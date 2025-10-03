import React from 'react'
import style from './Sidebar.module.css';
import { NavLink, useLocation } from 'react-router-dom';
import { logoutUser } from 'services/operations/authAPI';
import { useDispatch, useSelector } from 'react-redux';

const Sidebar = ({ sidebar }) => {

    const { userData } = useSelector(state => state.auth);
    const location = useLocation()
    const dispatch = useDispatch();

    const logout = () => {
        logoutUser(dispatch);
    }

    console.log(userData);

    return (
        <div className={style.Sidebar} style={{ width: sidebar ? '256px' : '0px' }}>
            <div>
                <NavLink className={`${location.pathname === '/' ? style.activeLink : ''} ${style.navlinks}`} to={'/'}>Dashboard</NavLink>
                <NavLink className={`${location.pathname === '/manage-varient' ? style.activeLink : ''} ${style.navlinks}`} to={'/manage-varient'}>Manage Varients</NavLink>
                <NavLink className={`${location.pathname === '/manage-inventory' ? style.activeLink : ''} ${style.navlinks}`} to={'/manage-inventory'}>Manage Inventory</NavLink>
                <NavLink className={`${location.pathname === '/manage-orders' ? style.activeLink : ''} ${style.navlinks}`} to={'/manage-orders'}>Manage Orders</NavLink>
                {(userData.role === 'admin' || userData.role === 'director') && <NavLink className={`${location.pathname === '/manage-users' ? style.activeLink : ''} ${style.navlinks}`} to={'/manage-users'}>Manange Users</NavLink>}
                <NavLink className={`${location.pathname === '/manage-account' ? style.activeLink : ''} ${style.navlinks}`} to={'/manage-account'}>Manange Account</NavLink>
            </div>

            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default Sidebar