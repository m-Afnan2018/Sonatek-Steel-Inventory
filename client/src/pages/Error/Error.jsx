import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import style from './Error.module.css';

const Error = () => {
    const navigate = useNavigate();

    return (
        <section className={style.Error}>
            <div className={style.card} role='alert' aria-live='polite'>
                <span className={style.code}>404</span>
                <h1>Page not found</h1>
                <p>The page you requested doesn't exist or has been moved. Use one of the actions below to continue.</p>

                <div className={style.actions}>
                    <button type='button' className={style.primary} onClick={() => navigate('/')}>Go to dashboard</button>
                    <Link to='/manage-inventory'>Open inventory</Link>
                </div>
            </div>
        </section>
    );
};

export default Error;
