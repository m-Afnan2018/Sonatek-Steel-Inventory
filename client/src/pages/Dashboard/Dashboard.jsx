import React, { useEffect, useMemo, useState } from 'react';
import style from './Dashboard.module.css';
import { getAllUsers } from 'services/operations/userAPI';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';
import UpcomingDashboard from 'components/core/Dashboard/UpcomingDashboard';
import InventoryDashboard from 'components/core/Dashboard/InventoryDashboard';
import BookingDashboard from 'components/core/Dashboard/BookingDashboard';
import { MdOutlineDashboard } from 'react-icons/md';

const DASHBOARD_TABS = ['Upcoming', 'Inventory', 'Booking'];

const Dashboard = () => {
    const dispatch = useDispatch();
    const { upcomingItem, listViewList } = useSelector((state) => state.item);
    const { bookings, pendingBookings } = useSelector((state) => state.booking);
    const { allUsers } = useSelector((state) => state.user);

    const [selection, setSelection] = useState(() => localStorage.getItem('dashboard-tab') || 'Upcoming');

    useEffect(() => {
        getAllUsers(dispatch);
        getAllItem({ search: '' }, dispatch);
    }, [dispatch]);

    useEffect(() => {
        if (DASHBOARD_TABS.includes(selection)) {
            localStorage.setItem('dashboard-tab', selection);
        }
    }, [selection]);

    const selectedView = useMemo(() => {
        if (selection === 'Inventory') return <InventoryDashboard />;
        if (selection === 'Booking') return <BookingDashboard />;
        return <UpcomingDashboard />;
    }, [selection]);

    const dashboardStats = useMemo(
        () => [
            { label: 'Upcoming lots', value: upcomingItem?.length || 0 },
            { label: 'Inventory records', value: listViewList?.length || 0 },
            { label: 'Live bookings', value: bookings?.length || 0 },
            { label: 'Pending vehicles', value: pendingBookings?.length || 0 },
            { label: 'Active users', value: allUsers?.length || 0 },
        ],
        [allUsers?.length, bookings?.length, listViewList?.length, pendingBookings?.length, upcomingItem?.length],
    );

    return (
        <section className={`page-shell ${style.Dashboard}`}>
            <div className={style.dashboardHeader}>
                <h1>
                    <MdOutlineDashboard /> Operations Dashboard
                </h1>
                <p>Monitor inventory, upcoming stock, and booking movement with live insights.</p>
            </div>

            <div className={style.tabContainer} role='tablist' aria-label='Dashboard sections'>
                {DASHBOARD_TABS.map((tabItem) => (
                    <button
                        key={tabItem}
                        role='tab'
                        aria-selected={selection === tabItem}
                        className={selection === tabItem ? style.selected : ''}
                        onClick={() => setSelection(tabItem)}
                        type='button'
                    >
                        {tabItem}
                    </button>
                ))}
            </div>

            <div className={style.metricsGrid}>
                {dashboardStats.map((stat) => (
                    <article key={stat.label} className={style.metricCard}>
                        <p>{stat.label}</p>
                        <h2>{stat.value}</h2>
                    </article>
                ))}
            </div>

            <div className={style.contentCard}>{selectedView}</div>
        </section>
    );
};

export default Dashboard;
