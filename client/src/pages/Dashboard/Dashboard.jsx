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

    const { token, userData } = useSelector((state) => state.auth);
    useEffect(() => {
        getAllUsers(dispatch);
        getAllItem({ search: '' }, dispatch)
    }, [dispatch])

    const onDownload = async () => {
        try {
            // const response = await fetch('http://localhost:4000/api/v1/booking/getExcelBooking', {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem(token)}`
            //     }
            // });
            const response = await fetch('http://localhost:4000/api/v1/item/downloadTemplate', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(token)}`
                }
            });
            // const response = await fetch('http://localhost:4000/api/v1/item/getExcelItem', {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem(token)}`
            //     }
            // });
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Item-Data-${Date.now()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
        }
    };


    return (
        <div className={style.Dashboard}>
            <h2>Dashboard</h2>
            <button onClick={onDownload}>Download Excel</button>
            {/* <UploadCSV /> */}
            {['admin', 'director', 'inventory_associate'].includes(userData.role) && <Bookings />}

            {/* {['admin', 'director', 'ad'].includes(userData.role) && <Staff />} */}

            <Varient />

            <Items />
        </div>
    )
}

export default Dashboard