import React, { useEffect, useState } from 'react'
import style from './Booking.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { formatDate, formatTime } from 'utils/dateHandler';
import { cancelBooking, confirmBooking, deliverBooking, getAllIncompleteBookingsDetails, shipBooking } from 'services/operations/bookingAPI';
// import { getExcelBooking } from 'services/operations/utilAPI';
import { useOverlay } from 'hooks/useOverlay';
import ViewIncompleteBookingDetail from 'components/common/Overlay/ViewIncompleteBookingDetail';

const ViewIncompleteBooking = () => {
    const [view, setView] = useState('all');
    const [bookings, setBookings] = useState(null);
    const { userData } = useSelector((state) => state.auth);

    const { showOverlay, hideOverlay } = useOverlay();
    // const [height, setHeight] = useState(0);

    const dispatch = useDispatch();

    const [listing, setListing] = useState(null);

    useEffect(() => {
        getAllIncompleteBookingsDetails(setBookings, dispatch);
    }, [dispatch])

    useEffect(() => {
        if (bookings) {
            if (view === 'all') {
                setListing(bookings);
                console.log(bookings)
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

    const cancel = (field, id) => {
        if (field === null || field === '') {
            // setErrorCancel(true);
            // setError(false);
            return;
        }
        cancelBooking({ bookingId: id, reason: field }, dispatch, setBookings);
        hideOverlay()
    }

    const confirm = (field, id) => {
        if (field === null || field === '') {
            // setError(true);
            // setErrorCancel(false);
            return;
        }
        confirmBooking({ bookingId: id, orderId: field }, dispatch, setBookings);
        hideOverlay()
    }

    const ship = (field, id) => {
        if (field === null || field === '') {
            // setError(true);
            // setErrorCancel(false);
            return;
        }
        shipBooking({ bookingId: id, vehicleNumber: field }, dispatch, setBookings);
        hideOverlay()
    }

    const deliver = (field, id) => {
        if (field === null || field === '') {
            // setError(true);
            // setErrorCancel(false);
            return;
        }
        deliverBooking({ bookingId: id, description: field }, dispatch, setBookings);
        hideOverlay()
    }

    const status = {
        'Pending': {
            background: '#FFF4E5', // soft orange
            foreground: '#D97706'  // amber/dark orange
        },
        'Processing': {
            background: '#E0E7FF', // light indigo
            foreground: '#4338CA'  // deep indigo
        },
        'Shipped': {
            background: '#E0F2FE', // light blue
            foreground: '#0369A1'  // sky blue
        },
        'Delivered': {
            background: '#DCFCE7', // light green
            foreground: '#15803D'  // deep green
        },
        'Cancelled': {
            background: '#FEE2E2', // light red
            foreground: '#B91C1C'  // dark red
        }
    }

    const viewData = (data) => {
        showOverlay(ViewIncompleteBookingDetail, {
            type: 'showDetails',
            data: data,
            cancel,
            confirm,
            ship,
            deliver,
            userData,
            clickOutside: () => hideOverlay()
        })
    }

    return (
        <div className={style.ViewIncompleteBooking}>
            <h3>Required Actions</h3>
            <div>
                <div className={style.viewOptions}>
                    <button className={view === 'all' && style.selected} onClick={() => setView('all')}>All</button>
                    <button className={view === 'pending' && style.selected} onClick={() => setView('pending')}>Pending</button>
                    <button className={view === 'processing' && style.selected} onClick={() => setView('processing')}>Processing</button>
                    <button className={view === 'shipped' && style.selected} onClick={() => setView('shipped')}>Shipped</button>
                </div>

                <table className={style.table}>
                    <thead>
                        <tr>
                            {/* <th>Type</th> */}
                            <th style={{ minWidth: "8rem", width: "8rem", textAlign: "center" }}>Date</th>
                            <th style={{ minWidth: "3rem", width: "3rem" }}>Time</th>
                            {/* <th style={{ minWidth: "8rem", width: "8rem" }}>Material</th> */}
                            <th style={{ minWidth: "8rem", width: "8rem" }}>Booked By</th>
                            <th style={{ minWidth: "5rem", width: "5rem" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!(listing === null || listing.length === 0) && listing?.map((booking) => (
                            <tr onClick={() => viewData(booking)}>
                                <td>{formatDate(booking.bookingDate)}</td>
                                <td>{formatTime(booking.bookingDate)}</td>
                                {/* <td>{`${it.item?.thickness?.name} X ${it.item?.width?.name} X ${it.item?.grade?.name}`}</td> */}
                                <td>{`${booking.bookedBy.firstName} ${booking.bookedBy.lastName}`}</td>
                                <td><p className={style.coloredShipTo} style={{ background: status[booking.status].background, color: status[booking.status].foreground, border: `1px solid ${status[booking.status].foreground}` }}>{booking.status ?? "-"}</p></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(listing === null || listing.length === 0) && <div className={style.notFound}>
                    No booking found
                </div>}
            </div>

        </div >
    )
}

export default ViewIncompleteBooking