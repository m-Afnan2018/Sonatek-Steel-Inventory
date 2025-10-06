import React, { useEffect } from 'react'
import style from './Order.module.css'
import SearchForm from 'components/core/Order/SearchForm'
import Choices from 'components/core/Order/Choices'
import { getMyOrders } from '../../services/operations/orderAPI'
import ViewAll from 'components/core/Order/ViewAll'
import { useDispatch } from 'react-redux'

const Order = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        getMyOrders(dispatch);
    }, [])


    return (
        <div className={style.Order}>
            <h2>Manage Order</h2>

            {/* Create Order Form */}
            <SearchForm />

            {/* View my choice */}
            <Choices />

            {/* View All Orders */}
            <ViewAll />
        </div>

    )
}

export default Order