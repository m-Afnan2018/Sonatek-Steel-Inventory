import { apiConnector } from "services/apiConnector";
import { orderEndpoints } from "services/apis";
import { setAllChoices, setAllSuggestion, setBestSuggestion } from "slices/orderSlice";


export async function searchOptions(params, dispatch) {
    try {
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

export async function getMyOrders() {
    try {
        const response = (await apiConnector('GET', orderEndpoints.GET_MY_ORDER)).data;

        if (response.success) {
            console.log(response.orders);
        }
    } catch (err) {
        console.log("Error: ", err);
    }
}