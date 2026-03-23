import React, { useEffect, useState } from 'react';
import style from './Auth.module.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { resetPassword } from 'services/operations/authAPI';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

const ResetPassword = ({ setPath }) => {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    setOTP(params.get('otp') || '');
    setEmail(params.get('email') || '');
  }, [search]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (confirmPassword !== password) {
      toast.error('Passwords do not match');
      return;
    }
    resetPassword({ email, otp, password }, setPath, dispatch);
  };

  return (
    <div className={style.formWrapper}>
      <form onSubmit={onSubmit} className={style.form}>
        <div className={style.fieldGroup}>
          <label>Email address</label>
          <input type="email" value={email} disabled onChange={(e) => e.preventDefault()} />
        </div>

        <div className={style.fieldGroup}>
          <label>OTP code</label>
          <input type="text" value={otp} disabled onChange={(e) => e.preventDefault()} />
        </div>

        <div className={style.fieldGroup}>
          <label>New password</label>
          <div className={style.passwordField}>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <span className={style.eyeToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <div className={style.fieldGroup}>
          <label>Confirm new password</label>
          <div className={style.passwordField}>
            <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <span className={style.eyeToggle} onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <button type="submit" className={style.submitBtn}>Reset password</button>
      </form>

      <div className={style.divider}><span>or</span></div>
      <p className={style.footerText}>
        Back to{' '}
        <span className={style.link} onClick={() => setPath('login')}>sign in</span>
      </p>
    </div>
  );
};

export default ResetPassword;
