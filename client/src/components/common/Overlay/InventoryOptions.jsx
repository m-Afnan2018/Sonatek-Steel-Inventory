import React, { useEffect, useState } from 'react'
import style from './Overlayv2.module.css'
import { Controller, useForm } from 'react-hook-form';
import CreatableSelect from "react-select/creatable";
import { useDispatch, useSelector } from 'react-redux';
import { RxCrossCircled } from "react-icons/rx";
import { MdEdit, MdClose, MdCheck } from 'react-icons/md';
import { cancelBooking, createBookingFromInventory, getAllBookingByItem, getAllPartyDetails, increaseQuantity, shipBooking } from 'services/operations/bookingAPI';
import { updateItem } from 'services/operations/itemAPI';
import { updateBooking } from 'slices/bookingSlice';
import { setUpdateQuantity, updateListViewListData } from 'slices/itemSlice';

const tableData = ({ name, value }) => {
    return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', gap: '0.25rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{name}:</h2>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 400 }}>{value}</h3>
    </div >
}

const customStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: "24px",
        height: "24px",
        fontSize: "12px",
        borderRadius: "6px",
        width: '100%'
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: "0 4px",
        height: "24px",
        display: "flex",
        alignItems: "center"
    }),
    input: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: "24px"
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: "2px",
    }),
    clearIndicator: (provided) => ({
        ...provided,
        padding: "2px",
    }),
    option: (provided) => ({
        ...provided,
        fontSize: "12px",
        padding: "4px 8px"
    }),
    menu: (provided) => ({
        ...provided,
        fontSize: "12px"
    })
};

const InventoryOptions = ({ data, close, type, onAccept }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isEditing) { setIsEditing(false); return; }
                close?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [close, isEditing]);

    return (
        <div
            className={`${style.UpcomingOptions} ${style.InventoryOptions}`}
            onClick={(e) => e.stopPropagation()}
            style={{ width: type === 'booking' || type === 'increaseQuantity' ? 'min(460px, 92vw)' : 'min(860px, 92vw)' }}
        >
            <RxCrossCircled onClick={close} />
            <div>
                <h1>{type === 'booking' ? 'Place Order' : type === 'increaseQuantity' ? 'Update Quantity' : 'Order Overview'}</h1>
            </div>

            <div style={{
                flexDirection: type === 'booking' || type === 'increaseQuantity' ? 'column' : 'row'
            }}>
                {/* Info section — view or edit mode */}
                {isEditing ? (
                    <EditItemForm
                        data={localData}
                        onCancel={() => setIsEditing(false)}
                        onSaved={(updated) => {
                            setLocalData(updated);
                            setIsEditing(false);
                        }}
                    />
                ) : (
                    <section style={{
                        height: 'fit-content',
                        padding: '1rem',
                        gap: '0.75rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        alignItems: 'center',
                        border: '1px solid var(--border)',
                        position: 'relative'
                    }}>
                        {/* Edit toggle button — only shown on overview / logs */}
                        {(type === 'overview' || type === 'logs' || !type) && (
                            <button
                                title="Edit item"
                                onClick={() => setIsEditing(true)}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'var(--accent)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '26px',
                                    height: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    flexShrink: 0,
                                }}
                            >
                                <MdEdit size={14} />
                            </button>
                        )}
                        {tableData({ name: 'ID', value: localData.item_id })}
                        {tableData({ name: 'Date', value: localData.date?.slice(0, 10) || "No Date" })}
                        {tableData({ name: 'Type', value: localData?.type })}
                        {tableData({ name: 'Form Type', value: localData?.form })}
                        {tableData({ name: 'Wagon Number', value: `${localData?.wagonNumber}` || "NULL" })}
                        {tableData({ name: 'Description', value: `${localData?.thickness?.name} X ${localData?.width?.name} X ${localData?.grade?.name}` || "NULL" })}
                        {tableData({ name: 'Challan Number', value: localData?.challanNumber || "NULL" })}
                        {tableData({ name: 'Warehouse', value: localData?.warehouse?.name || "NULL" })}
                        {tableData({ name: 'Challan Date', value: localData?.challanDate?.slice(0, 10) || "NULL" })}
                        {tableData({ name: 'Total Quantity', value: Number(localData.originalQuantity)?.toFixed(3) || 0 })}
                        {tableData({ name: 'Remarks', value: localData.remarks || "NULL" })}
                        {tableData({ name: 'Current Quantity', value: Number(localData.quantity)?.toFixed(3) || 0 })}
                        {tableData({ name: 'Transporter', value: localData?.transporter || "NULL" })}
                        {tableData({ name: 'Loader', value: localData?.loader || "NULL" })}
                        {tableData({ name: 'Vehicle Number', value: localData?.vehicleNumber || "NULL" })}


                    </section>
                )}

                {type === 'booking' && <MoveToBooking
                    data={localData}
                    close={close}
                    onAccept={onAccept}
                />}
                {type === 'increaseQuantity' && <IncreaseQuantity
                    data={localData}
                    close={close}
                />}
            </div>

            {type === 'logs' && <TableView data={localData} />}
        </div >
    );
};

