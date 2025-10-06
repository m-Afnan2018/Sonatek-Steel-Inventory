import React, { useEffect, useState } from 'react'
import style from './Order.module.css'
import { useSelector } from 'react-redux'
import { formatDate } from 'utils/dateHandler';

const ViewAll = () => {
    const [view, setView] = useState('all');
    const { orders } = useSelector(state => state.order);
    const [select, setSelect] = useState(null);

    const [listing, setListing] = useState(null);

    useEffect(() => {
        if (orders) {
            console.log(orders);
            if (view === 'all') {
                setListing(orders);
            } else if (view === 'pending') {
                setListing(orders.filter((item) => item.status === 'Pending'));
            } else if (view === 'processing') {
                setListing(orders.filter((item) => item.status === 'Processing'));
            } else if (view === 'completed') {
                setListing(orders.filter((item) => item.status === 'Completed'));
            }
        }
    }, [orders, view])

    useEffect(() => console.log(view), [view]);


    return (
        <div className={style.viewAll}>
            <h2>Your all orders</h2>
            <div>
                <div className={style.viewOptions}>
                    <button className={view === 'all' && style.selected} onClick={() => setView('all')}>All</button>
                    <button className={view === 'pending' && style.selected} onClick={() => setView('pending')}>Pending</button>
                    <button className={view === 'processing' && style.selected} onClick={() => setView('processing')}>Processing</button>
                    <button className={view === 'completed' && style.selected} onClick={() => setView('completed')}>Completed</button>
                </div>
                <div className={style.allItems} style={{ padding: listing === null || listing.length === 0 ? '0 0.5rem' : '0.5rem' }}>
                    {
                        (listing && listing.length !== 0) && listing.map((order) => {
                            return <div className={style.items} onClick={() => setSelect(order._id)}>
                                <h2>{order._id}</h2>
                                <div style={{ height: select === order._id ? '27rem' : '0' }}>
                                    <div>
                                        <h4>Order Date</h4>
                                        <h5>{formatDate(order.orderDate)}</h5>
                                    </div>
                                    <div>
                                        <h4>Status</h4>
                                        <h5>{order.status}</h5>
                                    </div>
                                    <div>
                                        <h4>Quantity</h4>
                                        <h5>{order.quantity}</h5>
                                    </div>
                                    <div>
                                        <h4>Requirement</h4>
                                        <h5>{order.requirement}</h5>
                                    </div>
                                    <div>
                                        <h4>Type</h4>
                                        <h5>{order.type}</h5>
                                    </div>
                                    <div>
                                        <h4>Grade</h4>
                                        <h5>{order.grade}</h5>
                                    </div>
                                    <div>
                                        <h4>Form Type</h4>
                                        <h5>{order.formType}</h5>
                                    </div>
                                    <div>
                                        <h4>Thickness</h4>
                                        <h5>{order.thickness}</h5>
                                    </div>
                                    <div>
                                        <h4>Wagon Number</h4>
                                        <h5>{order.wagonNumber}</h5>
                                    </div>
                                    <div>
                                        <h4>Challan Number</h4>
                                        <h5>{order.challanNumber}</h5>
                                    </div>
                                    <div>
                                        <h4>Challan Date</h4>
                                        <h5>{formatDate(order.challanDate)}</h5>
                                    </div>
                                    <div style={{ borderBottom: '0' }}>
                                        <button>Cancel Order</button>
                                        <button>Confirm Order</button>
                                    </div>
                                </div>
                            </div>

                        })
                    }
                </div>
                {(listing === null || listing.length === 0) && <div className={style.notFound}>
                    No order found
                </div>}
            </div>

        </div >
    )
}

export default ViewAll