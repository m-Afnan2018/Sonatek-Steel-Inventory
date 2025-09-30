import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom'
import './App.css';
import Auth from './pages/Auth/Auth';
import { setLoader } from './slices/authSlice';
import { useEffect, useState } from 'react';
import Navbar from './components/common/Navbar/Navbar';
import Sidebar from './components/common/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Order from './pages/Order/Order';
import User from './pages/User/User';
import Account from './pages/Account/Account';
import { getUser } from 'services/operations/authAPI';

function App() {
    //  If User Logged in
    const { isLogin, token } = useSelector((state) => state.auth);
    const [sidebar, setSidebar] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (!isLogin) {
            dispatch(setLoader(false));
        }else{
            getUser(dispatch);
        }

    }, [dispatch, isLogin])

    if (!isLogin || !token) {
        return <Auth />
    }

    const triggerSidebar = () => {
        setSidebar(!sidebar);
    }

    return (
        <div className="App">
            <Navbar triggerSidebar={triggerSidebar} />
            <div className='main-container'>
                <Sidebar sidebar={sidebar}/>
                <Routes>
                    <Route path='/' element={<Dashboard />} />
                    <Route path='/manage-inventory' element={<Inventory />} />
                    <Route path='/manage-orders' element={<Order />} />
                    <Route path='/manage-users' element={<User />} />
                    <Route path='/manage-account' element={<Account />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
