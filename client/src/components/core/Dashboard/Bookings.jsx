import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { getAllBookingsDetails } from "services/operations/bookingAPI";

const Bookings = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllBookingsDetails(setData, setLoading);
        // const fetchBookings = async () => {
        //     setLoading(true);
        //     const res = await getAllBookings();
        //     if (res?.success) setData(res.data);
        //     setLoading(false);
        // };
        // fetchBookings();
    }, []);

    if (loading) return <div className={styles.loader}>Loading bookings...</div>;
    if (!data) return <div className={styles.error}>No data found</div>;

    const { summary, agents, bookings } = data;

    return (
        <div className={styles.Bookings}>
            <h2 className={styles.heading}>Bookings Overview</h2>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                {Object.entries(summary).map(([key, value]) => (
                    <div key={key} className={`${styles.card} ${styles[key]}`}>
                        <h4 className={styles.cardTitle}>{key.toUpperCase()}</h4>
                        <p className={styles.cardValue}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Agents Summary */}
            <div className={styles.agentsSection}>
                <h3>Agent-wise Report</h3>
                <div className={styles.agentGrid}>
                    {Object.entries(agents).map(([agent, info]) => (
                        <div key={agent} className={styles.agentCard}>
                            <h4>{agent}</h4>
                            <p>Total Bookings: {info.totalBookings}</p>
                            <p>Total Quantity: {info.totalQuantity}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bookings Table */}
            <div className={styles.tableContainer}>
                <h3>All Bookings</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Agent</th>
                            <th>Status</th>
                            <th>Quantity</th>
                            <th>Requirement</th>
                            <th>Vehicle</th>
                            <th>Date</th>
                            <th>Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{booking.booking_id}</td>
                                <td>{booking.bookedBy?.firstName || "N/A"}</td>
                                <td className={styles[booking.status.toLowerCase()]}>
                                    {booking.status}
                                </td>
                                <td>{booking.quantity}</td>
                                <td>{booking.requirement}</td>
                                <td>{booking.vehicleNumber || "N/A"}</td>
                                <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                <td>
                                    {booking.items.map((it, idx) => (
                                        <div key={idx} className={styles.itemDetails}>
                                            <p>
                                                {it.item?.type} | {it.item?.grade?.name} |{" "}
                                                {it.item?.width?.name}mm | {it.item?.thickness?.name}mm
                                            </p>
                                            <small>Qty: {it.quantity}</small>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Bookings;
