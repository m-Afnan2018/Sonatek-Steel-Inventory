import { apiConnector } from "services/apiConnector";
import { bookingEndpoints, itemEndpoints } from "services/apis";
import {
    addBooking,
    addIncompleteBookings,
    removeIncompleteBookings,
    setAllChoices,
    setAllSuggestion,
    setBestSuggestion,
    setBookings,
    setIncompleteBookings,
    setOptions,
    setParty,
    updateBookingStatus
} from "slices/bookingSlice";
import { deleteFromUpcomingItem, setPagination } from "slices/itemSlice";
import { addLoader, removeLoader, showError, showSuccess } from "slices/loaderSlice";

export async function searchOptions(params, dispatch, setter) {
    try {
        dispatch(addLoader("searchOptions"));
        dispatch(setAllChoices(null));
        dispatch(setOptions(params));

        const response = (await apiConnector('POST', bookingEndpoints.SEARCH_OPTIONS, params)).data;

        if (response.success) {
            // dispatch(setAllChoices(response.allItems));
            setter(response.allItems);
        }

        dispatch(showSuccess({ id: "searchOptions", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "searchOptions", message: err?.response?.data?.message || "Search failed" }));
    }
}

export async function bookingItems(params, dispatch, reset) {
    try {
        dispatch(addLoader("bookingItems"));

        const response = (await apiConnector('POST', bookingEndpoints.PLACE_BOOKING, params)).data;

        if (response.success) {
            dispatch(setBestSuggestion(null));
            dispatch(setAllSuggestion(null));
            // dispatch(setAllChoices(response.booking));
            // dispatch(addNewBooking(response.booking));
            dispatch(addIncompleteBookings(response.booking));
        }

        dispatch(showSuccess({ id: "bookingItems", message: response.message }));
        reset();
    } catch (err) {
        dispatch(showError({ id: "bookingItems", message: err?.response?.data?.message || "Booking failed" }));
        reset();
    }
}

export async function createBookingFromUpcoming(params, dispatch) {
    try {
        dispatch(addLoader("createBookingFromUpcoming"));

        const response = (await apiConnector('POST', bookingEndpoints.PLACE_BOOKING_FROM_UPCOMING, params)).data;

        if (response.success) {
            dispatch(deleteFromUpcomingItem(response.listView._id));
        }

        dispatch(showSuccess({ id: "createBookingFromUpcoming", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "createBookingFromUpcoming", message: err?.response?.data?.message || "Booking failed" }));
    }
}

export async function createBookingFromInventory(params, dispatch) {
    try {
        dispatch(addLoader("createBookingFromInventory"));

        const response = (await apiConnector('POST', bookingEndpoints.PLACE_BOOKING_FROM_UPCOMING, params)).data;

        if (response.success) {
            dispatch(deleteFromUpcomingItem(response.listView._id));
        }

        dispatch(showSuccess({ id: "createBookingFromInventory", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "createBookingFromInventory", message: err?.response?.data?.message || "Booking failed" }));
    }
}

