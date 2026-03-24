import React, { useEffect, useState } from 'react';
import style from './Inventory.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem, updateItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';
import { generateShipToColors } from 'utils/colorHandler';
import { LuDownload } from "react-icons/lu";
import { FiEye } from 'react-icons/fi';
import { FaPlus } from "react-icons/fa6";
import { IoCartOutline } from 'react-icons/io5';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { cancelBooking, getAllBookingByItem, shipBooking, updateRemark } from 'services/operations/bookingAPI';
import { useOverlay } from 'hooks/useOverlay';
import InventoryOptions from 'components/common/Overlay/InventoryOptions';

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [search, setSearch] = useState("");
    const [order, setOrder] = useState('desc');
    const [sortType, setSortType] = useState(null)
    const { listViewList, totalQuantity, pagination } = useSelector(state => state.item);
    const { token } = useSelector((state) => state.auth);
    const [colors, setColors] = useState(null)

    const [showFilters, setShowFilters] = useState(null);

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
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Inventory Items
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
                <button onClick={(e) => { e.preventDefault(); setShowFilters(!showFilters) }} className={style.searchButton}>Filter</button>
            </form>
            <Filters setFilters={setFilters} showFilters={showFilters} />
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
                                    <th onClick={() => sortBy('item_id')}>ID</th>
                                    <th onClick={() => sortBy('challan.challanDate')}>Challan date</th>
                                    <th onClick={() => sortBy('materialDescription')}>Material Description</th>
                                    <th onClick={() => sortBy('quantity')}>Quantity</th>
                                    <th onClick={() => sortBy('available')}>Available</th>
                                    <th onClick={() => sortBy('warehouse')}>Warehouse</th>
                                    <th onClick={() => sortBy('remark')}>Remark</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem
                                        key={item._id}
                                        color={colors.find(i => item.warehouse?._id === i.warehouseId)}
                                        item={item}
                                        view={view}
                                        setView={setView}
                                        expandedRow={expandedRow}
                                        setExpandedRow={setExpandedRow}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className={style.controlsRow}>
                <div className={style.paginationControls}>
                    {pagination?.page > 1 && <button onClick={prevPage}>Prev</button>}
                    <div className={style.paginationInfo}>
                        Page {pagination?.page} of {pagination?.totalPages || 1}
                    </div>
                    {pagination?.page < (pagination?.totalPages || 1) && <button onClick={nextPage}>Next</button>}
                </div>
            </div>
        </div>
    );
};

