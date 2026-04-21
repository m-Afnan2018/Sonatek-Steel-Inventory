import React, { useEffect } from 'react'
import style from './Overlay.module.css'

const ConfirmationOverlay = ({ message, onAccept, close }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                close?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [close]);

    return (
        <div className={style.ShowOverlay}>
            <h4 style={{ color: 'var(--text-primary)' }}>{message}</h4>
            <div>
                <button onClick={() => { onAccept?.(); close?.(); }}>Ok</button>
                <button onClick={close}>Cancel</button>
            </div>
        </div>
    )
}

export default ConfirmationOverlay