import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import style from './Sidebar.module.css';
import { logoutUser } from 'services/operations/authAPI';
import { MdOutlineDashboard, MdOutlineInventory2, MdEvent } from 'react-icons/md';
import { TbCodeVariablePlus } from 'react-icons/tb';
import { IoLocationOutline, IoLogOutOutline } from 'react-icons/io5';
import { RiShoppingCartLine } from 'react-icons/ri';
import { LuUsersRound } from 'react-icons/lu';
import { FaRegUserCircle } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';

const Sidebar = ({ sidebar }) => {
    const { userData } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [currentSidebar, setCurrentSidebar] = useState(sidebar);

    useEffect(() => {
        setCurrentSidebar(sidebar);
    }, [sidebar]);

    const normalizeRole = (roleValue) =>
        (roleValue || '')
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

    const roleKey = normalizeRole(userData?.role);

    const canSee = (roles = []) => {
        if (!userData) return false;
        if (roleKey === 'admin') return true;
        return roles.some((role) => normalizeRole(role) === roleKey);
    };

    const logout = () => logoutUser(dispatch);

    const links = [
        { to: '/', label: 'Dashboard', icon: <MdOutlineDashboard />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-upcoming', label: 'Upcoming', icon: <MdEvent />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-inventory', label: 'Inventory', icon: <MdOutlineInventory2 />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
        { to: '/manage-bookings', label: 'Bookings', icon: <RiShoppingCartLine />, roles: ['admin', 'agent', 'accountant', 'director'] },
        { to: '/manage-users', label: 'Users', icon: <LuUsersRound />, roles: ['admin', 'director'] },
        { to: '/manage-varient', label: 'Varients', icon: <TbCodeVariablePlus />, roles: ['admin'] },
        { to: '/manage-warehouses', label: 'Warehouse', icon: <IoLocationOutline />, roles: ['admin'] },
        { to: '/sales-report', label: 'Sales Report', icon: <HiOutlineDocumentReport />, roles: ['admin', 'accountant', 'director'] },
        { to: '/manage-party', label: 'Party', icon: <IoLocationOutline />, roles: ['admin'] },
        { to: '/manage-account', label: 'Account', icon: <FaRegUserCircle />, roles: ['admin', 'inventory_associate', 'agent', 'accountant', 'director'] },
    ];

    return (
        <aside
            className={`${style.Sidebar} ${!currentSidebar ? style.collapsed : ''}`}
            onMouseEnter={() => setCurrentSidebar(true)}
            onMouseLeave={() => setCurrentSidebar(sidebar)}
            aria-label='Sidebar navigation'
        >
            <nav>
                {links.map((linkItem) => {
                    if (!canSee(linkItem.roles)) return null;
                    return (
                        <NavLink
                            key={linkItem.to}
                            to={linkItem.to}
                            className={({ isActive }) => `${style.navlinks} ${isActive ? style.activeLink : ''}`}
                            title={!currentSidebar ? linkItem.label : ''}
                        >
                            <span className={style.icon}>{linkItem.icon}</span>
                            {currentSidebar && <span>{linkItem.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            <button type='button' onClick={logout} className={style.logoutButton}>
                <IoLogOutOutline />
                {currentSidebar && <span>Logout</span>}
            </button>
        </aside>
    );
};

export default Sidebar;
