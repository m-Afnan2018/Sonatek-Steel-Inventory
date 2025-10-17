/* eslint-disable no-unused-vars */
import { setIsLogin, setLoader, setToken, setUserData } from "../../slices/authSlice";
import { apiConnector } from "../apiConnector";
import { authEndpoints } from "../apis";
import { addLoader, showError } from "slices/loaderSlice";

export async function login(email, password, dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(addLoader("login"));

        const response = await apiConnector('POST', authEndpoints.LOGIN, { email, password });

        localStorage.setItem('isLogin', true);
        sessionStorage.setItem('id', response.data.token);
        dispatch(setUserData(response.data.user));
        dispatch(setToken(response.data.token));

        // dispatch(showSuccess({ id: 'login', message: response.data.message }));
        return true;
    } catch (err) {
        dispatch(showError({ id: 'login', message: err?.response?.data?.message || 'Login failed' }));
        return false;
    } finally {
        dispatch(setLoader(false));
    }
}

export async function signup(firstName, lastName, email, password, dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(addLoader("signup"));

        const response = (await apiConnector('POST', authEndpoints.SIGNUP, {
            firstName, lastName, email, password
        })).data;

        // dispatch(showSuccess({ id: 'signup', message: response.message }));
        return true;
    } catch (err) {
        dispatch(showError({ id: 'signup', message: err?.response?.data?.message || 'Signup failed' }));
        return false;
    } finally {
        dispatch(setLoader(false));
    }
}

export async function sendLink(email, dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(addLoader("sendLink"));
        dispatch(setIsLogin(false));

        const response = (await apiConnector('POST', authEndpoints.FORGET_PASSWORD, { email })).data;

        // dispatch(showSuccess({ id: 'sendLink', message: response.message }));
        return true;
    } catch (err) {
        dispatch(showError({ id: 'sendLink', message: err?.response?.data?.message || 'Failed to send link' }));
        return false;
    } finally {
        dispatch(setLoader(false));
    }
}

export async function getUser(dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(addLoader("getUser"));

        const response = await apiConnector('GET', authEndpoints.GET_USER);

        if (response.data.success) {
            dispatch(setUserData(response.data.user));
            dispatch(setToken(response.data.token));
            // dispatch(showSuccess({ id: 'getUser', message: response.data.message }));
        } else {
            dispatch(showError({ id: 'getUser', message: 'Failed to fetch user' }));
        }
    } catch (err) {
        localStorage.removeItem('isLogin');
        dispatch(showError({ id: 'getUser', message: err?.response?.data?.message || 'Failed to fetch user' }));
    } finally {
        dispatch(setLoader(false));
    }
}

export async function logoutUser(dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(addLoader("logoutUser"));

        const response = (await apiConnector('GET', authEndpoints.LOGOUT_USER)).data;

        dispatch(setToken(null));
        dispatch(setUserData(null));
        dispatch(setIsLogin(false));
        localStorage.removeItem('isLogin');

        // dispatch(showSuccess({ id: 'logoutUser', message: response.message }));
    } catch (err) {
        dispatch(showError({ id: 'logoutUser', message: err?.response?.data?.message || 'Logout failed' }));
    } finally {
        dispatch(setLoader(false));
    }
}

export async function resetPassword(params, setPath, dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(addLoader("resetPassword"));

        // eslint-disable-next-line no-unused-vars
        const response = (await apiConnector('POST', authEndpoints.RESET_PASSWORD, params)).data;

        // dispatch(showSuccess({ id: 'resetPassword', message: response.message }));
        setPath('login');
    } catch (err) {
        dispatch(showError({ id: 'resetPassword', message: err?.response?.data?.message || 'Password reset failed' }));
    } finally {
        dispatch(setLoader(false));
    }
}
