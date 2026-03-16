import React from 'react'
import style from './Navbar.module.css';
import logo from 'assets/images/logo.svg'
import { RiMenu2Fill } from "react-icons/ri";
import { useSelector } from 'react-redux';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';

const Navbar = ({ triggerSidebar, theme, toggleTheme }) => {
  const { userData } = useSelector(state => state.auth);

  return (
    <div className={style.Navbar}>
      <RiMenu2Fill onClick={triggerSidebar} />
      <img src={logo} alt='logo' />
      <div className={style.rightSection}>
        <button type='button' onClick={toggleTheme} className={style.themeButton}>
          {theme === 'dark' ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
        </button>

        <div className={style.userDetail}>
          <h2>{`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()}</h2>
          <h2>({userData?.role || 'User'})</h2>
        </div>
      </div>
    </div>
  )
}

export default Navbar
