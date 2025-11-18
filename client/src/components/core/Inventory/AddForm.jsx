import React from "react";
import style from "./Inventory.module.css";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { addItem } from "services/operations/itemAPI";
import { FaCirclePlus } from "react-icons/fa6";

const AddForm = ({ setShowUpcoming }) => {
    const { thicknesses, grades, widths, warehouses } = useSelector((state) => state.varient);
    const dispatch = useDispatch();

    const { register, handleSubmit, control, setFocus } = useForm({
        defaultValues: {
            type: null,
            thickness: null,
            width: null,
            grade: null,
            quantity: "",
        },
    });

    const onSubmit = (data) => {
        setShowUpcoming(true);
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
    };

    const toOptions = (arr, labelField = "name", valueField = "_id") =>
        arr?.map((i) => ({
            label: i[labelField] || i.value,
            value: i[valueField] || i.label,
        })) || [];

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

    // const customStyles = {
    //     control: (provided) => ({
    //         ...provided,
    //         minHeight: "18px",        // remove large default height
    //         height: "auto",           // set exact height
    //         cursor: "pointer",
    //         border: '1px solid grey',
    //         borderRadius: '2rem'
    //     }),
    //     valueContainer: (provided) => ({
    //         ...provided,
    //         fontWeight: '400',
    //         height: "36px",
    //         padding: "0 6px",
    //     }),
    //     indicatorsContainer: (provided) => ({
    //         ...provided,
    //         height: "36px",
    //     }),
    //     dropdownIndicator: (provided) => ({
    //         ...provided,
    //         padding: "2px",           // reduce padding around icon
    //         transform: "scale(0.7)",  // shrink arrow icon
    //     }),
    //     indicatorSeparator: () => ({
    //         display: "none",          // optional: remove | separator
    //     }),
    //     option: (styles, { isFocused, isSelected }) => ({
    //         ...styles,
    //         zIndex: 1,
    //     }),
    //     menu: base => ({
    //         ...base,
    //         zIndex: 1000,
    //         position: 'absolute'
    //     }),
    //     container: (provided) => ({
    //         ...provided,
    //         position: 'relative'
    //     }),
    //     placeholder: (provided) => ({
    //         ...provided,
    //     })
    // };

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
                            options={toOptions(thicknesses)}
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
                            options={toOptions(widths)}
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
                            options={toOptions(grades)}
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
            <div style={{ width: '6rem' }}>
                <input
                    style={{ width: '100%', height: '2rem' }}
                    type="number"
                    {...register("quantity")}
                    onKeyDown={(e) => handleKeyDown(e, 'grade', "warehouse")}
                    placeholder="Quantity"
                    step={'any'}
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
                <button type="submit"><FaCirclePlus /></button>
            </div>

        </form>
    );
};

export default AddForm;
