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
    ACTIVE_USER: `${BASE_URL}/user/activeUser`,
    DELETE_USER: `${BASE_URL}/user/deleteUser`,
    REMOVE_USER: `${BASE_URL}/user/removeUser`,
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
    DELETE_ITEM: `${BASE_URL}/item/deleteItem`,
    GET_UPCOMING_ITEM: `${BASE_URL}/item/getUpcomingItems`
}

export const bookingEndpoints = {
    SEARCH_OPTIONS: `${BASE_URL}/booking/searchOptions`,
    PLACE_BOOKING: `${BASE_URL}/booking/createBooking`,
    GET_MY_BOOKING: `${BASE_URL}/booking/getMyBookings`,
    GET_BOOKING: `${BASE_URL}/booking/getBooking`,
    GET_ALL_BOOKING: `${BASE_URL}/booking/getAllBookings`,
    UPDATE_BOOKING: `${BASE_URL}/booking/updateBooking`,
    UPDATE_REMARK: `${BASE_URL}/booking/updateRemark`,
    CONFIRM_BOOKING: `${BASE_URL}/booking/confirmBooking`,
    SHIPPED_BOOKING: `${BASE_URL}/booking/shippedBooking`,
    CANCEL_BOOKING: `${BASE_URL}/booking/cancelBooking`,
    DELIVER_BOOKING: `${BASE_URL}/booking/deliverBooking`,
    GET_ALL_BOOKING_DETAILS: `${BASE_URL}/booking/getAllBookingsDetails`,
    GET_ALL_INCOMPLETE_BOOKING_DETAILS: `${BASE_URL}/booking/getAllIncompleteBookingsDetails`,
    GET_ALL_BOOKING_DETAILS_TABLEWISE: `${BASE_URL}/booking/getAllBookingsDetailsTablewise`,
    GET_ALL_PARTY: `${BASE_URL}/booking/getAllParty`,
    GET_ALL_PARTY_DETAILS: `${BASE_URL}/booking/getAllPartyDetails`,
    DELETE_PARTY: `${BASE_URL}/booking/deleteParty`,
}

export const cutterEndpoints = {
    ADD_CUTTERS: `${BASE_URL}/cutters/addCutter`,
    UPDATE_CUTTER: `${BASE_URL}/cutters/updateCutter`,
    HIDE_CUTTERS: `${BASE_URL}/cutters/hideCutter`,
    SHOW_CUTTERS: `${BASE_URL}/cutters/showCutter`,
    GET_DATA_BY_CUTTERS: `${BASE_URL}/cutters/getDataByCutters`,
    GET_ALL_CUTTER_DETAILS: `${BASE_URL}/cutters/getAllCutterDetails`
}

export const utilEndpoints = {
    DOWNLOAD_TEMPLATE: `${BASE_URL}/item/downloadTemplate`,
    GET_EXCEL_ITEM: `${BASE_URL}/item/getExcelItem`,
    UPLOAD_CSV: `${BASE_URL}/item/uploadCSV`,
    GET_EXCEL_BOOKING: `${BASE_URL}/booking/getExcelBooking`
}