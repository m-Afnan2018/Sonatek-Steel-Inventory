import React, { useState } from 'react'
import style from './Varient.module.css'
import SingleVarient from './SingleVarient'
import { addVarient, deleteVarient, updateVarient } from 'services/operations/varientAPI'
import { useDispatch } from 'react-redux'

const SingleBlock = ({ list, name }) => {
    const [showForm, setShowForm] = useState(false)
    const [varient, setVarient] = useState('')
    const [option, setOption] = useState('Hot Rolled');
    const [show, setShow] = useState(list);
    const [type, setType] = useState('ALL')

    const handleClick = (t) => {
        if (t === 'HR') {
            setType('HR')
            setShow(list.filter(i => i.type === 'Hot Rolled'))
        } else if (t === 'CR') {
            setType('CR')
            setShow(list.filter(i => i.type === 'Cold Rolled'))
        } else {
            setType('ALL')
            setShow(list);
        }
    }

    const dispatch = useDispatch();

    const onSubmit = (e, type) => {
        e.preventDefault();
        if (type === 'Grade') {
            addVarient('grade', { name: varient, type: option }, dispatch, list);
        }
        if (type === 'Thickness') {
            addVarient('thickness', { name: varient, type: option }, dispatch, list);
        }
        if (type === 'Cutter') {
            addVarient('cutter', { name: varient, type: option }, dispatch, list);
        }

        if (type === 'Width') {
            addVarient('width', { name: varient, type: option }, dispatch, list);
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
            <div style={{ height: showForm ? '0' : '40px', opacity: showForm ? '0' : '1' }}>
                <button onClick={() => handleClick('ALL')} style={{ boxShadow: type === 'ALL' && 'inset 0px 0px 4px 0px black', background: type === 'ALL' && '#05516f', color: type === 'ALL' && '#f0fbff' }}>Both</button>
                <button onClick={() => handleClick('HR')} style={{ boxShadow: type === 'HR' && 'inset 0px 0px 4px 0px black', background: type === 'HR' && '#05516f', color: type === 'HR' && '#f0fbff' }}>Hot Rolled</button>
                <button onClick={() => handleClick('CR')} style={{ boxShadow: type === 'CR' && 'inset 0px 0px 4px 0px black', background: type === 'CR' && '#05516f', color: type === 'CR' && '#f0fbff' }}>Cold Rolled</button>
                <button onClick={() => setShowForm(true)}>Add new {name}</button>
            </div>
            <form style={{ height: showForm ? '40px' : '0' }} onSubmit={(e) => onSubmit(e, name)}>
                <div>
                    <select
                        id='type'
                        defaultValue={option}
                        onChange={(e) => setOption(e.target.value)}
                    >
                        {name !== 'Grade' && <option value='Both'>All</option>}
                        <option value='Hot Rolled'>  Hot Rolled </option>
                        <option value='Cold Rolled'>  Cold Rolled </option>
                    </select>
                </div>
                <input type='text' value={varient} onChange={(e) => setVarient(e.target.value)} placeholder={`Name of new ${name}`} style={{ width: '100%' }} />
                <div>
                    <button type='submit'>Add</button>
                    <button type='reset' onClick={() => setShowForm(false)}>Cancle</button>
                </div>
            </form>
            {show && show.length > 0 &&
                <table className={style.allVarients}>
                    <thead>
                        <th>Value</th>
                        <th>Type</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                        {show.map((value) => {
                            return <SingleVarient onUpdate={onUpdate} onDelete={onDelete} value={value} />
                        })}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default SingleBlock