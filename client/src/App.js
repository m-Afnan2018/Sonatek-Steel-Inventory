// =======================
// Core Imports
// =======================
import './App.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import toast from 'react-hot-toast';
import { OverlayProvider } from 'hooks/useOverlay';

// =======================
// Pages
// =======================
import Account from './pages/Account/Account';
import Auth from './pages/Auth/Auth';
import Booking from './pages/Booking/Booking';
import Create from 'pages/Booking/Create';
import Dashboard from './pages/Dashboard/Dashboard';
import Error from 'pages/Error/Error';
import Inventory from './pages/Inventory/Inventory';
import NotVerified from 'pages/NotVerified/NotVerified';
import Party from 'pages/Party/Party';
import Pending from 'pages/Booking/Pending';
import SalesReport from 'pages/SalesReport/SalesReport';
import Upcoming from 'pages/Upcoming/Upcoming';
import User from './pages/User/User';
import Varient from 'pages/Varient/Varient';
import Warehouse from 'pages/Warehouse/Warehouse';

// =======================
// Common Components
// =======================
import Navbar from './components/common/Navbar/Navbar';
import Sidebar from './components/common/Sidebar/Sidebar';

// =======================
// Redux Slices
// =======================
import { setLoader } from './slices/authSlice';
import { removeError, removeSuccess } from 'slices/loaderSlice';

// =======================
// API Calls
// =======================
import { getUser } from 'services/operations/authAPI';
import { getAllVarients } from 'services/operations/varientAPI';

function App() {

    // =======================
    // Redux State
    // =======================
    const { isLogin, token, userData } = useSelector((state) => state.auth);
    const { loader, success, error } = useSelector((state) => state.loader);

    // =======================
    // Local State
    // =======================
    const [sidebar, setSidebar] = useState(false);
    const dispatch = useDispatch();

    // =======================
    // Loader Toast Handling
    // =======================
    useEffect(() => {
        if (loader.length > 0) {
            toast.loading("Loading...", { id: "loader" });
        } else {
            toast.dismiss("loader");
        }
    }, [loader]);

    // =======================
    // Success Toast Handling
    // =======================
    useEffect(() => {
        success.forEach((s) => {
            toast.success(s.message);
            dispatch(removeSuccess(s.id));
        });
    }, [dispatch, success]);

    // =======================
    // Error Toast Handling
    // =======================
    useEffect(() => {
        error.forEach((s) => {
            toast.error(s.message, { position: "bottom-right" });
            dispatch(removeError(s.id));
        });
    }, [dispatch, error]);

    // =======================
    // Auth & Initial Data Load
    // =======================
    useEffect(() => {
        if (!isLogin) {
            dispatch(setLoader(false));
        } else {
            getUser(dispatch);
            getAllVarients(dispatch);
        }
    }, [dispatch, isLogin]);

    // =======================
    // Auth Guards
    // =======================
    if (!isLogin || !token) {
        return <Auth />;
    }

    if (!userData) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!userData.isVerified) {
        return <NotVerified />;
    }

    // =======================
    // UI Handlers
    // =======================
    const triggerSidebar = () => {
        setSidebar(!sidebar);
    };

    // =======================
    // Main Render
    // =======================
    return (
        <div className="App">
            <Navbar triggerSidebar={triggerSidebar} />

            <div className="main-container">
                <Sidebar sidebar={sidebar} />

                <OverlayProvider>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />

                        <Route path="/booking">
                            <Route path="create" element={<Create />} />
                            <Route path="pending" element={<Pending />} />
                        </Route>

                        <Route path="/manage-varient" element={<Varient />} />
                        <Route path="/manage-inventory" element={<Inventory />} />
                        <Route path="/manage-upcoming" element={<Upcoming />} />
                        <Route path="/manage-warehouses" element={<Warehouse />} />
                        <Route path="/manage-bookings" element={<Booking />} />
                        <Route path="/sales-report" element={<SalesReport />} />
                        <Route path="/manage-party" element={<Party />} />
                        <Route path="/manage-users" element={<User />} />
                        <Route path="/manage-account" element={<Account />} />

                        <Route path="*" element={<Error />} />
                    </Routes>
                </OverlayProvider>
            </div>
        </div>
    );
}

export default App;
