import React, { useState } from 'react'
import style from './Inventory.module.css'
import { deleteItem, getItem } from 'services/operations/itemAPI';
import { useDispatch } from 'react-redux';
import { formatDate } from 'utils/dateHandler';

const ViewAll = ({ list }) => {

    const [view, setView] = useState(null);

    const onView = (id) => {
        if (view && view === id) {
            setView(null);
        } else {
            setView(id)
        }
    }

    return (
        <div className={style.viewAll}>
            {
                (list === null || list.length === 0) && <div className={style.noItem}>
                    No Item found
                </div>
            }
            {
                list && list.length > 0 && list.map((item) => {
                    return <div key={item._id}>
                        <div className={style.heading} style={{ borderRadius: item._id === view ? '0.5rem 0.5rem 0 0' : '0.5rem' }} onClick={() => onView(item._id)}>
                            <h3>{item.name}</h3>
                            <h4>{item.remaining}</h4>
                        </div>
                        <View view={item} show={item._id === view} />
                    </div>
                })
            }
        </div>
    )
}

const View = ({ view, show }) => {
    const dispatch = useDispatch()

    const onUpdate = () => {
        getItem({ itemId: view._id }, dispatch, 'selectUpdate');
    }

    const onDelete = () => {
        deleteItem({ itemId: view._id }, dispatch);
    }

    return (
        <div className={style.view} style={{ height: show ? '20rem' : 0 }}>
            <div>
                <h4>Type:</h4>
                <h5>{view.type}</h5>
            </div>
            <div>
                <h4>Grade:</h4>
                <h5>{view.grade}</h5>
            </div>
            <div>
                <h4>Form type: </h4>
                <h5>{view.formType}</h5>
            </div>
            <div>
                <h4>Width: </h4>
                <h5>{view.width}</h5>
            </div>
            <div>
                <h4>Remaining:</h4>
                <h5>{view.remaining}</h5>
            </div>
            <div>
                <h4>Thickness:</h4>
                <h5>{view.thickness}</h5>
            </div>
            <div>
                <h4>Wagon Number:</h4>
                <h5>{view.wagonNumber}</h5>
            </div>
            <div>
                <h4>Challan Number:</h4>
                <h5>{view.challanNumber}</h5>
            </div>
            <div>
                <h4>Challan Date:</h4>
                <h5>{formatDate(view.challanDate)}</h5>
            </div>
            <div>
                <button onClick={onUpdate}>Update</button>
                <button onClick={onDelete}>Delete</button>
            </div>
        </div>
    )
}

export default ViewAll