import React, { useEffect, useState } from 'react'
import style from './Booking.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { formatDate, formatTime } from 'utils/dateHandler';
import { cancelBooking, confirmBooking, deliverBooking, shipBooking } from 'services/operations/bookingAPI';
import { getExcelBooking } from 'services/operations/utilAPI';

const ViewAll = () => {
    const [view, setView] = useState('all');
    const { bookings, pagination } = useSelector(state => state.booking);
    const { userData } = useSelector((state) => state.auth);
    const [select, setSelect] = useState(null);
    const [field, setField] = useState(null);
    const [error, setError] = useState(false);
    const [errorCancel, setErrorCancel] = useState(false);
    // const [height, setHeight] = useState(0);

    const dispatch = useDispatch();

    const [listing, setListing] = useState(null);

    useEffect(() => {
        setError(false);
        setSelect(null);
        if (bookings) {
            if (view === 'all') {
                setListing(bookings);
            } else if (view === 'pending') {
                setListing(bookings.filter((item) => item.status === 'Pending'));
            } else if (view === 'cancelled') {
                setListing(bookings.filter((item) => item.status === 'Cancelled'));
            } else if (view === 'processing') {
                setListing(bookings.filter((item) => item.status === 'Processing'));
            } else if (view === 'shipped') {
                setListing(bookings.filter((item) => item.status === 'Shipped'));
            } else if (view === 'delivered') {
                setListing(bookings.filter((item) => item.status === 'Delivered'));
            }
        }
    }, [bookings, view])

    useEffect(() => {
        setError(false);
        setField('')
    }, [select])

    const cancel = (id, e) => {
        e.stopPropagation();
        if (field === null || field === '') {
            setErrorCancel(true);
            setError(false);
            return;
        }
        cancelBooking({ bookingId: id }, dispatch);
        setField('');
    }

    const confirm = (id, e) => {
        e.stopPropagation();
        if (field === null || field === '') {
            setError(true);
            setErrorCancel(false);
            return;
        }
        confirmBooking({ bookingId: id, orderId: field }, dispatch);
        setField('');
    }

    const ship = (id, e) => {
        e.stopPropagation();
        if (field === null || field === '') {
            setError(true);
            setErrorCancel(false);
            return;
        }
        shipBooking({ bookingId: id, vehicleNumber: field }, dispatch);
        setField('');
    }

    const onClickNext = () => {

    }
    const onClickPrev = () => {

    }

    const deliver = (id, e) => {
        e.stopPropagation();
        if (field === null || field === '') {
            setError(true);
            setErrorCancel(false);
            return;
        }
        deliverBooking({ bookingId: id, description: field }, dispatch);
        setField('');
    }

    const selectItem = (id) => {
        if (select === id) {
            setSelect(null)
        } else {
            // const item = bookings.filter(item => item._id === id);
            setSelect(id);
            // let height = (11 * 2) + 8.5;
            // if (item.status === 'Pending' || item.status === 'Processing') {
            //     height += 3.5 + 2.725;
            // }
            // setHeight(height)
        }
    }

    return (
        <div className={style.viewAll}>
            <h3>Your all bookings</h3>
            <div>
                <div className={style.viewOptions}>
                    <button className={view === 'all' && style.selected} onClick={() => setView('all')}>All</button>
                    <button className={view === 'pending' && style.selected} onClick={() => setView('pending')}>Pending</button>
                    <button className={view === 'cancelled' && style.selected} onClick={() => setView('cancelled')}>Cancelled</button>
                    <button className={view === 'processing' && style.selected} onClick={() => setView('processing')}>Processing</button>
                    <button className={view === 'shipped' && style.selected} onClick={() => setView('shipped')}>Shipped</button>
                    <button className={view === 'delivered' && style.selected} onClick={() => setView('delivered')}>Delivered</button>
                </div>
                <div className={style.allItems} style={{ padding: listing === null || listing.length === 0 ? '0 0.5rem' : '0.5rem' }}>
                    {
                        (listing && listing.length !== 0) && listing.map((booking) => {
                            return <div className={style.items} onClick={() => selectItem(booking._id)}>
                                <h2>{userData.role === 'admin' ? `${booking.bookedBy} - ` : ''}{formatDate(booking.bookingDate)} - {formatTime(booking.bookingDate)}</h2>
                                <div style={{ height: select === booking._id ? `45rem` : '0' }}>
                                    <div>
                                        <h4>Booking Date</h4>
                                        <h5>{formatDate(booking.bookingDate)}</h5>
                                    </div>
                                    <div>
                                        <h4>Status</h4>
                                        <h5>{booking.status}</h5>
                                    </div>
                                    <div>
                                        <h4>Quantity</h4>
                                        <h5>{booking.quantity}</h5>
                                    </div>
                                    <div>
                                        <h4>Requirement</h4>
                                        <h5>{booking.requirement}</h5>
                                    </div>
                                    <div>
                                        <h4>Booked By</h4>
                                        <h5>{booking.bookedBy}</h5>
                                    </div>
                                    <div>
                                        <h4>Type</h4>
                                        <h5>{booking.type}</h5>
                                    </div>
                                    <div>
                                        <h4>Grade</h4>
                                        <h5>{booking.grade}</h5>
                                    </div>
                                    <div>
                                        <h4>Form Type</h4>
                                        <h5>{booking.formType}</h5>
                                    </div>
                                    <div>
                                        <h4>Thickness</h4>
                                        <h5>{booking.thickness}</h5>
                                    </div>
                                    <div>
                                        <h4>Order ID</h4>
                                        <h5>{booking.orderId || 'NA'}</h5>
                                    </div>
                                    <div>
                                        <h4>Vehicle Number</h4>
                                        <h5>{booking.vehicleNumber || 'NA'}</h5>
                                    </div>
                                    <div>
                                        <h4>{booking.status === 'Cancelled' ? 'Reason for cancellation' : 'Description'}</h4>
                                        <h5>{booking.description || 'NA'}</h5>
                                    </div>
                                    <div className={style.wagons}>
                                        {
                                            booking.wagons.map((wagon) => {
                                                return <div className={style.singleWagon}>
                                                    <div>
                                                        <h4>Wagon Number:</h4>
                                                        <h4>{wagon.wagonNumber}</h4>
                                                    </div>
                                                    <div>
                                                        <h4>Quanity: </h4>
                                                        <h4>{wagon.quantityTaken}</h4>
                                                    </div>
                                                    <div>
                                                        <h4>Challan Number: </h4>
                                                        <h4>{wagon.challanNumber}</h4>
                                                    </div>
                                                    <div>
                                                        <h4>Challan Date:</h4>
                                                        <h4>{formatDate(wagon.challanDate)}</h4>
                                                    </div>
                                                </div>
                                            })
                                        }
                                    </div>
                                    {['admin', 'director', 'accountant'].includes(userData.role) && (booking.status === 'Pending' || booking.status === 'Processing' || booking.status === 'Shipped') && <div className={style.inputField}>
                                        <input value={field} type='text' placeholder={booking.status === 'Pending' ? 'Enter the Order id to confirm order or reason to cancel' : booking.status === 'Processing' ? 'Enter the Vechicle number to confirm deliver it or reason to cancel' : 'Enter the description to confirm delivery or reason to cancel or reason to cancel'} onClick={(e) => e.stopPropagation()} onChange={(e) => setField(e.target.value)} />
                                        <span style={{ height: error ? '1rem' : '0' }}>Please enter the {booking.status === 'Pending' ? 'Order ID.' : booking.status === 'Processing' ? 'Vechicle Number.' : 'Description.'}</span>
                                        <span style={{ height: errorCancel ? '1rem' : '0' }}>Please enter the Reason for cancellation</span>
                                    </div>}
                                    {['admin', 'director', 'accountant'].includes(userData.role) && booking.status !== 'Cancelled' && <div style={{ borderBottom: '0' }}>
                                        {booking.status !== 'Delivered' && <button onClick={(e) => cancel(booking._id, e)}>Cancel Booking</button>}
                                        {booking.status === 'Pending' && booking.status !== 'Processing' && <button onClick={(e) => confirm(booking._id, e)}>Confirm Booking</button>}
                                        {booking.status === 'Processing' && <button onClick={(e) => ship(booking._id, e)}>Shipped</button>}
                                        {booking.status === 'Shipped' && <button onClick={(e) => deliver(booking._id, e)}>Delivered</button>}
                                    </div>}
                                </div>
                            </div>

                        })
                    }
                </div>
                {(listing === null || listing.length === 0) && <div className={style.notFound}>
                    No booking found
                </div>}

                {/* Top controls: Search and pagination info */}
                <div className={style.controlsRow}>
                    <button onClick={getExcelBooking}>Download</button>

                    <div className={style.paginationControls}>
                        <button onClick={onClickPrev} disabled={pagination?.page === 1}>
                            Prev
                        </button>
                        <div className={style.paginationInfo}>
                            Page {pagination?.page} of {pagination?.totalPages || 1}
                        </div>
                        <button
                            onClick={onClickNext}
                            disabled={pagination?.page >= (pagination?.totalPages || 1)}
                        >s
                            Next
                        </button>
                    </div>
                </div>
            </div>

        </div >
    )
}

export default ViewAll