import toast from "react-hot-toast";
import { apiConnector } from "services/apiConnector";
import { bookingEndpoints } from "services/apis";
import { addNewBooking } from "slices/bookingSlice";
import { setAllChoices, setAllSuggestion, setBestSuggestion, setBookings, updateBookingStatus } from "slices/bookingSlice";


export async function searchOptions(params, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        dispatch(setAllChoices(null));
        const response = (await apiConnector('POST', bookingEndpoints.SEARCH_OPTIONS, params)).data;

        if (response.success) {
            if (response.allItems.length > 0) {
                dispatch(setAllChoices(response.allItems));
            }
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function bookingItems(params, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('POST', bookingEndpoints.PLACE_BOOKING, params)).data;

        if (response.success) {
            console.log(response);

            dispatch(setBestSuggestion(null))
            dispatch(setAllSuggestion(null))
            dispatch(setAllChoices(null))

            dispatch(addNewBooking(response.item))
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function getMyBookings(dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('GET', bookingEndpoints.GET_MY_BOOKING)).data;

        if (response.success) {
            console.log(response);
            dispatch(setBookings(response.bookings));
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function cancelBooking(params, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('PATCH', bookingEndpoints.CANCEL_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Cancelled' }))
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function confirmBooking(params, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('PATCH', bookingEndpoints.CONFIRM_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Processing' }))
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function deliverBooking(params, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('PATCH', bookingEndpoints.DELIVER_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Delivered' }))
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function getAllBookingsDetails(setBookings, setLoading) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('GET', bookingEndpoints.GET_ALL_BOOKING_DETAILS)).data;

        if (response.success) {
            setBookings(response.data);
            setLoading(false);
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}