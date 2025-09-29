import React, { useState } from 'react'
import style from './Auth.module.css';
import { useDispatch } from 'react-redux';
import { sendLink } from '../../../services/operations/authAPI';

const ForgetPassword = ({ setPath }) => {
    const [email, setEmail] = useState('');

    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault();

        sendLink(email, dispatch);
    }
    return (
        <div className={`${style.Auth} ${style.ForgetPassword}`}>
            <form onSubmit={onSubmit} className={style.form}>
                <div>
                    <label>Email</label>
                    <input type='email' value={email} placeholder='username@email.com' onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button>Send Reset Password link</button>
            </form>
            <div className={style.horizontalLine}></div>
            <h3>Remember your password ? <span onClick={() => setPath('login')} className={style.blueText}>Login</span></h3>
        </div>
    )
}

export default ForgetPassword