import React, { useEffect, useState } from 'react'
import style from './Overlayv2.module.css'
import { Controller, useForm } from 'react-hook-form';
import CreatableSelect from "react-select/creatable";
import { useDispatch, useSelector } from 'react-redux';
import { RxCrossCircled } from "react-icons/rx";
import { cancelBooking, createBookingFromInventory, getAllBookingByItem, getAllPartyDetails, increaseQuantity, shipBooking } from 'services/operations/bookingAPI';
import { IoMdDoneAll } from "react-icons/io";

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

const InventoryOptions = ({ data, close, type }) => {
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

            {/* <div style={{ width: '100%', height: '1px', backgroundColor: 'black' }}></div> */}

            <div style={{
                flexDirection: type === 'booking' || type === 'increaseQuantity' ? 'column' : 'row'
            }}>
                <section style={{
                    height: 'fit-content',
                    padding: '1rem',
                    // background: '#0000ff0f',
                    gap: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border)'
                }}>
                    {tableData({ name: 'ID', value: data.item_id })}
                    {tableData({ name: 'Date', value: data.date?.slice(0, 10) })}
                    {tableData({ name: 'Wagon Number', value: `${data?.wagonNumber}` })}
                    {tableData({ name: 'Description', value: `${data?.thickness?.name} X ${data?.width?.name} X ${data?.grade?.name}` })}
                    {tableData({ name: 'Total Quantity', value: data.originalQuantity.toFixed(3) })}
                    {tableData({ name: 'Current Quantity', value: data.quantity.toFixed(3) })}
                </section>

                {type === 'booking' && <MoveToBooking
                    data={data}
                    close={close}
                />}
                {type === 'increaseQuantity' && <IncreaseQuantity
                    data={data}
                    close={close}
                />}
            </div>

            {type === 'logs' && <TableView data={data} />}
        </div >
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
            setValidationError('Please select updated Quantity');
            return false;
        }
        return true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleUpdatedQuantitySubmit = async () => {
        setValidationError('');

        if (!validateForm()) return;

        close();
        increaseQuantity({ ...fillUpData }, dispatch);
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
                    <h3 style={{ width: '50%' }}>{fillUpData.available}</h3>
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

const MoveToBooking = ({ data, close }) => {
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
        close();
        createBookingFromInventory({ ...fillUpData, party }, dispatch);
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
            cancelBooking({ bookingId: id, reason: vNum.vehicleNumber }, dispatch, setList)
        }


        // CALL API HERE
        // updateBooking({ id, status }, dispatch);
    };

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

                            {/* Action column */}
                            {item.status === 'Processing' && <td>
                                {<button style={{ background: 'red', border: 'none', color: 'white', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', marginRight: '0.5rem' }} title='Cancel' onClick={() => handleAction(item._id, "Cancelled")}>
                                    <RxCrossCircled />
                                </button>}
                                {item.vehicleNumber && <button style={{ background: 'green', border: 'none', color: 'white', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }} title='Ship' onClick={() => handleAction(item._id, "Shipped")}>
                                    <IoMdDoneAll />
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
        </section>
    );
};



export default InventoryOptions;