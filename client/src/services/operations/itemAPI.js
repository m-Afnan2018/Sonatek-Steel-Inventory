import toast from "react-hot-toast";
import { apiConnector } from "services/apiConnector";
import { itemEndpoints } from "services/apis";
import { deleteFromCurrentList, setCurrentList, setSelectUpdate, updateFromCurrentList } from "slices/itemSlice";


export async function getAllItem(data, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('POST', itemEndpoints.GET_ALL_ITEMS, data)).data;

        dispatch(setCurrentList(response.items))
        toast.dismiss(toastId);
        toast.success(response.data.message)
    } catch (err) {
        toast.dismiss(toastId);
        // toast.error(err.response.data.message)
    }
}

export async function getItem(params, dispatch, purpose) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('POST', itemEndpoints.GET_ITEM, params)).data;

        if (response.success) {
            if (purpose === 'selectUpdate') {
                dispatch(setSelectUpdate(response.item));
            }
        }
        toast.dismiss(toastId);
        toast.success(response.data.message)
    } catch (err) {
        toast.dismiss(toastId);
        // toast.error(err.response.data.message)
    }
}

export async function addItem(data) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('POST', itemEndpoints.ADD_ITEM, data)).data;

        if (response.data) {
            console.log(response);
        }
        toast.dismiss(toastId);
        toast.success(response.data.message)
    } catch (err) {
        toast.dismiss(toastId);
        // toast.error(err.response.data.message)
    }
}

export async function updateItem(params, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('PATCH', itemEndpoints.UPDATE_ITEM, params)).data;

        dispatch(updateFromCurrentList({ id: params._id, data: response.item }))
        toast.dismiss(toastId);
        toast.success(response.data.message)
    } catch (err) {
        toast.dismiss(toastId);
        // toast.error(err.response.data.message)
    }
}

export async function deleteItem(params, dispatch) {
    const toastId = toast.loading("Loading...")
    console.log(params)
    try {
        const response = (await apiConnector('DELETE', itemEndpoints.DELETE_ITEM, params)).data;

        console.log(response)

        if (response.success) {
            dispatch(deleteFromCurrentList(params.itemId))
        }
        toast.dismiss(toastId);
        toast.success(response.data.message)
    } catch (err) {
        toast.dismiss(toastId);
        // toast.error(err.response.data.message)
    }
}