// =======================
// Core Imports
// =======================
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

// =======================
// Styles
// =======================
import style from './Account.module.css';

// =======================
// API
// =======================
import { updateUser } from 'services/operations/userAPI';

const Account = () => {

    // =======================
    // Local State
    // =======================
    const [editted, setEditted] = useState(false);

    // =======================
    // Redux State
    // =======================
    const { userData } = useSelector((state) => state.auth);
    const { firstName, lastName, email, phoneNumber, role } = userData;

    const dispatch = useDispatch();

    // =======================
    // React Hook Form
    // =======================
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            firstName: firstName || '',
            lastName: lastName || '',
            email: email || '',
            phoneNumber: phoneNumber || '',
            designation: role || '',
        },
    });

    // =======================
    // Sync Form with User Data
    // =======================
    useEffect(() => {
        reset({
            firstName: firstName || '',
            lastName: lastName || '',
            email: email || '',
            phoneNumber: phoneNumber || '',
            designation: role || '',
        });
    }, [userData, reset, firstName, lastName, email, phoneNumber, role]);

    // =======================
    // Form Handlers
    // =======================
    const onSubmit = (data) => {
        updateUser(data, dispatch);
        setEditted(false);
    };

    const handleCancel = () => {
        reset();
        setEditted(false);
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setEditted(true);
    };

    // =======================
    // Render
    // =======================
    return (
        <div className={style.Account}>
            <h2 className='main-heading'>Manage Account</h2>

            <form onSubmit={handleSubmit(onSubmit)}>

                {/* First Name */}
                <div>
                    <label>Your first name</label>
                    <input
                        type="text"
                        {...register('firstName', {
                            required: 'First name is required',
                            minLength: {
                                value: 2,
                                message: 'Minimum 2 characters required',
                            },
                        })}
                        style={{
                            backgroundColor: editted
                                ? 'var(--bg-elevated)'
                                : 'var(--bg-hover)',
                        }}
                        disabled={!editted}
                    />
                    {errors.firstName && (
                        <span className={style.error}>
                            {errors.firstName.message}
                        </span>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <label>Your last name</label>
                    <input
                        type="text"
                        {...register('lastName', {
                            required: 'Last name is required',
                            minLength: {
                                value: 2,
                                message: 'Minimum 2 characters required',
                            },
                        })}
                        style={{
                            backgroundColor: editted
                                ? 'var(--bg-elevated)'
                                : 'var(--bg-hover)',
                        }}
                        disabled={!editted}
                    />
                    {errors.lastName && (
                        <span className={style.error}>
                            {errors.lastName.message}
                        </span>
                    )}
                </div>

                {/* Phone Number */}
                <div>
                    <label>Your phone number</label>
                    <input
                        type="tel"
                        {...register('phoneNumber', {
                            required: 'Phone number is required',
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message:
                                    'Please enter a valid 10-digit phone number',
                            },
                        })}
                        style={{
                            backgroundColor: editted
                                ? 'var(--bg-elevated)'
                                : 'var(--bg-hover)',
                        }}
                        disabled={!editted}
                    />
                    {errors.phoneNumber && (
                        <span className={style.error}>
                            {errors.phoneNumber.message}
                        </span>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label>Your email address</label>
                    <input
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value:
                                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        })}
                        disabled
                    />
                    {errors.email && (
                        <span className={style.error}>
                            {errors.email.message}
                        </span>
                    )}
                </div>

                {/* Designation */}
                <div>
                    <label>Your Designation</label>
                    <input
                        type="text"
                        {...register('designation')}
                        disabled
                    />
                </div>

                {/* Action Buttons */}
                {editted ? (
                    <div>
                        <button type="submit">Save</button>
                        <button type="button" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div>
                        <button type="button" onClick={handleEdit}>
                            Edit
                        </button>
                    </div>
                )}

            </form>
        </div>
    );
};

export default Account;
