import React, { useState } from 'react';
import style from './Auth.module.css';
import { useDispatch } from 'react-redux';
import { sendLink } from '../../../services/operations/authAPI';

const ForgetPassword = ({ setPath }) => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const onSubmit = (e) => {
    e.preventDefault();
    sendLink(email, dispatch);
  };

  return (
    <div className={style.formWrapper}>
      <form onSubmit={onSubmit} className={style.form}>
        <div className={style.fieldGroup}>
          <label>Email address</label>
          <input
            type="email"
            value={email}
            placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={style.submitBtn}>Send reset code</button>
      </form>

      <div className={style.divider}><span>or</span></div>
      <p className={style.footerText}>
        Remember your password?{' '}
        <span className={style.link} onClick={() => setPath('login')}>Sign in</span>
      </p>
    </div>
  );
};

export default ForgetPassword;
