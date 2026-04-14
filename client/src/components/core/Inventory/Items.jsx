import React, { useEffect, useState } from 'react';
import style from './Inventory.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem, updateItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';
import { generateShipToColors } from 'utils/colorHandler';
import { LuDownload } from "react-icons/lu";
import { FiEye, FiEdit } from 'react-icons/fi';
import { FaPlus } from "react-icons/fa6";
import { IoCartOutline } from 'react-icons/io5';
import { MdCancel } from "react-icons/md";
import { LiaShippingFastSolid } from "react-icons/lia";
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { cancelBooking, getAllBookingByItem, shipBooking, updateRemark } from 'services/operations/bookingAPI';
import { useOverlay } from 'hooks/useOverlay';
import InventoryOptions from 'components/common/Overlay/InventoryOptions';
import { RxCheck, RxCross2 } from "react-icons/rx";
import { setUpdateQuantity, updateListViewData, updateListViewListData } from 'slices/itemSlice';

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
    const [colors, setColors] = useState(null);

    const [bookingList, setBookingList] = useState(null);
    const [showFilters, setShowFilters] = useState(null);

    const [filters, setFilters] = useState({
        type: 'Cold Rolled',
        grade: '',
        formType: '',
        width: '',
        thickness: '',
        wagonNumber: '',
        challanNumber: '',
        challanDate: '',
        warehouse: '',
    })

    // Track the latest query params so pagination always sends the same filters/search/sort
    const currentParams = React.useRef({ search: '', filters: null, sortBy: null, order: 'desc' });

    const dispatch = useDispatch();

    const onSearch = (e) => {
        e.preventDefault();
        const params = { search, filters, sortBy: sortType, order };
        currentParams.current = params;
        getAllItem({ ...params, page: 1 }, dispatch);
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
        };

    }, [listViewList]);

    const sortBy = (val) => {
        const newOrder = order === 'asc' ? 'desc' : 'asc';
        setOrder(newOrder);
        setSortType(val);
        const params = { search, filters, sortBy: val, order: newOrder };
        currentParams.current = params;
        getAllItem({ ...params, page: 1 }, dispatch);
    }

    const nextPage = () => {
        const nextPageNum = (pagination?.page ?? 1) + 1;
        getAllItem({ ...currentParams.current, page: nextPageNum }, dispatch);
    }

    const prevPage = () => {
        const prevPageNum = Math.max(1, (pagination?.page ?? 2) - 1);
        getAllItem({ ...currentParams.current, page: prevPageNum }, dispatch);
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
            <Filters setFilters={setFilters} showFilters={showFilters} currentParams={currentParams} search={search} />
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
                                {items.filter((item) => (item.remaining > 0
                                    && bookingList?.status !== 'processing')).map((item) => (
                                        <SingleItem
                                            key={item._id}
                                            color={colors.find(i => item.warehouse?._id === i.warehouseId)}
                                            item={item}
                                            view={view}
                                            setView={setView}
                                            expandedRow={expandedRow}
                                            setExpandedRow={setExpandedRow}
                                            bookingList={bookingList}
                                            setBookingList={setBookingList}
                                        />
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className={style.controlsRow}>
                <div className={style.paginationControls}>
                    <button
                        onClick={prevPage}
                        disabled={!pagination || pagination.page <= 1}
                        style={{ opacity: (!pagination || pagination.page <= 1) ? 0.4 : 1, cursor: (!pagination || pagination.page <= 1) ? 'not-allowed' : 'pointer' }}
                    >Prev</button>
                    <div className={style.paginationInfo}>
                        Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
                    </div>
                    <button
                        onClick={nextPage}
                        disabled={!pagination || pagination.page >= (pagination.totalPages ?? 1)}
                        style={{ opacity: (!pagination || pagination.page >= (pagination.totalPages ?? 1)) ? 0.4 : 1, cursor: (!pagination || pagination.page >= (pagination.totalPages ?? 1)) ? 'not-allowed' : 'pointer' }}
                    >Next</button>
                </div>
            </div>
        </div>
    );
};

const SingleItem = ({ color, item, setView, view, expandedRow, setExpandedRow, bookingList, setBookingList }) => {
    const { grades, thicknesses, widths, warehouses } = useSelector(state => state.varient);
    const dispatch = useDispatch();

    const [itemDetail, setItemDetail] = useState(item);
    const [isEditing, setIsEditing] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [editRemark, setEditRemark] = useState(false);
    const { showOverlay } = useOverlay();

    useEffect(() => setItemDetail(prev => ({ ...prev, ...item })), [item]);

    const handleEditToggle = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.stopPropagation();
        const grade = itemDetail.grade._id;
        const thickness = itemDetail.thickness._id;
        const width = itemDetail.width._id;
        const warehouse = itemDetail.warehouse?._id;
        let Item = { ...itemDetail, grade, thickness, width, warehouse: warehouse };
        updateItem(Item, dispatch);
        dispatch(updateListViewData({ updatedItem: itemDetail }))
        setIsEditing(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setIsEditing(false);
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

    function convertItem(data) {
        return {
            _id: data._id,
            item_id: data.item_id,
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
    const handleUpdateQuantity = () => {
        const output = convertItem(itemDetail);

        showOverlay(InventoryOptions, {
            type: 'increaseQuantity',
            data: output,
            onAccept: (updatedItem) => {
                if (!updatedItem) return;
                setItemDetail((prev) => ({ ...prev, ...updatedItem }));
                dispatch(updateListViewData({ updatedItem }))
            }
        })
    };

    const handlePreview = () => {
        const output = convertItem(itemDetail);

        showOverlay(InventoryOptions, {
            type: 'logs',
            data: output,
        })
    };

    const handleOrder = () => {
        const output = convertItem(itemDetail);
        showOverlay(InventoryOptions, {
            type: 'booking',
            data: output,
            onAccept: async (data, party) => {
                if (expandedRow === item._id) {
                    setLoadingBookings(true);
                    await getAllBookingByItem({ item: item._id }, dispatch, setBookingList);
                    setLoadingBookings(false);
                }
            }
        })
    };

    const renderDropdownField = (type, options) => {
        const valueSetter = (val) => {
            const option = options.find(i => i._id === val);
            setItemDetail((prev) => ({ ...prev, [type]: option }));
        };

        return (
            <div onClick={(e) => e.stopPropagation()}>
                <select
                    style={{ width: 'auto', padding: '0.15rem' }}
                    value={itemDetail[type]?._id || ""}
                    onChange={(e) => valueSetter(e.target.value)}
                >
                    <option value="" disabled>Select</option>
                    {options.map((opt) => (
                        <option key={opt._id} value={opt._id}>
                            {opt.name || opt.value}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    const renderEditableField = (type, inputType = 'text', size = '8rem') => {
        const valueSetter = (val) => {
            setItemDetail((prev) => ({ ...prev, [type]: val }));
        }

        return <div onClick={(e) => e.stopPropagation()}>
            <input
                style={{ width: size, padding: '0.15rem' }}
                type={inputType}
                value={itemDetail[type] || ''}
                onChange={(e) => valueSetter(e.target.value)}
            />
        </div>
    };

    const changeRemark = (value) => {
        setItemDetail((prev) => ({ ...prev, remark: value }));
    };

    const handleUpdateRemark = (e) => {
        const grade = itemDetail.grade._id;
        const thickness = itemDetail.thickness._id;
        const width = itemDetail.width._id;
        const warehouse = itemDetail.warehouse?._id;
        const payload = { ...itemDetail, grade, thickness, width, warehouse };
        updateItem(payload, dispatch);
        setEditRemark(false);
    };

    const handleUpdateRemarkKeyDown = (e, id) => {
        if (e.key === 'Enter') {
            handleUpdateRemark(id);
            setEditRemark(null);
        }
    };

    const cancelRemark = (e) => {
        e.stopPropagation();
        // Revert remark to the original item value
        setItemDetail((prev) => ({ ...prev, remark: item.remark }));
        setEditRemark(false);
    };


    return (
        <>
            <tr>
                <td className={style.idCell}>{itemDetail.item_id}</td>
                <td onClick={(e) => e.stopPropagation()}>
                    {isEditing
                        ? renderEditableField('challanDate', 'date', '8rem')
                        : itemDetail.challanDate ? new Date(itemDetail.challanDate).toLocaleDateString() : '-'}
                </td>
                <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <div>
                        {isEditing
                            ? renderDropdownField('thickness', thicknesses)
                            : <span style={{ width: '3rem' }}>{itemDetail.thickness?.name}</span>}
                    </div>
                    X
                    <div>
                        {isEditing
                            ? renderDropdownField('width', widths)
                            : <span style={{ width: '3rem' }}>{itemDetail.width?.name}</span>}
                    </div>
                    X
                    <div>
                        {isEditing
                            ? renderDropdownField('grade', grades)
                            : <span style={{ width: '3rem' }}>{itemDetail.grade?.name}</span>}
                    </div>
                </td>
                <td className={style.numCell} onClick={(e) => e.stopPropagation()}>
                    {itemDetail.originalQuantity}
                </td>
                <td className={style.numCell} onClick={(e) => e.stopPropagation()}>
                    {itemDetail.remaining.toFixed(3)}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                    {isEditing
                        ? renderDropdownField('warehouse', warehouses)
                        : itemDetail.warehouse?.name || '-'}
                </td>
                <td
                    title={itemDetail.remark || ''}
                    onClick={(e) => { e.stopPropagation(); if (!isEditing) setEditRemark(true); }}
                    style={{ overflow: 'visible', cursor: 'pointer' }}
                >
                    {editRemark ?
                        <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 10 }}>
                            <input
                                style={{ padding: '.2rem 0.25rem', width: '6.5rem' }}
                                type='text'
                                value={itemDetail.remark || ''}
                                onChange={(e) => changeRemark(e.target.value)}
                                onKeyDown={(e) => handleUpdateRemarkKeyDown(e, itemDetail._id)}
                                autoFocus
                            />
                            <div className={style.inlineButtons}>
                                <button type="button" onClick={handleUpdateRemark}>Save</button>
                                <button type="button" onClick={cancelRemark}>Cancel</button>
                            </div>
                        </div>
                        : itemDetail.remark || '-'}
                </td>

                <td className={style.actionCell}>
                    {!isEditing ? <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <span className={style.actionIcon} onClick={handlePreview} title="View details">
                            <FiEye />
                        </span>
                        <span className={style.actionIcon} onClick={handleUpdateQuantity} title="Update Stock">
                            <FaPlus />
                        </span>
                        <IoCartOutline className={style.actionIcon} onClick={handleOrder} style={{ cursor: 'pointer', padding: '0.35rem', height: '30px', width: '30px' }} title="Quick Order" />
                        <span className={style.actionIcon}><FiEdit onClick={handleEditToggle} title="Edit Item" /></span>
                        {expandedRow === item._id ? (
                            <MdExpandLess className={style.actionIcon} onClick={toggleSubtable} style={{ padding: '0.35rem', height: '30px', width: '30px', cursor: 'pointer' }} title="Hide Bookings" />
                        ) : (
                            <MdExpandMore className={style.actionIcon} onClick={toggleSubtable} style={{ padding: '0.35rem', height: '30px', width: '30px', cursor: 'pointer' }} title="Show Bookings" />
                        )}
                    </div> : <div style={{ gap: '0.5rem', display: 'flex' }}>
                        <span className={style.actionIcon}><RxCheck style={{ color: 'green', fontSize: '1.25rem' }} onClick={handleSave} /></span>
                        <span className={style.actionIcon}><RxCross2 style={{ color: 'red', fontSize: '1.25rem' }} onClick={handleCancel} /></span>
                    </div>}
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
                            <BookingsSubtable bookings={bookingList} parentItem={item} />
                        )}
                    </td>
                </tr>
            )}
        </>
    );
};

const BookingsSubtable = ({ bookings, parentItem }) => {
    const bookingDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : "-";
    };

    const [editRemark, setEditRemark] = useState(null);
    const [reason, setReason] = useState('');

    const [list, setList] = useState(bookings);

    const dispatch = useDispatch();

    useEffect(() => {
        setList(bookings);
    }, [bookings]);

    // Handle action buttons
    const handleAction = (id, status) => {
        const vNum = list.find((i) => i._id === id);

        // Optimistic update — only change status, preserve all other fields (incl. reason)
        setList((prev) => prev.map((b) =>
            b._id === id ? { ...b, status } : b
        ));

        if (status === 'Shipped') {
            shipBooking({ bookingId: id, fieldValue: vNum.vehicleNumber }, dispatch, setList);
        }

        if (status === 'Cancelled') {
            cancelBooking({ bookingId: id, fieldValue: vNum.reason }, dispatch, setList);
            dispatch(updateListViewListData({ updatedItem: { _id: parentItem._id, remaining: Number(parentItem.remaining) + Number(vNum.quantity) } }));
        }
    };

    // Handle action buttons
    const handleUpdateRemark = (id) => {
        const vNum = (list.filter((i) => i._id === id))[0];

        // updateRemark(id, vNum.remark);
        updateRemark({ bookingId: id, remark: vNum.remarks }, dispatch);
        setEditRemark(null)
    };
    const handleUpdateRemarkKeyDown = (e, id) => {
        if (e.key === 'Enter') {
            handleUpdateRemark(id);
            setEditRemark(null);
        }
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

    function turncate(str, len) {
        if (str.length > len) {
            return str.slice(0, len) + '...';
        }
        return str;
    }

    function handleReason(id, value) {
        const updated = list.map((b) =>
            b._id === id ? { ...b, reason: value } : b
        );
        setList(updated);
    }
    return (
        <table className='nestedTable' >
            <thead>
                <tr style={{ backgroundColor: 'var(--bg-active)' }}>
                    <th style={thStyle}>Order ID</th>
                    <th style={thStyle}>Form Type</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Party</th>
                    <th style={thStyle}>Booked By</th>
                    <th style={thStyle}>Booking Date</th>
                    <th style={thStyle}>Ship To</th>
                    <th style={thStyle}>Remarks</th>
                    <th style={thStyle}>Vehicle Number</th>
                    <th style={thStyle}>Reason</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                </tr>
            </thead>
            <tbody style={{ position: 'relative' }}>
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
                        <td title={booking.remarks} onClick={() => setEditRemark(booking._id)} style={{ overflow: 'visible' }}> {editRemark === booking._id ?
                            <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 10 }}>
                                <input
                                    style={{ padding: '.2rem 0.25rem', width: '6.5rem' }}
                                    type={'text'}
                                    value={booking.remarks}
                                    onChange={(e) => changeRemark(booking._id, e.target.value)}
                                    onKeyDown={(e) => handleUpdateRemarkKeyDown(e, booking._id)}
                                    autoFocus
                                />
                                <div className={style.inlineButtons}>
                                    <button type="button" onClick={() => handleUpdateRemark(booking._id,)}>Save</button>
                                    <button type="button" onClick={() => cancelRemark(booking._id)}>Cancel</button>
                                </div>
                            </div>
                            : turncate(booking.remarks, 12) || '-'}

                        </td>

                        {
                            booking.status === 'Processing' ? <td style={tdStyle}>
                                <input
                                    className='simpleField'
                                    type="text"
                                    name='vehicleNumber'
                                    placeholder={'Vehicle Number'}
                                    value={booking.vehicleNumber || ""}
                                    onChange={(e) =>
                                        updateVehicle(booking._id, e.target.value)
                                    }
                                    style={{ width: "120px", height: '1.8rem', padding: '.15rem .25rem' }}
                                /></td> : <td style={tdStyle}>{booking.vehicleNumber || '-'}</td>
                        }

                        {
                            booking.status === 'Processing' ? <td style={tdStyle}>
                                <input
                                    className='simpleField'
                                    type="text"
                                    name='reason'
                                    placeholder={'Reason'}
                                    value={booking.reason || ""}
                                    onChange={(e) =>
                                        handleReason(booking._id, e.target.value)
                                    }
                                    style={{ width: "120px", height: '1.8rem', padding: '.15rem .25rem' }}
                                /></td> : <td style={tdStyle}>{booking.reason || '-'}</td>
                        }

                        <td className={`${style.statusPill}`} style={getStatus(booking)}>
                            <p style={{ fontSize: '10px' }}>{booking.status || '-'}</p>
                        </td>
                        {/* <td className={`${style.statusPill} ${booking.status === 'Processing'
                            ? style.statusProcessing
                            : booking.status === 'Shipped'
                                ? style.statusShipped
                                : booking.status === 'Cancelled'
                                    ? style.statusCancelled
                                    : ''
                            }`}>{booking.status || '-'}</td> */}
                        {booking.status === 'Processing' &&
                            <td style={{ padding: '0' }}>
                                {booking.vehicleNumber.length > 0 && <button title={booking.vehicleNumber.length > 0 ? 'shipped' : 'cancel'} style={{ padding: '0', height: '2rem', width: '5rem', borderRadius: '0' }} className={`btn ${booking.vehicleNumber.length > 0 ? 'success' : 'error'}`} onClick={() => {
                                    booking.vehicleNumber.length > 0 ? handleAction(booking._id, 'Shipped') : handleAction(booking._id, 'Cancelled');
                                }}>{booking.vehicleNumber.length > 0 ? <LiaShippingFastSolid /> : 'Cancel'}</button>
                                }
                                {booking.reason?.length > 0 && <button title='cancel' style={{ padding: '0', height: '2rem', width: '3rem', borderRadius: '0', marginLeft: '0.2rem', backgroundColor: 'var(--danger)' }} className={`btn`} onClick={() => {
                                    handleAction(booking._id, 'Cancelled');
                                }}><MdCancel /></button>}
                            </td>}

                    </tr>
                ))
                }
            </tbody >
        </table >
    );
};

const Filters = ({ setFilters, showFilters, currentParams, search }) => {
    const { grades, thicknesses, warehouses, widths } = useSelector(state => state.varient)
    const dispatch = useDispatch();
    const [currentType, setCurrentType] = useState('Both');

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            type: 'Cold Rolled',
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
        // Sync currentParams ref so pagination carries the latest filters
        if (currentParams) {
            currentParams.current = { ...currentParams.current, filters, search: search ?? '' };
        }
        getAllItem({ filters, search: search ?? '', page: 1 }, dispatch);
    }

    const handleReset = () => {
        reset()
        // Clear currentParams ref on reset
        if (currentParams) {
            currentParams.current = { search: '', filters: null, sortBy: null, order: 'desc' };
        }
        getAllItem({ page: 1 }, dispatch);
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

        {/* <div>
            <label htmlFor='type'>Type:</label>
            <select
                id='type'
                {...register('type')}
            >
                <option value=''>All</option>
                <option value='Cold Rolled'>  Cold Rolled </option>
            </select>
            {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
        </div> */}

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
