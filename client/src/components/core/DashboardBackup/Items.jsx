import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const [search, setSearch] = useState("");
    // eslint-disable-next-line no-unused-vars
    // const [pagination, setPagination] = useState(null);
    const { listViewList, pagination } = useSelector(state => state.item);
    const { token } = useSelector((state) => state.auth);

    // eslint-disable-next-line no-unused-vars
    const [filters, setFilters] = useState({
        type: '',
        grade: '',
        formType: '',
        width: '',
        thickness: '',
        wagonNumber: '',
        challanNumber: '',
        challanDate: '',
        warehouse: '',
        from: '',
        to: ''
    })


    const onClickNext = () => {
        getAllItem({ filters, search, page: pagination.page + 1 }, dispatch);
    }
    const onClickPrev = () => {
        getAllItem({ filters, search, page: pagination.page - 1 }, dispatch);
    }

    const dispatch = useDispatch();

    const onSearch = (e) => {
        e.preventDefault();
        // Implement search functionality
        getAllItem({ search: search }, dispatch);
    }

    // Fetch all items
    useEffect(() => {
        if (listViewList) {
            setItems(listViewList);
            setLoading(false);
        }
    }, [listViewList]);

    const onDownload = async () => {
        try {
            const BASE_URL = process.env.REACT_APP_BASE_URL;
            const response = await fetch(`${BASE_URL}/item/getExcelItem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ search, filters })
            });
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Item-Data-${Date.now()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
        }
    };

    return (
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Inventory Items</h3>
            <form onSubmit={onSearch} className={style.searchForm} style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search bookings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={style.searchInput}
                />
                <button type="submit" className={style.searchButton}>Search</button>
            </form>
            <Filters setFilters={setFilters} />
            <div className={style.card}>
                {loading ? (
                    <div className={style.loading}>Loading items...</div>
                ) : items.length === 0 ? (
                    <div className={style.empty}>No items found</div>
                ) : (
                    <div className={style.tableWrapper}>

                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Wagon No.</th>
                                    <th>Challan date</th>
                                    <th>Challan No.</th>
                                    <th>Type</th>
                                    <th>Material Description</th>
                                    <th>Quantity</th>
                                    <th>Warehouse</th>
                                    <th>Vehicle Number</th>
                                    <th>Loader</th>
                                    <th>Transport</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem key={item._id} item={item} view={view} setView={setView} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Pagination controls */}
            </div>
            {/* Top controls: Search and pagination info */}
            <div className={style.controlsRow}>
                <button onClick={onDownload}>Download</button>

                <div className={style.paginationControls}>
                    {pagination?.page !== 1 && <button onClick={onClickPrev}>
                        Prev
                    </button>}
                    <div className={style.paginationInfo}>
                        Page {pagination?.page} of {pagination?.totalPages || 1}
                    </div>
                    {pagination?.page < (pagination?.totalPages) && <button
                        onClick={onClickNext}>
                        Next
                    </button>}
                </div>
            </div>
        </div >
    );
};

const SingleItem = ({ item, view, setView }) => {
    const challanDate = item.challanDate
        ? new Date(item.challanDate).toLocaleDateString()
        : "-";

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ""}`}
            onClick={() => setView(item._id)}
        >
            <td>{item.wagonNumber || "-"}</td>
            <td>{challanDate}</td>
            <td>{item.challanNumber || "-"}</td>
            <td>{item.type || "-"}</td>
            <td> {`${item.thickness?.name || "-"} X ${item.width?.name || "-"} X ${item.grade?.name || "-"}`}</td>
            <td>{item.quantity ?? "-"}</td>
            <td>{item.warehouse?.name ?? "-"}</td>
            <td>{item.vehicleNumber || "-"}</td>
            <td>{item.loader || "-"}</td>
            <td>{item.transport || "-"}</td>
        </tr>
    );
};

const Filters = ({ setFilters }) => {
    const { grades, thicknesses, warehouses, widths } = useSelector(
        (state) => state.varient
    );
    const dispatch = useDispatch();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            type: "",
            grade: "",
            formType: "",
            width: "",
            thickness: "",
            wagonNumber: "",
            challanNumber: "",
            challanDate: "",
            quantity: "",
            warehouse: "",
            fromDate: "",
            toDate: "",
        },
    });

    const onSubmit = (filters) => {
        setFilters(filters)
        getAllItem({ filters }, dispatch);
    };

    const handleReset = (filters) => {
        getAllItem({}, dispatch);
        reset();
        setFilters({
            type: "",
            grade: "",
            formType: "",
            width: "",
            thickness: "",
            wagonNumber: "",
            challanNumber: "",
            challanDate: "",
            quantity: "",
            warehouse: "",
            fromDate: "",
            toDate: "",
        })
    };

    return (
        <form className={style.formBlock} onSubmit={handleSubmit(onSubmit)}>
            {/* Quantity Filter */}
            <div>
                <label htmlFor="remaining">Quantity:</label>
                <select id="remaining" {...register("remaining")}>
                    <option value="">All</option>
                    <option value="remaining">In Stock</option>
                    <option value="finished">Sold Out</option>
                </select>
            </div>

            {/* Type */}
            <div>
                <label htmlFor="type">Type:</label>
                <select id="type" {...register("type")}>
                    <option value="Cold Rolled">Cold Rolled</option>
                </select>
            </div>

            {/* Grade */}
            <div>
                <label htmlFor="grade">Grade:</label>
                <select id="grade" {...register("grade")}>
                    <option value="">All</option>
                    {grades?.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                            {grade.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Width */}
            <div>
                <label htmlFor="width">Width:</label>
                <select id="width" {...register("width")}>
                    <option value="">All</option>
                    {widths?.map((width) => (
                        <option key={width._id} value={width._id}>
                            {width.value || width.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Thickness */}
            <div>
                <label htmlFor="thickness">Thickness:</label>
                <select id="thickness" {...register("thickness")}>
                    <option value="">All</option>
                    {thicknesses?.map((thickness) => (
                        <option key={thickness._id} value={thickness._id}>
                            {thickness.value || thickness.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Wagon Number */}
            <div>
                <label htmlFor="wagonNumber">Wagon Number:</label>
                <input
                    id="wagonNumber"
                    type="text"
                    placeholder="Enter wagon number"
                    {...register("wagonNumber")}
                />
            </div>

            {/* Challan Number */}
            <div>
                <label htmlFor="challanNumber">Challan Number:</label>
                <input
                    id="challanNumber"
                    type="text"
                    placeholder="Enter challan number"
                    {...register("challanNumber")}
                />
            </div>

            {/* 📅 Date Range Filter */}
            <div>
                <label>From Date:</label>
                <input type="date" {...register("fromDate")} />
            </div>

            <div>
                <label>To Date:</label>
                <input type="date" {...register("toDate")} />
            </div>

            {/* Quantity */}
            <div>
                <label htmlFor="quantity">Quantity:</label>
                <input
                    id="quantity"
                    type="number"
                    step="any"
                    placeholder="Enter quantity"
                    {...register("quantity")}
                />
            </div>

            {/* Warehouse */}
            <div>
                <label htmlFor="warehouse">Warehouse:</label>
                <select id="warehouse" {...register("warehouse")}>
                    <option value="">All</option>
                    {warehouses?.map((warehouse) => (
                        <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Buttons */}
            <div className={style.buttonGroup}>
                <button type="submit">Filter</button>
                <button type="button" onClick={handleReset}>
                    Reset
                </button>
            </div>
        </form>
    );
};


export default Items;
