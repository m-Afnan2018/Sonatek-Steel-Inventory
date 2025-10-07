import React from 'react'
import style from './Dashboard.module.css'
import Staff from 'components/core/Dashboard/Staff'
import Items from 'components/core/Dashboard/Items'
import Varient from 'components/core/Dashboard/Varient'
import Bookings from 'components/core/Dashboard/Bookings'

const Dashboard = () => {
    return (
        <div className={style.Dashboard}>
            <h2>Dashboard</h2>

            <Staff />

            <Items />

            <Varient />

            <Bookings />
        </div>
    )
}

export default Dashboard