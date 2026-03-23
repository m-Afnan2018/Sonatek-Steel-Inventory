import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { getAllUsers } from 'services/operations/userAPI';
import { useDispatch } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';
import UpcomingDashboard from 'components/core/Dashboard/UpcomingDashboard';
import InventoryDashboard from 'components/core/Dashboard/InventoryDashboard';
import BookingDashboard from 'components/core/Dashboard/BookingDashboard';

const TABS = [
  { key: 'Upcoming', label: 'Upcoming' },
  { key: 'Inventory', label: 'Inventory' },
  { key: 'Booking', label: 'Bookings' },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const [selection, setSelection] = useState('Upcoming');

  useEffect(() => {
    getAllUsers(dispatch);
    getAllItem({ search: '' }, dispatch);
  }, [dispatch]);

  return (
    <div className={style.Dashboard}>
      {/* Tab bar */}
      <div className={style.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${style.tab} ${selection === tab.key ? style.selected : ''}`}
            onClick={() => setSelection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={style.content}>
        {selection === 'Upcoming' && <UpcomingDashboard />}
        {selection === 'Inventory' && <InventoryDashboard />}
        {selection === 'Booking' && <BookingDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
