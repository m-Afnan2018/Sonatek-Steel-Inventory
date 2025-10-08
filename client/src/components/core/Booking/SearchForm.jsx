import React, { useState } from 'react';
import style from './Booking.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { searchOptions } from 'services/operations/bookingAPI';
import { setRequirement } from 'slices/bookingSlice';

const SearchForm = () => {
    const [showForm, setShowForm] = useState(false);
    const { grades, thicknesses, widths } = useSelector((state) => state.varient);
    const dispatch = useDispatch();
    // const [showField, setShowIeld] = useState(null);

    // useEffect(()=>{
    //     if(showField === null){
    //         setShowForm(false);
    //     }
    // }, [showField])

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            quantity: '',
            type: '',
            formType: '',
            grade: '',
            thickness: '',
            width: '',
        },
    });

    const onSubmit = (data) => {
        dispatch(setRequirement(data.quantity));
        searchOptions(data, dispatch);
        setShowForm(false);
        // 🧠 You can now trigger search or dispatch action here
    };

    return (
        <div className={style.SearchForm}>
            {/* Toggle button */}
            <div style={{ height: showForm ? '0rem' : '100%' }}>
                <button onClick={() => setShowForm(true)}>Create new Booking</button>
            </div>

            {/* Form */}
            <form
                style={{ height: showForm ? '38rem' : '0' }}
                onSubmit={handleSubmit(onSubmit)}
            >
                <h3>Search for Booking</h3>

                {/* Quantity */}
                <div>
                    <label>Quantity:</label>
                    <input
                        type="number"
                        placeholder="Enter the quantity"
                        {...register('quantity', {
                            required: 'Quantity is required',
                            min: { value: 1, message: 'Quantity must be at least 1' },
                        })}
                    />
                    {errors.quantity && (
                        <span className={style.error}>{errors.quantity.message}</span>
                    )}
                </div>

                {/* Type */}
                <div>
                    <label>Type:</label>
                    <select
                        {...register('type', {
                            required: 'Type is required',
                        })}
                    >
                        <option value="">Select Type</option>
                        <option value="Hot Rolled">Hot Rolled</option>
                        <option value="Cold Rolled">Cold Rolled</option>
                    </select>
                    {errors.type && (
                        <span className={style.error}>{errors.type.message}</span>
                    )}
                </div>

                {/* Form Type */}
                <div>
                    <label>Form Type:</label>
                    <select
                        {...register('formType', {
                            required: 'Form Type is required',
                        })}
                    >
                        <option value="">Select Form Type</option>
                        <option value="Coil">Coil</option>
                        <option value="Sheet">Sheet</option>
                    </select>
                    {errors.formType && (
                        <span className={style.error}>{errors.formType.message}</span>
                    )}
                </div>

                {/* Grade */}
                <div>
                    <label>Grade:</label>
                    <select
                        {...register('grade', {
                            required: 'Grade is required',
                        })}
                    >
                        <option value="">Select Grade</option>
                        {grades?.map((grade) => (
                            <option key={grade._id} value={grade._id}>
                                {grade.name}
                            </option>
                        ))}
                    </select>
                    {errors.grade && (
                        <span className={style.error}>{errors.grade.message}</span>
                    )}
                </div>

                {/* Thickness */}
                <div>
                    <label>Thickness:</label>
                    <select
                        {...register('thickness', {
                            required: 'Thickness is required',
                        })}
                    >
                        <option value="">Select Thickness</option>
                        {thicknesses?.map((thickness) => (
                            <option key={thickness._id} value={thickness._id}>
                                {thickness.name}
                            </option>
                        ))}
                    </select>
                    {errors.thickness && (
                        <span className={style.error}>{errors.thickness.message}</span>
                    )}
                </div>

                {/* Width */}
                <div>
                    <label>Width:</label>
                    <select
                        {...register('width', {
                            required: 'Width is required',
                        })}
                    >
                        <option value="">Select Width</option>
                        {widths?.map((width) => (
                            <option key={width._id} value={width._id}>
                                {width.name}
                            </option>
                        ))}
                    </select>
                    {errors.width && (
                        <span className={style.error}>{errors.width.message}</span>
                    )}
                </div>

                {/* Buttons */}
                <div>
                    <button type="submit">Search</button>
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            setShowForm(false);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SearchForm;
