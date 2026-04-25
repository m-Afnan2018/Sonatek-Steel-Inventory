import React, { useEffect, useRef, useState } from 'react'
import style from './Upcoming.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { deleteItem, getUpcomingItem, updateItem } from 'services/operations/itemAPI';
import AddForm from 'components/core/Upcoming/AddForm';
import { RxCheck, RxCross2 } from "react-icons/rx";
import { generateShipToColors } from 'utils/colorHandler';
import { downloadTemplate, uploadCSV } from 'services/operations/utilAPI';
import { useOverlay } from 'hooks/useOverlay';
import UpcomingOptions from 'components/common/Overlay/UpcomingOptions';
import ConfirmationOverlay from 'components/common/Overlay/ConfirmationOverlay';
import { getAllPartyDetails } from 'services/operations/bookingAPI';
import { FaRegTrashCan } from "react-icons/fa6";
import { FiEye, FiEdit } from 'react-icons/fi';
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { MdOutlineWarehouse } from 'react-icons/md';
import { IoCartOutline } from 'react-icons/io5';


const getUpcomingSortValue = (item, sortKey) => {
    switch (sortKey) {
        case 'id':
            return Number(item.id ?? 0);
        case 'date':
            return item.date ? new Date(item.date).getTime() : 0;
        case 'description':
            return `${item.thickness?.name ?? ''} ${item.width?.name ?? ''} ${item.grade?.name ?? ''}`.trim().toLowerCase();
        case 'quantity':
            return Number(item.originalQuantity ?? 0);
        case 'wagonNumber':
            return (item.wagonNumber ?? '').toString().toLowerCase();
        case 'warehouse':
            return (item.warehouse?.name ?? '').toLowerCase();
        default:
            return '';
    }
};

const sortUpcomingItems = (items, sortKey, order) => {
    const direction = order === 'asc' ? 1 : -1;

    return [...items].sort((firstItem, secondItem) => {
        const firstValue = getUpcomingSortValue(firstItem, sortKey);
        const secondValue = getUpcomingSortValue(secondItem, sortKey);

        if (typeof firstValue === 'number' && typeof secondValue === 'number') {
            return (firstValue - secondValue) * direction;
        }

        return firstValue.toString().localeCompare(secondValue.toString(), undefined, {
            numeric: true,
            sensitivity: 'base',
        }) * direction;
    });
};

const renderSortIcon = (activeSort, columnSort, order) => {
    if (activeSort !== columnSort) {
        return null;
    }

    return order === 'asc'
        ? <HiSortAscending style={{ marginLeft: '0.35rem', display: 'inline-block', verticalAlign: 'middle' }} />
        : <HiSortDescending style={{ marginLeft: '0.35rem', display: 'inline-block', verticalAlign: 'middle' }} />;
};

