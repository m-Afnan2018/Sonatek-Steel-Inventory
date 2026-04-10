import React, { useEffect, useState } from 'react'
import style from './Overlayv2.module.css'
import { Controller, useForm } from 'react-hook-form';
import CreatableSelect from "react-select/creatable";
import { useDispatch, useSelector } from 'react-redux';
import { markForBooking, moveToInventory, unmarkForBooking } from 'services/operations/itemAPI';

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
        width: '12rem'
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


const UpcomingOptions = ({ data, close, type }) => {
    const [show, setShow] = useState(type);
    const [fillUpData, setFillUpData] = useState({});
    const [text, setText] = useState('');

    useEffect(() => {
        if (show === 'party') {
            if (fillUpData?.vehicleNumber?.length > 0) {
                setText('Move to Shipped');
            } else {
                if (fillUpData?.invoiceNumber?.length > 0) {
                    setText('Move to Booking');
                } else {
                    setText('Save for Booking');
                }
            }

        } else {
            setText('Move to Inventory')
        }
    }, [fillUpData, show]);


    const dispatch = useDispatch();

    // Initialize handleSubmit function for child components to use
    const handleSubmit = () => {
        if (show === 'party') {
            // Call the MoveToBooking's submit logic
            handleBookingSubmit();
        } else {
            // Call the MoveToInventory's submit logic
            handleInventorySubmit();
        }
    };

    const resetForm = () => {
        unmarkForBooking({ item: data._id }, dispatch);
        setFillUpData(null);
        close();
    }

    const [handleBookingSubmit, setHandleBookingSubmit] = useState(() => () => { });
    const [handleInventorySubmit, setHandleInventorySubmit] = useState(() => () => { });

    return (
        <div
            className={style.UpcomingOptions}
            onClick={(e) => e.stopPropagation()}
        >
            <div>
                <h1>Upcoming Action</h1>
                <div className={style.groupBtn}>
                    <button onClick={() => setShow('party')} style={{ borderRadius: '100rem 0 0 100rem', color: show === 'party' ? '#fff' : 'var(--accent)', backgroundColor: show === 'party' ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--accent)', padding: '0px 12px', fontWeight: 600, cursor: 'pointer' }}>To Party</button>
                    <button onClick={() => { if (!data.marking) setShow('inventory') }} style={{ cursor: data.marking ? 'not-allowed' : 'pointer', borderRadius: '0 100rem 100rem 0', color: show === 'party' ? 'var(--accent)' : '#fff', backgroundColor: show === 'party' ? 'var(--bg-elevated)' : 'var(--accent)', border: '1px solid var(--accent)', padding: '0px 12px', fontWeight: 600 }}>To Inventory</button>
                </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)' }}></div>

            <div>
                <div style={{
                    height: 'fit-content',
                    padding: '1rem',
                    background: 'var(--accent-muted)',
                    borderRadius: '1rem',
                    gap: '0.5rem'
                }}>
                    {tableData({ name: 'ID', value: data.item_id })}
                    {tableData({ name: 'Date', value: data.date?.slice(0, 10) })}
                    {tableData({ name: 'Wagon Number', value: `${data?.wagonNumber}` })}
                    {tableData({ name: 'Description', value: `${data?.thickness?.name} X ${data?.width?.name} X ${data?.grade?.name}` })}
                    {tableData({ name: 'Coming Quantity', value: data.quantity.toFixed(3) })}
                </div>

                {show === 'inventory' ?
                    <MoveToInventory
                        data={data}
                        close={close}
                        fillUpData={fillUpData}
                        setFillUpData={setFillUpData}
                        setHandleSubmit={setHandleInventorySubmit}
                    /> :
                    <MoveToBooking
                        data={data}
                        close={close}
                        fillUpData={fillUpData}
                        setFillUpData={setFillUpData}
                        setHandleSubmit={setHandleBookingSubmit}
                    />
                }
            </div>

            <div style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
                {data.marking?.markedBy && <button onClick={resetForm} className="btn error">Cancel Order</button>}
                <button onClick={close} className="btn error">Close</button>
                <button className="btn success" onClick={handleSubmit}>{text}</button>
            </div>
        </div >
    );
};

