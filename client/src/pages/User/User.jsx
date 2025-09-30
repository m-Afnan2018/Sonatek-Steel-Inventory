import React, { useEffect, useState } from 'react'
import style from './User.module.css'
import { getAllUsers } from 'services/operations/userAPI'
import { useDispatch } from 'react-redux';

const User = () => {
    const [users, setUsers] = useState(null);
    const [requests, setRequests] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        getAllUsers(dispatch);
    }, [])

    useEffect(() => {
        if (users) {
            setRequests(users.filter(user => !user.isVerified));
        }
    }, [users])

    useEffect(() => {
        console.log(requests);
    }, [requests])

    const applyFilter = () => {

    }

    if (!users) {
        return <div className='loader' />
    }

    return (
        <div className={style.User}>
            <h2>Manage Users</h2>
            <div>
                <h3>Pending Requests</h3>
                <div>
                    {users && users.map((user) => {
                        return <div>{user.firstName} {user.lastName}</div>
                    })}
                </div>
            </div>
            <div>
                <h3>All Users</h3>
                <div>
                    <input type='text' placeholder='Search' />
                    <select name='filter'>
                        <option value={'any'}>Any</option>
                        <option value={'admin'}>Admin</option>
                        <option value={'inventory_associate'}>Inventory Associate</option>
                        <option value={'director'}>Director</option>
                        <option value={'agent'}>Agent</option>
                        <option value={'accountant'}>Accountant</option>
                    </select>
                    <select name='sort'>
                        <option value='any'>Any</option>
                        <option value='firstName'>By First Name</option>
                        <option value='lastName'>By Last Name</option>
                        <option value='createdAt'>By Joining</option>
                        <option value='role'>By Role</option>
                    </select>
                    <button onClick={applyFilter}> GO </button>
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}

export default User