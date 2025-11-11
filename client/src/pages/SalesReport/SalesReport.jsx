import React, { useEffect, useState } from 'react';
import style from './SalesReport.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';
import { getAllBookingsTable } from 'services/operations/bookingAPI';

const SalesReport = () => {
    const [view, setView] = useState(null);

    const [allBookings, setAllBookings] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [setPage, page] = useState(null);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('desc')
    const [sortType, setSortType] = useState(null)

    const dispatch = useDispatch();

    useEffect(() => {
        getAllBookingsTable({ filters: { status: 'Shipped' } }, setAllBookings, setPagination, dispatch);
    }, [dispatch])

    useEffect(() => {
        if (allBookings !== null) {
            setLoading(false)
        }
    }, [allBookings])

    // eslint-disable-next-line no-unused-vars
    const [filters, setFilters] = useState({
        grade: "",
        type: "",
        width: "",
        thickness: "",
        shipTo: "",
        formType: "",
        status: "Shipped",
        bookedBy: "",
        fromDate: "",
        toDate: "",
    })

    const onDownload = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/v1/booking/getExcelTablewiseBooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://localhost:3000'
                },
                body: JSON.stringify({ filters, sortBy: sortType, order: order })
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

    const sortBy = (val) => {
        setOrder(order === 'asc' ? 'desc' : 'asc');
        setSortType(val);
        // getAllBookingsTable({ sortBy: val, order: order, filters }, setAllBookings, setPagination, dispatch);
        getAllBookingsTable(
            { page: 1, limit: 50, filters, sortBy: val, order: order === 'asc' ? 'desc' : 'asc' },
            setAllBookings,
            setPagination,
            dispatch
        );
        // getAllItem({ filters, sortBy: val, order: order }, dispatch);
    }

    return (
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Sales Report</h3>
            <Filters setFilters={setFilters} setAllBookings={setAllBookings} setPagination={setPagination} />
            {allBookings !== null && <div className={style.card}>
                {loading ? (
                    <div className={style.loading}>Loading items...</div>
                ) : allBookings.length === 0 ? (
                    <div className={style.empty}>No items found</div>
                ) : (
                    <div className={style.tableWrapper}>

                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '8rem' }} onClick={() => sortBy('order_id')}>ID</th>
                                    <th style={{ width: '8rem' }} onClick={() => sortBy('party')}>Party</th>
                                    <th style={{ width: '8rem' }} onClick={() => sortBy('bookedBy')}>Booked By</th>
                                    <th style={{ width: '8rem' }} onClick={() => sortBy('bookingDate')}>Booking Date</th>
                                    <th style={{ width: '8rem' }} onClick={() => sortBy('quantity')}>Items</th>
                                    <th style={{ width: '8rem' }} onClick={() => sortBy('vehicleNumber')}>Vehicle Number</th>
                                    <th style={{ width: '8rem' }} onClick={() => sortBy('remark')}>Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allBookings?.map((item) => (
                                    <SingleItem key={item._id} item={item} view={view} setView={setView} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Pagination controls */}
            </div>}
            {/* Top controls: Search and pagination info */}
            <div className={style.controlsRow}>
                <button onClick={onDownload}>Download</button>

                <div className={style.paginationControls}>
                    {pagination?.page > 1 && <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        Prev
                    </button>}
                    <div className={style.paginationInfo}>
                        Page {pagination?.page} of {pagination?.totalPages || 1}
                    </div>
                    {pagination?.page < pagination?.totalPages && <button
                        onClick={() => setPage((p) => (p < (pagination?.totalPages || 1) ? p + 1 : p))}
                        disabled={page >= (pagination?.totalPages || 1)}
                    >
                        Next
                    </button>}
                </div>
            </div>
        </div >
    );
};

