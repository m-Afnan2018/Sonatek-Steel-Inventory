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
    addParty as addPartyAction,
    updateParty as updatePartyAction,
    deleteParty as deletePartyAction,
    updateBooking,
    updateBookingStatus
} from "slices/bookingSlice";
import { deleteFromUpcomingItem, setPagination, updateListViewList } from "slices/itemSlice";
import { addLoader, removeLoader, showError, showSuccess } from "slices/loaderSlice";

const updateBookingInSetter = (setter, bookingId, updates) => {
    if (!setter) return;

    setter((prev) => {
        if (!Array.isArray(prev)) return prev;

        return prev.map((booking) =>
            booking._id === bookingId ? { ...booking, ...updates } : booking
        );
    });
};
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

        // if (response.success) {
        //     dispatch(deleteFromUpcomingItem(response.listView._id));
        // }

        dispatch(showSuccess({ id: "createBookingFromUpcoming", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "createBookingFromUpcoming", message: err?.response?.data?.message || "Booking failed" }));
    }
}

export async function createBookingFromInventory(params, dispatch) {
    try {
        dispatch(addLoader("createBookingFromInventory"));

        const response = (await apiConnector('POST', bookingEndpoints.PLACE_BOOKING_FROM_INVENTORY, params)).data;

        if (response.success) {
            if (response.listView) {
                dispatch(updateListViewList(response.listView));
            }
            dispatch(showSuccess({ id: "createBookingFromInventory", message: response.message }));
            return true;
        }
    } catch (err) {
        dispatch(showError({ id: "createBookingFromInventory", message: err?.response?.data?.message || "Booking failed" }));
    }
    return false;
}

