import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
import { PiConfettiLight } from 'react-icons/pi';

const NAV_LINKS = [
  {
    section: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: <MdOutlineDashboard />, roles: ['admin','inventory_associate','agent','accountant','director'] },
    ],
  },
  {
    section: 'Inventory',
    items: [
      { to: '/manage-upcoming',   label: 'Upcoming',   icon: <MdEvent />,             roles: ['admin','inventory_associate','agent','accountant','director'] },
      { to: '/manage-inventory',  label: 'Inventory',  icon: <MdOutlineInventory2 />, roles: ['admin','inventory_associate','agent','accountant','director'] },
      { to: '/manage-varient',    label: 'Variants',   icon: <TbCodeVariablePlus />,  roles: ['admin','director'] },
      { to: '/manage-warehouses', label: 'Warehouses', icon: <IoLocationOutline />,   roles: ['admin','director'] },
    ],
  },
  {
    section: 'Commerce',
    items: [
      { to: '/manage-bookings', label: 'Bookings',    icon: <RiShoppingCartLine />,     roles: ['admin','agent','accountant','director'] },
      { to: '/manage-party',    label: 'Parties',     icon: <PiConfettiLight />,         roles: ['admin','director','accountant'] },
      { to: '/sales-report',    label: 'Sales Report',icon: <HiOutlineDocumentReport />, roles: ['admin','accountant','director'] },
    ],
  },
  {
    section: 'Admin',
    items: [
      { to: '/manage-users',   label: 'Users',   icon: <LuUsersRound />,   roles: ['admin','director'] },
      { to: '/manage-account', label: 'Account', icon: <FaRegUserCircle />, roles: ['admin','inventory_associate','agent','accountant','director'] },
    ],
  },
];

const Sidebar = ({ sidebar }) => {
  const { userData } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const [expanded, setExpanded] = useState(sidebar);

  useEffect(() => {
    setExpanded(sidebar);
  }, [sidebar]);

  const normalizeRole = (r = '') =>
    r.toString().toLowerCase().replace(/[^a-z0-9]/g, '');

  const roleKey = normalizeRole(userData?.role);

  const canSee = (roles = []) => {
    if (!userData) return false;
    if (roleKey === 'admin') return true;
    return roles.map((r) => r.toLowerCase().replace(/[^a-z0-9]/g, '')).includes(roleKey);
  };

  const sidebarWidth = expanded ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)';

  return (
    <nav
      className={style.Sidebar}
      style={{ width: sidebarWidth }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(sidebar)}
    >
      {/* Navigation */}
      <div className={style.navList}>
        {NAV_LINKS.map((section, si) => {
          const visibleItems = section.items.filter((ln) => canSee(ln.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={si}>
              {/* Section label */}
              <div className={`${style.sectionLabel} ${!expanded ? style.sectionLabelHidden : ''}`}>
                {section.section}
              </div>

              {visibleItems.map((ln, i) => (
                <NavLink
                  key={i}
                  to={ln.to}
                  title={!expanded ? ln.label : undefined}
                  className={`${style.navLink} ${location.pathname === ln.to ? style.activeLink : ''}`}
                >
                  <span className={style.navIcon}>{ln.icon}</span>
                  {expanded && <span className={style.navLabel}>{ln.label}</span>}
                </NavLink>
              ))}

              {si < NAV_LINKS.length - 1 && <div className={style.sidebarDivider} />}
            </div>
          );
        })}
      </div>

      {/* Bottom: Logout */}
      <div className={style.sidebarBottom}>
        <button className={style.logoutBtn} onClick={() => logoutUser(dispatch)}>
          <IoLogOutOutline />
          {expanded && <span className={style.navLabel}>Logout</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
