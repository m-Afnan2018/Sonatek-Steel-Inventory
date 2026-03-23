import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import style from './Auth.module.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../../../services/operations/authAPI';
import { setIsLogin } from '../../../slices/authSlice';

const Login = ({ setPath }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await login(email, password, dispatch);
    if (response) {
      dispatch(setIsLogin(true));
    }
  };

  return (
    <div className={style.formWrapper}>
      <form onSubmit={onSubmit} className={style.form}>
        {/* Email */}
        <div className={style.fieldGroup}>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className={style.fieldGroup}>
          <label htmlFor="login-password">Password</label>
          <div className={style.passwordField}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className={style.eyeToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          <div className={style.linksRow}>
            <span className={style.link} onClick={() => setPath('forgetPassword')}>
              Forgot password?
            </span>
          </div>
        </div>

        <button type="submit" className={style.submitBtn}>
          Sign in
        </button>
      </form>

      <div className={style.divider}><span>or</span></div>

      <p className={style.footerText}>
        Don't have an account?{' '}
        <span className={style.link} onClick={() => setPath('signup')}>
          Create account
        </span>
      </p>
    </div>
  );
};

export default Login;
