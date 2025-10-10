import React from 'react'
import style from './Overlay.module.css'

const ConfirmationOverlay = ({ message, onAccept, close }) => {
    return (
        <div className={style.ShowOverlay}>
            <h4>{message}</h4>
            <div>
                <button onClick={onAccept}>Ok</button>
                <button onClick={close}>Cancel</button>
            </div>
        </div>
    )
}

export default ConfirmationOverlay