/* ─── Inline edit form ──── */
const EditItemForm = ({ data, onCancel, onSaved }) => {
    const dispatch = useDispatch();
    const { grades, widths, thicknesses, warehouses, transporters, loaders, vehicles } = useSelector(state => state.varient);

    const [form, setForm] = useState({
        grade: data.grade?._id || '',
        width: data.width?._id || '',
        thickness: data.thickness?._id || '',
        challanNumber: data.challanNumber || '',
        challanDate: data.challanDate?.slice(0, 10) || '',
        warehouse: data.warehouse?._id || '',
        wagonNumber: data.wagonNumber || '',
        transporter: data.transporter || '',
        loader: data.loader || '',
        vehicleNumber: data.vehicleNumber || '',
        date: data.date?.slice(0, 10) || '',
        remarks: data.remarks || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const handleSave = async () => {
        if (!form.grade || !form.width || !form.thickness) {
            setError('Grade, Width and Thickness are required.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                _id: data._id,
                grade: form.grade,
                width: form.width,
                thickness: form.thickness,
                warehouse: form.warehouse || '',
                wagonNumber: form.wagonNumber,
                date: form.date,
                challanDate: form.challanDate,
                challanNumber: form.challanNumber,
                remarks: form.remarks,
                transporter: form.transporter,
                loader: form.loader,
                vehicleNumber: form.vehicleNumber,
            };
            await updateItem(payload, dispatch);

            // Build updated localData from selected variant objects
            const findById = (arr, id) => (arr || []).find(x => x._id === id);
            const updatedGrade = findById(grades, form.grade) || data.grade;
            const updatedWidth = findById(widths, form.width) || data.width;
            const updatedThickness = findById(thicknesses, form.thickness) || data.thickness;
            const updatedWarehouse = findById(warehouses, form.warehouse) || null;
            const updatedTransporter = findById(transporters, form.transporter) || null;
            const updatedLoader = findById(loaders, form.loader) || null;
            const updatedVehicle = findById(vehicles, form.vehicleNumber) || null;

            const merged = {
                ...data,
                grade: updatedGrade,
                width: updatedWidth,
                thickness: updatedThickness,
                warehouse: updatedWarehouse,
                wagonNumber: form.wagonNumber,
                date: form.date,
                challanDate: form.challanDate,
                challanNumber: form.challanNumber,
                remarks: form.remarks,
                transporter: form.transporter,
                loader: form.loader,
                vehicleNumber: form.vehicleNumber,
            };

            // Instantly update Redux list so parent table reflects the change
            dispatch(updateListViewListData({
                updatedItem: {
                    _id: data._id,
                    grade: updatedGrade,
                    width: updatedWidth,
                    thickness: updatedThickness,
                    warehouse: updatedWarehouse,
                    wagonNumber: form.wagonNumber,
                    date: form.date,
                    remarks: form.remarks,
                    transporter: form.transporter,
                    loader: form.loader,
                    vehicleNumber: form.vehicleNumber,
                    challanDate: form.challanDate,
                    challanNumber: form.challanNumber,
                }
            }));

            onSaved(merged);
        } catch (e) {
            setError('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const fieldStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        marginBottom: '0.5rem',
    };
    const labelStyle = { fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)' };
    const inputStyle = {
        fontSize: '0.78rem',
        padding: '4px 6px',
        borderRadius: '5px',
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        width: '100%',
    };

    return (
        <section style={{
            height: 'fit-content',
            padding: '1rem',
            gap: '0.25rem',
            border: '1px solid var(--accent)',
            borderRadius: '6px',
            position: 'relative',
            minWidth: '200px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            gap: '.5rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>Edit Item</span>
            </div>

            {error && (
                <div style={{
                    fontSize: '0.72rem', color: 'rgb(198,40,40)',
                    background: 'rgb(255,235,238)', border: '1px solid rgb(239,83,80)',
                    borderRadius: '4px', padding: '4px 8px', marginBottom: '0.4rem'
                }}>{error}</div>
            )}

            {/* Read-only ID */}
            {tableData({ name: 'ID', value: data.item_id })}

            {/* Grade */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Grade:</label>
                <select style={inputStyle} value={form.grade} onChange={e => handleChange('grade', e.target.value)}>
                    <option value=''>Select grade</option>
                    {(grades || []).map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
            </div>

            {/* Width */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Width:</label>
                <select style={inputStyle} value={form.width} onChange={e => handleChange('width', e.target.value)}>
                    <option value=''>Select width</option>
                    {(widths || []).map(w => <option key={w._id} value={w._id}>{w.value || w.name}</option>)}
                </select>
            </div>

            {/* Thickness */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Thickness:</label>
                <select style={inputStyle} value={form.thickness} onChange={e => handleChange('thickness', e.target.value)}>
                    <option value=''>Select thickness</option>
                    {(thicknesses || []).map(t => <option key={t._id} value={t._id}>{t.value || t.name}</option>)}
                </select>
            </div>

            {/* Warehouse */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Warehouse:</label>
                <select style={inputStyle} value={form.warehouse} onChange={e => handleChange('warehouse', e.target.value)}>
                    <option value=''>None</option>
                    {(warehouses || []).map(wh => <option key={wh._id} value={wh._id}>{wh.name}</option>)}
                </select>
            </div>

            {/* Wagon Number */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Wagon Number:</label>
                <input
                    style={inputStyle}
                    type='text'
                    value={form.wagonNumber}
                    onChange={e => handleChange('wagonNumber', e.target.value)}
                    placeholder='Wagon number'
                />
            </div>

            {/* Date */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Date:</label>
                <input
                    style={inputStyle}
                    type='date'
                    value={form.date}
                    onChange={e => handleChange('date', e.target.value)}
                />
            </div>

            {/* Challan Date */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Challan Date:</label>
                <input
                    style={inputStyle}
                    type='date'
                    value={form.challanDate}
                    onChange={e => handleChange('challanDate', e.target.value)}
                />
            </div>

            {/* Challan Number */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Challan Number:</label>
                <input
                    style={inputStyle}
                    type='text'
                    value={form.challanNumber}
                    onChange={e => handleChange('challanNumber', e.target.value)}
                    placeholder='Challan number'
                />
            </div>

            {/* Remarks */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Remarks:</label>
                <input
                    style={inputStyle}
                    type='text'
                    value={form.remarks}
                    onChange={e => handleChange('remarks', e.target.value)}
                    placeholder='Add remarks'
                />
            </div>

            {/* Transporter */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Transporter:</label>
                <input
                    style={inputStyle}
                    type='text'
                    value={form.transporter}
                    onChange={e => handleChange('transporter', e.target.value)}
                    placeholder='Enter transporter name'
                />
            </div>

            {/* Loader */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Loader:</label>
                <input
                    style={inputStyle}
                    type='text'
                    value={form.loader}
                    onChange={e => handleChange('loader', e.target.value)}
                    placeholder='Enter loader name'
                />
            </div>

            {/* Vehicle Number */}
            <div style={fieldStyle}>
                <label style={labelStyle}>Vehicle Number:</label>
                <input
                    style={inputStyle}
                    type='text'
                    value={form.vehicleNumber}
                    onChange={e => handleChange('vehicleNumber', e.target.value)}
                    placeholder='Enter vehicle number'
                />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem', gridColumn: '1/-1' }}>
                <button className='btn error' onClick={onCancel} disabled={saving} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Cancel</button>
                <button className='btn success' onClick={handleSave} disabled={saving} style={{ fontSize: '0.75rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MdCheck size={14} />{saving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </section>
    );
};

const IncreaseQuantity = ({ data, close }) => {
    const dispatch = useDispatch();

    const [fillUpData, setFillUpData] = useState({
        item: data._id,
        original: data.originalQuantity,
        available: data.quantity,
        updatedQuantity: 0
    })

    const [validationError, setValidationError] = useState('');

    const handleChange = (field, e) => {
        setFillUpData((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
        if (validationError) setValidationError('');
    };

    const validateForm = () => {
        if (!fillUpData?.updatedQuantity || fillUpData?.updatedQuantity <= 0) {
            setValidationError('Please enter a valid quantity');
            return false;
        }
        if (Number(fillUpData.updatedQuantity) <= Number(fillUpData.original)) {
            setValidationError(`Please enter a quantity greater than the current total (${fillUpData.original})`);
            return false;
        }
        return true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleUpdatedQuantitySubmit = async () => {
        setValidationError('');

        if (!validateForm()) return;

        const res = await increaseQuantity({ ...fillUpData }, dispatch);
        dispatch(setUpdateQuantity({ item: data._id, updatedQuantity: fillUpData.updatedQuantity }));
        close();
    };

    return (
        <section>
            {validationError && (
                <div style={{
                    marginBottom: '15px',
                    backgroundColor: 'rgb(255, 235, 238)',
                    color: 'rgb(198, 40, 40)',
                    borderRadius: '4px',
                    border: '1px solid rgb(239, 83, 80)',
                    position: 'absolute',
                    fontSize: '0.75em',
                    padding: '0.3rem 0.5rem',
                    fontWeight: '800',
                    top: '75px',
                    left: '52%',
                    transform: 'translateX(-50%)',
                }}>
                    {validationError}
                </div>
            )}

            <div className={style.fillUpData}>
                <div>
                    <h2 style={{ width: '50%' }}>Total Quantity:</h2>
                    <h3 style={{ width: '50%' }}>{fillUpData.original}</h3>
                </div>
                <div>
                    <h2 style={{ width: '50%' }}>Available Quantity:</h2>
                    <h3 style={{ width: '50%' }}>{fillUpData.available.toFixed(3)}</h3>
                </div>
                <div>
                    <h2 style={{ width: '50%' }}>Updated Quantity:</h2>
                    <input
                        type="number"
                        value={fillUpData?.updatedQuantity || ''}
                        onChange={(e) => handleChange('updatedQuantity', e)}
                    />
                </div>

            </div>
            <div style={{ display: 'flex', width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
                {/* <button className="btn error" onClick={close}>Close</button> */}
                <button onClick={handleUpdatedQuantitySubmit} className="btn success">Updated Quantity</button>
            </div>
        </section>
    );
};

const MoveToBooking = ({ data, close, onAccept }) => {
    const dispatch = useDispatch();

    const [fillUpData, setFillUpData] = useState({
        item: data._id,
        quantity: 0,
        formType: data.marking?.formType || 'Coil',
        shipTo: data.marking?.shipTo || '',
        markedBy: data.marking?.markedBy ? `${data.marking?.markedBy.firstName} ${data.marking?.markedBy.lastName}` : 'Not Booked Yet',
        invoiceNumber: '',
        invoiceDate: '',
        vehicleNumber: '',
    })

    const [validationError, setValidationError] = useState('');

    const { control, getValues } = useForm({
        defaultValues: {
            party: data.marking?.party ? { label: data.marking?.party.name, value: data.marking?.party._id } : null,
        },
    });

    const { parties } = useSelector(state => state.booking);

    // Fetch parties on mount so the selector is populated even after a hard refresh
    useEffect(() => {
        if (!parties || parties.length === 0) {
            getAllPartyDetails(dispatch);
        }
    }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (field, e) => {
        setFillUpData((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
        if (validationError) setValidationError('');
    };

    const validateForm = (selectedParty) => {
        if (!fillUpData?.formType) {
            setValidationError('Please select Form Type');
            return false;
        }
        if (!fillUpData?.quantity || Number(fillUpData?.quantity) <= 0) {
            setValidationError('Please enter a valid Quantity');
            return false;
        }
        if (Number(fillUpData?.quantity) > data.quantity) {
            setValidationError(`Quantity cannot be greater than available stock (${data.quantity.toFixed(3)})`);
            return false;
        }
        if (!selectedParty) {
            setValidationError('Please select or add a Party');
            return false;
        }
        if (!fillUpData?.shipTo || fillUpData?.shipTo.trim().length === 0) {
            setValidationError('Please enter Ship To address');
            return false;
        }
        if (!fillUpData?.invoiceDate) {
            setValidationError('Please select Invoice Date');
            return false;
        }
        if (!fillUpData?.invoiceNumber || fillUpData?.invoiceNumber.trim().length === 0) {
            setValidationError('Please enter Invoice Number');
            return false;
        }

        return true;
    };

    const handleBookingSubmit = async () => {
        setValidationError('');

        const { party: selectedParty } = getValues();

        // Validate all fields first
        if (!validateForm(selectedParty)) {
            return;
        }

        let party = null;
        if (selectedParty && typeof selectedParty.value === "string") {
            party = {
                val: selectedParty.value,
                type: parties && parties.some((p) => p._id === selectedParty.value) ? 'id' : 'name'
            };
        }

        if (!party) {
            setValidationError('Please select or add a Party');
            return;
        }

        // Only close and submit if everything above passed
        const result = await createBookingFromInventory({ ...fillUpData, party }, dispatch);
        if (result) {
            const newRemaining = Number(data.quantity) - Number(fillUpData.quantity);
            dispatch(updateListViewListData({ updatedItem: { _id: data._id, remaining: newRemaining } }));
        }
        close();
        if (onAccept) onAccept(result);
    };

    const toOptions = (arr, labelField = "name", valueField = "_id") =>
        arr?.map((i) => ({
            label: i[labelField] || i.value,
            value: i[valueField] || i.label,
        })) || [];

    return (
        <section>
            {validationError && (
                <div style={{
                    marginBottom: '15px',
                    backgroundColor: 'rgb(255, 235, 238)',
                    color: 'rgb(198, 40, 40)',
                    borderRadius: '4px',
                    border: '1px solid rgb(239, 83, 80)',
                    position: 'absolute',
                    fontSize: '0.75em',
                    padding: '0.3rem .5rem',
                    fontWeight: '800',
                    left: '52%',
                    top: '75px',
                    transform: 'translateX(-50%)',
                }}>
                    {validationError}
                </div>
            )}

            <div className={style.fillUpData}>
                <div>
                    <h2>Form:</h2>
                    <select
                        value={fillUpData?.formType || ''}
                        onChange={(e) => handleChange('formType', e)}
                    >
                        <option value="" disabled>Select</option>
                        <option value="Sheet">Sheet</option>
                        <option value="Coil">Coil</option>
                    </select>
                </div>

                <div>
                    <h2>Quantity:</h2>
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        max={data.quantity?.toFixed(3)}
                        value={fillUpData?.quantity || ''}
                        onChange={(e) => handleChange('quantity', e)}
                    />
                </div>

                <div>
                    <h2>Party:</h2>
                    <Controller
                        name="party"
                        control={control}
                        render={({ field }) => (
                            <CreatableSelect
                                {...field}
                                options={toOptions(parties)}
                                value={field.value}
                                onChange={(option) => {
                                    field.onChange(option);
                                    if (validationError) setValidationError('');
                                }}
                                placeholder="Party"
                                styles={customStyles}
                                isSearchable
                                isClearable
                                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                            />
                        )}
                    />
                </div>

                <div>
                    <h2>Ship To:</h2>
                    <input
                        type="text"
                        value={fillUpData?.shipTo || ''}
                        onChange={(e) => handleChange('shipTo', e)}
                        placeholder="Ship To"
                    />
                </div>
                <div>
                    <h2>Invoice Date:</h2>
                    <input
                        type='date'
                        value={fillUpData?.invoiceDate || ''}
                        onChange={(e) => handleChange('invoiceDate', e)}
                    />
                </div>
                <div>
                    <h2>Invoice Number:</h2>
                    <input
                        type="text"
                        value={fillUpData?.invoiceNumber || ''}
                        onChange={(e) => handleChange('invoiceNumber', e)}
                    />
                </div>
                <div>
                    <h2>Vehicle Number:</h2>
                    <input
                        type="text"
                        value={fillUpData?.vehicleNumber || ''}
                        onChange={(e) => handleChange('vehicleNumber', e)}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
                {/* <button className="btn error" onClick={close}>Close</button> */}
                <button style={{ width: '9rem' }} onClick={handleBookingSubmit} className="btn success">Place Order</button>
            </div>
        </section>
    );
};

const TableView = ({ data }) => {
    const [show, setShow] = useState("Pending");
    const [showListing, setShowListing] = useState([]);
    const [list, setList] = useState([]);
    const [editingRemarkId, setEditingRemarkId] = useState(null); // which remark is being edited
    const [tempRemark, setTempRemark] = useState("");
    const [reason, setReason] = useState("");

    const dispatch = useDispatch();

    useEffect(() => {
        getAllBookingByItem({ item: data._id }, dispatch, setList);
    }, [data._id, dispatch]);

    useEffect(() => {
        if (show === 'Pending') {
            setShowListing(list.filter((i) => i.status === 'Processing'))
        } else {
            setShowListing(list.filter((i) => i.status !== 'Processing'))
        }
    }, [list, show])

    const bookingDate = (date) =>
        date ? new Date(date).toLocaleDateString() : "-";

    // Save remark in DB
    const saveRemark = (id) => {
        const updated = list.map((b) =>
            b._id === id ? { ...b, remarks: tempRemark } : b
        );
        setList(updated);

        // CALL API HERE
        // updateBooking({ id, remarks: tempRemark }, dispatch);

        setEditingRemarkId(null);
        setTempRemark("");
    };

    // Update vehicle number immediately
    const updateVehicle = (id, value) => {
        const updated = list.map((b) =>
            b._id === id ? { ...b, vehicleNumber: value } : b
        );
        setList(updated);

        // CALL API HERE
        // updateBooking({ id, vehicleNumber: value }, dispatch);
    };

    // Handle action buttons
    const handleAction = (id, status) => {
        const updated = list.map((b) =>
            b._id === id ? { ...b, status } : b
        );
        setList(updated);

        const vNum = (list.filter((i) => i._id === id))[0];

        if (status === 'Shipped') {
            shipBooking({ bookingId: id, fieldValue: vNum.vehicleNumber }, dispatch, setList);
        }

        if (status === 'Cancelled') {
            cancelBooking({ bookingId: id, fieldValue: vNum.reason }, dispatch, setList)
        }

        // CALL API HERE
        updateBooking({ id, status }, dispatch);
    };
    function updateReason(id, value) {
        const updated = list.map((b) =>
            b._id === id ? { ...b, reason: value } : b
        );
        setList(updated);

        // CALL API HERE
        updateBooking({ id, fieldValue: value }, dispatch);
    }

    if (list === null) return <div>Loading</div>;
    if (list.length === 0) return <div>No Booking Found</div>;

    return (
        <section className={style.tableView}>
            <div>
                <div className={style.toggle}>
                    <h3>{show}</h3>
                    <div className={style.groupRadio} style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setShow("Pending")}
                            style={{
                                border: '1px solid var(--accent)',
                                color: show === "Pending" ? '#fff' : 'var(--accent)',
                                backgroundColor: show === "Pending" ? 'var(--accent)' : 'var(--bg-elevated)',
                                cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '4px 12px', fontWeight: 600,
                            }}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setShow("Completed")}
                            style={{
                                border: '1px solid var(--accent)',
                                color: show === "Pending" ? 'var(--accent)' : '#fff',
                                backgroundColor: show === "Pending" ? 'var(--bg-elevated)' : 'var(--accent)',
                                cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '4px 12px', fontWeight: 600,
                            }}
                        >
                            Completed
                        </button>
                    </div>
                </div>
                <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border)" }} />
            </div>
            <div style={{ overflow: "auto" }}>
                <table>
                    <thead style={{ position: "sticky", top: 0 }}>
                        <tr>
                            <th>Order ID</th>
                            <th>FormType</th>
                            <th>Quantity</th>
                            <th>Party</th>
                            <th>Booked By</th>
                            <th>Booking Date</th>
                            <th>Ship To</th>
                            <th>Remarks</th>
                            <th>Vehicle Number</th>
                            <th>Reason</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {showListing.length > 0 ? showListing.map((item) => (
                            <tr key={item._id}>
                                <td>{item.order_id}</td>
                                <td>{item.formType}</td>
                                <td>{item.quantity}</td>
                                <td>{item.party}</td>
                                <td>{item.bookedBy}</td>
                                <td>{bookingDate(item.bookingDate)}</td>
                                <td>{item.shipTo}</td>

                                {/* Remarks cell */}
                                <td>
                                    {editingRemarkId === item._id ? (
                                        <div style={{ position: 'relative' }}>
                                            <textarea
                                                value={tempRemark}
                                                onChange={(e) => setTempRemark(e.target.value)}
                                                rows={2}
                                                style={{ width: "100%" }}
                                            />
                                            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                                                <button onClick={() => saveRemark(item._id)}>
                                                    Save
                                                </button>
                                                <button onClick={() => setEditingRemarkId(null)}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                setEditingRemarkId(item._id);
                                                setTempRemark(item.remarks || "");
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {item.remarks || "Add remark"}
                                        </div>
                                    )}
                                </td>

                                {/* Vehicle number input */}
                                <td>
                                    {item.status === 'Processing' && <input
                                        type="text"
                                        value={item.vehicleNumber || ""}
                                        onChange={(e) =>
                                            updateVehicle(item._id, e.target.value)
                                        }
                                        style={{ width: "120px" }}
                                    />}
                                    {item.status === 'Cancelled' && '-'}
                                    {item.status === 'Shipped' && item.vehicleNumber}
                                </td>

                                {/* Reason input */}
                                <td>
                                    {<input
                                        type="text"
                                        value={item.reason || ""}
                                        onChange={(e) => updateReason(item._id, e.target.value)}
                                        style={{ width: "120px" }}
                                    />}
                                    {item.reason && '-'}

                                </td>

                                {/* Action column */}
                                {item.status === 'Processing' && <td>
                                    {item.reason && <button style={{ background: 'red', border: 'none', color: 'white', borderRadius: '5px', padding: '0.5rem', cursor: 'pointer', marginRight: '0.5rem' }} title='Cancel' onClick={() => handleAction(item._id, "Cancelled")}>
                                        Cancel
                                    </button>}
                                    {item.vehicleNumber && <button style={{ background: 'green', border: 'none', color: 'white', borderRadius: '5px', padding: '0.5rem', cursor: 'pointer' }} title='Ship' onClick={() => handleAction(item._id, "Shipped")}>
                                        Ship
                                    </button>}
                                </td>}
                                {item.status === 'Shipped' && <td style={{ color: 'green' }}>
                                    Shipped
                                </td>}
                                {item.status === 'Cancelled' && <td style={{ color: 'red' }}>
                                    Cancelled
                                </td>}
                            </tr>
                        )) : <td colSpan={10} style={{ padding: '2rem' }}> No Booking Found </td>}
                    </tbody>
                </table>
            </div>
        </section>
    );
};



export default InventoryOptions;