import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css';
import Auth from './pages/Auth/Auth';
import { setLoader } from './slices/authSlice';
import { useEffect } from 'react';

function App() {
    //  If User Logged in
    const { isLogin } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogin) {
            dispatch(setLoader(false));
        }
    }, [dispatch, isLogin])

    if (!isLogin) {
        return <Auth />
    }

    return (
        <div className="App">
            
        </div>
    );
}

export default App;
