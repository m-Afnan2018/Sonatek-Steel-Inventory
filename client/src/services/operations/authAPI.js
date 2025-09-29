import { setIsLogin, setLoader } from "../../slices/authSlice";
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