import { apiConnector } from "services/apiConnector";
import { bookingEndpoints } from "services/apis";
import {
    addNewBooking,
    setAllChoices,
    setAllSuggestion,
    setBestSuggestion,
    setBookings,
    setOptions,
    updateBookingStatus
} from "slices/bookingSlice";
import { setPagination } from "slices/itemSlice";
import { addLoader, removeLoader, showError } from "slices/loaderSlice";

export async function searchOptions(params, dispatch) {
    try {
        dispatch(addLoader("searchOptions"));
        dispatch(setAllChoices(null));
        dispatch(setOptions(params));

        const response = (await apiConnector('POST', bookingEndpoints.SEARCH_OPTIONS, params)).data;

        if (response.success) {
            dispatch(setAllChoices(response.allItems));
        }

        // dispatch(showSuccess({ id: "searchOptions", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "searchOptions", message: err?.response?.data?.message || "Search failed" }));
    }
}

export async function bookingItems(params, dispatch) {
    try {
        dispatch(addLoader("bookingItems"));

        const response = (await apiConnector('POST', bookingEndpoints.PLACE_BOOKING, params)).data;

        if (response.success) {
            dispatch(setBestSuggestion(null));
            dispatch(setAllSuggestion(null));
            dispatch(setAllChoices(null));
            dispatch(addNewBooking(response.item));
        }

        // dispatch(showSuccess({ id: "bookingItems", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "bookingItems", message: err?.response?.data?.message || "Booking failed" }));
    }
}

export async function getAllBookings(dispatch) {
    try {
        dispatch(addLoader("getAllBookings"));

        const response = (await apiConnector('POST', bookingEndpoints.GET_ALL_BOOKING)).data;

        if (response.success) {
            dispatch(setBookings(response.bookings));
            dispatch(setPagination(response.pagination))
        }

        // dispatch(showSuccess({ id: "getAllBookings", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getAllBookings", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function getMyBookings(dispatch) {
    try {
        dispatch(addLoader("getMyBookings"));

        const response = (await apiConnector('GET', bookingEndpoints.GET_MY_BOOKING)).data;

        if (response.success) {
            dispatch(setBookings(response.bookings));
        }

        // dispatch(showSuccess({ id: "getMyBookings", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getMyBookings", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function cancelBooking(params, dispatch) {
    try {
        dispatch(addLoader("cancelBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.CANCEL_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Cancelled' }));
        }

        // dispatch(showSuccess({ id: "cancelBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "cancelBooking", message: err?.response?.data?.message || "Cancel booking failed" }));
    }
}

export async function shipBooking(params, dispatch) {
    try {
        dispatch(addLoader("shipBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.SHIPPED_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Shipped' }));
        }

        // dispatch(showSuccess({ id: "shipBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "shipBooking", message: err?.response?.data?.message || "Ship booking failed" }));
    }
}

export async function confirmBooking(params, dispatch) {
    try {
        dispatch(addLoader("confirmBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.CONFIRM_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Processing' }));
        }

        // dispatch(showSuccess({ id: "confirmBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "confirmBooking", message: err?.response?.data?.message || "Confirm booking failed" }));
    }
}

export async function deliverBooking(params, dispatch) {
    try {
        dispatch(addLoader("deliverBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.DELIVER_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Delivered' }));
        }

        // dispatch(showSuccess({ id: "deliverBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "deliverBooking", message: err?.response?.data?.message || "Delivery update failed" }));
    }
}

export async function getAllBookingsDetails(setBookings, setLoading, dispatch) {
    try {
        dispatch(addLoader("getAllBookingsDetails"));

        const response = (await apiConnector('GET', bookingEndpoints.GET_ALL_BOOKING_DETAILS)).data;

        if (response.success) {
            setBookings(response.data);
            setLoading(false);
        }

        // dispatch(showSuccess({ id: "getAllBookingsDetails", message: response.message }));
        dispatch(removeLoader("getAllBookingsDetails"));
    } catch (err) {
        dispatch(removeLoader("getAllBookingsDetails"));
        dispatch(showError({ id: "getAllBookingsDetails", message: err?.response?.data?.message || "Failed to get all bookings" }));
        setLoading(false);
    }
}

// Fetch bookings with server-side pagination, search and sorting support
export async function fetchBookings(params = {}, setBookings, setLoading, dispatch) {
    try {
        dispatch(addLoader("fetchBookings"));

        // params may contain: page, limit, search, sortBy (e.g., status), userId
        const response = (await apiConnector('GET', bookingEndpoints.GET_ALL_BOOKING_DETAILS, params)).data;

        if (response.success) {
            setBookings(response.data);
            setLoading(false);
        }

        // dispatch(showSuccess({ id: "fetchBookings", message: response.message }));
        dispatch(removeLoader("fetchBookings"));
    } catch (err) {
        dispatch(removeLoader("fetchBookings"));
        dispatch(showError({ id: "fetchBookings", message: err?.response?.data?.message || "Failed to fetch bookings" }));
        setLoading(false);
    }
}