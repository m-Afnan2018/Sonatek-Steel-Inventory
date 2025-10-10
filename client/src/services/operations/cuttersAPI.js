import { apiConnector } from "services/apiConnector";
import { cutterEndpoints } from "services/apis";
import { addLoader, showError, showSuccess } from "slices/loaderSlice";
import { setCutters } from "slices/varientSlice";


// ➕ Add Varient
export async function addCutter(params, dispatch, list) {
    try {
        dispatch(addLoader("addCutter"));

        const response = (await apiConnector("POST", cutterEndpoints.ADD_CUTTERS, params)).data;

        if (response.success) {
            const newList = [...list, response.value];

            dispatch(setCutters(newList));

            dispatch(showSuccess({ id: "addCutter", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "addCutter",
            message: err?.response?.data?.message || "Failed to add variant"
        }));
    }
}

// ➕ Add Varient
export async function showCutter(params, dispatch, list) {
    try {
        dispatch(addLoader("showCutter"));

        const response = (await apiConnector("POST", cutterEndpoints.SHOW_CUTTERS, params)).data;

        if (response.success) {
            const newList = [...list, response.value];

            dispatch(setCutters(newList));

            dispatch(showSuccess({ id: "showCutter", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "showCutter",
            message: err?.response?.data?.message || "Failed to show Cutter"
        }));
    }
}

// ➕ Add Varient
export async function hideCutter(params, dispatch, list) {
    try {
        dispatch(addLoader("hideCutter"));

        const response = (await apiConnector("POST", cutterEndpoints.HIDE_CUTTERS_CUTTERS, params)).data;

        if (response.success) {
            const newList = [...list, response.value];

            dispatch(setCutters(newList));

            dispatch(showSuccess({ id: "hideCutter", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "hideCutter",
            message: err?.response?.data?.message || "Failed to show Cutter"
        }));
    }
}

export async function getDataByCutters() {
    try {
        const response = (await apiConnector("GET", cutterEndpoints.GET_CUTTERS)).data;
        return response;
    } catch (err) {
        return null;
    }
}