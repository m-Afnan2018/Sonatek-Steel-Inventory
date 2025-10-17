import React, { useState } from "react";
import style from "./Inventory.module.css";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { addItem } from "services/operations/itemAPI";
import { FaPlus } from "react-icons/fa6";

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

    // prepare option arrays once so we can reference them in handlers
    const typeOptions = [
        { label: "Hot Rolled", value: "Hot Rolled" },
        { label: "Cold Rolled", value: "Cold Rolled" },
    ];

    const onSubmit = (data) => {
        const formattedData = {
            type: data.type?.value,
            grade: data.grade?.value,
            width: data.width?.value,
            thickness: data.thickness?.value,
            quantity: data.quantity,
        };

        addItem(formattedData, dispatch);
        setCurrentData((prev) => [...prev, { ...formattedData, thickness: data.thickness?.label, width: data.width?.label, grade: data.grade?.label }]);
        setFocus("type");
    };

    const toOptions = (arr, labelField = "name", valueField = "_id") =>
        arr?.map((i) => ({
            label: i[labelField] || i.value,
            value: i[valueField] || i.label,
        })) || [];

    const handleKeyDown = (e, nextField) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (nextField) setFocus(nextField);
        }
    };

    // const handleSelectEnter = (e, nextField) => {
    //     if (e.key === "Enter" && nextField) {
    //         e.preventDefault();
    //         setTimeout(() => setFocus(nextField), 100); // allow select to close first
    //     }
    // }

    const handleSelectEnter = (e, field, options = [], nextField = null) => {
        if (e.key === "Enter") {
            if (nextField) {
                // slight delay to allow select internal state to settle
                setTimeout(() => setFocus(nextField), 80);
            }
        }
    };

    const [currentData, setCurrentData] = useState([]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={style.AddForm}>
            <table className={style.table}>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Thickness</th>
                        <th>Width</th>
                        <th>Grade</th>
                        <th>Quantity</th>
                        <th>Cutter</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        currentData && currentData.length > 0 && currentData.map((data, index) => (
                            <tr key={index}>
                                <td>{data.type}</td>
                                <td>{data.thickness}</td>
                                <td>{data.width}</td>
                                <td>{data.grade}</td>
                                <td>{data.quantity}</td>
                                <td>{data.shipTo}</td>
                            </tr>
                        ))
                    }
                    <tr>
                        {/* Type */}
                        <td>
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
                                    />
                                )}
                            />
                        </td>

                        {/* Thickness */}
                        <td>
                            <Controller
                                name="thickness"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={toOptions(thicknesses)}
                                        value={field.value}
                                        onChange={(option) => field.onChange(option)}
                                        onKeyDown={(e) => handleSelectEnter(e, field, thicknesses, "width")}
                                        placeholder="Select Thickness"
                                        isSearchable
                                    />
                                )}
                            />
                        </td>

                        {/* Width */}
                        <td>
                            <Controller
                                name="width"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={toOptions(widths)}
                                        value={field.value}
                                        onChange={(option) => field.onChange(option)}
                                        onKeyDown={(e) => handleSelectEnter(e, field, widths, "grade")}
                                        placeholder="Select Width"
                                        isSearchable
                                    />
                                )}
                            />
                        </td>

                        {/* Grade */}
                        <td>
                            <Controller
                                name="grade"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={toOptions(grades)}
                                        value={field.value}
                                        onChange={(option) => field.onChange(option)}
                                        onKeyDown={(e) => handleSelectEnter(e, field, grades, "quantity")}
                                        placeholder="Select Grade"
                                        isSearchable
                                    />
                                )}
                            />
                        </td>

                        {/* Quantity */}
                        <td>
                            <input
                                type="number"
                                {...register("quantity")}
                                onKeyDown={(e) => handleKeyDown(e, 'cutter')}
                                placeholder="Enter qty"
                                step={'any'}
                            />
                        </td>

                        {/* Cutters */}
                        <td>
                            <Controller
                                name="cutter"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={toOptions(cutters)}
                                        value={field.value}
                                        onChange={(option) => field.onChange(option)}
                                        onKeyDown={(e) => handleSelectEnter(e, field, cutters, null)}
                                        placeholder="Select Cutter"
                                        isSearchable
                                    />
                                )}
                            />
                        </td>

                        <td>
                            <button type="submit"><FaPlus /></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    );
};

export default AddForm;
