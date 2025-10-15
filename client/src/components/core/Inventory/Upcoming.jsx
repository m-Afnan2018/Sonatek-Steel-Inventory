import React, { useEffect, useState } from 'react'
import style from './Inventory.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { updateItem } from 'services/operations/itemAPI';
import { formatDateMini } from 'utils/dateHandler';

const Upcoming = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const { upcomingItem } = useSelector(state => state.item)

    useEffect(() => {
        if (upcomingItem) {
            setItems(upcomingItem)
            setLoading(false)
        }
    }, [upcomingItem])


    return (
        <div className={style.Upcoming}>
            <h3 className={style.heading}>Upcoming Items</h3>
            <div className={style.card}>
                {loading ? (
                    <div className={style.loading}>Loading items...</div>
                ) : items.length === 0 ? (
                    <div className={style.empty}>No items found</div>
                ) : (
                    <div className={style.tableWrapper}>

                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Material Description</th>
                                    <th>Quantity</th>
                                    <th>Wagon No.</th>
                                    <th>Challan date</th>
                                    <th>Challan No.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem key={item._id} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div >
        </div>
    )
}

const SingleItem = ({ item }) => {
    const [wagonNumber, setWagonNumber] = useState(item.wagonNumber || '');
    const [challanNumber, setChallanNumber] = useState('');
    const [challanDate, setChallanDate] = useState('');

    const dispatch = useDispatch();

    const onSubmit = () => {
        updateItem({ ...item, wagonNumber, challanNumber, challanDate }, dispatch)
    }

    return (
        <tr>
            <td>{formatDateMini(item.createdAt)}</td>
            <td>{item.thickness ? `${item.thickness.name} X ${item.width.name} X ${item.grade.name}` : '-'}</td>
            <td>{item.quantity}</td>
            <td><input onChange={(e) => setWagonNumber(e.target.value)} value={wagonNumber} type='text' /></td>
            <td><input type='date' value={challanDate} onChange={(e) => setChallanDate(e.target.value)} /> </td>
            <td><input onChange={(e) => setChallanNumber(e.target.value)} value={challanNumber} type='text' /></td>
            <td><button onClick={onSubmit}>Submit</button></td>
        </tr>
    );
};

export default Upcoming