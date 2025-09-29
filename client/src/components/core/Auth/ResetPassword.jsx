import React, { useEffect, useState } from 'react'
import style from './Auth.module.css'
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

const ResetPassword = ({ setPath }) => {
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setshowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState('');

    const { search } = useLocation(); // gives "?otp=123456&email=test@gmail.com"

    useEffect(() => {
        const params = new URLSearchParams(search);

        const otp = params.get("otp");
        const email = params.get("email");

        setOTP(otp);
        setEmail(email);

        console.log(`Email: ${email} OTP: ${otp}`);

    }, [search])

    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();
        console.log(`Email: ${email}, Password: ${password}`)
    }

    return (
        <div className={`${style.Auth} ${style.ResetPassword}`}>
            <form onSubmit={onSubmit} className={style.form}>
                <div>
                    <label>Email</label>
                    <input disabled type='email' value={email} placeholder='username@email.com' onChange={(e) => e.preventDefault()} />
                </div>
                <div>
                    <label>OTP</label>
                    <input disabled type='text' value={otp} placeholder='OTP' onChange={(e) => e.preventDefault()} />
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
                            {showConfirmPassword ? <FiEyeOff onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : <FiEye onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
                        </div>
                    </div>
                </div>
                <button>Reset Password</button>
            </form>
            <div className={style.horizontalLine}></div>
            <h3>Don't have an account ? <span className={style.blueText} onClick={() => setPath('signup')}>Create an account</span></h3>
        </div>
    )
}

export default ResetPassword