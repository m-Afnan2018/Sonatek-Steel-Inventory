// =======================
// Core Imports
// =======================
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// =======================
// Styles
// =======================
import style from './Sidebar.module.css';

// =======================
// API
// =======================
import { logoutUser } from 'services/operations/authAPI';

// =======================
// Icons
// =======================
import { MdOutlineDashboard } from 'react-icons/md';
import { MdOutlineInventory2 } from 'react-icons/md';
import { MdEvent } from 'react-icons/md';
import { TbCodeVariablePlus } from 'react-icons/tb';
import { IoLocationOutline, IoLogOutOutline } from 'react-icons/io5';
import { RiShoppingCartLine } from 'react-icons/ri';
import { LuUsersRound } from 'react-icons/lu';
import { FaRegUserCircle } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';

const Sidebar = ({ sidebar }) => {

    // =======================
    // Redux & Router
    // =======================
    const { userData } = useSelector((state) => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();

    // =======================
    // Local State
    // =======================
    const [currentSidebar, setCurrentSidebar] = useState(sidebar);
    const [openMenu, setOpenMenu] = useState(null);

    // =======================
    // Sync Sidebar State
    // =======================
    useEffect(() => {
        setCurrentSidebar(sidebar);
    }, [sidebar]);

    // =======================
    // Role Helpers
    // =======================
    const normalizeRole = (r) =>
        (r || '')
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

    const roleKey = normalizeRole(userData?.role);

    const canSee = (roles = []) => {
        if (!userData) return false;
        if (roleKey === 'admin') return true;

        const normalizedRoles = roles.map((r) =>
            r.toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        return normalizedRoles.includes(roleKey);
    };

    // =======================
    // Actions
    // =======================
    const logout = () => logoutUser(dispatch);

    // =======================
    // Sidebar Menu Config
    // =======================
    const links = [
        {
            to: '/',
            label: 'Dashboard',
            icon: <MdOutlineDashboard />,
            roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'],
        },
        {
            to: '/manage-upcoming',
            label: 'Upcoming',
            icon: <MdEvent />,
            roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'],
        },
        {
            to: '/manage-inventory',
            label: 'Inventory',
            icon: <MdOutlineInventory2 />,
            roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'],
        },
        {
            to: '/manage-bookings',
            label: 'Bookings',
            icon: <RiShoppingCartLine />,
            roles: ['admin', 'agent', 'accountant', 'director'],
        },
        {
            to: '/manage-users',
            label: 'Users',
            icon: <LuUsersRound />,
            roles: ['admin', 'director'],
        },
        {
            to: '/manage-varient',
            label: 'Varients',
            icon: <TbCodeVariablePlus />,
            roles: ['admin'],
        },
        {
            to: '/manage-warehouses',
            label: 'Warehouse',
            icon: <IoLocationOutline />,
            roles: ['admin'],
        },
        {
            to: '/sales-report',
            label: 'Sales Report',
            icon: <HiOutlineDocumentReport />,
            roles: ['admin', 'accountant', 'director'],
        },
        {
            to: '/manage-party',
            label: 'Party',
            icon: <IoLocationOutline />,
            roles: ['admin'],
        },
        {
            to: '/manage-account',
            label: 'Account',
            icon: <FaRegUserCircle />,
            roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'],
        },
    ];

    // =======================
    // Render
    // =======================
    return (
        <div
            className={style.Sidebar}
            style={{
                width: currentSidebar ? '250px' : '70px',
                padding: '0.25rem',
            }}
            onMouseEnter={() => setCurrentSidebar(true)}
            onMouseLeave={() => setCurrentSidebar(sidebar)}
        >
            <div>
                {links.map((ln, i) => {
                    if (!canSee(ln.roles)) return null;

                    // =======================
                    // Single Link
                    // =======================
                    if (!ln.children) {
                        return (
                            <NavLink
                                key={i}
                                to={ln.to}
                                className={`${location.pathname === ln.to ? style.activeLink : ''} ${style.navlinks}`}
                            >
                                <span style={{ minWidth: '30px' }}>
                                    {ln.icon}
                                </span>
                                {currentSidebar && ln.label}
                            </NavLink>
                        );
                    }

                    // =======================
                    // Parent with Submenu
                    // =======================
                    return (
                        <div key={i}>
                            <div
                                className={style.navlinks}
                                onClick={() =>
                                    setOpenMenu(openMenu === ln.label ? null : ln.label)
                                }
                                style={{ cursor: 'pointer' }}
                            >
                                <span style={{ minWidth: '30px' }}>
                                    {ln.icon}
                                </span>
                                {currentSidebar && ln.label}
                            </div>

                            <div
                                className={`${style.submenuWrapper} ${openMenu === ln.label && currentSidebar
                                    ? style.open
                                    : ''
                                    }`}
                                style={{
                                    maxHeight:
                                        openMenu === ln.label && currentSidebar
                                            ? `${ln.children.length * 2}rem`
                                            : '0px',
                                }}
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

            {/* Logout */}
            <button onClick={logout}>
                <IoLogOutOutline /> Logout
            </button>
        </div>
    );
};

export default Sidebar;