const SingleItem = ({ item, view, setView, allowed }) => {
    const bookingDate = item.bookingDate
        ? new Date(item.bookingDate).toLocaleDateString()
        : "-";

    const status = {
        'Pending': { background: '#FFF4E5', foreground: '#D97706' },
        'Processing': { background: '#E0E7FF', foreground: '#4338CA' },
        'Shipped': { background: '#E0F2FE', foreground: '#0369A1' },
        'Delivered': { background: '#DCFCE7', foreground: '#15803D' },
        'Cancelled': { background: '#FEE2E2', foreground: '#B91C1C' }
    };

    const isOpen = view === item._id;

    return (
        <>
            <tr
                className={`${isOpen ? style.activeRow : ""}`}
                onClick={() => setView(isOpen ? null : item._id)}
                style={{ cursor: "pointer" }}
            >
                <td style={{ fontWeight: '500', color: 'black' }}>{item.orderId || "-"}</td>
                <td style={{ fontWeight: '500', color: 'black' }}>{item.party || "-"}</td>
                {allowed && <td style={{ fontWeight: '500', textDecoration: 'underline' }}>{item.bookedBy || "-"}</td>}
                <td>{bookingDate}</td>
                <td>{item.items?.length}</td>
                <td style={{ display: 'flex' }}>
                    <p
                        className={style.coloredShipTo}
                        style={{
                            background: status[item.status]?.background,
                            color: status[item.status]?.foreground,
                            border: `1px solid ${status[item.status]?.foreground}`,
                        }}
                    >
                        {item.status ?? "-"}
                    </p>
                </td>
                <td style={{ fontWeight: '500', textDecoration: 'underline' }}>{item.vehicleNumber ?? "-"}</td>
                <td>{item.remark ?? "-"}</td>
            </tr>

            {isOpen && (
                <tr className='nestedRow'>
                    <td colSpan="12">
                        <table className='nestedTable'>
                            <thead>
                                <tr>
                                    <th>Form Type</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Challan No</th>
                                    <th>Challan Date</th>
                                    <th>Wagon No</th>
                                    <th>Ship To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {item.items?.map((i) => (
                                    <tr key={i._id}>
                                        <td>{i.formType}</td>
                                        <td>{i.itemSnapshot.type}</td>
                                        <td>{`${i.itemSnapshot.thickness?.name || "-"} X ${i.itemSnapshot.width?.name || "-"} X ${i.itemSnapshot.grade?.name || "-"}`}</td>
                                        <td>{i.quantity}</td>
                                        <td>{i.itemSnapshot.challan?.challanNumber || "-"}</td>
                                        <td>{i.itemSnapshot.challan?.challanDate
                                            ? new Date(i.itemSnapshot.challan.challanDate).toLocaleDateString()
                                            : "-"}</td>
                                        <td>{i.itemSnapshot.wagonNumber || "-"}</td>
                                        <td>{i.itemSnapshot.shipTo?.name || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </>
    );
};

const Filters = ({ setFilters, setAllBookings, setPagination }) => {
    const { grades, thicknesses, cutters, widths } = useSelector(
        (state) => state.varient
    );
    const dispatch = useDispatch();

    const [currentType, setCurrentType] = useState('Both');
    const handleTypeChange = (e) => {
        if (e.target.value === '') {
            setCurrentType('Both')
        } else {
            setCurrentType(e.target.value);
        }
    }

    const { allUsers } = useSelector(state => state.user);

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            grade: "",
            type: "",
            width: "",
            thickness: "",
            shipTo: "",
            formType: "",
            bookedBy: "",
            fromDate: "",
            toDate: "",
        },
    });

    const onSubmit = (data) => {
        let filterPayload = {};

        if (data.grade) filterPayload.grade = data.grade;
        if (data.type) filterPayload.type = data.type;
        if (data.width) filterPayload.width = data.width;
        if (data.thickness) filterPayload.thickness = data.thickness;
        if (data.shipTo) filterPayload.shipTo = data.shipTo;
        if (data.formType) filterPayload.formType = data.formType;
        if (data.bookedBy) filterPayload.bookedBy = data.bookedBy;
        if (data.fromDate) filterPayload.fromDate = data.fromDate;
        if (data.toDate) filterPayload.toDate = data.toDate;
        setFilters(filterPayload);
        getAllBookingsTable(
            { page: 1, limit: 50, filters: filterPayload },
            setAllBookings,
            setPagination,
            dispatch
        );
    };


    const handleReset = (filters) => {
        getAllItem({}, dispatch);
        reset();
        setFilters({});
    };

    return (
        <form className={style.formBlock} onSubmit={handleSubmit(onSubmit)}>
            {/* Type */}
            <div>
                <label htmlFor="type">Type:</label>
                <select id="type" {...register("type")} onChange={handleTypeChange}>
                    <option value="">All</option>
                    <option value="Hot Rolled">Hot Rolled</option>
                    <option value="Cold Rolled">Cold Rolled</option>
                </select>
            </div>

            {/* Grade */}
            <div>
                <label htmlFor="grade">Grade:</label>
                <select id="grade" {...register("grade")}>
                    <option value="">All</option>
                    {grades?.map((grade) => ((currentType === 'Both' || currentType === grade.type) &&
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
                    {widths?.map((width) => ((currentType === 'Both' || currentType === width.type) &&
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
                    {thicknesses?.map((thickness) => ((currentType === 'Both' || currentType === thickness.type) &&
                        <option key={thickness._id} value={thickness._id}>
                            {thickness.value || thickness.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ship To */}
            <div>
                <label htmlFor="shipTo">Location:</label>
                <select id="shipTo" {...register("shipTo")}>
                    <option value="">All</option>
                    {cutters?.map((cutter) => (
                        <option key={cutter._id} value={cutter._id}>
                            {cutter.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Booked By */}
            <div>
                <label htmlFor="bookedBy">Booked By:</label>
                <select id="bookedBy" {...register("bookedBy")}>
                    <option value="">All</option>
                    {allUsers?.map((users) => (
                        <option key={users._id} value={users._id}>
                            {`${users.firstName} ${users.lastName}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* FormType  */}
            <div>
                <label htmlFor="formType">Form:</label>
                <select id="formType" {...register("formType")}>
                    <option value="">All</option>
                    <option value="Sheet">Sheet</option>a
                    <option value="Coil">Coil</option>a
                </select>
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

            {/* Buttons */}
            <div className={style.buttonGroup}>
                <button type="submit">Filter</button>
                <button type="button" onClick={handleReset}>
                    Cancel
                </button>
            </div>
        </form>
    );
};


export default SalesReport;
