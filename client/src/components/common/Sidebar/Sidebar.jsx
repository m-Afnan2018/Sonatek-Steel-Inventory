import React from 'react'
import style from './Sidebar.module.css';
import { NavLink, useLocation } from 'react-router-dom';
import { logoutUser } from 'services/operations/authAPI';
import { useDispatch, useSelector } from 'react-redux';

const Sidebar = ({ sidebar }) => {

    const { userData } = useSelector(state => state.auth);
    const location = useLocation()
    const dispatch = useDispatch();

    // normalize role to a compact key for comparisons
    const normalizeRole = (r) => (r || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const roleKey = normalizeRole(userData?.role);


    const logout = () => {
        logoutUser(dispatch);
    }
    const links = [
        { to: '/', label: 'Dashboard', roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-inventory', label: 'Manage Inventory', roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-varient', label: 'Manage Varients', roles: ['admin'] },
        { to: '/manage-cutters', label: 'Manage Cutters', roles: ['admin'] },
        { to: '/manage-bookings', label: 'Manage Booking', roles: ['admin', 'agent', 'accountant', 'director'] },
        { to: '/manage-users', label: 'Manange Users', roles: ['admin', 'director'] },
        { to: '/manage-account', label: 'Manange Account', roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
    ];

    const canSee = (linkRoles = []) => {
        if (!userData) return false;
        if (roleKey === 'admin') return true; // admin sees everything
        // normalize allowed roles
        const normalized = linkRoles.map(r => r.toString().toLowerCase().replace(/[^a-z0-9]/g, ''));
        return normalized.includes(roleKey);
    }

    return (
        <div className={style.Sidebar} style={{ width: sidebar ? '200px' : '0px' }}>
            <div>
                {links.map((ln) => (
                    canSee(ln.roles) && (
                        <NavLink key={ln.to} className={`${location.pathname === ln.to ? style.activeLink : ''} ${style.navlinks}`} to={ln.to}>{ln.label}</NavLink>
                    )
                ))}
            </div>

            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default Sidebar