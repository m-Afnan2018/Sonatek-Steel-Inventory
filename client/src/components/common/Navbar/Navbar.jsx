import React from 'react'
import style from './Navbar.module.css';
import logo from 'assets/images/logo.svg'
import { RiMenu2Fill } from "react-icons/ri";
import { useSelector } from 'react-redux';

const Navbar = ({ triggerSidebar }) => {
  const { userData } = useSelector(state => state.auth);
  return (
    <div className={style.Navbar}>
      <RiMenu2Fill onClick={triggerSidebar} />
      <img src={logo} alt='logo' />
      <div>
        <h2>{`${userData.firstName} ${userData.lastName}`}</h2>
        <h2>({userData.role})</h2>
      </div>
    </div>
  )
}

export default Navbar