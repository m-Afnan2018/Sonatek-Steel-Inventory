import { setIsLogin, setLoader, setToken, setUserData } from "../../slices/authSlice";
import { apiConnector } from "../apiConnector";
import { authEndpoints } from "../apis";


export async function login(email, password, dispatch) {
    try {
        dispatch(setLoader(true));
        console.log(`Email: ${email}, Password: ${password}`)

        const response = await apiConnector('POST', authEndpoints.LOGIN, {
            email, password
        });

        console.log(response);

        localStorage.setItem('isLogin', true);
        dispatch(setUserData(response.data.user));
        dispatch(setToken(response.data.token));

        dispatch(setLoader(false));

        return true;
    } catch (err) {
        dispatch(setLoader(false));
        console.log(err);
        return false;
    }

}

export async function signup(firstName, lastName, email, password, dispatch) {
    try {
        dispatch(setLoader(true));
        const response = await apiConnector('POST', authEndpoints.SIGNUP, {
            firstName, lastName, email, password
        })


        console.log(response);

        dispatch(setLoader(false));
        return true;
    } catch (err) {
        dispatch(setLoader(false));
        console.log(err)
        return false;
    }
}

export async function sendLink(email, dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(setIsLogin(false))
        const response = await apiConnector('POST', authEndpoints.FORGET_PASSWORD, {
            email
        })

        dispatch(setLoader(false));

        console.log(response);

        return true;
    } catch (err) {
        dispatch(setLoader(false));
        console.log(err);
        return false;
    }
}

export async function getUser(dispatch) {
    try {
        const response = await apiConnector('GET', authEndpoints.GET_USER);


        if (response.data.success) {
            console.log(response)
            dispatch(setUserData(response.data.user));
            dispatch(setToken(response.data.token));
        }

        dispatch(setLoader(false))

    } catch (err) {
        console.log("Error:", err)
        localStorage.removeItem('isLogin');
    }
}

export async function logoutUser(dispatch) {
    try {
        const response = await apiConnector('GET', authEndpoints.LOGOUT_USER);

        console.log(response);

        dispatch(setToken(null));
        dispatch(setUserData(null));
        dispatch(setIsLogin(false));
        localStorage.removeItem('isLogin');
    } catch (err) {
        console.log("Error while logging out", err);
    }
}