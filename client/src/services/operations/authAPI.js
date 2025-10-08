import toast from "react-hot-toast";
import { setIsLogin, setLoader, setToken, setUserData } from "../../slices/authSlice";
import { apiConnector } from "../apiConnector";
import { authEndpoints } from "../apis";


export async function login(email, password, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        dispatch(setLoader(true));

        const response = await apiConnector('POST', authEndpoints.LOGIN, {
            email, password
        });

        localStorage.setItem('isLogin', true);
        dispatch(setUserData(response.data.user));
        dispatch(setToken(response.data.token));

        dispatch(setLoader(false));

        toast.dismiss(toastId)
        toast.success('Successfully Logged in')
        return true;
    } catch (err) {
        toast.dismiss(toastId);
        if (err?.response?.data?.message) {
            toast.error(err.response.data.message)
        }
        dispatch(setLoader(false));
        return false;
    }
}

export async function signup(firstName, lastName, email, password, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        dispatch(setLoader(true));
        const response = (await apiConnector('POST', authEndpoints.SIGNUP, {
            firstName, lastName, email, password
        })).data

        dispatch(setLoader(false));
        toast.dismiss(toastId);
        toast.success(response.message);
        return true;
    } catch (err) {
        dispatch(setLoader(false));
        toast.dismiss(toastId);
        if (err?.response?.data?.message) {
            toast.error(err.response.data.message)
        }
        return false;
    }
}

export async function sendLink(email, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        dispatch(setLoader(true));
        dispatch(setIsLogin(false))

        const response = (await apiConnector('POST', authEndpoints.FORGET_PASSWORD, {
            email
        })).data;
        toast.dismiss(toastId);
        toast.success(response.message);
        dispatch(setLoader(false));
        return true;
    } catch (err) {
        dispatch(setLoader(false));
        toast.dismiss(toastId);
        if (err?.response?.data?.message) {
            toast.error(err.response.data.message)
        }
        return false;
    }
}

export async function getUser(dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector('GET', authEndpoints.GET_USER);


        if (response.data.success) {
            dispatch(setUserData(response.data.user));
            dispatch(setToken(response.data.token));
        }

        dispatch(setLoader(false))

        toast.dismiss(toastId);
        toast.success(response.data.message);
    } catch (err) {
        localStorage.removeItem('isLogin');
        toast.dismiss(toastId);
        if (err?.response?.data?.message) {
            toast.error(err.response.data.message)
        }
        dispatch(setLoader(false))
    }
}

export async function logoutUser(dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('GET', authEndpoints.LOGOUT_USER)).data;

        dispatch(setToken(null));
        dispatch(setUserData(null));
        dispatch(setIsLogin(false));
        localStorage.removeItem('isLogin');
        toast.dismiss(toastId);
        toast.success(response.data.message);
    } catch (err) {
        toast.dismiss(toastId);
        if (err?.response?.data?.message) {
            toast.error(err.response.data.message)
        }
    }
}

export async function resetPassword(params, setPath) {
    const toastId = toast.loading("Resetting Password");
    try {
        const response = (await apiConnector('POST', authEndpoints.RESET_PASSWORD, params)).data;

        toast.dismiss(toastId);
        toast.success(response.message);
        setPath('login')
    } catch (err) {
        toast.dismiss(toastId);
        if (err?.response?.data?.message) {
            toast.error(err.response.data.message)
        }
    }
}