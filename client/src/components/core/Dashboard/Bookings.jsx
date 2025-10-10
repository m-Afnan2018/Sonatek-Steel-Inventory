import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { fetchBookings } from "services/operations/bookingAPI";
import { useDispatch } from "react-redux";
import { useOverlay } from "hooks/useOverlay";
import Overlay from "components/common/Overlay/Overlay";

const Bookings = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState(null); // e.g., 'status'
    const [userFilter, setUserFilter] = useState(null);
    const [details, setDetails] = useState(null);

    const dispatch = useDispatch();

    const { showOverlay, hideOverlay } = useOverlay();

    const viewData = (data) => {
        showOverlay(Overlay, {
            type: 'showDetails',
            data: data,
            clickOutside: () => hideOverlay()
        })
    }

    const load = () => {
        setLoading(true);
        const params = { page, limit };
        if (search) params.search = search;
        if (sortBy) params.sortBy = sortBy;
        if (userFilter) params.userId = userFilter;

        fetchBookings(params, setData, setLoading, dispatch);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, sortBy, userFilter]);

    const onSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const onSortByStatus = () => {
        setSortBy((prev) => (prev === "status" ? null : "status"));
        setPage(1);
    };

    const onUserClick = (userId) => {
        setUserFilter(userId);
        setPage(1);
    };

    if (loading) return <div className={styles.loader}>Loading bookings...</div>;
    if (!data) return <div className={styles.error}>No data found</div>;

    const { summary, agents, bookings, pagination } = data;

    return (
        <div className={styles.Bookings}>
            <h2 className={styles.heading}>Bookings Overview</h2>

            {/* Summary Cards */}
            {summary && <div className={styles.summaryGrid}>
                {Object.entries(summary).map(([key, value]) => (
                    <div key={key} className={`${styles.card} ${styles[key]}`}>
                        <h4 className={styles.cardTitle}>{key.toUpperCase()}</h4>
                        <p className={styles.cardValue}>{value}</p>
                    </div>
                ))}
            </div>}

            {/* Agents Summary */}
            {agents && <div className={styles.agentsSection}>
                <h2>Agent-wise Report</h2>
                <div className={styles.agentGrid}>
                    {Object.entries(agents).map(([agent, info]) => (
                        <div key={agent} className={styles.agentCard}>
                            <h4
                                style={{ cursor: "pointer", color: "var(--primary)" }}
                                onClick={() => onUserClick(info.userId)}
                            >
                                {agent}
                            </h4>
                            <p>Total Bookings: {info.totalBookings}</p>
                            <p>Total Quantity: {info.totalQuantity}</p>
                        </div>
                    ))}
                </div>
            </div>}

            {/* Bookings Table */}
            <div className={styles.tableContainer}>
                <h2>All Bookings</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Agent</th>
                            <th onClick={onSortByStatus} style={{ cursor: "pointer" }}>
                                Status {sortBy === "status" ? "▲" : ""}
                            </th>
                            <th>Date</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking._id} onClick={() => viewData(booking)} style={{ cursor: "pointer" }}>
                                <td>{booking.orderId || 'Processing'}</td>
                                <td
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUserClick(booking.bookedBy?._id);
                                    }}
                                >
                                    {booking.bookedBy?.firstName || "N/A"}
                                </td>
                                <td className={styles[booking.status.toLowerCase()]}>
                                    {booking.status}
                                </td>
                                <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                <td>
                                    {booking.items.map((it, idx) => (
                                        <div key={idx} className={styles.itemDetails}>
                                            <p>
                                                {it.item?.type} | {it.item?.grade?.name} | {" "}
                                                {it.item?.width?.name}mm | {it.item?.thickness?.name}mm
                                            </p>
                                            <small>Qty: {it.quantity}ton</small>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Top controls: Search and pagination info */}
                <div className={styles.controlsRow}>
                    <form onSubmit={onSearch} className={styles.searchForm}>
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchButton}>Search</button>
                    </form>

                    <div className={styles.paginationControls}>
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            Prev
                        </button>
                        <div className={styles.paginationInfo}>
                            Page {page} of {pagination?.totalPages || 1}
                        </div>
                        <button
                            onClick={() => setPage((p) => (p < (pagination?.totalPages || 1) ? p + 1 : p))}
                            disabled={page >= (pagination?.totalPages || 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Pagination controls */}
            </div>

            {/* Details modal / panel */}
            {details && (
                <div className={styles.detailsModal} onClick={() => setDetails(null)}>
                    <div className={styles.detailsContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Booking Details - {details.booking_id}</h3>
                        <p>Agent: {details.bookedBy?.firstName} {details.bookedBy?.lastName}</p>
                        <p>Status: {details.status}</p>
                        <p>Quantity: {details.quantity}</p>
                        <p>Requirement: {details.requirement}</p>
                        <p>Vehicle: {details.vehicleNumber}</p>
                        <p>Date: {new Date(details.bookingDate).toLocaleString()}</p>

                        <h4>Items</h4>
                        {details.items.map((it, idx) => (
                            <div key={idx} className={styles.itemDetails}>
                                <p>
                                    {it.item?.type} | {it.item?.grade?.name} | {it.item?.width?.name}mm | {it.item?.thickness?.name}mm
                                </p>
                                <small>Qty: {it.quantity}</small>
                            </div>
                        ))}

                        <div className={styles.modalActions}>
                            <button onClick={() => setDetails(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
