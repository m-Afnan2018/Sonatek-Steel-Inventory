import React from 'react';
import style from './Navbar.module.css';
import logo from 'assets/images/logo.svg';
import { RiMenu2Fill } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

const Navbar = ({ triggerSidebar, theme, toggleTheme }) => {
    const { userData } = useSelector((state) => state.auth);

    return (
        <header className={style.Navbar}>
            <button
                type='button'
                className={style.menuButton}
                onClick={triggerSidebar}
                aria-label='Toggle sidebar menu'
            >
                <RiMenu2Fill />
            </button>

            <div className={style.brandSection}>
                <img src={logo} alt='Sonatek Steel logo' />
                <p>Inventory Platform</p>
            </div>

            <div className={style.rightSection}>
                <button
                    type='button'
                    onClick={toggleTheme}
                    className={style.themeButton}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
                    <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
                </button>

                <div className={style.userDetail}>
                    <h2>{`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'User'}</h2>
                    <h3>{userData?.role || 'viewer'}</h3>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
