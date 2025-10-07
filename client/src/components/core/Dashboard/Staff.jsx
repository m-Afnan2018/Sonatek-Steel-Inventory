import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { useSelector } from 'react-redux';

const Staff = () => {
    const [listUsers, setListUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const { allUsers } = useSelector(state => state.user);

    // Fetch all users
    useEffect(() => {
        if (allUsers) {
            setListUsers(allUsers);
            setLoading(false);
        }
    }, [allUsers]);

    return (
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Staff Details</h3>

            <div className={style.card}>
                <h4>All Users</h4>

                {loading ? (
                    <div className={style.loading}>Loading users...</div>
                ) : listUsers.length === 0 ? (
                    <div className={style.empty}>No user found</div>
                ) : (
                    <div className={style.tableWrapper}>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listUsers.map((user) => (
                                    <SingleUser key={user._id} user={user} setView={setView} view={view} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const SingleUser = ({ user, setView, view }) => {
    return (
        <tr
            className={`${view === user._id ? style.activeRow : ''}`}
            onClick={() => setView(user._id)}
        >
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.phoneNumber || '-'}</td>
            <td>{user.role || '—'}</td>
            <td>
                <span className={user.isVerified ? style.verified : style.notVerified}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
            </td>
            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
    );
};

export default Staff;
