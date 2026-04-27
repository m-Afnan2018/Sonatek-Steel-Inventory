import React, { useEffect } from 'react'
import style from './Overlay.module.css'
import { RxCross2 } from "react-icons/rx";

const ViewIncompleteBookingDetail = ({ data,
    cancel,
    confirm,
    ship,
    deliver,
    userData, close }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                close?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [close]);
    if (!data) return null;

    const bookedBy = data.bookedBy || {};

    const submitting = (e) => {
        e.preventDefault();
        const button = e.nativeEvent.submitter;
        if (button.innerText === 'Cancel') {
            cancel(e.target[0].value, data._id);
        } else {
            ship(e.target[0].value, data._id)
        }
        // } else if (button.innerText === 'Shipped') {
        //     ship(e.target[0].value, data._id)
        // } else if (button.innerText === 'Delivered') {
        //     deliver(e.target[0].value, data._id)
        // }

        close();
    }

    // const status = {
    //     'Pending': {
    //         button: 'Confirm Booking',
    //         placeholder: 'Enter the Order ID to confirm order or reason to cancel'
    //     },
    //     'Processing': {
    //         button: 'Shipped',
    //         placeholder: 'Enter the Vechicle number to confirm deliver it or reason to cancel'
    //     },
    //     'Shipped': {
    //         button: 'Delivered',
    //         placeholder: 'Enter the description to confirm delivery or reason to cancel or reason to cancel'
    //     }
    // }

    return (
        <div className={style.ViewIncompleteBookingDetail} onClick={close}>
            <div className={style.DetailsContent} onClick={(e) => e.stopPropagation()}>
                <div className={style.DetailsHeader}>
                    <h2>Booking Details</h2>

                    <button className='crossButton' onClick={close}><RxCross2 /></button>
                </div>

                <div className={style.DetailsGrid}>
                    <div className={style.Card}>
                        <h4>Booking</h4>
                        <p><strong>ID:</strong> {data.order_id}</p>
                        <p><strong>Status:</strong> <span className={style[data.status?.toLowerCase()] || ''}>{data.status}</span></p>
                        <p><strong>Quantity:</strong> {data.quantity?.toFixed(3)}</p>
                        <p><strong>Booked At:</strong> {new Date(data.bookingDate).toLocaleString()}</p>
                        <p><strong>Party:</strong> {data.partySnapshot?.name}</p>
                        <p><strong>Owner:</strong> {data.partySnapshot?.owner || data.party?.owner || 'NULL'}</p>
                        <p><strong>Phone:</strong> {data.partySnapshot?.phone || data.party?.phone || 'N/A'}</p>
                        <p><strong>Address:</strong> {data.partySnapshot?.address || data.party?.address || 'N/A'}</p>
                        <p><strong>Ship To:</strong> {data.shipTo || 'NA'}</p>
                    </div>

                    <div className={style.Card}>
                        <h4>Agent</h4>
                        <p><strong>Name:</strong> {bookedBy.firstName} {bookedBy.lastName}</p>
                        <p><strong>Email:</strong> {bookedBy.email}</p>
                        <p><strong>Role:</strong> {bookedBy.role}</p>
                    </div>

                    <div className={style.FullWidth}>
                        <h4>Items</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Form</th>
                                    <th>Available</th>
                                    <th>Booked</th>
                                    <th>Wagon</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.items.map((it) => (
                                        <tr key={it._id}>
                                            <td>{it.item?.type}</td>
                                            <td>{`${it.item?.thickness?.name} X ${it.item?.width?.name} X ${it.item?.grade?.name}`}</td>
                                            <td>{it?.formType}</td>
                                            <td>{it.item?.quantity?.toFixed(3)}</td>
                                            <td>{it.quantity?.toFixed(3)}</td>
                                            <td>{it.item?.wagonNumber || 'N/A'}</td>
                                        </tr>

                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <form onSubmit={submitting} className={style.FullWidth}>
                        <h4>Action</h4>
                        {['admin', 'director', 'accountant'].includes(userData.role) && (data.status === 'Pending' || data.status === 'Processing' || data.status === 'Shipped') && <div className={style.inputField}>
                            <input type='text' placeholder={'Enter the Vechicle number to confirm deliver it or reason to cancel'} required />
                        </div>}
                        {['admin', 'director', 'accountant'].includes(userData.role) && data.status !== 'Cancelled' && <div className={style.buttons}>
                            <button
                                type='submit' style={{ backgroundColor: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button type='submit' style={{ backgroundColor: 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>Ship</button>
                        </div>}
                    </form>
                </div>

                {/* <div className={style.DetailsFooter}>
                </div> */}
            </div>
        </div>
    )
}

export default ViewIncompleteBookingDetail