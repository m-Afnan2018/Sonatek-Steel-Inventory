import React, { useEffect, useState } from 'react'
import style from './Booking.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { formatDate, formatTime } from 'utils/dateHandler';
import { cancelBooking, confirmBooking, deliverBooking } from 'services/operations/bookingAPI';

const ViewAll = () => {
    const [view, setView] = useState('all');
    const { bookings } = useSelector(state => state.booking);
    const [select, setSelect] = useState(null);
    const [field, setField] = useState(null);
    const [error, setError] = useState(false);

    const dispatch = useDispatch();

    const [listing, setListing] = useState(null);

    useEffect(() => {
        setError(false);
        if (bookings) {
            if (view === 'all') {
                setListing(bookings);
            } else if (view === 'pending') {
                setListing(bookings.filter((item) => item.status === 'Pending'));
            } else if (view === 'cancelled') {
                setListing(bookings.filter((item) => item.status === 'Cancelled'));
            } else if (view === 'processing') {
                setListing(bookings.filter((item) => item.status === 'Processing'));
            } else if (view === 'delivered') {
                setListing(bookings.filter((item) => item.status === 'Delivered'));
            }
        }
    }, [bookings, view])

    useEffect(() => {
        setError(false);
    }, [select])

    useEffect(() => { setField(null) }, [])

    const cancel = (id) => {
        cancelBooking({ bookingId: id }, dispatch);
    }

    const confirm = (id, e) => {
        e.stopPropagation();
        if (field === null || field === '') {
            setError(true);
            return;
        }
        confirmBooking({ bookingId: id, orderId: field }, dispatch);
    }

    const deliver = (id, e) => {
        e.stopPropagation();
        if (field === null || field === '') {
            setError(true);
            return;
        }
        deliverBooking({ bookingId: id, vehicle_number: field }, dispatch);
    }

    const selectItem = (id) => {
        if (select === id) {
            setSelect(null)
        } else {
            setSelect(id);
        }
    }

    return (
        <div className={style.viewAll}>
            <h2>Your all bookings</h2>
            <div>
                <div className={style.viewOptions}>
                    <button className={view === 'all' && style.selected} onClick={() => setView('all')}>All</button>
                    <button className={view === 'pending' && style.selected} onClick={() => setView('pending')}>Pending</button>
                    <button className={view === 'cancelled' && style.selected} onClick={() => setView('cancelled')}>Cancelled</button>
                    <button className={view === 'processing' && style.selected} onClick={() => setView('processing')}>Processing</button>
                    <button className={view === 'delivered' && style.selected} onClick={() => setView('delivered')}>Delivered</button>
                </div>
                <div className={style.allItems} style={{ padding: listing === null || listing.length === 0 ? '0 0.5rem' : '0.5rem' }}>
                    {
                        (listing && listing.length !== 0) && listing.map((booking) => {
                            return <div className={style.items} onClick={() => selectItem(booking._id)}>
                                <h2>{booking.bookedBy} - {formatDate(booking.bookingDate)} - {formatTime(booking.bookingDate)}</h2>
                                <div style={{ height: select === booking._id ? '35rem' : '0' }}>
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
                                    {(booking.status === 'Pending' || booking.status === 'Processing') && <div className={style.inputField}>
                                        <input type='text' placeholder={booking.status === 'Pending' ? 'Enter the Order id to confirm order.' : 'Enter the Vechicle number to confirm deliver it'} value={field} onClick={(e) => e.stopPropagation()} onChange={(e) => setField(e.target.value)} />
                                        <span style={{ height: error ? '1rem' : '0' }}>Please enter the {booking.status === 'Pending' ? 'Order ID.' : 'Vechicle Number.'}</span>
                                    </div>}
                                    {booking.status !== 'Cancelled' && <div style={{ borderBottom: '0' }}>
                                        {booking.status !== 'Delivered' && <button onClick={() => cancel(booking._id)}>Cancel Booking</button>}
                                        {booking.status === 'Pending' && booking.status !== 'Processing' && <button onClick={(e) => confirm(booking._id, e)}>Confirm Booking</button>}
                                        {booking.status === 'Processing' && <button onClick={(e) => deliver(booking._id, e)}>Delivered</button>}
                                    </div>}
                                </div>
                            </div>

                        })
                    }
                </div>
                {(listing === null || listing.length === 0) && <div className={style.notFound}>
                    No booking found
                </div>}
            </div>

        </div >
    )
}

export default ViewAll