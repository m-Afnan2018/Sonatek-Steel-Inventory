import { apiConnector } from "services/apiConnector";
import { cutterEndpoints } from "services/apis";
import { addLoader, showError, showSuccess } from "slices/loaderSlice";
import { setCutters } from "slices/varientSlice";


// ➕ Add Varient
export async function addCutter(params, dispatch, list, setter) {
    try {
        dispatch(addLoader("addCutter"));

        const response = (await apiConnector("POST", cutterEndpoints.ADD_CUTTERS, params)).data;

        if (response.success) {
            const newList = [...list, response.cutter];

            dispatch(setCutters(newList));

            const newCutter = {
                _id: response.cutter._id,
                name: response.cutter.name,
                address: response.cutter.address,
                phoneNumber: response.cutter.phoneNumber,
                totalItems: 0,
                totalQuantity: 0,
                items: [],
            };
            setter((s) => [newCutter, ...s]);

            dispatch(showSuccess({ id: "addCutter", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "addCutter",
            message: err?.response?.data?.message || "Failed to add variant"
        }));
    }
}

export async function updateCutter(params, dispatch, list, setCutters) {
    try {
        dispatch(addLoader("updateCutter"));

        const response = (await apiConnector("POST", cutterEndpoints.UPDATE_CUTTER, params)).data;

        if (response.success) {
            setCutters(list.map((c) => {
                if (c._id === params.cutterId) {
                    c.name = params.name || c.name;
                    c.address = params.address || c.address;
                    c.phoneNumber = params.phoneNumber || c.phoneNumber;
                }
                return c;
            }))

            dispatch(showSuccess({ id: "updateCutter", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "updateCutter",
            message: err?.response?.data?.message || "Failed to update cutter"
        }));
    }
}

// ➕ Add Varient
export async function showCutter(params, dispatch, list, setter) {
    try {
        dispatch(addLoader("showCutter"));

        const response = (await apiConnector("POST", cutterEndpoints.SHOW_CUTTERS, params)).data;

        if (response.success) {
            setter(list.map((prev) => {
                if (prev._id === params.cutterId) {
                    prev.visible = true;
                }
                return prev;
            }))

            dispatch(showSuccess({ id: "showCutter", message: response.message }));
        }
    } catch (err) {
        console.log(err);
        dispatch(showError({
            id: "showCutter",
            message: err?.response?.data?.message || "Failed to show Cutter"
        }));
    }
}

// ➕ Add Varient
export async function hideCutter(params, dispatch, list, setCutters) {
    try {
        dispatch(addLoader("hideCutter"));

        const response = (await apiConnector("POST", cutterEndpoints.HIDE_CUTTERS, params)).data;

        if (response.success) {
            setCutters(list.map((prev) => {
                if (prev._id === params.cutterId) {
                    prev.visible = false;
                }
                return prev;
            }))

            dispatch(showSuccess({ id: "hideCutter", message: response.message }));
        }
    } catch (err) {

        console.log(err);
        dispatch(showError({
            id: "hideCutter",
            message: err?.response?.data?.message || "Failed to show Cutter"
        }));
    }
}

export async function getAllCutterDetails(setCutters) {
    try {
        const response = (await apiConnector('GET', cutterEndpoints.GET_ALL_CUTTER_DETAILS)).data;

        if (response.success) {
            setCutters(response.data.list);
        }
    } catch (err) {
        return null;
    }
}

export async function getDataByCutters(id, setItemsList) {
    try {
        const response = (await apiConnector('POST', cutterEndpoints.GET_DATA_BY_CUTTERS, { cutter: id })).data;

        if (response.success) {
            setItemsList(response.data.items);
        }
    } catch (err) {
        console.log(err);
    }
}