import React, { useEffect, useState } from 'react';
import style from './Booking.module.css';
import { useDispatch, useSelector } from 'react-redux';
// import { getAllItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';
import { bookingItems, getAllPartyDetails, searchOptions } from 'services/operations/bookingAPI';
import { FaCheckSquare, FaSquare } from "react-icons/fa";
import { useOverlay } from 'hooks/useOverlay';
import { generateShipToColors } from 'utils/colorHandler';
import OrderConfirmationOverlay from 'components/common/Overlay/OrderConfirmationOverlay';

const Create = () => {
    const [items, setItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const [selection, setSelection] = useState([]);
    const [colors, setColors] = useState(null)

    const { showOverlay } = useOverlay()



    // eslint-disable-next-line no-unused-vars
    const [filters, setFilters] = useState({
        type: '',
        grade: '',
        formType: '',
        width: '',
        thickness: '',
        wagonNumber: '',
        challanNumber: '',
        challanDate: '',
        warehouse: '',
        from: '',
        to: ''
    })

    useEffect(() => {
        if (items === null) {
            setLoading(true);
        } else {
            setColors(generateShipToColors(items))
            setLoading(false);
        }
    }, [items]);

    const dispatch = useDispatch();

    const onBookinging = () => {
        if (selection.length <= 0) {
            return;
        }
        let mini = 0;
        let maxi = 0;
        selection.forEach(element => {
            maxi += element.quantity;
            mini = Math.max(mini, element.quantity);
        });
        mini = maxi - mini;
        showOverlay(OrderConfirmationOverlay, {
            message: "Enter requirement and form type",
            range: { min: mini.toFixed(3), max: maxi.toFixed(3) },
            data: selection,
            onAccept: (data, party, shipTo) => {
                bookingItems({ items: data, party, shipTo }, dispatch, () => { setSelection([]); setItems(null) })
            }
        })
    }

    useEffect(() => {
        getAllPartyDetails(dispatch)
    }, [dispatch])

    return (
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Create a Booking</h3>
            <Filters setFilters={setFilters} setItems={setItems} />
            {items && <div className={style.card}>
                {loading ? (
                    <div className={style.loading}>Loading items...</div>
                ) : items.length === 0 ? (
                    <div className={style.empty}>No items found</div>
                ) : (
                    <div className={style.tableWrapper}>

                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>ID</th>
                                    <th>Wagon No.</th>
                                    <th>Status</th>
                                    <th>Type</th>
                                    <th>Material Description</th>
                                    <th>Quantity</th>
                                    <th>Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem color={colors.find(i => item.warehouse?._id === i.warehouseId)} key={item._id} item={item} view={view} setSelection={setSelection} setView={setView} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>}
            {items && selection.length > 0 && <div className={style.confirmationButton}>
                <button onClick={() => onBookinging()}>Confirm Booking</button>
            </div>}
        </div >
    );
};

const SingleItem = ({ color, setSelection, item, view }) => {
    const [select, setSelect] = useState(false);

    const handleSelect = () => {
        setSelect(prev => !prev);

        setSelection(prev => {
            if (select) {
                // Remove from selection
                return prev.filter(i => i._id !== item._id);
            } else {
                // Add to selection
                return [...prev, item];
            }
        });
    };

    const status = {
        'Cold Rolled': { background: 'var(--info-muted)',   foreground: 'var(--info)' },
        'Hot Rolled':  { background: 'var(--danger-muted)', foreground: 'var(--danger)' },
    };

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ""}`}
            style={{ backgroundColor: select ? 'var(--accent-muted)' : 'transparent' }}
            onClick={handleSelect}
        >
            <td>{select ? <FaCheckSquare style={{ color: 'var(--accent)', borderRadius: '0.4rem' }} /> : <FaSquare style={{ color: 'var(--accent)', borderRadius: '0.25rem', opacity: 0.4 }} />}</td>
            <td>{item.item_id || "-"}</td>
            <td>{item.wagonNumber || "-"}</td>
            <td style={{ fontWeight: '500', textDecoration: 'underline' }}>{item.challanNumber ? 'In Inventory' : "Arriving"}</td>
            <td>
                <p className={style.coloredShipTo}
                    style={{
                        background: status[item.type]?.background,
                        color: status[item.type]?.foreground,
                        border: `1px solid ${status[item.type]?.foreground}`,
                    }}>{item.type || "-"}</p>
            </td>

            <td style={{ display: "flex", gap: "4px" }}>
                <span>{item.thickness?.name || "-"}</span> X
                <span>{item.width?.name || "-"}</span> X
                <span>{item.grade?.name || "-"}</span>
            </td>

            <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{item.quantity != null ? Number(item.quantity).toFixed(3) : '-'}</td>
            <td style={{ display: "flex" }}>{item.warehouse === null ? "-" : <p className={style.coloredShipTo} style={{ background: color?.backgroundColor, color: color?.foregroundColor, border: `1px solid ${color?.foregroundColor}` }}>{item.warehouse.name.toLowerCase()}</p>}</td>

        </tr>
    );
};

const Filters = ({ setFilters, setItems }) => {
    const { grades, thicknesses, warehouses, widths } = useSelector(
        (state) => state.varient
    );
    const dispatch = useDispatch();

    const [currentType, setCurrentType] = useState('Both');
    const handleTypeChange = (e) => {
        if (e.target.value === '') {
            setCurrentType('Both')
        } else {
            setCurrentType(e.target.value);
        }
    }

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            grade: "",
            type: "",
            width: "",
            thickness: "",
            warehouse: "",
        },
    });

    const onSubmit = (data) => {
        let payload = {};
        if (data.grade !== '') {
            payload.grade = data.grade
        }
        if (data.type !== '') {
            payload.type = data.type
        }
        if (data.width !== '') {
            payload.width = data.width
        }
        if (data.thickness !== '') {
            payload.thickness = data.thickness
        }
        if (data.warehouse !== '') {
            payload.warehouse = data.warehouse
        }
        searchOptions(payload, dispatch, setItems);
        // 🧠 You can now trigger search or dispatch action here
    };

    const handleReset = (filters) => {
        searchOptions({}, dispatch, setItems);
        reset();
        setFilters({
            grade: "",
            type: "",
            width: "",
            thickness: "",
            warehouse: "",
        })
    };

    return (
        <form className={style.formBlock} onSubmit={handleSubmit(onSubmit)} onChange={handleSubmit(onSubmit)}>
            {/* Type */}
            <div>
                <label htmlFor="type">Type:</label>
                <select id="type" {...register("type")} onClick={handleTypeChange}>
                    <option value="">All</option>
                    <option value="Hot Rolled">Hot Rolled</option>
                    <option value="Cold Rolled">Cold Rolled</option>
                </select>
            </div>

            {/* Grade */}
            <div>
                <label htmlFor="grade">Grade:</label>
                <select id="grade" {...register("grade")}>
                    <option value="">All</option>
                    {grades?.map((grade) => ((currentType === 'Both' || currentType === grade.type) &&
                        <option key={grade._id} value={grade._id}>
                            {grade.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Width */}
            <div>
                <label htmlFor="width">Width:</label>
                <select id="width" {...register("width")}>
                    <option value="">All</option>
                    {widths?.map((width) => ((currentType === 'Both' || currentType === width.type) &&
                        <option key={width._id} value={width._id}>
                            {width.value || width.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Thickness */}
            <div>
                <label htmlFor="thickness">Thickness:</label>
                <select id="thickness" {...register("thickness")}>
                    <option value="">All</option>
                    {thicknesses?.map((thickness) => ((currentType === 'Both' || currentType === thickness.type) &&
                        <option key={thickness._id} value={thickness._id}>
                            {thickness.value || thickness.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Warehouse */}
            <div>
                <label htmlFor="warehouse">Location:</label>
                <select id="warehouse" {...register("warehouse")}>
                    <option value="">All</option>
                    {warehouses?.map((warehouse) => (
                        <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Buttons */}
            <div className={style.buttonGroup}>
                <button type="button" onClick={handleReset}>
                    Reset
                </button>
            </div>
        </form>
    );
};


export default Create;
