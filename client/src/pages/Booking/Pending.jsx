import React, { useEffect, useMemo, useState } from 'react';
import style from './Booking.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate } from 'utils/dateHandler';
import { getMarkedItem } from 'services/operations/itemAPI';

const Pending = () => {
    const dispatch = useDispatch();
    const { pendingBookings } = useSelector((state) => state.booking);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!pendingBookings) {
            getMarkedItem(dispatch);
        }
    }, [dispatch, pendingBookings]);

    const bookings = useMemo(() => {
        if (!pendingBookings?.length) return [];

        const normalizedQuery = searchTerm.trim().toLowerCase();
        if (!normalizedQuery) return pendingBookings;

        return pendingBookings.filter((booking) => {
            const lookup = [
                booking?.item_id,
                booking?.id,
                booking?.remark,
                booking?.status,
                booking?.warehouse?.name,
                booking?.grade?.name,
                booking?.thickness?.name,
                booking?.width?.name,
                booking?.bookedBySnapshot?.name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return lookup.includes(normalizedQuery);
        });
    }, [pendingBookings, searchTerm]);

    const getStatusClass = (status) => {
        const normalizedStatus = (status || '').toLowerCase();
        if (normalizedStatus.includes('pending')) return style.pending;
        if (normalizedStatus.includes('booked')) return style.success;
        if (normalizedStatus.includes('cancel')) return style.error;
        return style.default;
    };

    return (
        <section className={style.pendingContainer}>
            <div className={style.pendingHeader}>
                <div>
                    <h2>Pending Booking Queue</h2>
                    <p>Track inventory already marked for booking and keep dispatches aligned.</p>
                </div>

                <label htmlFor='pending-search' className={style.searchFieldLabel}>
                    Search pending inventory
                    <input
                        id='pending-search'
                        aria-label='Search pending inventory'
                        type='search'
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder='Search by lot, remark, warehouse...'
                    />
                </label>
            </div>

            <div className={style.pendingTableWrapper}>
                <table className={style.table}>
                    <thead>
                        <tr>
                            <th>Lot ID</th>
                            <th>Description</th>
                            <th>Warehouse</th>
                            <th>Marked On</th>
                            <th>Status</th>
                            <th>Remark</th>
                        </tr>
                    </thead>

                    <tbody>
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking.item_id || booking.id || '-'}</td>
                                    <td>{`${booking?.thickness?.name || '-'} X ${booking?.width?.name || '-'} X ${booking?.grade?.name || '-'}`}</td>
                                    <td>{booking?.warehouse?.name || '-'}</td>
                                    <td>{booking?.updatedAt ? formatDate(booking.updatedAt) : '-'}</td>
                                    <td>
                                        <span className={`${style.statusBadge} ${getStatusClass(booking?.status || 'Pending')}`}>
                                            {booking?.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>{booking?.remark || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan='6' className={style.notFound}>
                                    No pending bookings found for this query.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Pending;
