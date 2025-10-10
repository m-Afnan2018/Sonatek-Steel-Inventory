import React, { useState } from 'react'
import style from './Overlay.module.css'

const SingleField = ({ message, onAccept, close }) => {
    const [selectedType, setSelectedType] = useState('Sheet');
    const [quantity, setQuantity] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const qty = Number(quantity);
        if (!qty || qty <= 0) {
            setError('Please enter a valid quantity greater than 0');
            return;
        }

        const payload = {
            formtType: selectedType,
            requirement: qty,
        };

        try {
            setSubmitting(true);
            const res = onAccept && onAccept(payload);
            // support async onAccept
            if (res && typeof res.then === 'function') await res;
            // close after successful accept
            close && close();
        } catch (err) {
            setError(err?.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    }

    const handleReset = (e) => {
        e.preventDefault();
        // reset to defaults and close
        setSelectedType('Sheet');
        setQuantity('');
        close && close();
    }

    return (
        <form onSubmit={handleSubmit} className={style.ShowOverlay} onClick={(e) => e.stopPropagation()}>
            <h3>{message}</h3>
            <div>
                <label>Type: </label>
                <div className={style.radioGroup}>
                    <label className={style.radioButton}>
                        <input
                            type='radio'
                            name='steelType'
                            value='Sheet'
                            checked={selectedType === 'Sheet'}
                            onChange={() => setSelectedType('Sheet')}
                        />
                        <span className={style.radioLabel}>Sheet</span>
                    </label>
                    <label className={style.radioButton}>
                        <input
                            type='radio'
                            name='steelType'
                            value='Coil'
                            checked={selectedType === 'Coil'}
                            onChange={() => setSelectedType('Coil')}
                        />
                        <span className={style.radioLabel}>Coil</span>
                    </label>
                </div>
            </div>
            <div>
                <label>Enter the quantity</label>
                <input
                    type='number'
                    min='1'
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={style.inputField}
                />
            </div>

            {error && <div className={style.error}>{error}</div>}

            <div>
                <button type='submit' disabled={submitting}>{submitting ? 'Submitting...' : 'Ok'}</button>
                <button type='reset' onClick={handleReset}>Cancel</button>
            </div>
        </form>
    )
}

export default SingleField