export async function increaseQuantity(params, dispatch) {
    try {
        dispatch(addLoader("increaseQuantity"));

        const response = (await apiConnector('POST', itemEndpoints.INCREASE_QUANTITY, params)).data;

        if (response.success && response.listView) {
            dispatch(updateListViewList(response.listView));
        }
        if (response.listView) {
            dispatch(updateListViewList(response.listView));
        }

        dispatch(showSuccess({ id: "increaseQuantity", message: response.message }));
        return response.listView || null;
    } catch (err) {
        dispatch(showError({ id: "increaseQuantity", message: err?.response?.data?.message || "Booking failed" }));
        return null;
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

        const reason = params.fieldValue ?? params.reason ?? '';
        const payload = { bookingId: params.bookingId, fieldValue: reason };
        const response = (await apiConnector('PATCH', bookingEndpoints.CANCEL_BOOKING, payload)).data;

        if (response.success) {
            dispatch(updateBooking({
                bookingId: params.bookingId,
                updates: { status: 'Cancelled', reason: response.reason ?? reason }
            }));
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Cancelled' }));
            dispatch(addBooking({ bookingId: params.bookingId, reason: response.reason ?? reason, status: "Cancelled" }));
            dispatch(removeIncompleteBookings(params.bookingId))
        }

        updateBookingInSetter(setter, params.bookingId, {
            status: 'Cancelled',
            reason: response.reason ?? reason
        });

        dispatch(showSuccess({ id: "cancelBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "cancelBooking", message: err?.response?.data?.message || "Cancel booking failed" }));
    }
}

export async function shipBooking(params, dispatch, setter) {
    try {
        dispatch(addLoader("shipBooking"));

        const vehicleNumber = params.fieldValue ?? params.vehicleNumber ?? '';
        const payload = { bookingId: params.bookingId, fieldValue: vehicleNumber };
        const response = (await apiConnector('PATCH', bookingEndpoints.SHIPPED_BOOKING, payload)).data;

        if (response.success) {
            dispatch(updateBooking({
                bookingId: params.bookingId,
                updates: { status: 'Shipped', vehicleNumber }
            }));
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Shipped' }));
            dispatch(addBooking({ bookingId: params.bookingId, vehicleNumber, status: "Shipped" }));
        }

        updateBookingInSetter(setter, params.bookingId, {
            status: 'Shipped',
            vehicleNumber
        });

        dispatch(showSuccess({ id: "shipBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "shipBooking", message: err?.response?.data?.message || "Ship booking failed" }));
    }
}

export async function updateRemark(params, dispatch, setter) {
    try {
        dispatch(addLoader("updateRemark"));

        const response = (await apiConnector('POST', bookingEndpoints.UPDATE_REMARK, params)).data;

        dispatch(updateBooking({
            bookingId: params.bookingId,
            updates: { remark: params.remark }
        }));

        updateBookingInSetter(setter, params.bookingId, { remark: params.remark });

        dispatch(showSuccess({ id: "updateRemark", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "updateRemark", message: err?.response?.data?.message || "Remark Update failed" }));
    }
}

export async function confirmBooking(params, dispatch, setter) {
    try {
        dispatch(addLoader("confirmBooking"));

        const orderId = params.orderId ?? params.fieldValue ?? '';
        const payload = { bookingId: params.bookingId, orderId };
        const response = (await apiConnector('PATCH', bookingEndpoints.CONFIRM_BOOKING, payload)).data;

        if (response.success) {
            dispatch(updateBooking({
                bookingId: params.bookingId,
                updates: { status: 'Processing', orderId }
            }));
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Processing' }));
        }

        updateBookingInSetter(setter, params.bookingId, {
            status: 'Processing',
            orderId
        });

        dispatch(showSuccess({ id: "confirmBooking", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "confirmBooking", message: err?.response?.data?.message || "Confirm booking failed" }));
    }
}

export async function deliverBooking(params, dispatch, setter) {
    try {
        dispatch(addLoader("deliverBooking"));

        const vehicleNumber = params.vehicle_number ?? params.fieldValue ?? params.description ?? '';
        const response = (await apiConnector('PATCH', bookingEndpoints.DELIVER_BOOKING, {
            bookingId: params.bookingId,
            vehicle_number: vehicleNumber
        })).data;

        if (response.success) {
            dispatch(updateBooking({
                bookingId: params.bookingId,
                updates: { status: 'Delivered', vehicleNumber }
            }));
            dispatch(updateBookingStatus({ bookingId: params.bookingId, status: 'Delivered' }));
        }

        updateBookingInSetter(setter, params.bookingId, {
            status: 'Delivered',
            vehicleNumber
        });

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

export async function createParty(params, dispatch) {
    try {
        dispatch(addLoader("createParty"));

        const response = (await apiConnector('POST', bookingEndpoints.ADD_PARTY, params)).data;

        if (response.success) {
            dispatch(addPartyAction(response.party));
        }

        dispatch(showSuccess({ id: "createParty", message: response.message }));
        return response.success;
    } catch (err) {
        dispatch(showError({ id: "createParty", message: err?.response?.data?.message || "Failed to add party" }));
        return false;
    }
}

export async function editParty(params, dispatch) {
    try {
        dispatch(addLoader("editParty"));

        const response = (await apiConnector('PATCH', bookingEndpoints.UPDATE_PARTY, params)).data;

        if (response.success) {
            dispatch(updatePartyAction(response.party));
        }

        dispatch(showSuccess({ id: "editParty", message: response.message }));
        return response.success;
    } catch (err) {
        dispatch(showError({ id: "editParty", message: err?.response?.data?.message || "Failed to update party" }));
        return false;
    }
}

export async function removeParty(params, dispatch) {
    try {
        dispatch(addLoader("removeParty"));

        const response = (await apiConnector('DELETE', bookingEndpoints.DELETE_PARTY, params)).data;

        if (response.success) {
            dispatch(deletePartyAction(params.id));
        }

        dispatch(showSuccess({ id: "removeParty", message: response.message }));
        return response.success;
    } catch (err) {
        dispatch(showError({ id: "removeParty", message: err?.response?.data?.message || "Failed to delete party" }));
        return false;
    }
}
