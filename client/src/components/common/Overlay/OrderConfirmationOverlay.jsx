import React, { useState } from 'react'
import style from './Overlay.module.css'

const OrderConfirmationOverlay = ({ message, data = [], onAccept, close }) => {
    const [rows, setRows] = useState(
        data.map((item) => ({
            id: item._id,
            formType: '',
            quantity: ''
        }))
    );

    const handleChange = (index, field, value) => {
        setRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all rows
        const validRows = rows.filter(
            (row) =>
                row.formType &&
                Number(row.quantity) > 0
        );

        if (validRows.length === 0) {
            alert('Please fill at least one valid entry.');
            return;
        }

        try {
            const res = onAccept && onAccept(validRows);
            if (res && typeof res.then === 'function') await res;
            close && close();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={style.OrderConfirmationOverlay}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={style.FullWidth} style={{ width: '100%' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Wagon</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Form</th>
                            <th>Available</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((it, index) => (
                            <tr key={it._id || index}>
                                <td>{it?.wagonNumber || 'N/A'}</td>
                                <td>{it?.type}</td>
                                <td>{`${it?.thickness?.name} X ${it?.width?.name} X ${it?.grade?.name}`}</td>
                                <td>
                                    <select
                                        value={rows[index].formType}
                                        onChange={(e) =>
                                            handleChange(index, 'formType', e.target.value)
                                        }
                                    >
                                        <option value="" disabled>
                                            Select
                                        </option>
                                        <option value="Sheet">Sheet</option>
                                        <option value="Coil">Coil</option>
                                    </select>
                                </td>
                                <td>{it?.quantity?.toFixed(3)}</td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max={it.quantity.toFixed(3)}
                                        value={rows[index].quantity || ''}
                                        onChange={(e) =>
                                            handleChange(index, 'quantity', e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="6">
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={close}>
                                        Close
                                    </button>
                                    <button type="submit">Confirm Booking</button>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </form>
    );
};

export default OrderConfirmationOverlay;