export async function increaseQuantity(params, dispatch) {
    try {
        dispatch(addLoader("increaseQuantity"));

        const response = (await apiConnector('POST', itemEndpoints.INCREASE_QUANTITY, params)).data;

        dispatch(showSuccess({ id: "increaseQuantity", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "increaseQuantity", message: err?.response?.data?.message || "Booking failed" }));
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

        dispatch(showSuccess({ id: "getAllBookings", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getAllBookings", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function getAllBookingsTable(filters, setter, setPagination, dispatch) {
    try {
        dispatch(addLoader('getAllBookingsTable'));

        const response = (await apiConnector('POST', bookingEndpoints.GET_ALL_BOOKING_DETAILS_TABLEWISE, filters)).data;

        if (response.success) {
            setter(response.listView);
            dispatch(setBookings(response.listView));
            setPagination({ page: response.page, totalPages: response.pages });
        }
        dispatch(showSuccess({ id: 'getAllBookingsTable', message: response.message }));
    } catch (err) {
        dispatch(showError({ id: 'getAllBookingsTable', message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function getMyBookings(dispatch) {
    try {
        dispatch(addLoader("getMyBookings"));

        const response = (await apiConnector('GET', bookingEndpoints.GET_MY_BOOKING)).data;

        if (response.success) {
            dispatch(setBookings(response.bookings));
        }

        dispatch(showSuccess({ id: "getMyBookings", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getMyBookings", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function cancelBooking(params, dispatch, setter) {
    try {
        dispatch(addLoader("cancelBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.CANCEL_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Cancelled' }));
            dispatch(addBooking({ bookingId: params.bookingId, reason: params.fieldValue, status: "Cancelled" }));
            dispatch(removeIncompleteBookings(params.bookingId))
        }

        setter((prev) => prev.filter(i => i._id === params.bookingId));

        dispatch(showSuccess({ id: "cancelBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "cancelBooking", message: err?.response?.data?.message || "Cancel booking failed" }));
    }
}

export async function shipBooking(params, dispatch, setter) {
    try {
        dispatch(addLoader("shipBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.SHIPPED_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Shipped' }));
            dispatch(addBooking({ bookingId: params.bookingId, vehicleNumber: params.fieldValue, status: "Cancelled" }));
            // dispatch(removeIncompleteBookings(params.bookingId))
        }

        if (setter) {
            setter((prev) => prev.map(i => {
                if (i._id === params.bookingId) {
                    return { ...i, status: 'Shipped' }
                }
                return i;
            }));
        }

        dispatch(showSuccess({ id: "shipBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "shipBooking", message: err?.response?.data?.message || "Ship booking failed" }));
    }
}

export async function updateRemark(params, dispatch, setter) {
    try {
        dispatch(addLoader("updateRemark"));

        const response = (await apiConnector('POST', bookingEndpoints.UPDATE_REMARK, params)).data;

        // if (response.success) {
        //     dispatch(updateBookingStatus({ bookingId: params.bookingId, remark: params.remark }));
        // }

        if (setter) {
            setter((prev) => prev.map(i => {
                if (i._id === params.bookingId) {
                    return { ...i, remark: params.remark }
                }
                return i;
            }));
        }

        dispatch(showSuccess({ id: "updateRemark", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "updateRemark", message: err?.response?.data?.message || "Remark Update failed" }));
    }
}

export async function confirmBooking(params, dispatch, setter) {
    try {
        dispatch(addLoader("confirmBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.CONFIRM_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Processing' }));
        }

        setter((prev) => prev.map(i => {
            if (i._id === params.bookingId) {
                return { ...i, status: 'Processing' }
            }
            return i;
        }));

        dispatch(showSuccess({ id: "confirmBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "confirmBooking", message: err?.response?.data?.message || "Confirm booking failed" }));
    }
}

export async function deliverBooking(params, dispatch, setter) {
    try {
        dispatch(addLoader("deliverBooking"));

        const response = (await apiConnector('PATCH', bookingEndpoints.DELIVER_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Delivered' }));
        }

        setter((prev) => prev.filter(i => i._id === params.bookingId));

        dispatch(showSuccess({ id: "deliverBooking", message: response.message }));
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

        dispatch(showSuccess({ id: "getAllBookingsDetails", message: response.message }));
        dispatch(removeLoader("getAllBookingsDetails"));
    } catch (err) {
        dispatch(removeLoader("getAllBookingsDetails"));
        dispatch(showError({ id: "getAllBookingsDetails", message: err?.response?.data?.message || "Failed to get all bookings" }));
        setLoading(false);
    }
}

export async function getAllBookingByItem(params, dispatch, setter) {
    try {
        const response = (await apiConnector('POST', bookingEndpoints.GET_BOOKINGS_BY_ITEM, params)).data;

        if (response.success) {
            setter(response.data);
        }
    } catch (err) {
        dispatch(showError({ id: "getAllBookingByItem", message: err?.response?.data?.message || "Failed to get all bookings" }));
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

        dispatch(showSuccess({ id: "fetchBookings", message: response.message }));
        dispatch(removeLoader("fetchBookings"));
    } catch (err) {
        dispatch(removeLoader("fetchBookings"));
        dispatch(showError({ id: "fetchBookings", message: err?.response?.data?.message || "Failed to fetch bookings" }));
        setLoading(false);
    }
}

// Fetch bookings with server-side pagination, search and sorting support
export async function getAllIncompleteBookingsDetails(setter, dispatch) {
    try {
        dispatch(addLoader("fetchAllIncompleteBookings"));

        // params may contain: page, limit, search, sortBy (e.g., status), userId
        const response = (await apiConnector('GET', bookingEndpoints.GET_ALL_INCOMPLETE_BOOKING_DETAILS)).data;

        if (response.success) {
            setter(response.data.bookings);
            dispatch(setAllChoices(response.data.bookings));
            dispatch(setIncompleteBookings(response.data.bookings));
        }

        dispatch(showSuccess({ id: "fetchAllIncompleteBookings", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "fetchAllIncompleteBookings", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function getAllParty(dispatch) {
    try {
        dispatch(addLoader("getAllParty"));

        const response = (await apiConnector('GET', bookingEndpoints.GET_ALL_PARTY)).data;

        dispatch(setParty(response.parties));

        dispatch(showSuccess({ id: "getAllParty", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getAllParty", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function getAllPartyDetails(dispatch) {
    try {
        dispatch(addLoader("getAllPartyDetails"));

        const response = (await apiConnector('GET', bookingEndpoints.GET_ALL_PARTY_DETAILS)).data;

        dispatch(setParty(response.parties));

        dispatch(showSuccess({ id: "getAllPartyDetails", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getAllPartyDetails", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}

export async function deleteParty(dispatch) {
    try {
        dispatch(addLoader("deleteParty"));

        const response = (await apiConnector('POST', bookingEndpoints.ADD_PARTY)).data;


        dispatch(showSuccess({ id: "deleteParty", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "deleteParty", message: err?.response?.data?.message || "Failed to fetch bookings" }));
    }
}