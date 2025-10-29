import React, { useEffect, useState } from 'react';
import style from './Booking.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';
import { bookingItems, searchOptions } from 'services/operations/bookingAPI';
import { FaCheckSquare, FaSquare } from "react-icons/fa";
import { useOverlay } from 'hooks/useOverlay';
import SingleField from 'components/common/Overlay/SingleField';

const Items = () => {
    const [items, setItems] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const [selection, setSelection] = useState([]);

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
        shipTo: '',
        from: '',
        to: ''
    })

    // useEffect(() => {
    //     if (allChoices) {
    //         setItems(allChoices);
    //         setLoading(false);
    //     }
    // }, [allChoices])

    useEffect(() => {
        if (items === null) {
            setLoading(true);
        } else {
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
        showOverlay(SingleField, {
            message: "Enter requirement and form type",
            range: { min: mini.toFixed(3), max: maxi.toFixed(3) },
            onAccept: (data) => {
                bookingItems({ items: [...selection], ...data }, dispatch, () => { setSelection([]); setItems(null) })
            }
        })
    }

    return (
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Inventory Items</h3>
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
                                    <th>Wagon No.</th>
                                    <th>Challan date</th>
                                    <th>Challan No.</th>
                                    <th>Type</th>
                                    <th>Material Description</th>
                                    <th>Quantity</th>
                                    <th>Location</th>
                                    <th>Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem key={item._id} item={item} view={view} setSelection={setSelection} setView={setView} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Pagination controls */}
            </div>}
            {items && selection.length > 0 && <div className={style.confirmationButton}>
                <button onClick={() => onBookinging()}>Confirm Booking</button>
            </div>}
        </div >
    );
};

const SingleItem = ({ setSelection, item, view, setView }) => {
    const challanDate = item.challanDate
        ? new Date(item.challanDate).toLocaleDateString()
        : "-";

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

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ""}`}
            onClick={handleSelect}
        >
            <td>{item.wagonNumber || "-"}</td>
            <td>{challanDate}</td>
            <td>{item.challanNumber || "-"}</td>
            <td>{item.type || "-"}</td>

            <td style={{ display: "flex", gap: "5px" }}>
                <span>{item.thickness?.name || "-"}</span> X
                <span>{item.width?.name || "-"}</span> X
                <span>{item.grade?.name || "-"}</span>
            </td>

            <td>{item.quantity.toFixed(3) ?? "-"}</td>
            <td>{item.shipTo?.name ?? "-"}</td>

            <td>{select ? <FaCheckSquare /> : <FaSquare />}</td>
        </tr>
    );
};


const Filters = ({ setFilters, setItems }) => {
    const { grades, thicknesses, cutters, widths } = useSelector(
        (state) => state.varient
    );
    const dispatch = useDispatch();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            grade: "",
            type: "",
            width: "",
            thickness: "",
            shipTo: "",
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
        if (data.shipTo !== '') {
            payload.shipTo = data.shipTo
        }
        searchOptions(payload, dispatch, setItems);
        // 🧠 You can now trigger search or dispatch action here
    };

    const handleReset = (filters) => {
        getAllItem({}, dispatch);
        reset();
        setFilters({
            grade: "",
            type: "",
            width: "",
            thickness: "",
            shipTo: "",
        })
    };

    return (
        <form className={style.formBlock} onSubmit={handleSubmit(onSubmit)}>
            {/* Type */}
            <div>
                <label htmlFor="type">Type:</label>
                <select id="type" {...register("type")}>
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
                    {grades?.map((grade) => (
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
                    {widths?.map((width) => (
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
                    {thicknesses?.map((thickness) => (
                        <option key={thickness._id} value={thickness._id}>
                            {thickness.value || thickness.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ship To */}
            <div>
                <label htmlFor="shipTo">Location:</label>
                <select id="shipTo" {...register("shipTo")}>
                    <option value="">All</option>
                    {cutters?.map((cutter) => (
                        <option key={cutter._id} value={cutter._id}>
                            {cutter.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Buttons */}
            <div className={style.buttonGroup}>
                <button type="submit">Search</button>
                <button type="button" onClick={handleReset}>
                    Cancel
                </button>
            </div>
        </form>
    );
};


export default Items;
