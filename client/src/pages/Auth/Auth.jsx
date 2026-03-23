import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import style from './Auth.module.css';
import Login from '../../components/core/Auth/Login';
import Signup from '../../components/core/Auth/Signup';
import ForgetPassword from '../../components/core/Auth/ForgetPassword';
import ResetPassword from '../../components/core/Auth/ResetPassword';

const Auth = () => {
  const [path, setPath] = useState('login');
  const { loader } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.toLowerCase() === '/resetpassword') {
      setPath('resetPassword');
    }
  }, [location.pathname]);

  const titles = {
    login: { title: 'Welcome back', sub: 'Sign in to your account' },
    signup: { title: 'Create account', sub: 'Join Sonatek Steel Inventory' },
    forgetPassword: { title: 'Forgot password?', sub: 'We\'ll send a reset code to your email' },
    resetPassword: { title: 'Reset password', sub: 'Enter your new password below' },
  };

  const current = titles[path] || titles.login;

  return (
    <div className={style.Auth}>
      <div className={style.container}>
        <div className={style.heading}>
          <h1>Sonatek <span>Steel</span></h1>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 'var(--space-4)' }}>
            {current.title}
          </h2>
          <p>{current.sub}</p>
        </div>

        {loader && (
          <div className={style.loaderContainer}>
            <div className="spinner" />
          </div>
        )}

        {!loader && path === 'login' && <Login setPath={setPath} />}
        {!loader && path === 'signup' && <Signup setPath={setPath} />}
        {!loader && path === 'forgetPassword' && <ForgetPassword setPath={setPath} />}
        {!loader && path === 'resetPassword' && <ResetPassword setPath={setPath} />}
      </div>
    </div>
  );
};

export default Auth;
