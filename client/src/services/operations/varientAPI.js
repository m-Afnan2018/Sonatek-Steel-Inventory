import { apiConnector } from "services/apiConnector";
import { varientEndpoints } from "services/apis";
import { setWarehouses, setGrades, setThicknesses, setWidths } from "slices/varientSlice";
import { addLoader, showError, showSuccess } from "slices/loaderSlice";

// 🧩 Get All Varients
export async function getAllVarients(dispatch) {
    try {
        dispatch(addLoader("getAllVarients"));

        const response = (await apiConnector("GET", varientEndpoints.GET_ALL_VARIENT)).data;

        if (response.success) {
            const toName = (item, key = "name") => {
                if (item == null) return "";
                if (typeof item === "string" || typeof item === "number") return String(item);
                const v = item[key];
                return v == null ? "" : String(v);
            };

            const sortByName = (arr = [], key = "name") =>
                [...arr].sort((a, b) =>
                    toName(a, key).localeCompare(toName(b, key), undefined, { numeric: true, sensitivity: "base" })
                );

            dispatch(setGrades(sortByName(response.grades)));
            dispatch(setWarehouses(sortByName(response.warehouses)));
            dispatch(setThicknesses(sortByName(response.thickness)));
            dispatch(setWidths(sortByName(response.widths)));

            dispatch(showSuccess({ id: "getAllVarients", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "getAllVarients",
            message: err?.response?.data?.message || "Failed to fetch variants"
        }));
    }
}

// ➕ Add Varient
export async function addVarient(type, value, dispatch, list) {
    try {
        dispatch(addLoader("addVarient"));

        const response = (await apiConnector("POST", varientEndpoints.ADD_VARIENT, { type, value })).data;

        if (response.success) {
            const newList = [...list, response.value];

            if (type === "grade") dispatch(setGrades(newList));
            if (type === "warehouse") dispatch(setWarehouses(newList));
            if (type === "thickness") dispatch(setThicknesses(newList));
            if (type === "width") dispatch(setWidths(newList));

            dispatch(showSuccess({ id: "addVarient", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "addVarient",
            message: err?.response?.data?.message || "Failed to add variant"
        }));
    }
}

// ✏️ Update Varient
export async function updateVarient(id, type, value, dispatch, list) {
    try {
        dispatch(addLoader("updateVarient"));

        const response = (await apiConnector("PATCH", varientEndpoints.UPDATE_VARIENT, { id, type, value })).data;

        if (response.success) {
            const newList = list.map((vari) =>
                vari._id === id ? { ...vari, name: value } : vari
            );

            if (type === "grade") dispatch(setGrades(newList));
            if (type === "warehouse") dispatch(setWarehouses(newList));
            if (type === "thickness") dispatch(setThicknesses(newList));
            if (type === "width") dispatch(setWidths(newList));

            dispatch(showSuccess({ id: "updateVarient", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "updateVarient",
            message: err?.response?.data?.message || "Failed to update variant"
        }));
    }
}

// ❌ Delete Varient
export async function deleteVarient(id, type, dispatch, list) {
    try {
        dispatch(addLoader("deleteVarient"));
        console.log({id, type})

        const response = (await apiConnector("DELETE", varientEndpoints.DELETE_VARIENT, { id, type })).data;

        if (response.success) {
            const newList = list.filter((vari) => vari._id !== id);

            if (type === "grade") dispatch(setGrades(newList));
            if (type === "warehouse") dispatch(setWarehouses(newList));
            if (type === "thickness") dispatch(setThicknesses(newList));
            if (type === "width") dispatch(setWidths(newList));

            dispatch(showSuccess({ id: "deleteVarient", message: response.message }));
        }
    } catch (err) {
        console.log(err);
        dispatch(showError({
            id: "deleteVarient",
            message: err?.response?.data?.message || "Failed to delete variant"
        }));
    }
}

// 📋 Get All Varients Detail
export async function getAllVarientsDetail(setData, setLoading, dispatch) {
    try {
        dispatch(addLoader("getAllVarientsDetail"));

        const response = (await apiConnector("GET", varientEndpoints.GET_ALL_VARIENT_DETAIL)).data;

        if (response.success) {
            setData(response.data);
            setLoading(false);
            dispatch(showSuccess({ id: "getAllVarientsDetail", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "getAllVarientsDetail",
            message: err?.response?.data?.message || "Failed to fetch variant details"
        }));
    }
}
