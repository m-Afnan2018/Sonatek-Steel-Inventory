import React, { useEffect, useState } from 'react'
import style from './Dashboard.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { deleteItem, getUpcomingItem, updateItem } from 'services/operations/itemAPI';
import { MdDelete } from "react-icons/md";
import { RxCheck, RxCross2 } from "react-icons/rx";
import { generateShipToColors } from 'utils/colorHandler';
import { useOverlay } from 'hooks/useOverlay';
import ConfirmationOverlay from 'components/common/Overlay/ConfirmationOverlay';
const UpcomingDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [view, setView] = useState(null);
    const [count, setCount] = useState(null);
    const [colors, setColors] = useState(null);

    const dispatch = useDispatch();

    const { upcomingItem } = useSelector(state => state.item)

    useEffect(() => {
        if (upcomingItem) {
            setColors(generateShipToColors(upcomingItem))
            setItems(upcomingItem)
            setLoading(false)
            let sum = 0;
            upcomingItem.forEach(i => {
                sum += Number(i.originalQuantity);
            });
            setCount(sum)
        }
    }, [upcomingItem])

    useEffect(() => {
        getUpcomingItem({}, dispatch);
    }, [dispatch])

    return (
        <div className={style.Dashboard}>
            <h3 className='main-heading'>Upcoming Items</h3>
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
                                    <th style={{ minWidth: "8rem", width: "8rem" }}>Date</th>
                                    <th style={{ minWidth: "8rem", width: "8rem", textAlign: "center" }}>Description</th>
                                    <th style={{ minWidth: "3rem", width: "3rem" }}>Quantity</th>
                                    <th style={{ minWidth: "5rem", width: "5rem" }}>Wagon</th>
                                    <th style={{ minWidth: "4rem", width: "4rem" }}>Challan date</th>
                                    <th style={{ minWidth: "6rem", width: "6rem" }}>Challan No.</th>
                                    <th style={{ minWidth: "4rem", width: "4rem", textAlign: "center" }}>Warehouse</th>
                                    <th style={{ minWidth: "4rem", width: "4rem", textAlign: "center" }}>Remarks</th>
                                    <th style={{ minWidth: "4rem", width: "4rem" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem color={colors.find(i => item.warehouse?._id === i.warehouseId)} key={item._id} item={item} view={view} setView={setView} />
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderBottom: 'none' }}>
                                    <td></td>
                                    <td style={{ fontWeight: '600' }}>Total quantity:</td>
                                    <td style={{ fontWeight: '600' }}>{count.toFixed(3)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
            {/* <button style={{ height: showUpcoming ? '50px' : '0' }} className={style.totalCount}>{count?.toFixed(3)}</button> */}
        </div>
    )
}


const SingleItem = ({ color, item, setView, view }) => {
    // const challanDate = item.challanDate
    //     ? new Date(item.challanDate).toLocaleDateString()
    //     : '-';
    const { grades, thicknesses, widths, warehouses } = useSelector(state => state.varient);
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
        const warehouse = itemDetail.warehouse?._id;
        let Item = { ...itemDetail, grade, thickness, width, warehouse: warehouse };
        // let updatedItem = { ...Item };
        updateItem(Item, dispatch);
        setSelect('');
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setItemDetail(item);
        setSelect('');
    };

    const { showOverlay } = useOverlay();

    const handleDelete = (e) => {
        e.stopPropagation();
        showOverlay(ConfirmationOverlay, {
            message: `Delete this item? This cannot be undone.`,
            onAccept: () => deleteItem({ itemId: item._id }, dispatch),
        });
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
                            setTimeout(() => {
                                el.focus();
                                el.click(); // Programmatically open it
                            }, 800);
                        }
                    }}
                    style={{ padding: '0rem', width: '3rem' }}
                    value={itemDetail[type]?._id || ""}
                    onChange={(e) => valueSetter(e.target.value)}
                >
                    <option value="" disabled>Select</option>
                    {options.map((opt) => (
                        <option key={opt._id} value={opt._id}>
                            {opt.name || opt.value}
                        </option>
                    ))}
                </select>
            </div>
        );
    };


    const renderEditableField = (type, inputType = 'text', size = '8rem') => {

        const valueSetter = (val) => {
            setItemDetail((prev) => ({ ...prev, [type]: val }));
        }

        return <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <input
                style={{ padding: '0rem', width: size }}
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
            {/* Challan Date */}
            <td onClick={() => clickHandler('date')}>
                {select === 'date'
                    ? renderEditableField('date', 'date')
                    : itemDetail.date?.slice(0, 10) || '-'}
            </td>

            {/* Thickness x Width x Grade */}
            <td style={{ display: 'flex' }}>
                {/* Thickness */}
                <div onClick={() => clickHandler('thickness')}>
                    {select === 'thickness'
                        ? renderDropdownField('thickness', thicknesses)
                        : <span style={{ width: '3rem' }}>{itemDetail.thickness.name}</span>}
                </div>
                X
                {/* Width */}
                <div onClick={() => clickHandler('width')}>
                    {select === 'width'
                        ? renderDropdownField('width', widths)
                        : <span style={{ width: '3rem' }}>{itemDetail.width.name}</span>}
                </div>
                X
                {/* Grade */}
                <div onClick={() => clickHandler('grade')}>
                    {select === 'grade'
                        ? renderDropdownField('grade', grades)
                        : <span style={{ width: '3rem' }}>{itemDetail.grade.name}</span>}
                </div>
            </td>

            {/* Quantity */}
            <td onClick={() => clickHandler('originalQuantity')}>
                {select === 'originalQuantity'
                    ? renderEditableField('originalQuantity', 'number', '3rem')
                    : itemDetail.originalQuantity}
            </td>

            {/* Wagon Number */}
            <td onClick={() => clickHandler('wagonNumber')}>
                {select === 'wagonNumber'
                    ? renderEditableField('wagonNumber', 'text', '5rem')
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
                    ? renderEditableField('challanNumber', '6rem')
                    : itemDetail.challanNumber || '-'}
            </td>

            {/* Warehouse */}
            <td onClick={() => clickHandler('warehouse')} style={{ display: 'flex' }}>
                {select === 'warehouse' ? (
                    <div onClick={() => clickHandler('warehouse')}>
                        {select === 'warehouse'
                            ? renderDropdownField('warehouse', warehouses)
                            : <span>{itemDetail?.warehouse?.name}</span>}
                    </div>
                ) : (
                    itemDetail.warehouse === null ? "NA" : <p className={style.coloredShipTo} style={{ background: color?.backgroundColor, color: color?.foregroundColor, border: `1px solid ${color?.foregroundColor}` }}>{itemDetail.warehouse.name.toLowerCase()}</p>
                )}
            </td>

            {/* Remark */}
            <td onClick={() => clickHandler('remark')}>
                {select === 'remark'
                    ? renderEditableField('remark', 'text', '5rem')
                    : itemDetail.remark || '-'}
            </td>


            <td>
                {select === '' && JSON.stringify(item) === JSON.stringify(itemDetail) ? <MdDelete style={{ color: 'red' }} onClick={handleDelete} /> : <div>
                    <RxCheck style={{ color: 'green' }} onClick={handleSave} />
                    <RxCross2 style={{ color: 'red' }} onClick={handleCancel} />
                </div>}
            </td>
        </tr>
    );
};


export default UpcomingDashboard