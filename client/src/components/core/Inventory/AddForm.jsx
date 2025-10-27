import React from "react";
import style from "./Inventory.module.css";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { addItem } from "services/operations/itemAPI";

const AddForm = () => {
    const { thicknesses, grades, widths, cutters } = useSelector((state) => state.varient);
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
        const formattedData = {
            type: grades.find(g => g._id === data.grade.value).type || 'Cold Rolled',
            grade: data.grade?.value,
            width: data.width?.value,
            thickness: data.thickness?.value,
            quantity: data.quantity,
            shipTo: data.cutter?.value || null,
        };

        addItem(formattedData, dispatch);
        // setCurrentData((prev) => [...prev, { ...formattedData, thickness: data.thickness?.label, width: data.width?.label, grade: data.grade?.label, shipTo: data.cutter?.label || null }]);
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

    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: "18px",        // remove large default height
            height: "auto",           // set exact height
            cursor: "pointer",
        }),
        valueContainer: (provided) => ({
            ...provided,
            fontWeight: '900',
            height: "36px",
            padding: "0 6px",
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: "36px",
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: "2px",           // reduce padding around icon
            transform: "scale(0.7)",  // shrink arrow icon
        }),
        indicatorSeparator: () => ({
            display: "none",          // optional: remove | separator
        }),
        option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            zIndex: 1,
        }),
        menu: base => ({
            ...base,
            zIndex: 1000,
            position: 'absolute'
        }),
        container: (provided) => ({
            ...provided,
            position: 'relative'
        })
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={style.AddForm} onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(onSubmit)();
            }
        }}>

            {/* Type */}
            {/* <div>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={typeOptions}
                            value={field.value}
                            onChange={(option) => field.onChange(option)}
                            onKeyDown={(e) => handleSelectEnter(e, field, typeOptions, "thickness")}
                            placeholder="Select Type"
                            isSearchable
                            // components={{ DropdownIndicator: SmallDropdownIndicator }}
                            styles={customStyles}
                            menuIsOpen={true}
                        />
                    )}
                />
            </div> */}

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
                            onKeyDown={(e) => handleSelectEnter(e, field, thicknesses, null, "width")}
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
            <div>
                <input
                    style={{ width: '100%' }}
                    type="number"
                    {...register("quantity")}
                    onKeyDown={(e) => handleKeyDown(e, 'grade', "cutter")}
                    placeholder="Quantity"
                    step={'any'}
                />
            </div>

            {/* Cutters */}
            <div>
                <Controller
                    name="cutter"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={[{ label: 'NULL', value: null }, ...(toOptions(cutters))]}
                            value={field.value}
                            onChange={(option) => field.onChange(option)}
                            onKeyDown={(e) => handleSelectEnter(e, field, cutters, "quantity", null)}
                            placeholder="Cutter"
                            styles={customStyles}
                            isSearchable
                        />
                    )}
                />
            </div>

            <div>
                <button type="submit">Add</button>
            </div>

        </form>
    );
};

export default AddForm;
