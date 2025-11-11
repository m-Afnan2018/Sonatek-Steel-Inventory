import React, { useState } from 'react'
import style from './Varient.module.css'
import { MdDelete } from "react-icons/md";
import { RxCheck, RxCross2 } from "react-icons/rx";

const SingleVarient = ({ onDelete, onUpdate, value }) => {
    const [edit, setEdit] = useState(value.name)
    const [editable, setEditable] = useState(false);

    const updating = (e) => {
        e.stopPropagation()
        setEditable(false);
        onUpdate(value._id, edit)
    }

    const handleEdit = (e) => {
        e.stopPropagation();
        setEditable(false);
    }

    return (
        <tr className={style.SingleVarient} onClick={() => setEditable(true)}>
            <td style={{ color: 'black' }}> {editable ? <input placeholder={value.name} type='text' value={edit} onChange={(e) => setEdit(e.target.value)} /> : value.name}</td>
            <td style={{ fontWeight: '500', textDecoration: 'underline' }}> {value.type}</td>
            <td>
                {editable ? <div>
                    <RxCheck style={{ color: 'green' }} onClick={updating} />
                    <RxCross2 style={{ color: 'red' }} onClick={handleEdit} />
                </div> : <MdDelete style={{ color: 'red' }} onClick={() => onDelete(value._id)} />}
            </td>
        </tr>
    )
}

export default SingleVarient