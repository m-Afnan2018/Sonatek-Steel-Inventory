// =======================
// Core Imports
// =======================
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// =======================
// Styles & Assets
// =======================
import style from './Auth.module.css';
import logo from '../../assets/images/logo.svg';

// =======================
// Auth Components
// =======================
import Login from '../../components/core/Auth/Login';
import Signup from '../../components/core/Auth/Signup';
import ForgetPassword from '../../components/core/Auth/ForgetPassword';
import ResetPassword from '../../components/core/Auth/ResetPassword';

const Auth = () => {

    // =======================
    // Local State
    // =======================
    const [path, setPath] = useState('login');

    // =======================
    // Redux State
    // =======================
    const { loader } = useSelector((state) => state.auth);

    // =======================
    // Router
    // =======================
    const location = useLocation();

    // =======================
    // Handle Reset Password Route
    // =======================
    useEffect(() => {
        // eslint-disable-next-line eqeqeq
        if (location.pathname.toLocaleLowerCase() == '/resetpassword') {
            setPath('resetPassword');
        }
    }, [location.pathname]);

    // =======================
    // Render
    // =======================
    return (
        <div className={style.Auth}>
            <div className={style.container}>

                {/* Logo */}
                <div className={style.heading}>
                    <img src={logo} alt="SONATEK STEELS LOGO" />
                </div>

                {/* Loader */}
                {loader && (
                    <div className={style.loaderContainer}>
                        <div className="loader" />
                    </div>
                )}

                {/* Auth Screens */}
                {!loader && path === 'login' && (
                    <Login setPath={setPath} />
                )}

                {!loader && path === 'signup' && (
                    <Signup setPath={setPath} />
                )}

                {!loader && path === 'forgetPassword' && (
                    <ForgetPassword setPath={setPath} />
                )}

                {!loader && path === 'resetPassword' && (
                    <ResetPassword setPath={setPath} />
                )}

            </div>
        </div>
    );
};

export default Auth;
