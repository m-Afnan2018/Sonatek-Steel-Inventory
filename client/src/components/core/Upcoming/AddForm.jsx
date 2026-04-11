import React, { useState } from "react";
import { useActiveTheme } from "hooks/useActiveTheme";
import style from "./Upcoming.module.css";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { addItem } from "services/operations/itemAPI";
import toast from "react-hot-toast";
import { useOverlay } from "hooks/useOverlay";
import { bookingItems } from "services/operations/bookingAPI";
import CreateAndConfirmationOverlay from "components/common/Overlay/CreateAndConfirmationOverlay";

const AddForm = () => {
    const { thicknesses, grades, widths, warehouses } = useSelector((state) => state.varient);
    const dispatch = useDispatch();

    const [type] = useState('Cold Rolled');
    useActiveTheme(); // re-renders this component when dark/light theme toggles

    const { showOverlay } = useOverlay()

    const { register, handleSubmit, control, setFocus, watch, setValue } = useForm({
        defaultValues: {
            type: 'Cold Rolled',
            thickness: null,
            width: null,
            grade: null,
            quantity: "",
        },
    });

    const onSubmit = (data, e) => {
        // Basic validation
        if (!data.thickness?.value) return toast.error("Please select thickness");
        if (!data.width?.value) return toast.error("Please select a width");
        if (!data.grade?.value) return toast.error("Please select a grade");
        if (!data.quantity || data.quantity <= 0) return toast.error("Invalid quantity");

        const button = e?.nativeEvent?.submitter; // safely access submitter

        if (button && button.innerText === 'Book') {
            onBookinging(data);
            return;
        }

        const formattedData = {
            type: grades.find(g => g._id === data.grade.value).type || 'Cold Rolled',
            grade: data.grade?.value,
            width: data.width?.value,
            thickness: data.thickness?.value,
            quantity: data.quantity,
            warehouse: data.warehouse?.value || null,
            date: data.date
        };

        addItem(formattedData, dispatch);
        // setCurrentData((prev) => [...prev, { ...formattedData, thickness: data.thickness?.label, width: data.width?.label, grade: data.grade?.label, warehouse: data.warehouse?.label || null }]);
        setFocus("type");
        setValue("quantity", "");
    };

    const toOptions = (arr, labelField = "name", valueField = "_id") => {
        console.log(arr)
        return arr?.map((i) => ({
            label: i[labelField] || i.value,
            value: i[valueField] || i.label,
        })) || [];
    }

    const typeOption = [
        {
            label: 'CR',
            value: 'Cold Rolled'
        }
    ]

    const handleKeyDown = (e, prevField, nextField) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (nextField) setFocus(nextField);
        }
        if (e.key === 'ArrowLeft' && prevField) {
            setFocus(prevField)
        }
        if (e.key === 'ArrowRight' && nextField) {
            setFocus(nextField)
        }
        console.log(e.key)
    };

    const handleSelectEnter = (e, field, options = [], prevField = null, nextField = null) => {
        if (e.key === "Enter") {
            if (nextField) {
                // slight delay to allow select internal state to settle
                setTimeout(() => setFocus(nextField), 80);
            }
        }
        if (e.key === 'ArrowLeft' && prevField) {
            e.preventDefault();
            setFocus(prevField)
        }
        if (e.key === 'ArrowRight' && nextField) {
            e.preventDefault();
            setFocus(nextField)
        }
    };

    // Reads live CSS variables so the dropdown adapts to dark / light theme automatically
    const getCSSVar = (name) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: "2rem",
            height: "1rem",
            fontSize: "0.75rem",
            padding: "0 2px",
            borderRadius: '0.5rem',
            backgroundColor: getCSSVar('--bg-elevated'),
            borderColor: state.isFocused ? getCSSVar('--accent') : getCSSVar('--border'),
            boxShadow: state.isFocused ? `0 0 0 2px ${getCSSVar('--accent-border')}` : 'none',
            '&:hover': { borderColor: getCSSVar('--border-strong') },
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: "1rem",
            padding: "0 4px",
            fontSize: "0.75rem",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: getCSSVar('--text-primary'),
            fontSize: "0.75rem",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: getCSSVar('--text-muted'),
            fontSize: "0.75rem",
        }),
        input: (provided) => ({
            ...provided,
            margin: "0px",
            padding: "0px",
            fontSize: "0.75rem",
            borderRadius: '0.5rem',
            height: '16px',
            color: getCSSVar('--text-primary'),
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: "2rem",
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: "2px",
            color: getCSSVar('--text-muted'),
        }),
        clearIndicator: (provided) => ({
            ...provided,
            padding: "2px",
            color: getCSSVar('--text-muted'),
        }),
        menu: (provided) => ({
            ...provided,
            fontSize: "0.75rem",
            backgroundColor: getCSSVar('--bg-elevated'),
            border: `1px solid ${getCSSVar('--border')}`,
            boxShadow: getCSSVar('--shadow-md'),
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '2px 0',
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: "0.75rem",
            padding: "4px 8px",
            backgroundColor: state.isSelected
                ? getCSSVar('--accent')
                : state.isFocused
                    ? getCSSVar('--bg-hover')
                    : 'transparent',
            color: state.isSelected
                ? '#ffffff'
                : getCSSVar('--text-primary'),
            cursor: 'pointer',
        }),
    };



    const onBookinging = (data) => {
        let mini = 0;
        let maxi = 0;
        mini = maxi - mini;
        showOverlay(CreateAndConfirmationOverlay, {
            range: { min: mini.toFixed(3), max: maxi.toFixed(3) },
            data: data,
            onAccept: (data, party) => {
                bookingItems({ items: data, party }, dispatch, () => { console.log("Compelted") })
            }
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={style.AddForm} onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(onSubmit)();
            }
        }}>
            {/* Date */}
            <div style={{ width: '8rem' }}>
                <input
                    style={{ width: '100%', height: '2rem' }}
                    type="date"
                    {...register("date")}
                    onKeyDown={(e) => handleKeyDown(e, null, 'thickness')}
                />
            </div>



            {/* Thickness */}
            <div>
                <Controller
                    name="thickness"
                    control={control}
                    render={({ field }) => (
                        <Select
                            classNames={{
                                control: (state) =>
                                    state.isFocused ? style.test : style.test,

                            }}
                            {...field}
                            options={toOptions(thicknesses?.filter(t => t.type === type || t.type === 'Both'))}
                            value={field.value}
                            onChange={(option) => field.onChange(option)}
                            onKeyDown={(e) => handleSelectEnter(e, field, thicknesses, 'date', "width")}
                            placeholder="Thickness"
                            styles={customStyles}
                            isSearchable
                        />
                    )}
                />
            </div>

            {/* Width */}
            <div >
                <Controller
                    name="width"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={toOptions(widths?.filter(w => w.type === type || w.type === 'Both'))}
                            value={field.value}
                            onChange={(option) => field.onChange(option)}
                            onKeyDown={(e) => handleSelectEnter(e, field, widths, "thickness", "grade")}
                            placeholder="Width"
                            styles={customStyles}
                            isSearchable
                        />
                    )}
                />
            </div>

            {/* Grade */}
            <div>
                <Controller
                    name="grade"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={toOptions(grades?.filter(g => g.type === type || g.type === 'Both'))}
                            value={field.value}
                            onChange={(option) => field.onChange(option)}
                            onKeyDown={(e) => handleSelectEnter(e, field, grades, "width", "quantity")}
                            placeholder="Grade"
                            styles={customStyles}
                            isSearchable
                        />
                    )}
                />
            </div>

            {/* Quantity */}
            <div style={{ width: '6.2rem' }}>
                <input
                    style={{ width: '100%', height: '2rem', padding: '1rem' }}
                    type="text"
                    inputMode="numeric"
                    value={watch('quantity') || ''}
                    onChange={(e) => {
                        // Strip everything except digits
                        const digits = e.target.value.replace(/[^0-9]/g, '');
                        if (digits === '') {
                            setValue('quantity', '');
                            return;
                        }
                        // Pad to at least 4 digits so we always have X.XXX
                        const padded = digits.padStart(4, '0');
                        const intPart = padded.slice(0, padded.length - 3).replace(/^0+(?=\d)/, '') || '0';
                        const decPart = padded.slice(-3);
                        setValue('quantity', `${intPart}.${decPart}`);
                    }}
                    onKeyDown={(e) => {
                        // Allow: backspace, delete, tab, escape, arrow keys
                        const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'];
                        if (allowed.includes(e.key)) {
                            if (e.key === 'Backspace' || e.key === 'Delete') {
                                // Remove last digit from raw digits
                                const current = watch('quantity') || '';
                                const digits = current.replace(/[^0-9]/g, '');
                                const newDigits = digits.slice(0, -1);
                                if (newDigits === '') {
                                    setValue('quantity', '');
                                } else {
                                    const padded = newDigits.padStart(4, '0');
                                    const intPart = padded.slice(0, padded.length - 3).replace(/^0+(?=\d)/, '') || '0';
                                    const decPart = padded.slice(-3);
                                    setValue('quantity', `${intPart}.${decPart}`);
                                }
                                e.preventDefault();
                                return;
                            }
                            handleKeyDown(e, 'grade', 'warehouse');
                            return;
                        }
                        // Block non-digit keys
                        if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                        }
                    }}
                    placeholder="Quantity"

                />
            </div>

            {/* Warehouses */}
            <div>
                <Controller
                    name="warehouse"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={[{ label: 'NULL', value: null }, ...(toOptions(warehouses))]}
                            value={field.value}
                            onChange={(option) => field.onChange(option)}
                            onKeyDown={(e) => handleSelectEnter(e, field, warehouses, "quantity", null)}
                            placeholder="Warehouse"
                            styles={customStyles}
                            isSearchable
                        />
                    )}
                />
            </div>

            <div>
                <button type="submit">Add</button>
            </div>
            {/* <div>
                <button type="submit">Book</button>
            </div> */}

        </form>
    );
};

export default AddForm;
