import { apiConnector } from "services/apiConnector";
import { itemEndpoints } from "services/apis";
import { setPendingBookings } from "slices/bookingSlice";
import {
    addUpcomingItem,
    deleteFromUpcomingItem,
    setCurrentList,
    setListviewList,
    setPagination,
    setSelectUpdate,
    setTotalQuantity,
    setUpcomingItem,
    updateListViewList,
    updateUpcomingSaveForBooking
} from "slices/itemSlice";
import { addLoader, showError, showSuccess } from "slices/loaderSlice";

export async function getAllItem(data, dispatch) {
    try {
        dispatch(addLoader("getAllItem"));
        const response = (await apiConnector('POST', itemEndpoints.GET_ALL_ITEMS, data)).data;

        dispatch(setListviewList(response.listView));
        dispatch(setTotalQuantity(response.totalQuantity));
        dispatch(setPagination({ totalPages: response.pages, page: response.page }));
        dispatch(setCurrentList(response.wagons));
        dispatch(showSuccess({ id: "getAllItem", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getAllItem", message: err?.response?.data?.message || "Failed to fetch items" }));
    }
}

export async function getItem(params, dispatch, purpose) {
    try {
        dispatch(addLoader("getItem"));
        const response = (await apiConnector('POST', itemEndpoints.GET_ITEM, params)).data;

        if (response.success && purpose === 'selectUpdate') {
            dispatch(setSelectUpdate(response.item));
        }

        dispatch(showSuccess({ id: "getItem", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getItem", message: err?.response?.data?.message || "Failed to fetch item" }));
    }
}

export async function addItem(data, dispatch) {
    try {
        dispatch(addLoader("addItem"));
        const response = (await apiConnector('POST', itemEndpoints.ADD_ITEM, data)).data;

        // dispatch(addToCurrentList(response.listView));
        dispatch(addUpcomingItem(response.listView))

        dispatch(showSuccess({ id: "addItem", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "addItem", message: err?.response?.data?.message || "Failed to add item" }));
    }
}

/**
 * Returns true if an upcoming item with the same grade, width, thickness
 * and quantity already exists in the DB. No Redux side-effects.
 */
export async function checkDuplicateItem(data) {
    try {
        const response = (await apiConnector('POST', itemEndpoints.CHECK_DUPLICATE_ITEM, data)).data;
        return response.isDuplicate === true;
    } catch (err) {
        // On error, allow the submission to proceed (fail-open)
        return false;
    }
}

export async function updateItem(params, dispatch) {
    try {
        dispatch(addLoader("updateItem"));
        const response = (await apiConnector('PATCH', itemEndpoints.UPDATE_ITEM, params)).data;

        // dispatch(updateFromCurrentList({ id: params._id, data: response.item }));
        dispatch(updateListViewList(response.listView))

        dispatch(showSuccess({ id: "updateItem", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "updateItem", message: err?.response?.data?.message || "Failed to update item" }));
    }
}

export async function deleteItem(params, dispatch) {
    try {
        dispatch(addLoader("deleteItem"));
        const response = (await apiConnector('DELETE', itemEndpoints.DELETE_ITEM, params)).data;

        if (response.success) {
            // dispatch(deleteFromCurrentList(params.itemId));
            dispatch(deleteFromUpcomingItem(params.itemId))
        }

        dispatch(showSuccess({ id: "deleteItem", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "deleteItem", message: err?.response?.data?.message || "Failed to delete item" }));
    }
}

export async function getUpcomingItem(params, dispatch) {
    try {
        dispatch(addLoader("getUpcomingItem"));
        const response = (await apiConnector('GET', itemEndpoints.GET_UPCOMING_ITEM, params)).data;

        if (response.success) {
            dispatch(setUpcomingItem(response.items));
        }

        dispatch(showSuccess({ id: "getUpcomingItem", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "getUpcomingItem", message: err?.response?.data?.message || "Failed to get upcoming item" }));
    }
}

export async function markForBooking(params, dispatch) {
    try {
        dispatch(addLoader("Moving"));
        const response = (await apiConnector('POST', itemEndpoints.MARK_FOR_BOOKING, params)).data;

        if (response.success) {
            if (params.invoiceNumber.length > 0) {
                dispatch(deleteFromUpcomingItem(response.item._id))
            } else {
                dispatch(updateUpcomingSaveForBooking({ ...response.item, ...params }));
            }
        }
        dispatch(showSuccess({ id: "Moving", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "Moving", message: err?.response?.data?.message || "Failed to move item" }));
    }
}

export async function unmarkForBooking(params, dispatch) {
    try {
        dispatch(addLoader("UnMoving"));
        const response = (await apiConnector('POST', itemEndpoints.UNMARK_FOR_BOOKING, params)).data;

        if (response.success) {
            dispatch(updateUpcomingSaveForBooking(params));
        }
        dispatch(showSuccess({ id: "UnMoving", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "UnMoving", message: err?.response?.data?.message || "Failed to move item" }));
    }
}

export async function moveToInventory(params, dispatch) {
    try {
        dispatch(addLoader("MoveToInventory"));
        const response = (await apiConnector('POST', itemEndpoints.MOVE_TO_INVENTORY, params)).data;

        if (response.success) {
            dispatch(deleteFromUpcomingItem(response.listView._id));
        }
        dispatch(showSuccess({ id: "MoveToInventory", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "MoveToInventory", message: err?.response?.data?.message || "Failed to move item" }));
    }
}

export async function getMarkedItem(dispatch) {
    try {
        dispatch(addLoader("GetMarkedItem"));
        const response = (await apiConnector('POST', itemEndpoints.GET_MARKED_ITEM)).data;

        if (response.success) {
            dispatch(setPendingBookings(response.items))
        }
        dispatch(showSuccess({ id: "GetMarkedItem", message: response.message }));
    } catch (err) {
        dispatch(showError({ id: "GetMarkedItem", message: err?.response?.data?.message || "Failed to move item" }));
    }
}