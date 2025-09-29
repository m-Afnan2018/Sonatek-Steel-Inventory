const BASE_URL = process.env.REACT_APP_BASE_URL;

export const authEndpoints = {
    LOGIN: `${BASE_URL}/auth/loginUser`,
    SIGNUP: `${BASE_URL}/auth/registerUser`,
    FORGET_PASSWORD: `${BASE_URL}/auth/forgetPassword`,
    RESET_PASSWORD: `${BASE_URL}/auth/resetPassword`,
}