const SingleItem = ({ color, item, setView, view, expandedRow, setExpandedRow }) => {
    const challanDate = item.challanDate
        ? new Date(item.challanDate).toLocaleDateString()
        : '-';

    const { grades, thicknesses, widths, warehouses } = useSelector(state => state.varient);
    const dispatch = useDispatch();

    const [select, setSelect] = useState('');
    const [value, setValue] = useState('');
    const [bookingList, setBookingList] = useState(null);
    const [loadingBookings, setLoadingBookings] = useState(false);
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

    const toggleSubtable = async (e) => {
        e.stopPropagation();
        if (expandedRow === item._id) {
            setExpandedRow(null);
            setBookingList(null);
        } else {
            setExpandedRow(item._id);
            setLoadingBookings(true);
            await getAllBookingByItem({ item: item._id }, dispatch, setBookingList);
            setLoadingBookings(false);
        }
    };

    const handleUpdateQuantity = () => {
        function convertItem(data) {
            return {
                _id: data._id,
                item_id: data.id,
                type: data.type,
                grade: data.grade,
                form: "Coil",
                width: data.width,
                thickness: data.thickness,
                wagonNumber: data.wagonNumber,
                currentStatus: "In Stock",
                originalQuantity: Number(data.originalQuantity),
                quantity: data.remaining,
                warehouse: data.warehouse,
                remark: data.remark,
                date: data.date,
                createdAt: data.createdAt,
                updatedAt: data.createdAt,
                marking: data.marking,
            };
        }

        const output = convertItem(item);

        showOverlay(InventoryOptions, {
            type: 'increaseQuantity',
            data: output,
        })
    };

    const handlePreview = () => {
        function convertItem(data) {
            return {
                _id: data._id,
                item_id: data.id,
                type: data.type,
                grade: data.grade,
                form: "Coil",
                width: data.width,
                thickness: data.thickness,
                wagonNumber: data.wagonNumber,
                currentStatus: "In Stock",
                originalQuantity: Number(data.originalQuantity),
                quantity: data.remaining,
                warehouse: data.warehouse,
                remark: data.remark,
                date: data.date,
                createdAt: data.createdAt,
                updatedAt: data.createdAt,
                marking: data.marking,
            };
        }

        const output = convertItem(item);

        showOverlay(InventoryOptions, {
            type: 'logs',
            data: output,
        })
    };

    const handleOrder = () => {
        function convertItem(data) {
            return {
                _id: data._id,
                item_id: data.id,
                type: data.type,
                grade: data.grade,
                form: "Coil",
                width: data.width,
                thickness: data.thickness,
                wagonNumber: data.wagonNumber,
                currentStatus: "In Stock",
                originalQuantity: Number(data.originalQuantity),
                quantity: data.remaining,
                warehouse: data.warehouse,
                remark: data.remark,
                date: data.date,
                createdAt: data.createdAt,
                updatedAt: data.createdAt,
                marking: data.marking,
            };
        }

        const output = convertItem(item);

        showOverlay(InventoryOptions, {
            type: 'booking',
            data: output,
            onAccept: (data, party) => {
                console.log(data);
            }
        })
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

    return (
        <>
            <tr>
                <td className={style.idCell}>{item.item_id}</td>
                <td>{challanDate || '-'}</td>
                <td>{`${item.thickness?.name} X ${item.width?.name} X ${item.grade?.name}`}</td>
                <td className={style.numCell}>{item.originalQuantity}</td>
                <td className={style.numCell}>{item.remaining}</td>
                <td>{item.warehouse?.name || '-'}</td>
                <td onClick={() => clickHandler('remark')}>
                    {select === 'remark'
                        ? renderEditableField('remark')
                        : item.remark || '-'}
                </td>

                <td className={style.actionCell}>
                    <span className={style.actionIcon} onClick={handlePreview} title="View details">
                        <FiEye />
                    </span>
                    <span className={style.actionIcon} onClick={handleUpdateQuantity} title="View details">
                        <FaPlus />
                    </span>
                    <IoCartOutline onClick={handleOrder} style={{ cursor: 'pointer' }} title="Quick Order" />
                    {expandedRow === item._id ? (
                        <MdExpandLess onClick={toggleSubtable} title="Hide Bookings" />
                    ) : (
                        <MdExpandMore onClick={toggleSubtable} title="Show Bookings" />
                    )}
                </td>
            </tr>

            {expandedRow === item._id && (
                <tr>
                    <td colSpan="8" style={{ padding: 0 }}>
                        {loadingBookings ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>
                        ) : bookingList === null || bookingList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No bookings found for this item
                            </div>
                        ) : (
                            <BookingsSubtable bookings={bookingList} />
                        )}
                    </td>
                </tr>
            )}
        </>
    );
};

