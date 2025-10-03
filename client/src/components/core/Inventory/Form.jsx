import React from 'react'
import { useForm } from 'react-hook-form'
import style from './Inventory.module.css'
import { useSelector } from 'react-redux'
import { addItem } from 'services/operations/itemAPI'

const Form = ({ setShowForm, showForm }) => {
    const { grades, widths, thicknesses, cutters } = useSelector(state => state.varient)

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            type: '',
            grade: '',
            formType: '',
            width: '',
            thickness: '',
            weight: '',
            wagonNumber: '',
            challanNumber: '',
            challanDate: '',
            quantity: '',
            shipTo: '',
        }
    })

    const onSubmit = (data) => {
        // Transform data to match your API structure
        const formattedData = {
            type: data.type,
            grade: data.grade,
            formType: data.formType,
            width: data.width,
            thickness: data.thickness,
            weight: parseFloat(data.weight),
            wagonNumber: data.wagonNumber,
            challan: {
                challanDate: data.challanDate,
                challanNumber: data.challanNumber,
            },
            quantity: parseInt(data.quantity),
            shipTo: data.shipTo,
        }

        addItem(formattedData)
        reset()
        setShowForm(false)
    }

    const handleCancel = () => {
        reset()
        setShowForm(false)
    }

    return (
        <form className={style.formBlock} style={{ height: showForm ? '44rem' : '0' }} onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Type: </label>
                <div className={style.radioGroup}>
                    <label className={style.radioButton}>
                        <input
                            type='radio'
                            value='Hot Rolled'
                            {...register('type', { required: 'Type is required' })}
                        />
                        <span className={style.radioLabel}>Hot Rolled</span>
                    </label>
                    <label className={style.radioButton}>
                        <input
                            type='radio'
                            value='Cold Rolled'
                            {...register('type', { required: 'Type is required' })}
                        />
                        <span className={style.radioLabel}>Cold Rolled</span>
                    </label>
                </div>
                {errors.type && <span className={style.error}>{errors.type.message}</span>}
            </div>

            <div>
                <label htmlFor='grade'>Grade:</label>
                <select
                    id='grade'
                    {...register('grade', { required: 'Grade is required' })}
                >
                    <option value=''>Select grade</option>
                    {grades && grades.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                            {grade.name}
                        </option>
                    ))}
                </select>
                {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
            </div>

            <div>
                <label>Form Type:</label>
                <div className={style.radioGroup}>
                    <label className={style.radioButton}>
                        <input
                            type='radio'
                            value='Sheet'
                            {...register('formType', { required: 'Form Type is required' })}
                        />
                        <span className={style.radioLabel}>Sheet</span>
                    </label>
                    <label className={style.radioButton}>
                        <input
                            type='radio'
                            value='Coil'
                            {...register('formType', { required: 'Form Type is required' })}
                        />
                        <span className={style.radioLabel}>Coil</span>
                    </label>
                </div>
                {errors.type && <span className={style.error}>{errors.type.message}</span>}
            </div>

            <div>
                <label htmlFor='width'>Width: </label>
                <select
                    id='width'
                    {...register('width', { required: 'Width is required' })}
                >
                    <option value=''>Select width</option>
                    {widths && widths.map((width) => (
                        <option key={width._id} value={width._id}>
                            {width.value || width.name}
                        </option>
                    ))}
                </select>
                {errors.width && <span className={style.error}>{errors.width.message}</span>}
            </div>

            <div>
                <label htmlFor='thickness'>Thickness: </label>
                <select
                    id='thickness'
                    {...register('thickness', { required: 'Thickness is required' })}
                >
                    <option value=''>Select thickness</option>
                    {thicknesses && thicknesses.map((thickness) => (
                        <option key={thickness._id} value={thickness._id}>
                            {thickness.value || thickness.name}
                        </option>
                    ))}
                </select>
                {errors.thickness && <span className={style.error}>{errors.thickness.message}</span>}
            </div>

            <div>
                <label htmlFor='weight'>Weight:</label>
                <input
                    id='weight'
                    type='number'
                    step='0.01'
                    placeholder='Enter weight'
                    {...register('weight', {
                        required: 'Weight is required',
                        min: { value: 0, message: 'Weight must be positive' }
                    })}
                />
                {errors.weight && <span className={style.error}>{errors.weight.message}</span>}
            </div>

            <div>
                <label htmlFor='wagonNumber'>Wagon Number:</label>
                <input
                    id='wagonNumber'
                    type='text'
                    placeholder='Enter wagon number'
                    {...register('wagonNumber', { required: 'Wagon number is required' })}
                />
                {errors.wagonNumber && <span className={style.error}>{errors.wagonNumber.message}</span>}
            </div>

            <div className={style.twoInOne}>
                <div>
                    <label htmlFor='challanNumber'>Challan Number</label>
                    <input
                        id='challanNumber'
                        type='text'
                        placeholder='Enter challan number'
                        {...register('challanNumber', { required: 'Challan number is required' })}
                    />
                    {errors.challanNumber && <span className={style.error}>{errors.challanNumber.message}</span>}
                </div>
                <div>
                    <label htmlFor='challanDate'>Challan Date</label>
                    <input
                        id='challanDate'
                        type='date'
                        {...register('challanDate', { required: 'Challan date is required' })}
                    />
                    {errors.challanDate && <span className={style.error}>{errors.challanDate.message}</span>}
                </div>
            </div>

            <div>
                <label htmlFor='quantity'>Quantity</label>
                <input
                    id='quantity'
                    type='number'
                    placeholder='Enter quantity'
                    {...register('quantity', {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                />
                {errors.quantity && <span className={style.error}>{errors.quantity.message}</span>}
            </div>

            <div>
                <label htmlFor='shipTo'>Ship To:</label>
                <select
                    id='shipTo'
                    {...register('shipTo', { required: 'Ship To is required' })}
                >
                    <option value=''>Select cutter</option>
                    {cutters && cutters.map((cutter) => (
                        <option key={cutter._id} value={cutter._id}>
                            {cutter.name}
                        </option>
                    ))}
                </select>
                {errors.shipTo && <span className={style.error}>{errors.shipTo.message}</span>}
            </div>

            <div className={style.buttonGroup}>
                <button type='submit'>Add New Item</button>
                <button type='button' onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    )
}

export default Form