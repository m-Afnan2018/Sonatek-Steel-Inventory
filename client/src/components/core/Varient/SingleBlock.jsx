import React, { useState } from 'react'
import style from './Varient.module.css'
import SingleVarient from './SingleVarient'
import { addVarient, deleteVarient, updateVarient } from 'services/operations/varientAPI'
import { useDispatch } from 'react-redux'

const SingleBlock = ({ list, name }) => {
    const [showForm, setShowForm] = useState(false)
    const [varient, setVarient] = useState('')

    const dispatch = useDispatch();

    const onSubmit = (e, type) => {
        e.preventDefault();
        if (type === 'Grade') {
            addVarient('grade', varient, dispatch, list);
        }
        if (type === 'Thickness') {
            addVarient('thickness', varient, dispatch, list);
        }
        if (type === 'Cutter') {
            addVarient('cutter', varient, dispatch, list);
        }

        if (type === 'Width') {
            addVarient('width', varient, dispatch, list);
        }
        setShowForm(false);
    }

    const onUpdate = (id, value) => {
        if (name === 'Grade') {
            updateVarient(id, 'grade', value, dispatch, list);
        }
        if (name === 'Thickness') {
            updateVarient(id, 'thickness', value, dispatch, list);
        }
        if (name === 'Cutter') {
            updateVarient(id, 'cutter', value, dispatch, list);
        }

        if (name === 'Width') {
            updateVarient(id, 'width', value, dispatch, list);
        }
    }

    const onDelete = (id) => {
        if (name === 'Grade') {
            deleteVarient(id, 'grade', dispatch, list);
        }
        if (name === 'Thickness') {
            deleteVarient(id, 'thickness', dispatch, list);
        }
        if (name === 'Cutter') {
            deleteVarient(id, 'cutter', dispatch, list);
        }

        if (name === 'Width') {
            deleteVarient(id, 'width', dispatch, list);
        }
    }

    return (
        <div className={style.Varient}>
            <h3>{name}</h3>
            <button style={{ height: showForm ? '0' : '5rem', padding: '0 3rem', opacity: showForm ? '0' : '1' }} onClick={() => setShowForm(true)}>Add new {name}</button>
            <form style={{ height: showForm ? '5rem' : '0' }} onSubmit={(e) => onSubmit(e, name)}>
                <input type='text' value={varient} onChange={(e) => setVarient(e.target.value)} placeholder={`Name of new ${name}`} />
                <div>
                    <button type='submit'>Add new {name}</button>
                    <button type='reset' onClick={() => setShowForm(false)}>Cancle</button>
                </div>
            </form>
            {list && list.length > 0 &&
                <div className={style.allVarients}>
                    {list.map((value) => {
                        return <SingleVarient onUpdate={onUpdate} onDelete={onDelete} value={value} />
                    })}
                </div>
            }
        </div>
    )
}

export default SingleBlock