import React from 'react';
import Logo from 'assets/images/Logo.png';
import style from './Navbar.module.css';
import { useSelector } from 'react-redux';
import { RiMenu2Fill } from 'react-icons/ri';
import { IoNotificationsOutline } from 'react-icons/io5';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

const Navbar = ({ triggerSidebar, theme, toggleTheme }) => {
  const { userData } = useSelector((state) => state.auth);

  const initials = userData
    ? `${(userData.firstName || '')[0] || ''}${(userData.lastName || '')[0] || ''}`.toUpperCase()
    : '??';

  const formatRole = (role = '') =>
    role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className={style.Navbar}>
      {/* Hamburger */}
      <button className={style.menuToggle} onClick={triggerSidebar} aria-label="Toggle sidebar">
        <RiMenu2Fill />
      </button>

      {/* Logo */}
      <div className={style.logo}>
        <img src={Logo} alt="Sonatek Steel logo" style={{ filter: theme === 'dark' ? 'invert(0)' : 'invert(1)' }} />
      </div>

      <div className={style.spacer} />

      <div className={style.rightSection}>
        {/* Theme toggle */}
        <button
          className={style.iconBtn}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
        </button>

        {/* Notification */}
        {/* <div className={style.iconBtn} title="Notifications">
          <IoNotificationsOutline />
          <span className={style.badge} />
        </div> */}

        {/* User */}
        <div className={style.userPill}>
          <div className={style.avatar}>{initials}</div>
          <div className={style.userInfo}>
            <span className={style.userName}>
              {userData ? `${userData.firstName} ${userData.lastName}` : '—'}
            </span>
            <span className={style.userRole}>
              {formatRole(userData?.role)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
