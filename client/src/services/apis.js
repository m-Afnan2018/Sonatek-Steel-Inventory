const BASE_URL = process.env.REACT_APP_BASE_URL;

export const authEndpoints = {
    LOGIN: `${BASE_URL}/auth/loginUser`,
    SIGNUP: `${BASE_URL}/auth/registerUser`,
    FORGET_PASSWORD: `${BASE_URL}/auth/forgetPassword`,
    RESET_PASSWORD: `${BASE_URL}/auth/resetPassword`,
    GET_USER: `${BASE_URL}/auth/getUser`,
    LOGOUT_USER: `${BASE_URL}/auth/logoutUser`,
}

export const userEndpoints = {
    GET_ALL_USER: `${BASE_URL}/user/getAllUsers`,
    UPDATE_USER: `${BASE_URL}/user/updateUser`,
    VERIFY_USER: `${BASE_URL}/user/verifyUser`,
    DELETE_USER: `${BASE_URL}/user/deleteUser`,
    REMOVE_USER: `${BASE_URL}/user/deleteUser`,
    CHANGE_DESIGNATION: `${BASE_URL}/user/changeUserDesignation`,
    GET_USER: `${BASE_URL}/user/getUser`
}

export const varientEndpoints = {
    GET_ALL_VARIENT: `${BASE_URL}/item/getAllVarients`,
    ADD_VARIENT: `${BASE_URL}/item/addVarient`,
    UPDATE_VARIENT: `${BASE_URL}/item/updateVarient`,
    DELETE_VARIENT: `${BASE_URL}/item/deleteVarient`,
}

export const itemEndpoints = {
    GET_ALL_ITEMS: `${BASE_URL}/item/getAllItems`,
    ADD_ITEM: `${BASE_URL}/item/addItem`,
    UPDATE_ITEM: `${BASE_URL}/item/updateItem`,
    GET_ITEM: `${BASE_URL}/item/getItem`,
    DELETE_ITEM: `${BASE_URL}/item/deleteItem`
}

export const orderEndpoints = {
    SEARCH_OPTIONS: `${BASE_URL}/order/searchOptions`,
    PLACE_ORDER: `${BASE_URL}/order/createOrder`,
    GET_MY_ORDER: `${BASE_URL}/order/getMyOrders`,
    GET_ORDER: `${BASE_URL}/order/getOrder`,
    GET_ALL_ORDER: `${BASE_URL}/order/getAllOrders`,
    UPDATE_ORDER: `${BASE_URL}/order/updateOrder`,
}