import React from 'react'
import style from './Order.module.css'
import SearchForm from 'components/core/Order/SearchForm'
import Choices from 'components/core/Order/Choices'

const Order = () => {
    return (
        <div className={style.Order}>
            <h2>Manage Order</h2>

            {/* Create Order Form */}
            <SearchForm />

            {/* View my choice */}
            <Choices />

            {/* View All Orders */}
        </div>

    )
}

export default Order