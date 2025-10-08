import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import style from './Auth.module.css'
import { FiEye, FiEyeOff } from "react-icons/fi";
import { login } from '../../../services/operations/authAPI';
import { setIsLogin } from '../../../slices/authSlice';

const Login = ({ setPath }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setshowPassword] = useState(false);

    const dispatch = useDispatch()

    const onSubmit = async (e) => {
        e.preventDefault();

        const response = await login(email, password, dispatch)

        if (response) {
            dispatch(setIsLogin(true));
        }
    }

    return (
        <div className={`${style.Auth} ${style.Login}`}>
            <form onSubmit={onSubmit} className={style.form}>
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
                        <div className={style.blueText} onClick={() => setPath('forgetPassword')}>Forget Password ?</div>
                    </div>
                </div>
                <button>Login</button>
            </form>
            <div className={style.horizontalLine}></div>
            <h3>Don't have an account ? <span className={style.blueText} onClick={() => setPath('signup')}>Create an account</span></h3>
        </div>
    )
}

export default Login