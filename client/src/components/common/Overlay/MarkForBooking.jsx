import React, { useState } from 'react'
import style from './Overlayv2.module.css'
import { Controller, useForm } from 'react-hook-form';
import CreatableSelect from "react-select/creatable";
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const tableData = ({ name, value }) => {
    return <tr>
        <td style={{ fontWeight: 800 }}>{name}</td>
        <td>{value}</td>
    </tr>
}

const customStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: "2rem",
        height: "1rem",
        fontSize: "0.75rem",
        padding: "0 2px",
        borderRadius: '0.5rem'
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: "1rem",
        padding: "0 4px",
        fontSize: "0.75rem",
    }),
    input: (provided) => ({
        ...provided,
        margin: "0px",
        padding: "0px",
        fontSize: "0.75rem",
        borderRadius: '0.5rem',
        height: '16px'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: "2rem",
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
        fontSize: "0.75rem",
        padding: "4px 8px",
    }),
    menu: (provided) => ({
        ...provided,
        fontSize: "0.75rem",
    })
};

const MarkForBooking = ({ data = [], onAccept, close }) => {
    const [fillUpData, setFillUpData] = useState({
        quantity: 0,
        formType: '',
        party: '',
        shipTo: ''
    })


    const { control, getValues } = useForm(); // ✅ Added getValues

    const { parties } = useSelector(state => state.booking);

    const handleChange = (field, value) => {
        setFillUpData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     // ✅ Get current "party" field value
    //     const selectedParty = getValues("party");

    //     let party = null;

    //     if (selectedParty && typeof selectedParty.value === "string") {
    //         party = {};
    //         party['val'] = selectedParty.value;
    //         if (parties && !parties.some((p) => p._id === selectedParty.value)) {
    //             party['type'] = 'name';
    //         } else {
    //             party['type'] = 'id';
    //         }
    //     }

    //     // Validate all rows
    //     const validRows = rows.filter(
    //         (row) => row.formType && Number(row.quantity) > 0
    //     );

    //     if (party === null) {
    //         toast.error("Please enter the party details");
    //         return;
    //     }

    //     if (validRows.length === 0) {
    //         toast.error('Please fill all details.');
    //         return;
    //     }

    //     if (fillUpData.shipTo.length === 0) {
    //         toast.error("Please enter the Ship To");
    //         return;
    //     }

    //     try {
    //         const res = onAccept && onAccept(validRows, party, shipTo);
    //         if (res && typeof res.then === 'function') await res;
    //         close && close();
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

    const toOptions = (arr, labelField = "name", valueField = "_id") =>
        arr?.map((i) => ({
            label: i[labelField] || i.value,
            value: i[valueField] || i.label,
        })) || [];


    return (
        <form
            onSubmit={handleSubmit}
            className={style.MarkForBooking}
            onClick={(e) => e.stopPropagation()}
        >
            <table>
                <tbody>
                    {tableData({ name: 'ID', value: data[0].item_id })}
                    {tableData({ name: 'Date', value: data[0].date?.slice(0, 10) })}
                    {tableData({ name: 'Type', value: data[0].type })}
                    {tableData({ name: 'Thickness', value: data[0].thickness.name })}
                    {tableData({ name: 'Width', value: data[0].width.name })}
                    {tableData({ name: 'Grade', value: data[0].grade.name })}
                    {tableData({ name: 'Description', value: `${data[0]?.thickness?.name} X ${data[0]?.width?.name} X ${data[0]?.grade?.name}` })}
                    {tableData({ name: 'Available', value: data[0].quantity.toFixed(3) })}
                </tbody>
            </table>
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>Form</td>
                            <td><select
                                value={fillUpData.formType}
                                onChange={(e) =>
                                    handleChange('formType', e.target.value)
                                }
                            >
                                <option value="" disabled>
                                    Select
                                </option>
                                <option value="Sheet">Sheet</option>
                                <option value="Coil">Coil</option>
                            </select></td>
                        </tr>
                        <tr>
                            <td>Quantity</td>
                            <td><input type="number" step="0.001" min="0" max={data[0].quantity?.toFixed(3)} value={fillUpData.quantity || ''}
                                onChange={(e) =>
                                    handleChange('quantity', e.target.value)
                                }
                            /></td>
                        </tr>
                        <tr>
                            <td>Party</td>
                            <td><Controller
                                name="party"
                                control={control}
                                render={({ field }) => (
                                    <CreatableSelect
                                        {...field}
                                        options={toOptions(parties)}
                                        value={field.value}
                                        onChange={(option) => field.onChange(option)}
                                        placeholder="Party"
                                        styles={customStyles}
                                        isSearchable
                                        isClearable
                                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                    />
                                )}
                            /></td>
                        </tr>
                        <tr>
                            <td>Ship To</td>
                            <td><input type='text' value={fillUpData} onChange={(e) => handleChange('shipTo', e.target.value)} placeholder='Ship To' style={{ height: '2rem', borderRadius: '0.5rem' }} /></td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    <button onClick={close} className='btn error'>Close</button>
                    <button className='btn success'>Mark for Booking</button>
                </div>
            </div>
        </form>
    );
};

export default MarkForBooking;
