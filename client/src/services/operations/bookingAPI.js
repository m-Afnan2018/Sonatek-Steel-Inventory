import { apiConnector } from "services/apiConnector";
import { bookingEndpoints } from "services/apis";
import { addNewBooking } from "slices/bookingSlice";
import { setAllChoices, setAllSuggestion, setBestSuggestion, setBookings, updateBookingStatus } from "slices/bookingSlice";


export async function searchOptions(params, dispatch) {
    try {
        dispatch(setAllChoices(null));
        const response = (await apiConnector('POST', bookingEndpoints.SEARCH_OPTIONS, params)).data;

        console.log(response);

        if (response.success) {
            if (response.allItems.length > 0) {
                dispatch(setAllChoices(response.allItems));
            }
        }
    } catch (err) {
        console.log(err);
    }
}

export async function bookingItems(params, dispatch) {
    try {
        const response = (await apiConnector('POST', bookingEndpoints.PLACE_BOOKING, params)).data;

        if (response.success) {
            console.log(response);

            dispatch(setBestSuggestion(null))
            dispatch(setAllSuggestion(null))
            dispatch(setAllChoices(null))

            dispatch(addNewBooking(response.item))
        }
    } catch (err) {
        console.log(err);
    }
}

export async function getMyBookings(dispatch) {
    try {
        const response = (await apiConnector('GET', bookingEndpoints.GET_MY_BOOKING)).data;

        if (response.success) {
            console.log(response);
            dispatch(setBookings(response.bookings));
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

export async function cancelBooking(params, dispatch) {
    try {
        const response = (await apiConnector('PATCH', bookingEndpoints.CANCEL_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Cancelled' }))
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

export async function confirmBooking(params, dispatch) {
    try {
        const response = (await apiConnector('PATCH', bookingEndpoints.CONFIRM_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Processing' }))
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

export async function deliverBooking(params, dispatch) {
    try {
        const response = (await apiConnector('PATCH', bookingEndpoints.DELIVER_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Delivered' }))
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

export async function getAllBookingsDetails(setBookings, setLoading) {
    try {
        const response = (await apiConnector('GET', bookingEndpoints.GET_ALL_BOOKING_DETAILS)).data;

        if (response.success) {
            setBookings(response.data);
            setLoading(false);
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}