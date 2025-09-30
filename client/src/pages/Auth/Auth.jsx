import React, { useEffect, useState } from 'react'
import style from './Auth.module.css';
import Login from '../../components/core/Auth/Login';
import Signup from '../../components/core/Auth/Signup';
import ForgetPassword from '../../components/core/Auth/ForgetPassword';
import logo from '../../assets/images/logo.svg'
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ResetPassword from '../../components/core/Auth/ResetPassword';

const Auth = () => {
    const [path, setPath] = useState('login')
    const { loader } = useSelector((state) => state.auth)

    const location = useLocation();

    useEffect(() => {
        // eslint-disable-next-line eqeqeq
        if (location.pathname.toLocaleLowerCase() == '/resetpassword') {
            setPath('resetPassword')
        }
    }, [location.pathname])
    
    return (
        <div className={style.Auth}>
            <div className={style.container}>
                <div className={style.heading}>
                    <img src={logo} alt='SONATEK STEELS LOGO' />
                </div>
                {loader && <div className={style.loaderContainer}>
                    <div className='loader' />
                </div>}
                {!loader && path === 'login' && <Login setPath={setPath} />}
                {!loader && path === 'signup' && <Signup setPath={setPath} />}
                {!loader && path === 'forgetPassword' && <ForgetPassword setPath={setPath} />}
                {!loader && path === 'resetPassword' && <ResetPassword setPath={setPath} />}
            </div>
        </div>
    )
}

export default Auth