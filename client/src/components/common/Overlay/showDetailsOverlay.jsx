import React from 'react'
import style from './Overlay.module.css'

const ShowDetailsOverlay = ({ data, close }) => {
    if (!data) return null;

    const bookedBy = data.bookedBy || {};

    return (
        <div className={style.DetailsOverlay} onClick={close}>
            <div className={style.DetailsContent} onClick={(e) => e.stopPropagation()}>
                <div className={style.DetailsHeader}>
                    <h2>Booking Details</h2>
                    <div className={style.HeaderActions}>
                        <button className={style.CloseButton} onClick={close}>Close</button>
                    </div>
                </div>

                <div className={style.DetailsGrid}>
                    <div className={style.Card}>
                        <h4>Booking</h4>
                        <p><strong>ID:</strong> {data.booking_id}</p>
                        <p><strong>Status:</strong> <span className={style[data.status?.toLowerCase()] || ''}>{data.status}</span></p>
                        <p><strong>Quantity:</strong> {data.quantity}</p>
                        <p><strong>Requirement:</strong> {data.requirement}</p>
                        <p><strong>Booked At:</strong> {new Date(data.bookingDate).toLocaleString()}</p>
                    </div>

                    <div className={style.Card}>
                        <h4>Agent</h4>
                        <p><strong>Name:</strong> {bookedBy.firstName} {bookedBy.lastName}</p>
                        <p><strong>Email:</strong> {bookedBy.email}</p>
                        <p><strong>Role:</strong> {bookedBy.role}</p>
                    </div>

                    <div className={style.FullWidth}>
                        <h4>Items</h4>
                        {data.items.map((it) => (
                            <div key={it._id} className={style.ItemRow}>
                                <div className={style.ItemMain}>
                                    <p><strong>Type:</strong> {it.item?.type}</p>
                                    <p><strong>Grade:</strong> {it.item?.grade?.name}</p>
                                    <p><strong>Form:</strong> {it.item?.formType}</p>
                                    <p><strong>Width:</strong> {it.item?.width?.name} mm</p>
                                    <p><strong>Thickness:</strong> {it.item?.thickness?.name} mm</p>
                                </div>
                                <div className={style.ItemMeta}>
                                    <p><strong>Available Qty:</strong> {it.item?.quantity}</p>
                                    <p><strong>Booked Qty:</strong> {it.quantity}</p>
                                    <p><strong>Wagon:</strong> {it.item?.wagonNumber || 'N/A'}</p>
                                    <p><strong>Challan#:</strong> {it.item?.challan?.challanNumber || 'N/A'}</p>
                                    <p><strong>Challan Date:</strong> {it.item?.challan?.challanDate ? new Date(it.item.challan.challanDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={style.DetailsFooter}>
                    <button className={style.PrimaryButton} onClick={close}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default ShowDetailsOverlay
