import React, { useEffect, useState } from "react";
import style from "./Party.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllPartyDetails } from "services/operations/bookingAPI";

const Party = () => {
    const [loading, setLoading] = useState(true);

    const { parties } = useSelector(state => state.booking);

    const dispatch = useDispatch();

    useEffect(() => {
        getAllPartyDetails(dispatch)
    }, [dispatch])

    useEffect(() => {
        if (parties) {
            setLoading(false);
        }
    }, [parties])
    return (
        <div className={style.Warehouse}>
            <h2>Manage Parties</h2>
            <div className={style.header}>
                <div>
                    <h3>Party Details</h3>
                    <p className={style.count}>Total Party: {parties?.length || 0}</p>
                </div>
            </div>

            <div className={style.tableWrap}>
                {loading ? (
                    <div className={style.loader}>Loading...</div>
                ) : (
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '1rem' }}>Name</th>
                                <th style={{ width: '1rem' }}>Total Items</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parties.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className={style.noData}>No parties found</td>
                                </tr>
                            ) : parties.map((c) => (
                                <React.Fragment key={c._id}>
                                    <tr className={style.row}>
                                        <td className={style.center}>{c.name || '-'}</td>
                                        <td className={style.center}>{c.totalBookings || 0}</td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Party;
