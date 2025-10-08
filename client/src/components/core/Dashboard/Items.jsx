import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { useSelector } from 'react-redux';

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const { currentList } = useSelector(state => state.item);

    // Fetch all items
    useEffect(() => {
        if (currentList) {
            setItems(currentList);
            setLoading(false);
        }
    }, [currentList]);

    return (
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Inventory Items</h3>

            <div className={style.card}>
                <h4>All Items</h4>

                {loading ? (
                    <div className={style.loading}>Loading items...</div>
                ) : items.length === 0 ? (
                    <div className={style.empty}>No items found</div>
                ) : (
                    <div className={style.tableWrapper}>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Grade</th>
                                    <th>Form</th>
                                    <th>Width</th>
                                    <th>Thickness</th>
                                    <th>Quantity</th>
                                    <th>Wagon No.</th>
                                    <th>Challan number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem key={item._id} item={item} view={view} setView={setView} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const SingleItem = ({ item, setView, view }) => {
    const challanDate = item.challanDate
        ? new Date(item.challanDate).toLocaleDateString()
        : '-';

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ''}`}
            onClick={() => setView(item._id)}
        >
            <td>{item.type}</td>
            <td>{item.grade || '-'}</td>
            <td>{item.formType}</td>
            <td>{item.width || '-'}</td>
            <td>{item.thickness || '-'}</td>
            <td>{item.quantity}</td>
            <td>{item.wagonNumber}</td>
            <td>
                {item.challanNumber || '-'} <br />
                <small>{challanDate}</small>
            </td>
        </tr>
    );
};

export default Items;
