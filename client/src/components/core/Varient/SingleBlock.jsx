import React, { useState, useMemo } from 'react'
import style from './Varient.module.css'
import SingleVarient from './SingleVarient'
import { addVarient, deleteVarient, updateVarient } from 'services/operations/varientAPI'
import { useDispatch } from 'react-redux'

const SingleBlock = ({ list, name }) => {
    const [showForm, setShowForm] = useState(false)
    const [varient, setVarient] = useState('')
    const [option, setOption] = useState('Hot Rolled');
    const [type, setType] = useState('ALL')

    const show = useMemo(() => {
        if (type === 'HR') return list ? list.filter(i => i.type === 'Hot Rolled') : [];
        if (type === 'CR') return list ? list.filter(i => i.type === 'Cold Rolled') : [];
        return list || [];
    }, [list, type]);

    const handleClick = (t) => {
        if (t === 'HR') {
            setType('HR')
        } else if (t === 'CR') {
            setType('CR')
        } else {
            setType('ALL')
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
                <button onClick={() => handleClick('ALL')} style={{ background: type === 'ALL' ? 'var(--accent)' : 'var(--bg-elevated)', color: type === 'ALL' ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>All</button>
                <button onClick={() => handleClick('HR')} style={{ background: type === 'HR' ? 'var(--accent)' : 'var(--bg-elevated)', color: type === 'HR' ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>HR</button>
                <button onClick={() => handleClick('CR')} style={{ background: type === 'CR' ? 'var(--accent)' : 'var(--bg-elevated)', color: type === 'CR' ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>CR</button>
                <button onClick={() => setShowForm(true)} style={{ marginLeft: 'auto', width: '4rem' }}>Add</button>
            </div>
            <form style={{ height: showForm ? '40px' : '0' }} onSubmit={(e) => onSubmit(e, name)}>
                <div>
                    <select
                        id='type'
                        defaultValue={option}
                        onChange={(e) => setOption(e.target.value)}
                        style={{ width: '4rem' }}
                    >
                        {name !== 'Grade' && <option value='Both'>All</option>}
                        <option value='Hot Rolled'>  HR </option>
                        <option value='Cold Rolled'>  CR </option>
                    </select>
                </div>
                <input type='text' value={varient} onChange={(e) => setVarient(e.target.value)} placeholder={`Name of ${name}`} style={{ width: '100%' }} />
                <div>
                    <button type='submit'>Add</button>
                    <button type='reset' onClick={() => setShowForm(false)}>Cancle</button>
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
                            return <SingleVarient onUpdate={onUpdate} onDelete={onDelete} value={value} />
                        })}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default SingleBlock