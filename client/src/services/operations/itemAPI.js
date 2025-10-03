import { apiConnector } from "services/apiConnector";
import { itemEndpoints } from "services/apis";


export async function getAllItem(params) {
    try {
        const response = (await apiConnector('GET', itemEndpoints.GET_ALL_ITEMS,))
        console.log(response)
    } catch (err) {
        console.log(err);
    }
}

export async function getItem(params) {
    try {

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

export async function updateItem(params) {
    try {

    } catch (err) {
        console.log(err);
    }
}

export async function deleteItem(params) {
    try {

    } catch (err) {
        console.log(err);
    }
}