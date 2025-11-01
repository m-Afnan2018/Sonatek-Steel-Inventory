import React, { useEffect } from 'react'
import style from './Booking.module.css'
// import SearchForm from 'components/core/Booking/SearchForm'
// import Choices from 'components/core/Booking/Choices'
import { getAllBookings, getMyBookings } from '../../services/operations/bookingAPI'
// import ViewAll from 'components/core/Booking/ViewAll'
import { useDispatch, useSelector } from 'react-redux'
import Items from 'components/core/Booking/Items'
import ViewTablewise from 'components/core/Booking/ViewTablewise'
import ViewIncompleteBooking from 'components/core/Booking/ViewIncompleteBooking'

const Booking = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userData && (userData.role === 'admin' || userData.role === 'accountant' || userData.role === 'directors')) {
            getAllBookings(dispatch);
        } else {
            getMyBookings(dispatch);
        }
    }, [dispatch, userData, userData.role])


    return (
        <div className={style.Booking}>
            <Items />

            {/* Create Booking Form */}
            {/* <SearchForm /> */}

            {/* View my choice */}
            {/* <Choices /> */}

            {/* View All Bookings */}
            {/* <ViewAll /> */}
            <ViewIncompleteBooking />

            <ViewTablewise />
        </div>

    )
}

export default Booking