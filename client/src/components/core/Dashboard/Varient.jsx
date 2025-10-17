import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { getAllVarientsDetail } from 'services/operations/varientAPI';
import { useDispatch } from 'react-redux';

const Varient = () => {
    const [data, setData] = useState(null);
    const [activeVariant, setActiveVariant] = useState(null); // tracks which variant card is expanded
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        getAllVarientsDetail(setData, setLoading, dispatch);
    }, [dispatch]);

    if (loading) return <div className={style.loading}>Loading variants...</div>;
    if (!data) return <div className={style.empty}>No variant data found</div>;

    // Helper to render details table
    const renderVariantDetails = (variant) => {
        return (
            <table className={style.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total Coils</th>
                        <th>Total Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {variant.list.map((v) => (
                        <tr key={v._id}>
                            <td>{v.name}</td>
                            <td>{v.totalItems}</td>
                            <td>{v.totalQuantity.toFixed(3)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className={style.Varient}>
            <h3>Variant Dashboard</h3>

            <div className={style.cardsWrapper}>
                {['cutters', 'grades', 'thicknesses', 'widths'].map((key) => (
                    <div
                        key={key}
                        className={style.card}
                        onClick={() =>
                            setActiveVariant(activeVariant === key ? null : key)
                        }
                    >
                        <h4>{key.charAt(0).toUpperCase() + key.slice(1)} - {data[key].total}</h4>
                        {/* <p>Total: {data[key].total}</p> */}

                        <div className={style.detailTable}>
                            {renderVariantDetails(data[key])}
                        </div>
                        {/* Show table if this card is active */}
                        {/* {activeVariant === key && (
                            <div className={style.detailTable}>
                                {renderVariantDetails(data[key])}
                            </div>
                        )} */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Varient;
