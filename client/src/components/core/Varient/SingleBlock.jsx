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
        if (type === 'Warehouse') {
            addVarient('warehouse', { name: varient, type: option }, dispatch, list);
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
        if (name === 'Warehouse') {
            updateVarient(id, 'warehouse', value, dispatch, list);
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
        if (name === 'Warehouse') {
            deleteVarient(id, 'warehouse', dispatch, list);
        }

        if (name === 'Width') {
            deleteVarient(id, 'width', dispatch, list);
        }
    }

    return (
        <div className={style.Varient}>
            <h3>{name}</h3>
            <div style={{ height: showForm ? '0' : '40px', opacity: showForm ? '0' : '1' }}>
                <button type='button' onClick={() => handleClick('ALL')} style={{ boxShadow: type === 'ALL' && 'inset 0px 0px 4px 0px black', background: type === 'ALL' && 'rgb(0 122 138)', color: type === 'ALL' && '#f0fbff' }}>All</button>
                <button type='button' onClick={() => handleClick('HR')} style={{ boxShadow: type === 'HR' && 'inset 0px 0px 4px 0px black', background: type === 'HR' && 'rgb(0 122 138)', color: type === 'HR' && '#f0fbff' }}>HR</button>
                <button type='button' onClick={() => handleClick('CR')} style={{ boxShadow: type === 'CR' && 'inset 0px 0px 4px 0px black', background: type === 'CR' && 'rgb(0 122 138)', color: type === 'CR' && '#f0fbff' }}>CR</button>
                <button type='button' onClick={() => setShowForm(true)} style={{marginLeft: 'auto', width: '4rem'}}>Add</button>
            </div>
            <form style={{ height: showForm ? '40px' : '0' }} onSubmit={(e) => onSubmit(e, name)}>
                <div>
                    <select
                        id='type'
                        defaultValue={option}
                        onChange={(e) => setOption(e.target.value)}
                        style={{width: '4rem'}}
                    >
                        {name !== 'Grade' && <option value='Both'>All</option>}
                        <option value='Hot Rolled'>  HR </option>
                        <option value='Cold Rolled'>  CR </option>
                    </select>
                </div>
                <input type='text' value={varient} onChange={(e) => setVarient(e.target.value)} placeholder={`Name of ${name}`} style={{ width: '100%' }} />
                <div>
                    <button type='submit'>Add</button>
                    <button type='reset' onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            </form>
            {show && show.length > 0 &&
                <table className={style.allVarients}>
                    <thead>
                        <tr>
                            <th>Value</th>
                            <th>Type</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {show.map((value) => {
                            return <SingleVarient key={value._id} onUpdate={onUpdate} onDelete={onDelete} value={value} />
                        })}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default SingleBlock