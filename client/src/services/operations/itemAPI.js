import { apiConnector } from "services/apiConnector";
import { itemEndpoints } from "services/apis";
import { deleteFromCurrentList, setCurrentList, setSelectUpdate, updateFromCurrentList } from "slices/itemSlice";


export async function getAllItem(data, dispatch) {
    try {
        const response = (await apiConnector('POST', itemEndpoints.GET_ALL_ITEMS, data)).data;

        dispatch(setCurrentList(response.items))
    } catch (err) {
        console.log(err);
    }
}

export async function getItem(params, dispatch, purpose) {
    try {
        const response = (await apiConnector('POST', itemEndpoints.GET_ITEM, params)).data;

        if (response.success) {
            if (purpose === 'selectUpdate') {
                dispatch(setSelectUpdate(response.item));
            }
        }
    } catch (err) {
        console.log(err);
    }
}

export async function addItem(data) {
    try {
        const response = (await apiConnector('POST', itemEndpoints.ADD_ITEM, data)).data;

        if (response.data) {
            console.log(response);
        }
    } catch (err) {
        console.log(err);
    }
}

export async function updateItem(params, dispatch) {
    try {
        const response = (await apiConnector('PATCH', itemEndpoints.UPDATE_ITEM, params)).data;

        dispatch(updateFromCurrentList({ id: params._id, data: response.item }))
    } catch (err) {
        console.log(err);
    }
}

export async function deleteItem(params, dispatch) {
    console.log(params)
    try {
        const response = (await apiConnector('DELETE', itemEndpoints.DELETE_ITEM, params)).data;

        console.log(response)

        if (response.success) {
            dispatch(deleteFromCurrentList(params.itemId))
        }
    } catch (err) {
        console.log(err);
    }
}