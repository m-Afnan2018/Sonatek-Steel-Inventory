import React from "react";
import style from "./Inventory.module.css";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { addItem } from "services/operations/itemAPI";

const AddForm = () => {
    const { thicknesses, grades, widths } = useSelector((state) => state.varient);
    const dispatch = useDispatch();

    const { register, handleSubmit, control, setFocus } = useForm({
        defaultValues: {
            wagonNumber: "",
            type: null,
            thickness: null,
            width: null,
            grade: null,
            quantity: "",
        },
    });

    const onSubmit = (data) => {
        const formattedData = {
            type: data.type?.value,
            grade: data.grade?.value,
            width: data.width?.value,
            thickness: data.thickness?.value,
            quantity: data.quantity,
            wagonNumber: data.wagonNumber,
        };

        addItem(formattedData, dispatch);
        setFocus("wagonNumber");
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

    const handleSelectEnter = (e, nextField) => {
        if (e.key === "Enter" && nextField) {
            e.preventDefault();
            setTimeout(() => setFocus(nextField), 100); // allow select to close first
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={style.AddForm}>
            <table className={style.table}>
                <thead>
                    <tr>
                        <th>Wagon Number</th>
                        <th>Type</th>
                        <th>Thickness</th>
                        <th>Width</th>
                        <th>Grade</th>
                        <th>Quantity</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {/* Wagon Number */}
                        <td>
                            <input
                                type="text"
                                {...register("wagonNumber")}
                                onKeyDown={(e) => handleKeyDown(e, "type")}
                                placeholder="Enter wagon"
                            />
                        </td>

                        {/* Type */}
                        <td>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={[
                                            { label: "Hot Rolled", value: "Hot Rolled" },
                                            { label: "Cold Rolled", value: "Cold Rolled" },
                                        ]}
                                        value={field.value}
                                        onChange={(option) => field.onChange(option)}
                                        onKeyDown={(e) => handleSelectEnter(e, "thickness")}
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
                                        onKeyDown={(e) => handleSelectEnter(e, "width")}
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
                                        onKeyDown={(e) => handleSelectEnter(e, "grade")}
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
                                        onKeyDown={(e) => handleSelectEnter(e, "quantity")}
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
                                onKeyDown={(e) => handleKeyDown(e, null)}
                                placeholder="Enter qty"
                                step={'any'}
                            />
                        </td>

                        <td>
                            <button type="submit">Add</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    );
};

export default AddForm;
