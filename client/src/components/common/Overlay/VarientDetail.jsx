// ...existing code...
import React from 'react'
import style from './Overlay.module.css'

/**
 * VarientDetail
 * Props:
 *  - cutter: { _id, name, address, phoneNumber, visible, createdAt, updatedAt }
 *  - items: [ { _id, wagonNumber, grade, width, thickness, quantity, challan, shipTo, createdAt } ] (optional)
 *  - bookings: [ { booking_id, status, quantity, bookingDate, bookedBySnapshot } ] (optional)
 *  - onClose: function to close overlay
 *
 * This component only renders UI for a single cutter variant. If `items` or `bookings`
 * are not provided the related sections will be hidden.
 */
const VarientDetail = ({ cutter = {}, items = [], bookings = [], close }) => {
    const fmt = (d) => {
        if (!d) return '-'
        const date = new Date(d)
        return date.toLocaleString()
    }

    const totalItems = items?.length || 0
    const totalItemQty = items?.reduce((s, it) => s + (Number(it.quantity) || 0), 0)
    const totalBookings = bookings?.length || 0
    const pendingBookings = bookings?.filter(b => b.status === 'Pending').length || 0

    return (
        <div className={style.Overlay}>
            <div className={style.VarientDetailCard} role="dialog" aria-modal="true">
                <header className={style.overlayHeader}>
                    <h3 className={style.title}>Cutter / Ship-To Details</h3>
                    <button className={style.closeBtn} onClick={close} aria-label="Close">✕</button>
                </header>

                <section className={style.grid}>
                    {/* <div className={style.card}>
                        <h4 className={style.cardTitle}>Basic Information</h4>
                        <div className={style.infoRow}><span className={style.label}>Name</span><span>{cutter.name || '-'}</span></div>
                        <div className={style.infoRow}><span className={style.label}>Phone</span><span>{cutter.phoneNumber || '-'}</span></div>
                        <div className={style.infoRow}><span className={style.label}>Address</span><span className={style.address}>{cutter.address || '-'}</span></div>
                        <div className={style.infoRow}><span className={style.label}>Visible</span><span>{cutter.visible ? 'Yes' : 'No'}</span></div>
                        <div className={style.infoRow}><span className={style.label}>Created</span><span>{fmt(cutter.createdAt)}</span></div>
                        <div className={style.infoRow}><span className={style.label}>Updated</span><span>{fmt(cutter.updatedAt)}</span></div>
                    </div> */}

                    <div className={style.card}>
                        <h4 className={style.cardTitle}>Summary</h4>
                        <div className={style.chips}>
                            <div className={style.chip}><div className={style.chipLabel}>Items</div><div className={style.chipValue}>{totalItems}</div></div>
                            <div className={style.chip}><div className={style.chipLabel}>Total Qty</div><div className={style.chipValue}>{totalItemQty}</div></div>
                            <div className={style.chip}><div className={style.chipLabel}>Bookings</div><div className={style.chipValue}>{totalBookings}</div></div>
                            <div className={style.chip}><div className={style.chipLabel}>Pending</div><div className={style.chipValue}>{pendingBookings}</div></div>
                        </div>

                        {items && items.length > 0 && (
                            <>
                                <h5 className={style.sectionTitle}>Recent Items</h5>
                                <ul className={style.list}>
                                    {items.slice(0, 6).map(it => (
                                        <li key={it._id} className={style.listItem}>
                                            <div className={style.itemTitle}>{it.wagonNumber} • {it.type}</div>
                                            <div className={style.itemMeta}>
                                                <span>{it.thickness?.name || it.thickness || '-'}</span>
                                                <span>× {it.width?.name || it.width || '-'}</span>
                                                <span className={style.qty}>Qty: {it.quantity}</span>
                                            </div>
                                            <div className={style.small}>
                                                Challan: {it.challan?.challanNumber || '-'} • {fmt(it.challan?.challanDate)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </section>

                {bookings && bookings.length > 0 && (
                    <section className={style.bookingsSection}>
                        <h4 className={style.sectionTitle}>Recent Bookings</h4>
                        <ul className={style.list}>
                            {bookings.slice(0, 8).map(b => (
                                <li key={b.booking_id} className={style.listItem}>
                                    <div className={style.itemTitle}>{b.booking_id} <span className={style.status}>{b.status}</span></div>
                                    <div className={style.itemMeta}>
                                        <span>Qty: {b.quantity}</span>
                                        <span>{fmt(b.bookingDate)}</span>
                                        <span className={style.small}>By: {b.bookedBySnapshot?.name || '-'}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <footer className={style.footer}>
                    <button className={style.closePrimary} onClick={close}>Close</button>
                </footer>
            </div>
        </div>
    )
}

export default VarientDetail