const MoveToInventory = ({ data, close, fillUpData, setFillUpData, setHandleSubmit }) => {
    const { warehouses } = useSelector(state => state.varient);
    const [validationError, setValidationError] = useState('');

    const dispatch = useDispatch();

    useEffect(() => {
        setFillUpData({
            item: data._id,
            challanDate: '',
            challanNumber: '',
            vehicleNumber: '',
            loader: '',
            transport: '',
            warehouse: data.warehouse?._id || ''
        });
    }, [data._id, data.warehouse?._id, setFillUpData]);

    useEffect(() => {
        // Set the submit handler for this component
        setHandleSubmit(() => async () => {
            if (!fillUpData?.challanNumber || fillUpData.challanNumber.trim() === '') {
                setValidationError('Please enter Challan Number');
                return;
            }
            moveToInventory(fillUpData, dispatch)
            close();
        });
    }, [fillUpData, close, setHandleSubmit, dispatch]);

    const handleChange = (field, e) => {
        setFillUpData((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
        if (validationError) setValidationError('');
    };

    return <div>
        {validationError && (
            <div style={{
                marginBottom: '15px',
                backgroundColor: 'rgb(255, 235, 238)',
                color: 'rgb(198, 40, 40)',
                borderRadius: '4px',
                border: '1px solid rgb(239, 83, 80)',
                position: 'absolute',
                fontSize: '0.75em',
                padding: '0.1rem',
                fontWeight: '800',
                left: '75%',
                transform: 'translateX(-50%)',
            }}>
                {validationError}
            </div>
        )}
        <div className={style.fillUpData}>
            <div>
                <h2>Warehouse</h2>
                <select
                    value={fillUpData?.warehouse || ''}
                    onChange={(e) => handleChange('warehouse', e)}
                >
                    <option value="" disabled>Select</option>
                    <option value={''}>NULL</option>
                    {warehouses?.map((opt) => (
                        <option key={opt._id} value={opt._id}>
                            {opt.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <h2>Challan Date</h2>
                <input
                    type='date'
                    value={fillUpData?.challanDate || ''}
                    onChange={(e) => handleChange('challanDate', e)}
                />
            </div>
            <div>
                <h2>Challan Number</h2>
                <input
                    required={true}
                    type="text"
                    value={fillUpData?.challanNumber || ''}
                    onChange={(e) => handleChange('challanNumber', e)}
                />
            </div>
            <div>
                <h2>Vehicle Number</h2>
                <input
                    type="text"
                    value={fillUpData?.vehicleNumber || ''}
                    onChange={(e) => handleChange('vehicleNumber', e)}
                />
            </div>
            <div>
                <h2>Loader</h2>
                <input
                    type="text"
                    value={fillUpData?.loader || ''}
                    onChange={(e) => handleChange('loader', e)}
                />
            </div>
            <div>
                <h2>Transport</h2>
                <input
                    type="text"
                    value={fillUpData?.transport || ''}
                    onChange={(e) => handleChange('transport', e)}
                />
            </div>
        </div>
    </div>
}

const MoveToBooking = ({ data, close, fillUpData, setFillUpData, setHandleSubmit }) => {
    const { userData } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        setFillUpData({
            item: data._id,
            quantity: data.marking?.quantity || data.quantity.toFixed(3) || 0,
            formType: data.marking?.formType || 'Coil',
            shipTo: data.marking?.shipTo || '',
            markedBy: data.marking?.markedBy ? `${data.marking?.markedBy.firstName} ${data.marking?.markedBy.lastName}` : 'Not Booked Yet',
            invoiceNumber: '',
            invoiceDate: '',
            vehicleNumber: '',
        });
        if (userData) {
            setDisableStatus(data.marking && userData?.userId !== data.marking?.markedBy._id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data._id, data.marking, userData, setFillUpData]);

    const [disableStatus, setDisableStatus] = useState(data.marking && userData?.userId !== data.marking?.markedBy._id);
    const [validationError, setValidationError] = useState('');

    const { control, getValues } = useForm({
        defaultValues: {
            party: data.marking?.party ? { label: data.marking?.party.name, value: data.marking?.party._id } : null,
        },
    });

    const { parties } = useSelector(state => state.booking);

    const handleChange = (field, e) => {
        setFillUpData((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
        if (validationError) setValidationError('');
    };

    const validateForm = (selectedParty) => {
        if (fillUpData?.invoiceNumber && fillUpData?.invoiceNumber.trim().length > 0) {
            if (!fillUpData?.formType) {
                setValidationError('Please select Form Type');
                return false;
            }
            if (!fillUpData?.quantity || fillUpData?.quantity <= 0) {
                setValidationError('Please enter a valid Quantity');
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
            if (!fillUpData?.vehicleNumber) {
                setValidationError('Please select Vehicle Date');
                return false;
            }
        }
        return true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleBookingSubmit = async () => {
        setValidationError('');
        const { party: selectedParty } = getValues();

        if (fillUpData?.invoiceNumber && fillUpData?.invoiceNumber.length > 0 && !validateForm(selectedParty)) {
            return;
        }

        let party;
        if (selectedParty && typeof selectedParty.value === "string") {
            party = {};
            party['val'] = selectedParty.value;

            if (parties && !parties.some((p) => p._id === selectedParty.value)) {
                party['type'] = 'name';
            } else {
                party['type'] = 'id';
            }
        }

        if (party === null) {
            return;
        }

        close();
        markForBooking({ ...fillUpData, party }, dispatch);
    };

    useEffect(() => {
        // Set the submit handler for this component
        setHandleSubmit(() => handleBookingSubmit);
    }, [fillUpData, setHandleSubmit, handleBookingSubmit]);

    const toOptions = (arr, labelField = "name", valueField = "_id") =>
        arr?.map((i) => ({
            label: i[labelField] || i.value,
            value: i[valueField] || i.label,
        })) || [];

    return (
        <div>
            {validationError && (
                <div style={{
                    marginBottom: '15px',
                    backgroundColor: 'rgb(255, 235, 238)',
                    color: 'rgb(198, 40, 40)',
                    borderRadius: '4px',
                    border: '1px solid rgb(239, 83, 80)',
                    position: 'absolute',
                    fontSize: '0.75em',
                    padding: '0.1rem',
                    fontWeight: '800',
                    left: '75%',
                    transform: 'translateX(-50%)',
                }}>
                    {validationError}
                </div>
            )}

            <div className={style.fillUpData}>
                <div>
                    <h2>Booked By:</h2>
                    <h3>{fillUpData?.markedBy}</h3>
                </div>

                {/* <div>
                    <h2>Form:</h2>
                    <select
                        disabled={disableStatus}
                        value={fillUpData?.formType || ''}
                        onChange={(e) => handleChange('formType', e)}
                    >
                        <option value="" disabled>Select</option>
                        <option value="Sheet">Sheet</option>
                        <option value="Coil">Coil</option>
                    </select>
                </div> */}

                <div>
                    <h2>Quantity:</h2>
                    <input
                        disabled={disableStatus}
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
                                disabled={disableStatus}
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
                        disabled={disableStatus}
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
        </div>
    );
};

export default UpcomingOptions;