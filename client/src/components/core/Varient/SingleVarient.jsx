import React, { useState } from 'react'
import style from './Varient.module.css'

const SingleVarient = ({ onDelete, onUpdate, value }) => {
    const [edit, setEdit] = useState(value.name)
    const [editable, setEditable] = useState(false);

    const updating = () => {
        setEditable(false);
        onUpdate(value._id, edit)
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

export default SingleVarient