const BookingsSubtable = ({ bookings }) => {
    const bookingDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : "-";
    };

    const [editRemark, setEditRemark] = useState(null);

    const [list, setList] = useState(bookings);

    const dispatch = useDispatch();

    // Handle action buttons
    const handleAction = (id, status) => {
        const updated = list.map((b) =>
            b._id === id ? { ...b, status } : b
        );
        setList(updated);

        const vNum = (list.filter((i) => i._id === id))[0];

        if (status === 'Shipped') {
            shipBooking({ bookingId: id, fieldValue: vNum.vehicleNumber }, dispatch, setList);
        }

        if (status === 'Cancelled') {
            cancelBooking({ bookingId: id, reason: vNum.vehicleNumber }, dispatch, setList)
        }


        // CALL API HERE
        // updateBooking({ id, status }, dispatch);
    };

    // Handle action buttons
    const handleUpdateRemark = (id) => {
        const vNum = (list.filter((i) => i._id === id))[0];

        // updateRemark(id, vNum.remark);
        updateRemark({bookingId: id, remark: vNum.remarks}, dispatch);
        setEditRemark(null)
    };

    const updateVehicle = (id, value) => {
        const updated = list.map((b) =>
            b._id === id ? { ...b, vehicleNumber: value } : b
        );
        setList(updated);
    };

    const changeRemark = (id, value) => {
        const updated = list.map((b) =>
            b._id === id ? { ...b, remarks: value } : b
        );
        setList(updated);
    };

    const cancelRemark = (id) => {
        let oldRemark = null;
        setEditRemark(null);
        bookings.forEach(item => {
            if (item._id === id) {
                oldRemark = item.remark;
            }
        });

        setList((prev) => {
            if (prev._id === id) {
                prev.remark = oldRemark;
            }
            return prev;
        })
    }

    const thStyle = {
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border)'
    }

    const tdStyle = {
        padding: '0',
        borderBottom: '1px solid var(--border-subtle)'
    }

    const status = {
        cancelled: {
            padding: 0,
            background: 'var(--danger-muted)',
            color: 'var(--danger)',
        },
        shipped: {
            padding: 0,
            background: 'var(--success-muted)',
            color: 'var(--success)',
        },
        processing: {
            padding: 0,
            background: 'var(--warning-muted)',
            color: 'var(--warning)',
        }
    }

    const getStatus = (booking) => {
        const s = booking.status;
        if (s === 'Shipped')
            return status.shipped;
        if (s === 'Processing')
            return status.processing;
        if (s === 'Cancelled')
            return status.cancelled;
    }

    return (
        <table className='nestedTable' >
            <thead>
                <tr style={{ backgroundColor: 'var(--bg-active)' }}>
                    <th style={thStyle}>Order ID</th>
                    <th style={thStyle}>Form Type</th>
                    <th style={thStyle}>Quantity</th>
                    <th style={thStyle}>Party</th>
                    <th style={thStyle}>Booked By</th>
                    <th style={thStyle}>Booking Date</th>
                    <th style={thStyle}>Ship To</th>
                    <th style={thStyle}>Remarks</th>
                    <th style={thStyle}>Vehicle Number</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                </tr>
            </thead>
            <tbody>
                {list.map((booking, index) => (
                    <tr key={booking._id || index}>
                        <td style={tdStyle}>{booking.order_id || '-'}</td>
                        <td style={tdStyle}>{booking.formType || '-'}</td>
                        <td style={tdStyle}>{booking.quantity || '-'}</td>
                        <td style={tdStyle}>{booking.party || '-'}</td>
                        <td style={tdStyle}>{booking.bookedBy || '-'}</td>
                        <td style={tdStyle}>{bookingDate(booking.bookingDate)}</td>
                        <td style={tdStyle}>{booking.shipTo || '-'}</td>
                        {/* <td style={tdStyle}>{booking.remarks || '-'}</td> */}
                        <td onClick={() => setEditRemark(booking._id)} style={{overflow: 'visible'}}> {editRemark === booking._id ?
                            <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                                <input
                                    style={{ padding: '0rem 0.25rem', width: '6.25rem' }}
                                    type={'text'}
                                    value={booking.remarks}
                                    onChange={(e) => changeRemark(booking._id, e.target.value)}
                                    autoFocus
                                />
                                <div className={style.inlineButtons}>
                                    <button type="button" onClick={() => handleUpdateRemark(booking._id,)}>Save</button>
                                    <button type="button" onClick={() => cancelRemark(booking._id)}>Cancel</button>
                                </div>
                            </div>
                            : booking.remarks || '-'}

                        </td>
                        {
                            booking.status === 'Processing' ? <td style={tdStyle}>
                                <input
                                    className='simpleField'
                                    type="text"
                                    placeholder={'Vehicle Number'}
                                    value={booking.vehicleNumber || ""}
                                    onChange={(e) =>
                                        updateVehicle(booking._id, e.target.value)
                                    }
                                    style={{ width: "120px", height: '2rem', padding: '0' }}
                                /></td> : <td style={tdStyle}>{booking.vehicleNumber || '-'}</td>
                        }

                        <td className={`${style.statusPill}`} style={getStatus(booking)}>
                            {booking.status || '-'}
                        </td>
                        {/* <td className={`${style.statusPill} ${booking.status === 'Processing'
                            ? style.statusProcessing
                            : booking.status === 'Shipped'
                                ? style.statusShipped
                                : booking.status === 'Cancelled'
                                    ? style.statusCancelled
                                    : ''
                            }`}>{booking.status || '-'}</td> */}
                        {booking.status === 'Processing' && <td style={{ padding: '0' }}><button style={{ padding: '0', height: '2rem', width: '5rem', borderRadius: '0' }} className={`btn ${booking.vehicleNumber.length > 0 ? 'success' : 'error'}`} onClick={() => {
                            booking.vehicleNumber.length > 0 ? handleAction(booking._id, 'Shipped') : handleAction(booking._id, 'Cancelled');
                        }}>{booking.vehicleNumber.length > 0 ? 'Shipped' : 'Cancelled'}</button></td>}
                    </tr>
                ))
                }
            </tbody >
        </table >
    );
};

const Filters = ({ setFilters, showFilters }) => {
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

    return <form className={style.formBlock} onChange={handleSubmit(onSubmit)} style={{ height: showFilters ? '12rem' : '0', padding: showFilters ? '1rem' : '0' }}>
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

export default Items;