const Upcoming = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [view, setView] = useState(null);
    const [count, setCount] = useState(null);
    const [colors, setColors] = useState(null);
    const [order, setOrder] = useState('desc');
    const [sortType, setSortType] = useState(null)
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();

    const { upcomingItem } = useSelector(state => state.item);
    const { userData } = useSelector(state => state.auth);

    useEffect(() => {
        if (upcomingItem) {
            const nextItems = sortType
                ? sortUpcomingItems(upcomingItem, sortType, order)
                : upcomingItem;

            setColors(generateShipToColors(upcomingItem))
            setItems(nextItems);
            setLoading(false);
            let sum = 0;
            upcomingItem.forEach(i => {
                sum += Number(i.originalQuantity);
            });
            setCount(sum)
        }
    }, [order, sortType, upcomingItem])


    const inputRef = useRef();

    const handleFileChange = async (e) => {
        if (e.target.files[0]) {
            uploadCSV(e.target.files[0], setUploading, inputRef);
            setFile(null);
        }
    };
    const handleUpload = async () => {
        if (!file) {
            inputRef.current.click();
            return;
        }
    };
    const sortBy = (val) => {
        const newOrder = sortType === val && order === 'asc' ? 'desc' : 'asc';
        setOrder(newOrder);
        setSortType(val);
    }

    useEffect(() => {
        getUpcomingItem({}, dispatch);
        getAllPartyDetails(dispatch);
    }, [dispatch])

    return (
        <div className={style.Upcoming}>
            {userData && ['admin', 'director', 'inventory_associate'].includes(userData.role) && <div className={style.addNew}>
                {/* <button onClick={() => showOverlay(AddItemForm, { showForm, setShowForm })}>Add new Item</button> */}
                {/* <button onClick={handleUpload} >
                    {uploading ? "Uploading..." : "Import"}
                </button> */}
                {/* <button onClick={downloadTemplate}>Download Template</button> */}
            </div>}
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full mb-4 border border-gray-300 rounded-lg p-2 cursor-pointer"
                disabled={uploading}
                hidden
            />
            <h3 className={style.heading}>
                Add Upcoming
                {userData && ['admin', 'director', 'inventory_associate'].includes(userData.role) && <span onClick={handleUpload} style={{ marginLeft: 'auto', fontSize: '0.875rem', background: 'rgb(124 150 185)', padding: '0.25rem 1rem', borderRadius: '0.25rem', color: 'white' }}>{uploading ? "Uploading..." : "Import"}</span>}
                {userData && ['admin', 'director', 'inventory_associate'].includes(userData.role) && <span onClick={downloadTemplate} style={{ fontSize: '0.875rem', textDecoration: 'underline' }}>Template</span>}
            </h3>
            <AddForm />
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
                                    {/* <th>Type</th> */}
                                    <th style={{ width: "6px" }}></th>
                                    <th style={{ width: "5%" }} onClick={() => sortBy('id')}>S.ID{renderSortIcon(sortType, 'id', order)}</th>
                                    <th style={{ width: "15%" }} onClick={() => sortBy('date')}>Date{renderSortIcon(sortType, 'date', order)}</th>
                                    <th style={{ width: "20%", textAlign: "center" }} onClick={() => sortBy('description')}>Description{renderSortIcon(sortType, 'description', order)}</th>
                                    <th style={{ width: "10%" }} onClick={() => sortBy('quantity')}>Quantity{renderSortIcon(sortType, 'quantity', order)}</th>
                                    <th style={{ width: "10%" }} onClick={() => sortBy('wagonNumber')}>Wagon{renderSortIcon(sortType, 'wagonNumber', order)}</th>
                                    <th style={{ width: "10%", textAlign: "center" }} onClick={() => sortBy('warehouse')}>Warehouse{renderSortIcon(sortType, 'warehouse', order)}</th>
                                    <th style={{ width: "20%", textAlign: "center" }}>Party</th>
                                    <th style={{ width: "20%", textAlign: "center" }}>Remarks</th>
                                    <th style={{ width: "10%" }}>Action</th>
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
                                    <td></td>
                                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Total quantity:</td>
                                    <td style={{ fontWeight: '600', color: 'var(--accent)' }}>{count != null ? Number(count).toFixed(3) : '0.000'}</td>
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

    const [isEditing, setIsEditing] = useState(false);

    const handleEditToggle = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const { showOverlay } = useOverlay();

    const handleSave = (e) => {
        e.stopPropagation();
        const grade = itemDetail.grade._id;
        const thickness = itemDetail.thickness._id;
        const width = itemDetail.width._id;
        const warehouse = itemDetail.warehouse?._id;
        let Item = { ...itemDetail, grade, thickness, width, warehouse: warehouse };
        updateItem(Item, dispatch);
        setIsEditing(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setItemDetail(item);
        setIsEditing(false);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        showOverlay(ConfirmationOverlay, {
            message: 'Delete this item? This cannot be undone.',
            onAccept: () => deleteItem({ itemId: item._id }, dispatch),
        });
    }

    const handleOrder = () => {
        function convertItem(data) {
            return {
                _id: data._id,
                item_id: data.id,
                type: data.type,
                grade: data.grade,
                form: "Coil",
                width: data.width,
                thickness: data.thickness,
                wagonNumber: data.wagonNumber,
                currentStatus: "In Stock",
                originalQuantity: Number(data.originalQuantity),
                quantity: Number(data.currentQuantity),
                warehouse: data.warehouse,
                remark: data.remark,
                date: data.date,
                createdAt: data.createdAt,
                updatedAt: data.createdAt,
                marking: data.marking,
            };
        }

        // Usage:
        const output = convertItem(item);


        showOverlay(UpcomingOptions, {
            type: 'party',
            data: output,
            onAccept: (data, party) => {
                console.log(data);
            }
        })
    }

    const handleInventory = () => {
        if (item.marking) {
            return;
        }
        function convertItem(data) {
            return {
                _id: data._id,
                item_id: data.id,
                type: data.type,
                grade: data.grade,
                form: "Coil",
                width: data.width,
                thickness: data.thickness,
                wagonNumber: data.wagonNumber,
                currentStatus: "In Stock",
                originalQuantity: Number(data.originalQuantity),
                quantity: Number(data.currentQuantity),
                warehouse: data.warehouse,
                remark: data.remark,
                date: data.date,
                createdAt: data.createdAt,
                updatedAt: data.createdAt,
                marking: data.marking,
            };
        }

        // Usage:
        const output = convertItem(item);

        showOverlay(UpcomingOptions, {
            type: 'inventory',
            data: output,
            onAccept: (data, party) => {
                console.log('Testing', data);
            }
        })
    }

    useEffect(() => setItemDetail(item), [item])

    const renderDropdownField = (type, options) => {
        const valueSetter = (val) => {
            const option = options.find(i => i._id === val);
            setItemDetail((prev) => ({ ...prev, [type]: option }));
        };

        return (
            <div onClick={(e) => e.stopPropagation()}>
                <select
                    style={{ width: 'auto' }}
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

        return <div onClick={(e) => e.stopPropagation()}>
            <input
                style={{ width: size }}
                type={inputType}
                value={itemDetail[type] || ''}
                onChange={(e) => valueSetter(e.target.value)}
            />
        </div>
    };

    return (
        <tr
            data-marked={item.marking ? "true" : "false"}
            className={`${view === item._id ? style.activeRow : ''}`}
            onClick={() => setView(item._id)}
            style={{ position: 'relative' }}
        >
            <div style={{
                position: 'absolute',
                width: '6px',
                height: '100%',
                backgroundColor: item.marking ? 'green' : '',
            }}></div>
            {/* Serial Number */}
            <td>
                {itemDetail.id}
            </td>
            {/* Date */}
            <td onClick={(e) => e.stopPropagation()}>
                {isEditing
                    ? renderEditableField('date', 'date', '7rem')
                    : itemDetail.date?.slice(0, 10) || '-'}
            </td>

            {/* Thickness x Width x Grade */}
            <td className={style.descCell} onClick={(e) => e.stopPropagation()}>
                {/* Thickness */}
                <div>
                    {isEditing
                        ? renderDropdownField('thickness', thicknesses)
                        : <span style={{ width: '3rem' }}>{itemDetail.thickness.name}</span>}
                </div>
                X
                {/* Width */}
                <div>
                    {isEditing
                        ? renderDropdownField('width', widths)
                        : <span style={{ width: '3rem' }}>{itemDetail.width.name}</span>}
                </div>
                X
                {/* Grade */}
                <div>
                    {isEditing
                        ? renderDropdownField('grade', grades)
                        : <span style={{ width: '3rem' }}>{itemDetail.grade.name}</span>}
                </div>
            </td>

            {/* Quantity */}
            <td style={{ textDecoration: 'underline', fontWeight: '500' }} onClick={(e) => e.stopPropagation()}>
                {isEditing
                    ? renderEditableField('originalQuantity', 'number', '4rem')
                    : Number(itemDetail.originalQuantity).toFixed(3)}
            </td>

            {/* Wagon Number */}
            <td onClick={(e) => e.stopPropagation()}>
                {isEditing
                    ? renderEditableField('wagonNumber', 'text', '6rem')
                    : itemDetail.wagonNumber || '-'}
            </td>

            {/* Warehouse */}
            <td style={{ display: "flex", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
                {isEditing ? (
                    <div>
                        {renderDropdownField('warehouse', warehouses)}
                    </div>
                ) : (
                    itemDetail.warehouse === null ? "NA" : <p className={style.coloredShipTo} style={{ background: color?.backgroundColor, color: color?.foregroundColor, border: `1px solid ${color?.foregroundColor}` }}>{itemDetail.warehouse.name.toLowerCase()}</p>
                )}
            </td>

            <td>
                {item.marking ? item?.marking?.party?.name : 'Inventory'}
            </td>

            {/* Remark */}
            <td onClick={(e) => e.stopPropagation()}>
                {isEditing
                    ? renderEditableField('remark', 'text', '6rem')
                    : itemDetail.remark || '-'}
            </td>

            <td className={style.actionCell}>
                {!isEditing ? <div style={{ gap: '0.25rem' }}>
                    <span title='Edit Item' onClick={handleEditToggle} className={style.actionIcon}><FiEdit /></span>
                    <span title={item.marking ? 'View Order' : 'View Item Detail'} onClick={item.marking ? handleOrder : handleInventory} className={style.actionIcon}><FiEye /></span>
                    <span title={item.marking ? 'Move to Inventory' : 'Update Inventory'} onClick={handleInventory} className={style.actionIcon}><MdOutlineWarehouse style={{ cursor: item.marking ? 'not-allowed' : 'pointer' }} /></span>
                    <span title='Order' onClick={handleOrder} className={style.actionIcon}><IoCartOutline /></span>
                    <span title='Delete' onClick={handleDelete} className={style.actionIcon}><FaRegTrashCan style={{ color: 'red' }} /></span>
                </div> : <div style={{ gap: '0.5rem', display: 'flex' }}>
                    <span className={style.actionIcon}><RxCheck style={{ color: 'green', fontSize: '1.25rem' }} onClick={handleSave} /></span>
                    <span className={style.actionIcon}><RxCross2 style={{ color: 'red', fontSize: '1.25rem' }} onClick={handleCancel} /></span>
                </div>}
            </td>
        </tr >
    );
};


export default Upcoming
