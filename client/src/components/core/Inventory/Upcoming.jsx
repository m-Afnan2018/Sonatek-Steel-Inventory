import React, { useEffect, useState } from 'react'
import style from './Inventory.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { deleteItem, updateItem } from 'services/operations/itemAPI';
import AddForm from './AddForm';
import { MdDelete } from "react-icons/md";
import { RxCheck, RxCross2 } from "react-icons/rx";

const Upcoming = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [view, setView] = useState(null);

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
            <AddForm />
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
                                    {/* <th>Type</th> */}
                                    <th style={{ width: "8rem" }}>Description</th>
                                    <th style={{ width: "4rem" }}>Quantity</th>
                                    <th style={{ width: "rem" }}>Wagon No.</th>
                                    <th style={{ width: "8rem" }}>Challan date</th>
                                    <th style={{ width: "8rem" }}>Challan No.</th>
                                    <th style={{ width: "8rem" }}>Ship To</th>
                                    <th style={{ width: "8rem" }}>Action</th>
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


                {/* Pagination controls */}
            </div>
            {/* <div className={style.card}>
                {loading ? (
                    <div className={style.loading}>Loading items...</div>
                ) : items.length === 0 ? (
                    <div className={style.empty}>No items found</div>
                ) : (
                    <div className={style.tableWrapper}>

                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Material Description</th>
                                    <th>Quantity</th>
                                    <th>Wagon No.</th>
                                    <th>Challan date</th>
                                    <th>Challan No.</th>
                                    <th>Ship To</th>
                                    <th>Action</th>
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

            </div > */}
        </div>
    )
}


const SingleItem = ({ item, setView, view }) => {
    // const challanDate = item.challanDate
    //     ? new Date(item.challanDate).toLocaleDateString()
    //     : '-';

    const { grades, thicknesses, widths, cutters } = useSelector(state => state.varient);
    const dispatch = useDispatch();

    const [itemDetail, setItemDetail] = useState(item);

    const [select, setSelect] = useState('');
    // const [value, setValue] = useState('');

    const clickHandler = (type) => {
        setSelect(type);
        // setValue(item[type]);
    };

    const handleSave = (e) => {
        e.stopPropagation();
        const grade = itemDetail.grade._id;
        const thickness = itemDetail.thickness._id;
        const width = itemDetail.width._id;
        const cutter = itemDetail.shipTo?._id;
        let Item = { ...itemDetail, grade, thickness, width, shipTo: cutter };
        // let updatedItem = { ...Item };
        updateItem(Item, dispatch);
        setSelect('');
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setItemDetail(item);
        setSelect('');
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteItem({ itemId: item._id }, dispatch)
    }

    useEffect(() => setItemDetail(item), [item])

    const renderDropdownField = (type, options) => {

        const valueSetter = (val) => {
            const option = options.find(i => i._id === val);
            setItemDetail((prev) => ({ ...prev, [type]: option }));
            setSelect('');
        };

        return (
            <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                <select
                    // ✅ Auto-open dropdown using callback ref
                    ref={(el) => {
                        if (el) {
                            console.log(el.click())
                            setTimeout(() => {
                                el.focus();
                                el.click(); // Programmatically open it
                            }, 800);
                        }
                    }}
                    style={{ padding: '0rem 0.25rem', width: '6.25rem' }}
                    value={itemDetail[type]?._id || ""}
                    onChange={(e) => valueSetter(e.target.value)}
                >
                    <option value="">Select</option>
                    {options.map((opt) => (
                        <option key={opt._id} value={opt._id}>
                            {opt.name || opt.value}
                        </option>
                    ))}
                </select>
            </div>
        );
    };


    const renderEditableField = (type, inputType = 'text') => {

        const valueSetter = (val) => {
            setItemDetail((prev) => ({ ...prev, [type]: val }));
            // console.log(`${type}: ${val}`)
        }

        return <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <input
                style={{ padding: '0rem 0.25rem', width: '6.25rem' }}
                type={inputType}
                value={itemDetail[type]}
                onChange={(e) => valueSetter(e.target.value)}
                autoFocus
            />
            {/* <div className={style.inlineButtons}>
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
            </div> */}
        </div>
    };

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ''}`}
            onClick={() => setView(item._id)}
        >
            {/* Thickness x Width x Grade */}
            <td style={{ display: 'flex', gap: '5px' }}>
                {/* Thickness */}
                <div onClick={() => clickHandler('thickness')}>
                    {select === 'thickness'
                        ? renderDropdownField('thickness', thicknesses)
                        : <span>{itemDetail.thickness.name}</span>}
                </div>
                X
                {/* Width */}
                <div onClick={() => clickHandler('width')}>
                    {select === 'width'
                        ? renderDropdownField('width', widths)
                        : <span>{itemDetail.width.name}</span>}
                </div>
                X
                {/* Grade */}
                <div onClick={() => clickHandler('grade')}>
                    {select === 'grade'
                        ? renderDropdownField('grade', grades)
                        : <span>{itemDetail.grade.name}</span>}
                </div>
            </td>

            {/* Quantity */}
            <td onClick={() => clickHandler('originalQuantity')}>
                {select === 'originalQuantity'
                    ? renderEditableField('originalQuantity', 'number')
                    : itemDetail.originalQuantity}
            </td>

            {/* Wagon Number */}
            <td onClick={() => clickHandler('wagonNumber')}>
                {select === 'wagonNumber'
                    ? renderEditableField('wagonNumber')
                    : itemDetail.wagonNumber || '-'}
            </td>

            {/* Challan Date */}
            <td onClick={() => clickHandler('challanDate')}>
                {select === 'challanDate'
                    ? renderEditableField('challanDate', 'date')
                    : itemDetail.challanDate?.slice(0, 10) || '-'}
            </td>

            {/* Challan Number */}
            <td onClick={() => clickHandler('challanNumber')}>
                {select === 'challanNumber'
                    ? renderEditableField('challanNumber')
                    : itemDetail.challanNumber || '-'}
            </td>

            {/* Ship To */}
            <td onClick={() => clickHandler('shipTo')}>
                {select === 'shipTo' ? (
                    <div onClick={() => clickHandler('shipTo')}>
                        {select === 'shipTo'
                            ? renderDropdownField('shipTo', cutters)
                            : <span>{itemDetail?.shipTo?.name}</span>}
                    </div>
                ) : (
                    itemDetail.shipTo === null ? "NA" : itemDetail.shipTo.name
                )}
            </td>
            <td>
                {itemDetail === item ? <MdDelete style={{ color: 'red' }} onClick={handleDelete} /> : <div>
                    <RxCheck style={{ color: 'green' }} onClick={handleSave} />
                    <RxCross2 style={{ color: 'red' }} onClick={handleCancel} />
                </div>}
            </td>
        </tr>
    );
};


export default Upcoming