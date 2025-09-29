import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Auth from './pages/Auth/Auth';
import { setLoader } from './slices/authSlice';

function App() {
    //  If User Logged in
    const { isLogin } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    if(!isLogin){
        dispatch(setLoader(false));
    }

    if (!isLogin) {
        return <Auth />
    }

    return (
        <div className="App">

        </div>
    );
}

export default App;
