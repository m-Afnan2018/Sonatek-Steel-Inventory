import React, { useState, useEffect } from 'react'
import style from './Varient.module.css'
import { IoTrashOutline } from "react-icons/io5";
import { RxCheck, RxCross2 } from "react-icons/rx";
import { useOverlay } from 'hooks/useOverlay';
import ConfirmationOverlay from 'components/common/Overlay/ConfirmationOverlay';

const SingleVarient = ({ onDelete, onUpdate, value }) => {
    const { showOverlay } = useOverlay();
    const [edit, setEdit] = useState(value.name)
    const [editable, setEditable] = useState(false);

    useEffect(() => {
        setEdit(value.name);
    }, [value.name]);

    const updating = (e) => {
        e.stopPropagation()
        setEditable(false);
        onUpdate(value._id, edit)
    }

    const handleEdit = (e) => {
        e.stopPropagation();
        setEditable(false);
    }

    const handleRowClick = () => {
        if (!value.inUse) setEditable(true);
    }

    return (
        <tr className={style.SingleVarient} onClick={handleRowClick} style={{ cursor: value.inUse ? 'default' : 'pointer' }}>
            <td style={{ color: 'var(--text-primary)' }}> {editable ? <input placeholder={value.name} type='text' value={edit} onChange={(e) => setEdit(e.target.value)} /> : value.name}</td>
            <td style={{ fontWeight: '500', textDecoration: 'underline' }}> {value.type}</td>
            <td>
                {editable ? (
                    <div>
                        <RxCheck style={{ color: 'green' }} onClick={updating} />
                        <RxCross2 style={{ color: 'red' }} onClick={handleEdit} />
                    </div>
                ) : value.inUse ? (
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: 'var(--accent, #e67e22)',
                        background: 'color-mix(in srgb, var(--accent, #e67e22) 12%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--accent, #e67e22) 35%, transparent)',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                    }}>In Use</span>
                ) : (
                    <IoTrashOutline
                        style={{ color: 'red', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            showOverlay(ConfirmationOverlay, {
                                message: `Delete "${value.name}"? This cannot be undone.`,
                                onAccept: () => onDelete(value._id),
                            });
                        }}
                    />
                )}
            </td>
        </tr>
    )
}

export default SingleVarient