import React, { useEffect, useState } from 'react'
import style from './Overlay.module.css'
import { Controller, useForm } from 'react-hook-form';
import CreatableSelect from "react-select/creatable";
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const CreateAndConfirmationOverlay = ({ data, onAccept, close }) => {
    const [form, setForm] = useState({
        formType: '',
        quantity: ''
    }
    );

    const { control, getValues } = useForm(); // ✅ Added getValues

    const { parties } = useSelector(state => state.booking);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        console.log(form)
    }, [form])

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Get current "party" field value
        const selectedParty = getValues("party");

        let party = null;

        if (selectedParty && typeof selectedParty.value === "string") {
            party = {};
            party['val'] = selectedParty.value;
            if (parties && !parties.some((p) => p._id === selectedParty.value)) {
                party['type'] = 'name';
            } else {
                party['type'] = 'id';
            }
        }

        // Validate all rows
        const validRows = form.formType && Number(form.quantity) > 0;

        if (party === null) {
            toast.error("Please enter the party details");
            return;
        }

        if (validRows.length === 0) {
            toast.error('Please fill all details.');
            return;
        }

        try {
            const res = onAccept && onAccept(validRows, party);
            if (res && typeof res.then === 'function') await res;
            close && close();
        } catch (err) {
            console.error(err);
        }
    };

    const toOptions = (arr, labelField = "name", valueField = "_id") =>
        arr?.map((i) => ({
            label: i[labelField] || i.value,
            value: i[valueField] || i.label,
        })) || [];

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

    return (
        <form
            onSubmit={handleSubmit}
            className={style.OrderConfirmationOverlay}
            onClick={(e) => e.stopPropagation()}
        >
            <div>
                <Controller
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
                />
            </div>

            <div className={style.FullWidth} style={{ width: '100%' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Wagon</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Form</th>
                            <th>Available</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.wagonNumber || 'N/A'}</td>
                            <td>{data.type.label}</td>
                            <td>{`${data.thickness?.label} X ${data.width?.label} X ${data.grade?.label}`}</td>
                            <td>
                                <select
                                    value={form.formType}
                                    onChange={(e) =>
                                        handleChange('formType', e.target.value)
                                    }
                                >
                                    <option value="" disabled>
                                        Select
                                    </option>
                                    <option value="Sheet">Sheet</option>
                                    <option value="Coil">Coil</option>
                                </select>
                            </td>
                            <td>{data.quantity}</td>
                            <td>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    max={data.quantity}
                                    value={form.quantity || ''}
                                    onChange={(e) =>
                                        handleChange('quantity', e.target.value)
                                    }
                                />
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="6">
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={close}>
                                        Close
                                    </button>
                                    <button type="submit">Confirm Booking</button>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </form>
    );
};

export default CreateAndConfirmationOverlay;
