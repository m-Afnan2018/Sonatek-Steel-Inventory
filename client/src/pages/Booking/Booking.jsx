import React, { useEffect } from 'react'
import style from './Booking.module.css'
import SearchForm from 'components/core/Booking/SearchForm'
import Choices from 'components/core/Booking/Choices'
import { getMyBookings } from '../../services/operations/bookingAPI'
import ViewAll from 'components/core/Booking/ViewAll'
import { useDispatch } from 'react-redux'

const Booking = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        getMyBookings(dispatch);
    }, [dispatch])


    return (
        <div className={style.Booking}>
            <h2>Manage Booking</h2>

            {/* Create Booking Form */}
            <SearchForm />

            {/* View my choice */}
            <Choices />

            {/* View All Bookings */}
            <ViewAll />
        </div>

    )
}

export default Booking