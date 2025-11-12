import React, { useEffect, useState } from 'react'
import style from './Dashboard.module.css'
import { getAllUsers } from 'services/operations/userAPI'
import { useDispatch } from 'react-redux'
import { getAllItem } from 'services/operations/itemAPI'
import UpcomingDashboard from 'components/core/Dashboard/UpcomingDashboard'
import InventoryDashboard from 'components/core/Dashboard/InventoryDashboard'
import BookingDashboard from 'components/core/Dashboard/BookingDashboard'

const Dashboard = () => {
    const dispatch = useDispatch();

    const [selection, setSelection] = useState('Upcoming');

    useEffect(() => {
        getAllUsers(dispatch);
        getAllItem({ search: '' }, dispatch)
    }, [dispatch])

    return (
        <div className={style.Dashboard}>
            <div>
                <button className={selection === 'Upcoming' ? style.selected : ''} onClick={() => setSelection('Upcoming')}>Upcoming</button>
                <button className={selection === 'Inventory' ? style.selected : ''} onClick={() => setSelection('Inventory')}>Inventory</button>
                {/* <button onClick={() => setSelection('Cutter')}>Cutters</button> */}
                <button className={selection === 'Booking' ? style.selected : ''} onClick={() => setSelection('Booking')}>Bookings</button>
            </div>
            <div>
                {selection === 'Upcoming' && <UpcomingDashboard />}
                {selection === 'Inventory' && <InventoryDashboard />}
                {selection === 'Booking' && <BookingDashboard />}
            </div>
        </div>
    )
}

export default Dashboard