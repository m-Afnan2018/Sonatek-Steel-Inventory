import React, { useEffect, useState } from 'react';
import style from './Booking.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate } from 'utils/dateHandler';
import {
    cancelBooking,
    confirmBooking,
    deliverBooking,
    getAllIncompleteBookingsDetails,
    shipBooking,
    updateRemark,
} from 'services/operations/bookingAPI';
import { useOverlay } from 'hooks/useOverlay';
import ViewIncompleteBookingDetail from 'components/common/Overlay/ViewIncompleteBookingDetail';

const STATUS_STYLES = {
    Pending: { background: 'var(--warning-muted)', foreground: 'var(--warning)' },
    Processing: { background: 'var(--accent-muted)', foreground: 'var(--accent)' },
    Shipped: { background: 'var(--info-muted)', foreground: 'var(--info)' },
    Delivered: { background: 'var(--success-muted)', foreground: 'var(--success)' },
    Cancelled: { background: 'var(--danger-muted)', foreground: 'var(--danger)' },
};

const ViewIncompleteBooking = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.auth);
    const { incompleteBookings } = useSelector((state) => state.booking);
    const { showOverlay, hideOverlay } = useOverlay();

    const [bookings, setBookings] = useState([]);
    const [listing, setListing] = useState([]);
    const [view, setView] = useState('all');
    const [editable, setEditable] = useState({ field: '', id: '', value: '' });

    useEffect(() => {
        setBookings(incompleteBookings);
        console.log(incompleteBookings);
    }, [incompleteBookings])

    // Fetch all bookings once
    useEffect(() => {
        getAllIncompleteBookingsDetails(setBookings, dispatch);
    }, [dispatch]);

    // Filter bookings whenever "bookings" or "view" changes
    useEffect(() => {
        if (!bookings) return;

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const filtered = bookings.filter((item) => {
            const bookingDate = new Date(item.bookingDate);
            if (view === 'pending') return bookingDate < threeDaysAgo;
            if (view === 'processing') return bookingDate >= threeDaysAgo;
            return true; // for "all"
        });

        setListing(filtered);
    }, [bookings, view]);

    // Common actions
    const handleAction = (apiFn, payload) => {
        if (!payload?.bookingId || !payload?.fieldValue) {
            return;
        }
        apiFn(payload, dispatch, setBookings);
        hideOverlay();
    };

    const cancel = (reason, id) => handleAction(cancelBooking, { bookingId: id, fieldValue: reason });
    const confirm = (orderId, id) => handleAction(confirmBooking, { bookingId: id, fieldValue: orderId });
    const ship = (vehicleNumber, id) => handleAction(shipBooking, { bookingId: id, fieldValue: vehicleNumber });
    const deliver = (desc, id) => handleAction(deliverBooking, { bookingId: id, fieldValue: desc });

    // Overlay view
    const viewData = (data) => {
        showOverlay(ViewIncompleteBookingDetail, {
            type: 'showDetails',
            data,
            cancel,
            confirm,
            ship,
            deliver,
            userData,
            clickOutside: hideOverlay,
        });
    };

    // Inline editing
    const startEdit = (field, id, value) => setEditable({ field, id, value });
    const cancelEdit = () => setEditable({ field: '', id: '', value: '' });
    const saveEdit = () => {
        updateRemark({ bookingId: editable.id, remark: editable.value }, dispatch, setBookings);
        cancelEdit();
    };

    const renderEditableField = () => (
        <div onClick={(e) => e.stopPropagation()} className={style.inlineEdit}>
            <input
                style={{ padding: '0.25rem', width: '6.25rem' }}
                type="text"
                value={editable.value}
                onChange={(e) => setEditable((prev) => ({ ...prev, value: e.target.value }))}
                autoFocus
            />
            <div className={style.inlineButtons}>
                <button type="button" onClick={saveEdit}>Save</button>
                <button type="button" onClick={cancelEdit}>Cancel</button>
            </div>
        </div>
    );

    return (
        <div className={style.ViewIncompleteBooking}>
            <h3>Required Actions</h3>

            <div className={style.viewOptions}>
                {['all', 'pending', 'processing'].map((v) => (
                    <button
                        key={v}
                        className={view === v ? style.selected : ''}
                        onClick={() => setView(v)}
                    >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>

            <table className={style.table}>
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>ID</th>
                        <th style={{ width: '20%' }}>Party Name</th>
                        <th style={{ width: '20%' }}>Time</th>
                        <th style={{ width: '20%' }}>Booked By</th>
                        <th style={{ width: '20%' }}>Status</th>
                        <th style={{ width: '20%' }}>Remark</th>
                    </tr>
                </thead>

                <tbody>
                    {listing.length > 0 ? (
                        listing.map((booking) => {
                            const threeDaysAgo = new Date();
                            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                            const bookingDate = new Date(booking.bookingDate);
                            let status;
                            if (bookingDate < threeDaysAgo) {
                                status = 'Pending';
                            } else {
                                status = 'Processing';
                            }
                            const s = STATUS_STYLES[status] || {};;
                            const isEditing =
                                editable.id === booking._id && editable.field === 'remark';

                            return (
                                <tr key={booking._id} onClick={() => viewData(booking)}>
                                    <td>{booking?.order_id}</td>
                                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{booking.partySnapshot?.name}</td>
                                    <td>{formatDate(booking.bookingDate)}</td>
                                    <td style={{ fontWeight: '500', textDecoration: 'underline' }}>{`${booking.bookedBy.firstName} ${booking.bookedBy.lastName}`}</td>
                                    <td style={{ display: 'flex' }}>
                                        <p
                                            className={style.coloredShipTo}
                                            style={{
                                                background: s.background,
                                                color: s.foreground,
                                                border: `1px solid ${s.foreground}`,
                                            }}
                                        >
                                            {status ?? '-'}
                                        </p>
                                    </td>
                                    <td onClick={(e) => { e.stopPropagation(); startEdit('remark', booking._id, booking.remark || ''); }}>
                                        {isEditing ? renderEditableField() : booking.remark || '-'}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className={style.notFound}>
                                No booking found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ViewIncompleteBooking;
