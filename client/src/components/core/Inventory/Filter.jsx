import React from 'react'
import style from './Inventory.module.css'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'

const Filter = ({ filterOptions, setFilterOptions }) => {
    const { cutters, thicknesses, widths, grades } = useSelector(state => state.varient);

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


    const handleCancel = () => {
        reset()
        setFilterOptions(false)
    }

    const onSubmit = (data) => {

    }


    return (
        <form onSubmit={handleSubmit(onSubmit)} className={style.filter} style={{ height: filterOptions ? '35rem' : 0 }}>
            <div>
                <label htmlFor='grade'>Type:</label>
                <select
                    id='type'
                    {...register('type', { required: 'Grade is required' })}
                >
                    <option value=''>Select type:</option>
                    <option value={'Hot Rolled'}> Hot Rolled </option>
                    <option value={'Cold Rolled'}> Cold Rolled </option>
                </select>
                {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
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
                <label htmlFor='grade'>Form Type:</label>
                <select
                    id='formType'
                    {...register('formType', { required: 'Form type is required' })}
                >
                    <option value=''>Select Form</option>
                    <option value={'sheet'}> Sheet </option>
                    <option value={'coil'}> Coit </option>
                </select>
                {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
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

export default Filter