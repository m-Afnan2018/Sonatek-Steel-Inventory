import React from 'react'
import style from './NotVerified.module.css'
import { logoutUser } from 'services/operations/authAPI';
import { useDispatch } from 'react-redux';
import logo from '../../assets/images/logo.svg'

const NotVerified = () => {
    const dispatch = useDispatch();
    const logout = () => {
        logoutUser(dispatch);
    }
    return (
        <div className={style.NotVerified}>
            <div className={style.container}>
                <div className={style.heading}>
                    <img src={logo} alt='SONATEK STEELS LOGO' />
                </div>
                <div className={style.loaderContainer}>
                    <h3>Please wait while admin verifying you</h3>
                    <button onClick={logout}>Logout</button>
                </div>

            </div>
        </div>
        // <div className={style.NotVerified}>

        //     <h2>Not Verified Yet</h2>
        //     <button onClick={logout}>Logout</button>
        // </div>
    )
}

export default NotVerified