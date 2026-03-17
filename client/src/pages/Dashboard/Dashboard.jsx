import React, { useEffect, useMemo, useState } from 'react';
import style from './Dashboard.module.css';
import { getAllUsers } from 'services/operations/userAPI';
import { useDispatch } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';
import UpcomingDashboard from 'components/core/Dashboard/UpcomingDashboard';
import InventoryDashboard from 'components/core/Dashboard/InventoryDashboard';
import BookingDashboard from 'components/core/Dashboard/BookingDashboard';
import { MdOutlineDashboard } from 'react-icons/md';

const DASHBOARD_TABS = ['Upcoming', 'Inventory', 'Booking'];

const Dashboard = () => {
    const dispatch = useDispatch();

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

    return (
        <section className={style.Dashboard}>
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

            <div className={style.contentCard}>{selectedView}</div>
        </section>
    );
};

export default Dashboard;
