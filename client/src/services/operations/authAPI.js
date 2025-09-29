import { setIsLogin, setLoader } from "../../slices/authSlice";
import { apiConnector } from "../apiConnector";
import { authEndpoints } from "../apis";


export async function login(email, password, dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(setIsLogin(true));
        console.log(`Email: ${email}, Password: ${password}`)

        const response = await apiConnector('POST', authEndpoints.LOGIN, {
            email, password
        });

        console.log(response);

        dispatch(setLoader(false));
    } catch (err) {
        dispatch(setLoader(false));
        dispatch(setIsLogin(false));
        console.log(err);
    }

}

export async function signup(firstName, lastName, email, password, dispatch) {
    try {
        dispatch(setLoader(true));
        dispatch(setIsLogin(true));
        const response = await apiConnector('POST', authEndpoints.SIGNUP, {
            firstName, lastName, email, password
        })


        console.log(response);
    } catch (err) {
        dispatch(setLoader(false));
        dispatch(setIsLogin(false));
        console.log(err)
    }
}

export async function sendLink(email, dispatch) {
    try {
        dispatch(setLoader(true));
        const response = await apiConnector('POST', authEndpoints.FORGET_PASSWORD, {
            email
        })

        dispatch(setLoader(false));
        
        console.log(response);
    } catch (err) {
        dispatch(setLoader(false));
        console.log(err);
    }
}