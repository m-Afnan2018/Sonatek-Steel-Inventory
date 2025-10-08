import React, { useState } from 'react'
import style from './Auth.module.css';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { signup } from '../../../services/operations/authAPI';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

const Signup = ({ setPath }) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setshowPassword] = useState(false);
    const [showConfirmPassword, setshowConfirmPassword] = useState(false);

    const [showError, setShowError] = useState(false);

    const dispatch = useDispatch();

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!email || !firstName || !lastName || !password || !confirmPassword || password !== confirmPassword) {
            setShowError(true);
            toast.error('Please fill the complete form');
            return;
        }

        const response = await signup(firstName, lastName, email, password, dispatch);
        if (response) {
            setPath('login');
        }
    }

    return (
        <div className={`${style.Auth} ${style.Signup}`}>
            <form onSubmit={onSubmit} className={style.form}>
                <div>
                    <label>First name</label>
                    <input type='text' value={firstName} placeholder='Enter your firstname' onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                    <label>Last name</label>
                    <input type='text' value={lastName} placeholder='Enter your lastname' onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                    <label>Email</label>
                    <input type='email' value={email} placeholder='username@email.com' onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label>Password</label>
                    <div>
                        <div className={style.password}>
                            <input type={showPassword ? 'text' : 'password'} placeholder='***********' value={password} onChange={(e) => setPassword(e.target.value)} />
                            {showPassword ? <FiEyeOff onClick={() => setshowPassword(!showPassword)} /> : <FiEye onClick={() => setshowPassword(!showPassword)} />}
                        </div>
                    </div>
                </div>
                <div>
                    <label>Confirm Password</label>
                    <div>
                        <div className={style.password}>
                            <input type={showConfirmPassword ? 'text' : 'password'} placeholder='***********' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            {showConfirmPassword ? <FiEyeOff onClick={() => setshowConfirmPassword(!showConfirmPassword)} /> : <FiEye onClick={() => setshowConfirmPassword(!showConfirmPassword)} />}
                        </div>
                    </div>
                </div>
                <button>Signup</button>
            </form>
            <div className={style.horizontalLine}></div>
            <h3>Already have an account ? <span className={style.blueText} onClick={() => setPath('login')}>Login</span></h3>
        </div>
    )
}

export default Signup