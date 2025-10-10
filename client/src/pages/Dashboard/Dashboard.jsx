import React, { useEffect } from 'react'
import style from './Dashboard.module.css'
import Staff from 'components/core/Dashboard/Staff'
import Items from 'components/core/Dashboard/Items'
import Varient from 'components/core/Dashboard/Varient'
import Bookings from 'components/core/Dashboard/Bookings'
import { getAllUsers } from 'services/operations/userAPI'
import { useDispatch } from 'react-redux'
import { getAllItem } from 'services/operations/itemAPI'

const Dashboard = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        getAllUsers(dispatch);
        getAllItem({ search: '' }, dispatch)
    }, [dispatch])

    return (
        <div className={style.Dashboard}>
            <h2>Dashboard</h2>
            <Bookings />

            <Staff />

            <Varient />

            <Items />
        </div>
    )
}

export default Dashboard