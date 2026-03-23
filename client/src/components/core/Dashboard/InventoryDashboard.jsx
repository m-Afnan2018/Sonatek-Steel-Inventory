import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem, updateItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';
import { generateShipToColors } from 'utils/colorHandler';
import { LuDownload } from "react-icons/lu";
import { useOverlay } from 'hooks/useOverlay';
import OrderConfirmationOverlay from 'components/common/Overlay/OrderConfirmationOverlay';
import { IoBookmarkOutline } from "react-icons/io5";
import { bookingItems } from 'services/operations/bookingAPI';

const InventoryDashboard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const [search, setSearch] = useState("");
    const [order, setOrder] = useState('desc');
    const [sortType, setSortType] = useState(null)
    // eslint-disable-next-line no-unused-vars
    // const [pagination, setPagination] = useState(null);
    const { listViewList, totalQuantity, pagination } = useSelector(state => state.item);
    const { token } = useSelector((state) => state.auth);
    const [colors, setColors] = useState(null)

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
    })

    const dispatch = useDispatch();

    const onSearch = (e) => {
        e.preventDefault();
        // Implement search functionality
        getAllItem({ search: search }, dispatch);
    }

    const onDownload = async () => {
        try {
            const BASE_URL = process.env.REACT_APP_BASE_URL;
            const response = await fetch(`${BASE_URL}/item/getExcelItem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ search, filters, sortBy: sortType, order })
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

    // Fetch all items
    useEffect(() => {
        if (listViewList) {
            setItems(listViewList);
            setColors(generateShipToColors(listViewList))
            setLoading(false);
        }
    }, [listViewList]);

    const sortBy = (val) => {
        setOrder(order === 'asc' ? 'desc' : 'asc');
        setSortType(val);
        getAllItem({ search, filters, sortBy: val, order: order }, dispatch);
    }

    const nextPage = () => {
        getAllItem({ search, filters, sortBy: sortType, order: order, page: pagination?.page + 1 }, dispatch);
    }

    const prevPage = () => {
        getAllItem({ search, filters, sortBy: sortType, order: order, page: pagination?.page - 1 }, dispatch);
    }

    return (
        <div className={style.Dashboard}>
            <h3 className='main-heading'>Inventory Items
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>Total Quantity: {totalQuantity}</span>
                <span><LuDownload onClick={onDownload} /></span>
            </h3>
            <form onSubmit={onSearch} className={style.searchForm}>
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
                                    <th onClick={() => sortBy('wagonNumber')}>Wagon No.</th>
                                    <th onClick={() => sortBy('challan.challanDate')}>Challan date</th>
                                    <th onClick={() => sortBy('challan.challanNumber')}>Challan No.</th>
                                    <th onClick={() => sortBy('type')}>Type</th>
                                    <th onClick={() => sortBy('materialDescription')}>Material Description</th>
                                    <th onClick={() => sortBy('quantity')}>Quantity</th>
                                    <th onClick={() => sortBy('remaining')}>Available</th>
                                    <th onClick={() => sortBy('warehouse')}>Warehouse</th>
                                    <th onClick={() => sortBy('transport.vehicleNumber')}>Vehicle Number</th>
                                    <th onClick={() => sortBy('transport.loader')}>Loader</th>
                                    <th onClick={() => sortBy('transport.transporterName')}>Transport</th>
                                    <th onClick={() => sortBy('remark')}>Remark</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem color={colors.find(i => item.warehouse?._id === i.warehouseId)} key={item._id} item={item} view={view} setView={setView} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Pagination controls */}
            </div>

            {/* Top controls: Search and pagination info */}
            <div className={style.controlsRow}>
                <div className={style.paginationControls}>
                    {pagination?.page > 1 && <button onClick={prevPage}>
                        Prev
                    </button>}
                    <div className={style.paginationInfo}>
                        Page {pagination?.page} of {pagination?.totalPages || 1}
                    </div>
                    {pagination?.page < (pagination?.totalPages || 1) && <button
                        onClick={nextPage}
                    >
                        Next
                    </button>}
                </div>
            </div>
        </div >
    );
};

const SingleItem = ({ color, item, setView, view }) => {
    const challanDate = item.challanDate
        ? new Date(item.challanDate).toLocaleDateString()
        : '-';

    const { grades, thicknesses, widths, warehouses } = useSelector(state => state.varient);
    const dispatch = useDispatch();

    const [select, setSelect] = useState('');
    const [value, setValue] = useState('');

    const { showOverlay } = useOverlay();

    const clickHandler = (type) => {
        setSelect(type);
        setValue(item[type]);
    };

    const handleSave = (e) => {
        e.stopPropagation();
        const grade = item.grade._id;
        const thickness = item.thickness._id;
        const width = item.width._id;
        const warehouse = item.warehouse?._id;
        let Item = { ...item, grade, thickness, width, warehouse: warehouse };
        let updatedItem = { ...Item, [select]: value };
        updateItem(updatedItem, dispatch);
        setSelect('');
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setValue(item[select]);
        setSelect('');
    };

    const renderEditableField = (type, inputType = 'text') => (
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <input
                style={{ padding: '0rem 0.25rem', width: '6.25rem' }}
                type={inputType}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
            />
            <div className={style.inlineButtons}>
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );

    const renderDropdownField = (type, options) => (
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <select
                style={{ padding: '0rem', width: '3rem' }}
                value={value?._id}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
            >
                <option value="">Select</option>
                {options.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                        {opt.name || opt.value}
                    </option>
                ))}
            </select>
            <div className={style.inlineButtons}>
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );

    const handleOrder = () => {
            function convertItem(data) {
                return {
                    _id: data._id,
                    type: data.type,
                    grade: data.grade,
                    form: "Coil",
                    width: data.width,
                    thickness: data.thickness,
                    wagonNumber: data.wagonNumber,
                    currentStatus: "In Stock",
                    originalQuantity: Number(data.originalQuantity),
                    quantity: Number(data.currentQuantity),
                    warehouse: data.warehouse,
                    remark: data.remark,
                    date: data.date,
                    createdAt: data.createdAt,
                    updatedAt: data.createdAt
                };
            }
    
            // Usage:
            const output = convertItem(item);
    
            showOverlay(OrderConfirmationOverlay, {
                range: { min: 0, max: output.quantity.toFixed(3) },
                data: [output],
                onAccept: (data, party) => {
                    bookingItems({ items: data, party }, dispatch, ()=>{})
                }
            })
        }

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ''}`}
            onClick={() => setView(item._id)}
        >
            {/* Wagon Number */}
            <td onClick={() => clickHandler('wagonNumber')}>
                {select === 'wagonNumber'
                    ? renderEditableField('wagonNumber')
                    : item.wagonNumber || '-'}
            </td>

            {/* Challan Date */}
            <td onClick={() => clickHandler('challanDate')}>
                {select === 'challanDate'
                    ? renderEditableField('challanDate', 'date')
                    : challanDate || '-'}
            </td>

            {/* Challan Number */}
            <td onClick={() => clickHandler('challanNumber')}>
                {select === 'challanNumber'
                    ? renderEditableField('challanNumber')
                    : item.challanNumber || '-'}
            </td>

            {/* Type */}
            <td onClick={() => clickHandler('type')}>
                {select === 'type' ? (
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                        <select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoFocus
                            style={{ padding: '0rem', width: '3rem' }}
                        >
                            <option value="">Select</option>
                            <option value="Hot Rolled">Hot Rolled</option>
                            <option value="Cold Rolled">Cold Rolled</option>
                        </select>
                        <div className={style.inlineButtons}>
                            <button type="button" onClick={handleSave}>Save</button>
                            <button type="button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    item.type
                )}
            </td>

            {/* Thickness x Width x Grade */}
            <td style={{ display: 'flex', gap: '5px' }}>
                {/* Thickness */}
                <div onClick={() => clickHandler('thickness')}>
                    {select === 'thickness'
                        ? renderDropdownField('thickness', thicknesses)
                        : <span>{item.thickness?.name || '-'}</span>}
                </div>
                X
                {/* Width */}
                <div onClick={() => clickHandler('width')}>
                    {select === 'width'
                        ? renderDropdownField('width', widths)
                        : <span>{item.width?.name || '-'}</span>}
                </div>
                X
                {/* Grade */}
                <div onClick={() => clickHandler('grade')}>
                    {select === 'grade'
                        ? renderDropdownField('grade', grades)
                        : <span>{item.grade?.name || '-'}</span>}
                </div>
            </td>

            {/* Quantity */}
            <td onClick={() => clickHandler('originalQuantity')}>
                {select === 'originalQuantity'
                    ? renderEditableField('originalQuantity', 'number')
                    : item.originalQuantity}
            </td>


            {/* Available */}
            <td onClick={() => clickHandler('remaining')}>
                {select === 'remaining'
                    ? renderEditableField('remaining', 'number')
                    : item.remaining}
            </td>

            {/* Warehouse */}
            <td onClick={() => clickHandler('warehouse')} style={{ display: 'flex' }}>
                {select === 'warehouse' ? (
                    <div onClick={() => clickHandler('warehouse')}>
                        {select === 'warehouse'
                            ? renderDropdownField('warehouse', warehouses)
                            : <span>{item.warehouse?.name || '-'}</span>}
                    </div>
                ) : (
                    item.warehouse === null ? "-" : <p className={style.coloredShipTo} style={{ background: color.backgroundColor, color: color.foregroundColor, border: `1px solid ${color.foregroundColor}` }}>{item.warehouse.name.toLowerCase()}</p>
                )}
            </td>

            {/* Vehicle */}
            <td onClick={() => clickHandler('vehicleNumber')}>
                {select === 'vehicleNumber'
                    ? renderEditableField('vehicleNumber')
                    : item.vehicleNumber || '-'}
            </td>

            {/* Warehouse */}
            <td onClick={() => clickHandler('loader')}>
                {select === 'loader'
                    ? renderEditableField('loader')
                    : item.loader || '-'}
            </td>

            {/* Warehouse */}
            <td onClick={() => clickHandler('transporterName')}>
                {select === 'transporterName'
                    ? renderEditableField('transporterName')
                    : item.transporterName || '-'}
            </td>

            {/* Remark */}
            <td onClick={() => clickHandler('remark')}>
                {select === 'remark'
                    ? renderEditableField('remark')
                    : item.remark || '-'}
            </td>

            <td>
                <div>
                    <IoBookmarkOutline style={{ color: 'blue' }} onClick={handleOrder} />
                </div> 
            </td>
        </tr>
    );
};

