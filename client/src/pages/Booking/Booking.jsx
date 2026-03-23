import React from 'react'
import style from './Booking.module.css'
import Items from 'components/core/Booking/Items'
import ViewTablewise from 'components/core/Booking/ViewTablewise'
import ViewIncompleteBooking from 'components/core/Booking/ViewIncompleteBooking'

const Booking = () => {
    // const dispatch = useDispatch();
    // const { userData } = useSelector((state) => state.auth);

    // useEffect(() => {
    //     getAllParty(dispatch)
    //     if (userData && (userData.role === 'admin' || userData.role === 'accountant' || userData.role === 'directors')) {
    //         // getAllBookings(dispatch);
    //         getAllBookings({}, setAllBookings, setPagination, dispatch);
    //     } else {
    //         getMyBookings(dispatch);
    //     }
    // }, [dispatch, userData, userData.role])


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