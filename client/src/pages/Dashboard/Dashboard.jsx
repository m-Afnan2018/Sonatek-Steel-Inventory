import React, { useEffect } from 'react'
import style from './Dashboard.module.css'
// import Staff from 'components/core/Users/Staff'
import Items from 'components/core/Dashboard/Items'
import Varient from 'components/core/Dashboard/Varient'
import Bookings from 'components/core/Dashboard/Bookings'
import { getAllUsers } from 'services/operations/userAPI'
import { useDispatch, useSelector } from 'react-redux'
import { getAllItem } from 'services/operations/itemAPI'
// import UploadCSV from 'components/core/Inventory/UploadCSV'

const Dashboard = () => {
    const dispatch = useDispatch();

    const { userData } = useSelector((state) => state.auth);
    useEffect(() => {
        getAllUsers(dispatch);
        getAllItem({ search: '' }, dispatch)
    }, [dispatch])


    return (
        <div className={style.Dashboard}>
            <h2>Dashboard</h2>
            {/* <UploadCSV /> */}
            {['admin', 'director', 'inventory_associate'].includes(userData.role) && <Bookings />}

            {/* {['admin', 'director', 'ad'].includes(userData.role) && <Staff />} */}

            <Varient />

            <Items />
        </div>
    )
}

export default Dashboard