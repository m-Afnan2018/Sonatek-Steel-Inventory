import React, { useEffect, useState } from 'react'
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
    const location = useLocation();
    const dispatch = useDispatch();

    const [currentSidebar, setCurrentSidebar] = useState(sidebar);
    const [openMenu, setOpenMenu] = useState(null);

    useEffect(() => setCurrentSidebar(sidebar), [sidebar]);

    const normalizeRole = (r) => (r || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const roleKey = normalizeRole(userData?.role);

    const logout = () => logoutUser(dispatch);

    const canSee = (roles = []) => {
        if (!userData) return false;
        if (roleKey === 'admin') return true;
        const normalized = roles.map(r => r.toLowerCase().replace(/[^a-z0-9]/g, ''));
        return normalized.includes(roleKey);
    }

    // MENU CONFIG
    const links = [
        { to: '/', label: 'Dashboard', icon: <MdOutlineDashboard />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-upcoming', label: 'Upcoming', icon: <MdEvent />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-inventory', label: 'Inventory', icon: <MdOutlineInventory2 />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        {
            label: 'Bookings', icon: <RiShoppingCartLine />, roles: ['admin', 'agent', 'accountant', 'director'],
            children: [
                { to: '/booking/create', label: 'Create' },
                { to: '/manage-bookings', label: 'View' },
                { to: '/booking/pending', label: 'Pending' },
                { to: '/action-required', label: 'Action Required' },
                { to: '/booking-report', label: 'Report' },
            ]
        },

        {
            label: 'Users', icon: <LuUsersRound />, roles: ['admin', 'director'],
            children: [
                { to: '/manage-users', label: 'All Users' },
                { to: '/inactive-users', label: 'Inactive Users' },
                { to: '/pending-requests', label: 'Pending Requests' }
            ]
        },
        {
            to: '/manage-varient', label: 'Varients', icon: <TbCodeVariablePlus />, roles: ['admin'],
            children: [
                { to: '/thickness', label: 'Thickness' },
                { to: '/width', label: 'Width' },
                { to: '/grade', label: 'Grade' },
            ]
        },
        // { to: '/manage-varient', label: 'Varients', icon: <TbCodeVariablePlus />, roles: ['admin'] },
        { to: '/manage-warehouses', label: 'Warehouse', icon: <IoLocationOutline />, roles: ['admin'] },
        { to: '/sales-report', label: 'Sales Report', icon: <HiOutlineDocumentReport />, roles: ['admin', 'accountant', 'director'] },
        { to: '/manage-party', label: 'Party', icon: <IoLocationOutline />, roles: ['admin'] },
        { to: '/manage-account', label: 'Account', icon: <FaRegUserCircle />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] }
    ];

    return (
        <div
            className={style.Sidebar}
            style={{ width: currentSidebar ? '250px' : '70px', padding: '0.25rem' }}
            onMouseEnter={() => setCurrentSidebar(true)}
            onMouseLeave={() => setCurrentSidebar(sidebar)}
        >
            <div>
                {links.map((ln, i) => {
                    if (!canSee(ln.roles)) return null;

                    if (!ln.children) {
                        // SINGLE LINK
                        return (
                            <NavLink
                                key={i}
                                to={ln.to}
                                className={`${location.pathname === ln.to ? style.activeLink : ''} ${style.navlinks}`}
                            // style={{ justifyContent: currentSidebar ? 'flex-start' : 'center' }}
                            >
                                <span style={{ minWidth: '30px' }}>{ln.icon}</span> {currentSidebar && ln.label}
                            </NavLink>
                        );
                    }

                    // PARENT WITH CHILDREN
                    return (
                        <div key={i}>
                            <div
                                className={style.navlinks}
                                onClick={() => setOpenMenu(openMenu === ln.label ? null : ln.label)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span style={{ minWidth: '30px' }}>{ln.icon}</span> {currentSidebar && ln.label}
                            </div>

                            <div
                                className={`${style.submenuWrapper} ${openMenu === ln.label && currentSidebar ? style.open : ''}`}
                                style={{ maxHeight: openMenu === ln.label && currentSidebar ? `${ln.children.length * 2}rem` : "0px" }}
                            >
                                {ln.children.map((child, idx) => (
                                    <NavLink
                                        key={idx}
                                        to={child.to}
                                        className={`${location.pathname === child.to ? style.activeLink : ''} ${style.subLink}`}
                                    >
                                        ▸ {child.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button onClick={logout}><IoLogOutOutline /> Logout</button>
        </div>
    )
}

export default Sidebar
