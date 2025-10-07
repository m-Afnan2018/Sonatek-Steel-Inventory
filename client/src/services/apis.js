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
    GET_ALL_VARIENT_DETAIL: `${BASE_URL}/item/getAllDetailVarient`
}

export const itemEndpoints = {
    GET_ALL_ITEMS: `${BASE_URL}/item/getAllItems`,
    ADD_ITEM: `${BASE_URL}/item/addItem`,
    UPDATE_ITEM: `${BASE_URL}/item/updateItem`,
    GET_ITEM: `${BASE_URL}/item/getItem`,
    DELETE_ITEM: `${BASE_URL}/item/deleteItem`
}

export const bookingEndpoints = {
    SEARCH_OPTIONS: `${BASE_URL}/booking/searchOptions`,
    PLACE_BOOKING: `${BASE_URL}/booking/createBooking`,
    GET_MY_BOOKING: `${BASE_URL}/booking/getMyBookings`,
    GET_BOOKING: `${BASE_URL}/booking/getBooking`,
    GET_ALL_BOOKING: `${BASE_URL}/booking/getAllBookings`,
    UPDATE_BOOKING: `${BASE_URL}/booking/updateBooking`,
    CONFIRM_BOOKING: `${BASE_URL}/booking/confirmBooking`,
    CANCEL_BOOKING: `${BASE_URL}/booking/cancelBooking`,
    DELIVER_BOOKING: `${BASE_URL}/booking/deliverBooking`,
    GET_ALL_BOOKING_DETAILS: `${BASE_URL}/booking/getAllBookingsDetails`
}