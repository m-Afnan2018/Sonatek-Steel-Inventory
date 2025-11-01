import React from 'react'
import style from './Sidebar.module.css';
import { NavLink, useLocation } from 'react-router-dom';
import { logoutUser } from 'services/operations/authAPI';
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineDashboard } from "react-icons/md";
import { MdOutlineInventory2 } from "react-icons/md";
import { TbCodeVariablePlus } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { RiShoppingCartLine } from "react-icons/ri";
import { LuUsersRound } from "react-icons/lu";
import { FaRegUserCircle } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdEvent } from "react-icons/md";

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
        { to: '/', label: 'Dashboard', icon: <MdOutlineDashboard />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-inventory', label: 'Inventory', icon: <MdOutlineInventory2 />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-upcoming', label: 'Upcoming', icon: <MdEvent />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-varient', label: 'Varients', icon: <TbCodeVariablePlus />, roles: ['admin'] },
        { to: '/manage-cutters', label: 'Cutters', icon: <IoLocationOutline />, roles: ['admin'] },
        { to: '/manage-bookings', label: 'Booking', icon: <RiShoppingCartLine />, roles: ['admin', 'agent', 'accountant', 'director'] },
        { to: '/sales-report', label: 'Sales Report', icon: <HiOutlineDocumentReport />, roles: ['admin', 'accountant', 'director'] },
        { to: '/manage-users', label: 'Users', icon: <LuUsersRound />, roles: ['admin', 'director'] },
        { to: '/manage-account', label: 'Account', icon: <FaRegUserCircle />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
    ];

    const canSee = (linkRoles = []) => {
        if (!userData) return false;
        if (roleKey === 'admin') return true; // admin sees everything
        // normalize allowed roles
        const normalized = linkRoles.map(r => r.toString().toLowerCase().replace(/[^a-z0-9]/g, ''));
        return normalized.includes(roleKey);
    }

    return (
        <div className={style.Sidebar} style={{ width: sidebar ? '250px' : '0px', padding: sidebar ? '0.25rem' : '0px' }}>
            <div>
                {links.map((ln) => (
                    canSee(ln.roles) && (
                        <NavLink key={ln.to} className={`${location.pathname === ln.to ? style.activeLink : ''} ${style.navlinks}`} to={ln.to}>{ln.icon} {ln.label}</NavLink>
                    )
                ))}
            </div>

            <button onClick={logout}><IoLogOutOutline /> Logout</button>
        </div>
    )
}

export default Sidebar