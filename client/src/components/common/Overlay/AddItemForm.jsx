import React, { useEffect, useState } from 'react'
import style from './Overlay.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { setSelectUpdate } from 'slices/itemSlice';
import { addItem, updateItem } from 'services/operations/itemAPI';

const AddItemForm = ({ close }) => {
    const { grades, widths, thicknesses, cutters } = useSelector(state => state.varient)
    const { selectUpdate } = useSelector(state => state.item);
    // const [wagonNumber, setWagonNumber] = useState('');
    // const [editWagonNumber, setEditWagonNumber] = useState('');
    const [added, setAdded] = useState([]);
    const [update, setUpdate] = useState(null);
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            type: '',
            grade: '',
            formType: '',
            width: '',
            thickness: '',
            wagonNumber: '',
            challanNumber: '',
            challanDate: '',
            quantity: '',
            shipTo: '',
        }
    })

    useEffect(() => {
        if (selectUpdate) {
            // setWagonNumber(selectUpdate.wagonNumber)
            reset({
                type: selectUpdate.type,
                grade: selectUpdate.grade._id,
                formType: selectUpdate.formType,
                width: selectUpdate.width._id,
                thickness: selectUpdate.thickness._id,
                challanNumber: selectUpdate.challan.challanNumber,
                challanDate: new Date(selectUpdate.challan.challanDate).toISOString().split('T')[0],
                quantity: selectUpdate.quantity,
                shipTo: selectUpdate.shipTo._id,
            })
            setUpdate(selectUpdate._id);
            dispatch(setSelectUpdate(null));
        }
    }, [dispatch, reset, selectUpdate])

    const onSubmit = (data) => {
        // if (wagonNumber.trim() === '') {
        //     setError('wagonNumber', { type: 'manual', message: 'Wagon Number is required' });
        //     setEditWagonNumber(true);
        //     document.querySelector(`.${style.formBlock} > div:nth-child(1)`).scrollIntoViewIfNeeded({ behavior: 'smooth' });
        //     return;
        // }
        // Transform data to match your API structure
        const formattedData = {
            type: data.type,
            grade: data.grade,
            width: data.width,
            thickness: data.thickness,
            quantity: data.quantity,
            shipTo: data.shipTo,
        }

        if (update) {
            updateItem({ ...formattedData, _id: update }, dispatch);
            close();
        } else {
            addItem(formattedData, dispatch);
        }
        setAdded((prev) => [...prev, `${thicknesses.filter(t => t._id === data.thickness)[0].name} X ${widths.filter(t => t._id === data.width)[0].name} X ${grades.filter(t => t._id === data.grade)[0].name}`])
        reset()
    }

    const handleCancel = () => {
        dispatch(setSelectUpdate(null));
        reset()
        close()
    }

    return (
        <div className={style.AddItemForm} onClick={(e) => e.stopPropagation()}>
            {update === null && <div>
                {added.map(item => {
                    return <div>{item}</div>
                })}
            </div>}
            <form className={style.formBlock} onSubmit={handleSubmit(onSubmit)}>

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
                        step="any"
                        placeholder='Enter quantity'
                        {...register('quantity', {
                            required: 'Quantity is required',
                        })}
                    />
                    {errors.quantity && <span className={style.error}>{errors.quantity.message}</span>}
                </div>

                <div>
                    <label htmlFor='shipTo'>Ship To:</label>
                    <select
                        id='shipTo'
                        {...register('shipTo')}
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
                    <button type='submit'>{update ? 'Update Item' : 'Add New Item'}</button>
                    <button type='button' onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    )
}

export default AddItemForm