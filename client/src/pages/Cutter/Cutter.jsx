import React, { useState } from 'react'
import style from './Cutter.module.css'
import { useSelector } from 'react-redux'
import { addCutter } from 'services/operations/cuttersAPI'

const Cutter = () => {
    const { cutters } = useSelector(state => state.varient);

    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')

    const onSubmit = (e, type) => {
        e.preventDefault();
        addCutter({ name, address, phoneNumber })
        setShowForm(false);
    }

    return (
        <div className={style.Varient}>
            <h3>{name}</h3>
            <button style={{ height: showForm ? '0' : '5rem', padding: '0 3rem', opacity: showForm ? '0' : '1' }} onClick={() => setShowForm(true)}>Add new {name}</button>
            <form style={{ height: showForm ? '5rem' : '0' }} onSubmit={(e) => onSubmit(e, name)}>
                <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder={`Name of new ${name}`} />
                <input type='text' value={address} onChange={(e) => setAddress(e.target.value)} placeholder={`Address of new ${name}`} />
                <input type='text' value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={`Phone Number of new ${name}`} />
                <div>
                    <button type='submit'>Add new {name}</button>
                    <button type='reset' onClick={() => setShowForm(false)}>Cancle</button>
                </div>
            </form>
            {cutters && cutters.length > 0 &&
                <div className={style.allVarients}>
                    {cutters.map((value) => {
                        return <SingleVarient value={value} />
                    })}
                </div>
            }
        </div>
    )
}

const SingleVarient = ({ onDelete, value }) => {
    const [edit, setEdit] = useState(value.name)
    const [editable, setEditable] = useState(false);

    const updating = () => {
        setEditable(false);
    }

    return (
        <div className={style.SingleVarient}>
            {!editable && <h4>{value.name}</h4>}
            {editable && <input placeholder={value.name} type='text' value={edit} onChange={(e) => setEdit(e.target.value)} />}
            <div>
                {editable && <button style={{ width: edit.length > 0 ? '7rem' : '0rem', padding: '0.5rem 0' }} onClick={updating}>Update</button>}
                {editable && <button onClick={() => setEditable(false)}>Cancel</button>}
                {!editable && <button onClick={() => setEditable(true)}>Edit</button>}
                {!editable && <button onClick={() => onDelete(value._id)}>Delete</button>}
            </div>
        </div>
    )
}

export default Cutter