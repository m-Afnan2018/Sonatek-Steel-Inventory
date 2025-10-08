import React from 'react'
import style from './NotVerified.module.css'
import { logoutUser } from 'services/operations/authAPI';
import { useDispatch } from 'react-redux';

const NotVerified = () => {
    const dispatch = useDispatch();
    const logout = () => {
        logoutUser(dispatch);
    }
    return (
        <div className={style.NotVerified}>

            <h2>Not Verified Yet</h2>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default NotVerified