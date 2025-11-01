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
import Booking from './pages/Booking/Booking';
import User from './pages/User/User';
import Account from './pages/Account/Account';
import { getUser } from 'services/operations/authAPI';
import Varient from 'pages/Varient/Varient';
import { getAllVarients } from 'services/operations/varientAPI';
import Error from 'pages/Error/Error';
import NotVerified from 'pages/NotVerified/NotVerified';
import toast from 'react-hot-toast';
import { removeError, removeSuccess } from 'slices/loaderSlice';
import { OverlayProvider } from 'hooks/useOverlay';
import Cutter from 'pages/Cutter/Cutter';
import SalesReport from 'pages/SalesReport/SalesReport';
import Upcoming from 'pages/Upcoming/Upcoming';

function App() {
    //  If User Logged in
    const { isLogin, token, userData } = useSelector((state) => state.auth);
    const { loader, success, error } = useSelector((state) => state.loader);
    const [sidebar, setSidebar] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        if (loader.length > 0) {
            toast.loading("Loading...", { id: "loader" });
        } else {
            toast.dismiss("loader");
        }
    }, [loader]);

    useEffect(() => {
        success.forEach((s) => {
            // toast.success(s.message, { position: "bottom-right" });
            dispatch(removeSuccess(s.id))
        })
    }, [dispatch, success])
    useEffect(() => {
        error.forEach((s) => {
            toast.error(s.message, { position: "bottom-right" });
            dispatch(removeError(s.id))
        })
    }, [dispatch, error])


    useEffect(() => {
        if (!isLogin) {
            dispatch(setLoader(false));
        } else {
            getUser(dispatch);
            getAllVarients(dispatch);
        }

    }, [dispatch, isLogin])

    if (!isLogin || !token) {
        return <Auth />
    }

    if (!userData.isVerified) {
        return <NotVerified />
    }

    const triggerSidebar = () => {
        setSidebar(!sidebar);
    }

    return (
        <div className="App">
            <Navbar triggerSidebar={triggerSidebar} />
            <div className='main-container'>
                <Sidebar sidebar={sidebar} />
                <OverlayProvider>
                    <Routes>
                        <Route path='/' element={<Dashboard />} />
                        <Route path='/manage-varient' element={<Varient />} />
                        <Route path='/manage-inventory' element={<Inventory />} />
                        <Route path='/manage-upcoming' element={<Upcoming />} />
                        <Route path='/manage-cutters' element={<Cutter />} />
                        <Route path='/manage-bookings' element={<Booking />} />
                        <Route path='/sales-report' element={<SalesReport />} />
                        <Route path='/manage-users' element={<User />} />
                        <Route path='/manage-account' element={<Account />} />
                        <Route path='*' element={<Error />} />
                    </Routes>
                </OverlayProvider>
            </div>
        </div>
    );
}

export default App;
