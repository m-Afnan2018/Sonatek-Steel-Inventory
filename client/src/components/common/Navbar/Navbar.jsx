import React from 'react'
import style from './Navbar.module.css';
import logo from 'assets/images/logo.svg'
import { RiMenu2Fill } from "react-icons/ri";

const Navbar = ({triggerSidebar}) => {
  return (
    <div className={style.Navbar}>
      <RiMenu2Fill onClick={triggerSidebar}/>
      <img src={logo} alt='logo' />
    </div>
  )
}

export default Navbar