const Filters = ({ setFilters }) => {
    const { grades, thicknesses, warehouses, widths } = useSelector(state => state.varient)
    const dispatch = useDispatch();
    const [currentType, setCurrentType] = useState('Both');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            type: '',
            grade: '',
            formType: '',
            width: '',
            thickness: '',
            wagonNumber: '',
            challanNumber: '',
            challanDate: '',
            quantity: '',
            warehouse: '',
        }
    })

    const onSubmit = (filters) => {
        setFilters(filters)
        const curr = filters.type;
        if (curr === '') {
            setCurrentType('Both')
        } else {
            setCurrentType(curr);
        }
        getAllItem({ filters }, dispatch);
    }

    const handleReset = () => {
        reset()
        getAllItem({}, dispatch);
    }

    return <form className={style.formBlock} onChange={handleSubmit(onSubmit)}>
        <div>
            <label htmlFor='remaining'>Availibility:</label>
            <select
                id='remaining'
                {...register('remaining')}
            >
                <option value=''>All</option>
                <option value='remaining'> In Stock </option>
                <option value='finished'> Sold Out </option>
            </select>
            {errors.grade && <span className={style.error}>{errors.remaining.message}</span>}
        </div>


        <div>
            <label htmlFor='type'>Type:</label>
            <select
                id='type'
                {...register('type')}
            >
                <option value=''>All</option>
                <option value='Hot Rolled'>  Hot Rolled </option>
                <option value='Cold Rolled'>  Cold Rolled </option>
            </select>
            {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
        </div>


        <div>
            <label htmlFor='grade'>Grade:</label>
            <select
                id='grade'
                {...register('grade')}
            >
                <option value=''>All</option>
                {grades && grades.map((grade) => ((currentType === 'Both' || currentType === grade.type) &&
                    <option key={grade._id} value={grade._id}>
                        {grade.name}
                    </option>
                ))}
            </select>
            {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
        </div>

        <div>
            <label htmlFor='width'>Width: </label>
            <select
                id='width'
                {...register('width')}
            >
                <option value=''>All</option>
                {widths && widths.map((width) => ((currentType === 'Both' || currentType === width.type) &&
                    <option key={width._id} value={width._id}>
                        {width.value || width.name}
                    </option>
                ))}
            </select>
            {errors.width && <span className={style.error}>{errors.width.message}</span>}
        </div>

        <div>
            <label htmlFor='thickness'>Thickness: </label>
            <select
                id='thickness'
                {...register('thickness')}
            >
                <option value=''>All</option>
                {thicknesses && thicknesses.map((thickness) => ((currentType === 'Both' || currentType === thickness.type) &&
                    <option key={thickness._id} value={thickness._id}>
                        {thickness.value || thickness.name}
                    </option>
                ))}
            </select>
            {errors.thickness && <span className={style.error}>{errors.thickness.message}</span>}
        </div>

        {/* <div>
            <label htmlFor='wagonNumber'>Wagon Number:</label>
            <input
                id='wagonNumber'
                type='text'
                placeholder='Enter wagon number'
                {...register('wagonNumber')}
            />
            {errors.wagonNumber && <span className={style.error}>{errors.wagonNumber.message}</span>}
        </div>

        <div>
            <label htmlFor='challanNumber'>Challan Number</label>
            <input
                id='challanNumber'
                type='text'
                placeholder='Enter challan number'
                {...register('challanNumber')}
            />
            {errors.challanNumber && <span className={style.error}>{errors.challanNumber.message}</span>}
        </div> */}
        <div>
            <label htmlFor='challanDate'>Challan Date</label>
            <input
                id='challanDate'
                type='date'
                {...register('challanDate')}
            />
            {errors.challanDate && <span className={style.error}>{errors.challanDate.message}</span>}
        </div>

        <div>
            <label htmlFor='quantity'>Quantity</label>
            <input
                id='quantity'
                type='number'
                step="any"
                placeholder='Enter quantity'
                {...register('quantity')}
            />
            {errors.quantity && <span className={style.error}>{errors.quantity.message}</span>}
        </div>

        <div>
            <label htmlFor='warehouse'>Warehouse:</label>
            <select
                id='warehouse'
                {...register('warehouse')}
            >
                <option value=''>All</option>
                {warehouses && warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}
                    </option>
                ))}
            </select>
            {errors.warehouse && <span className={style.error}>{errors.warehouse.message}</span>}
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

        <div className={style.buttonGroup}>
            <button type='button' onClick={handleReset}>Reset</button>
        </div>
    </form>
}

export default InventoryDashboard;
