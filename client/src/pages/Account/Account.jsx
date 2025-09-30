import React, { useState } from 'react'
import style from './Account.module.css'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'

const Account = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const [editted, setEditted] = useState(false);

    const { userData } = useSelector(state => state.auth)

    const { firstName, lastName, email } = userData;

    console.log(userData);

    const onSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <div className={style.Account}>
            <h2>Manage Account</h2>

            <form onSubmit={onSubmit}>
                <div>
                    <label>Your first name</label>
                    <input type='text' value={firstName}/>
                </div>
                <div>
                    <label>Your last name</label>
                    <input type='text' value={lastName}/>
                </div>
                <div>
                    <label>Your email address</label>
                    <input type='email' value={email}/>
                </div>
                <div>
                    <label>Your Designation</label>
                    <input type='email' value={email}/>
                </div>
                {editted ? <div>
                    <button>Save</button>
                    <button onClick={()=>setEditted(false)}>Cancel</button>
                </div> : <div>
                    <button onClick={()=>setEditted(true)}>Edit</button>
                </div>}
            </form>
        </div>
    )
}

export default Account