import React, { useState } from 'react';
import style from './Auth.module.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { signup } from '../../../services/operations/authAPI';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

const Signup = ({ setPath }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const response = await signup(firstName, lastName, email, password, dispatch);
    if (response) setPath('login');
  };

  return (
    <div className={style.formWrapper}>
      <form onSubmit={onSubmit} className={style.form}>
        <div className={style.fieldRow}>
          <div className={style.fieldGroup}>
            <label>First name</label>
            <input type="text" value={firstName} placeholder="First name" onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className={style.fieldGroup}>
            <label>Last name</label>
            <input type="text" value={lastName} placeholder="Last name" onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>

        <div className={style.fieldGroup}>
          <label>Email address</label>
          <input type="email" value={email} placeholder="you@company.com" onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className={style.fieldGroup}>
          <label>Password</label>
          <div className={style.passwordField}>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <span className={style.eyeToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <div className={style.fieldGroup}>
          <label>Confirm password</label>
          <div className={style.passwordField}>
            <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <span className={style.eyeToggle} onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <button type="submit" className={style.submitBtn}>Create account</button>
      </form>

      <div className={style.divider}><span>or</span></div>
      <p className={style.footerText}>
        Already have an account?{' '}
        <span className={style.link} onClick={() => setPath('login')}>Sign in</span>
      </p>
    </div>
  );
};

export default Signup;
