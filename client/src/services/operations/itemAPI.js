import { apiConnector } from "services/apiConnector";
import { itemEndpoints } from "services/apis";
import {
    addUpcomingItem,
    deleteFromCurrentList,
    setCurrentList,
    setListviewList,
    setSelectUpdate,
    setUpcomingItem,
    updateListViewList
} from "slices/itemSlice";
import { addLoader, showError, showSuccess } from "slices/loaderSlice";

export async function getAllItem(data, dispatch) {
    try {
        dispatch(addLoader("getAllItem"));
        const response = (await apiConnector('POST', itemEndpoints.GET_ALL_ITEMS, data)).data;

        dispatch(setListviewList(response.listView));
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

export async function updateItem(params, dispatch) {
    try {
        dispatch(addLoader("updateItem"));
        const response = (await apiConnector('PATCH', itemEndpoints.UPDATE_ITEM, params)).data;

        // dispatch(updateFromCurrentList({ id: params._id, data: response.item }));
        dispatch(updateListViewList(response.listView))

        dispatch(showSuccess({ id: "updateItem", message: response.message }));
    } catch (err) {
        console.log(err);
        dispatch(showError({ id: "updateItem", message: err?.response?.data?.message || "Failed to update item" }));
    }
}

export async function deleteItem(params, dispatch) {
    try {
        dispatch(addLoader("deleteItem"));
        const response = (await apiConnector('DELETE', itemEndpoints.DELETE_ITEM, params)).data;

        if (response.success) {
            dispatch(deleteFromCurrentList(params.itemId));
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

