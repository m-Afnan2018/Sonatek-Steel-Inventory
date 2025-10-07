import { apiConnector } from "services/apiConnector";
import { orderEndpoints } from "services/apis";
import { setAllChoices, setAllSuggestion, setBestSuggestion, setOrders, updateOrderStatus } from "slices/orderSlice";


export async function searchOptions(params, dispatch) {
    try {
        dispatch(setAllChoices(null));
        const response = (await apiConnector('POST', orderEndpoints.SEARCH_OPTIONS, params)).data;

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

export async function orderItems(params, dispatch) {
    try {
        const response = (await apiConnector('POST', orderEndpoints.PLACE_ORDER, params)).data;

        if (response.success) {
            console.log(response);

            dispatch(setBestSuggestion(null))
            dispatch(setAllSuggestion(null))
            dispatch(setAllChoices(null))
        }
    } catch (err) {
        console.log(err);
    }
}

export async function getMyOrders(dispatch) {
    try {
        const response = (await apiConnector('GET', orderEndpoints.GET_MY_ORDER)).data;

        if (response.success) {
            console.log(response);
            dispatch(setOrders(response.orders));
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

export async function cancelOrder(params, dispatch) {
    try {
        const response = (await apiConnector('PATCH', orderEndpoints.CANCEL_ORDER, params)).data;

        if (response.success) {
            dispatch(updateOrderStatus({ orderId: params.orderId, status: 'Cancelled' }))
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

export async function confirmOrder(params, dispatch) {
    try {
        const response = (await apiConnector('PATCH', orderEndpoints.CANCEL_ORDER, params)).data;

        if (response.success) {
            dispatch(updateOrderStatus({ orderId: params.orderId, status: 'Processing' }))
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}

export async function deliverOrder(params, dispatch) {
    try {
        const response = (await apiConnector('PATCH', orderEndpoints.CANCEL_ORDER, params)).data;

        if (response.success) {
            dispatch(updateOrderStatus({ orderId: params.orderId, status: 'Delivered' }))
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}