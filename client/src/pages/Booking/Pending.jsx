import React, { useEffect, useState } from 'react';
import style from './Booking.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate } from 'utils/dateHandler';
import { useOverlay } from 'hooks/useOverlay';
import { getMarkedItem } from 'services/operations/itemAPI';

const Pending = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.auth);
    const { pendingBookings } = useSelector((state) => state.booking);
    const { showOverlay } = useOverlay();

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        setBookings(pendingBookings);
    }, [pendingBookings])

    // Fetch all bookings once
    useEffect(() => {
        if (!pendingBookings) {
            getMarkedItem(dispatch)
        }
    }, [dispatch]);

    return (
        <div className={style.ViewIncompleteBooking}>

            <table className={style.table}>
                <thead>
                    <tr>
                        <th style={{ width: '20%' }}>ID</th>
                        <th style={{ width: '20%' }}>Description</th>
                        <th style={{ width: '20%' }}>Booked By</th>
                        <th style={{ width: '20%' }}>Status</th>
                        <th style={{ width: '20%' }}>Remark</th>
                    </tr>
                </thead>

                <tbody>
                    {bookings && bookings.length > 0 ? (
                        bookings.map((booking) => {
                            return (
                                <tr key={booking._id} >
                                    <td>{}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className={style.notFound}>
                                No Pending Order Found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Pending;
