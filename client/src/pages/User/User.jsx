import React, { useEffect, useState } from 'react'
import style from './User.module.css'
import { changeUserDesignation, getAllUsers, removeUser, verifyUser } from 'services/operations/userAPI'
import { useDispatch, useSelector } from 'react-redux';

const User = () => {
    const [requests, setRequests] = useState(null);
    const [listUsers, setListUsers] = useState(null);
    const [view, setView] = useState(null);
    const [filter, setFilter] = useState({
        query: '',
        role: null,
        sorted: null,
    })

    const { userData } = useSelector(state => state.auth);
    const { allUsers } = useSelector(state => state.user)
    const dispatch = useDispatch();

    useEffect(() => {
        getAllUsers(dispatch);
    }, [dispatch])

    useEffect(() => {
        if (allUsers) {
            console.log(allUsers)
            setRequests(allUsers.filter(user => !user.isVerified));
            setListUsers(allUsers);
        }
    }, [allUsers])

    const applyFilter = () => {
        let filtered = [...allUsers];

        if (filter.query) {
            filtered = filtered.filter(user =>
                user.firstName.toLowerCase().includes(filter.query.toLowerCase()) ||
                user.lastName.toLowerCase().includes(filter.query.toLowerCase()) ||
                user.email.toLowerCase().includes(filter.query.toLowerCase())
            );
        }

        if (filter.role) {
            filtered = filtered.filter(user => user.role === filter.role);
        }

        if (filter.sorted) {
            filtered = sortUsers(filtered, filter.sorted);
        }

        setListUsers(filtered);
    };

    const changeFilter = (e, type) => {
        console.log(listUsers);
        if (type === 'query') {
            setFilter((prev) => {
                prev.query = e.target.value;
                return prev;
            })
        }
        if (type === 'sort') {
            setFilter((prev) => {
                prev.sorted = e.target.value;
                return prev;
            })
        }
        if (type === 'role') {
            setFilter((prev) => {
                prev.role = e.target.value;
                return prev;
            })
        }
    }

    const clearFilter = () => {
        setListUsers(allUsers);
    }

    const sortUsers = (users, key) => {
        return [...users].sort((a, b) => {
            // for string keys (firstName, lastName, role)
            if (typeof a[key] === "string") {
                return a[key].localeCompare(b[key]);
            }
            // for dates (createdAt, updatedAt)
            if (key === "createdAt" || key === "updatedAt") {
                return new Date(a[key]) - new Date(b[key]);
            }
            // fallback (like phoneNumber numeric)
            return (a[key] || "").toString().localeCompare((b[key] || "").toString());
        });
    };

    if (!allUsers) {
        return <div className={style.loaderContainer}>
            <div className='loader' />
        </div>
    }

    return (
        <div className={style.User}>
            <h2>Manage Users</h2>
            <div className={style.pendingRequest}>
                <h3>Pending Requests</h3>
                <div className={style.usersList}>
                    {requests && requests.length > 0 && requests.map((user) => {
                        return <div className={style.singleUser}>
                            <p>{user.email}</p>
                            <p style={{ textTransform: 'capitalize' }}>{user.role}</p>
                            <button onClick={() => verifyUser(user._id, dispatch, allUsers)}>Verify</button>
                        </div>
                    })}
                    {requests && requests.length === 0 && <div className={style.Nothing}>
                        No Pending Request
                    </div>}
                </div>
            </div>
            <div className={style.pendingRequest}>
                <h3>All Users</h3>
                <div className={style.filters}>
                    <div>
                        <input type='text' placeholder='Search' onChange={(e) => changeFilter(e, 'query')} />
                        <select name='filter' defaultValue={'any'} onChange={(e) => changeFilter(e, 'role')}>
                            <option value={'any'} disabled>Role</option>
                            <option value={'admin'}>Admin</option>
                            <option value={'inventory_associate'}>Inventory Associate</option>
                            <option value={'director'}>Director</option>
                            <option value={'agent'}>Agent</option>
                            <option value={'accountant'}>Accountant</option>
                        </select>
                        <select name='sort' defaultValue={'any'} onChange={(e) => changeFilter(e, 'sort')}>
                            <option value='any' disabled>Sort</option>
                            <option value='firstName'>By First Name</option>
                            <option value='lastName'>By Last Name</option>
                            <option value='createdAt'>By Joining</option>
                            <option value='role'>By Role</option>
                        </select>
                    </div>
                    <div>
                        <button onClick={applyFilter}> Search </button>
                        <button onClick={clearFilter}> Cancle </button>
                    </div>
                </div>
                <div className={style.usersList}>
                    {listUsers && listUsers.map((user) => {
                        return <SingleUser dispatch={dispatch} user={user} userData={userData} setView={setView} view={view} key={user._id} />
                    })}
                    {listUsers && listUsers.length === 0 && <div className={style.Nothing}>
                        No user found
                    </div>}
                </div>

            </div>
        </div>
    )
}


const SingleUser = ({ user, userData, view, setView, dispatch }) => {

    const [role, setRole] = useState(user.role);

    return <div>
        <div className={style.singleUser} style={{ borderRadius: view === user._id ? '0.5rem 0.5rem 0 0' : '0.5rem' }}>
            <p>{user.firstName} {user.lastName}</p>
            {view !== user._id ? <button onClick={() => setView(user._id)}>View Detail</button> :
                <button onClick={() => setView(null)}>Close</button>}
        </div>
        <div style={{ height: view === user._id ? '250px' : 0, padding: view === user._id ? '1rem' : 0 }} className={style.moreDetails}>
            <div>
                <p>Name:</p>
                <p>{user.firstName} {user.lastName}</p>
            </div>
            <div>
                <p>Email:</p>
                <p>{user.email}</p>
            </div>
            <div>
                <p>Phone number:</p>
                <p>{user.phoneNumber}</p>
            </div>
            <div>
                <p>Designation:</p>
                <p>{user.role}</p>
            </div>
            <div>
                <p>Registered on: </p>
                <p>{user.createdAt}</p>
            </div>
            <div>
                <p>Last Updated on: </p>
                <p>{user.updatedAt}</p>
            </div>

            {userData.userId !== user._id && <div className={style.disignation}>
                <select name='designation' onChange={(e) => setRole(e.target.value)} defaultValue={user.role}>
                    {
                        ([{ val: 'admin', show: 'Admin' },
                        { val: 'inventory_associate', show: 'Inventory Associate' },
                        { val: 'director', show: 'Director' },
                        { val: 'agent', show: 'Agent' },
                        { val: 'accountant', show: 'Accountant' }
                            // eslint-disable-next-line array-callback-return
                        ].map((item) => {
                            return <option disabled={item.val === user.role} value={item.val}>{item.show}</option>
                        }))
                    }
                </select>
                <button onClick={() => changeUserDesignation(user._id, role, dispatch)}>Update Designation</button>
                <button onClick={() => removeUser(user._id, dispatch)}>Remove User</button>
            </div>}
        </div>
    </div>
}

export default User