import { apiConnector } from "services/apiConnector";
import { warehouseEndpoints } from "services/apis";
import { addLoader, showError, showSuccess } from "slices/loaderSlice";
import { setWarehouses } from "slices/varientSlice";


// ➕ Add Varient
export async function addWarehouse(params, dispatch, list, setter) {
    try {
        dispatch(addLoader("addWarehouse"));

        const response = (await apiConnector("POST", warehouseEndpoints.ADD_WAREHOUSES, params)).data;

        if (response.success) {
            const newList = [...list, response.warehouse];

            dispatch(setWarehouses(newList));

            const newWarehouse = {
                _id: response.warehouse._id,
                name: response.warehouse.name,
                address: response.warehouse.address,
                phoneNumber: response.warehouse.phoneNumber,
                totalItems: 0,
                totalQuantity: 0,
                items: [],
            };
            setter((s) => [newWarehouse, ...s]);

            dispatch(showSuccess({ id: "addWarehouse", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "addWarehouse",
            message: err?.response?.data?.message || "Failed to add variant"
        }));
    }
}

export async function deleteWarehouse(params, dispatch, list, setWarehouses) {
    try {
        dispatch(addLoader("deleteWarehouse"));

        const response = (await apiConnector("DELETE", warehouseEndpoints.DELETE_WAREHOUSE + `/${params.warehouseId}`)).data;

        if (response.success) {
            setWarehouses(list.filter((c) => c._id !== params.warehouseId));

            dispatch(showSuccess({ id: "deleteWarehouse", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "deleteWarehouse",
            message: err?.response?.data?.message || "Failed to delete warehouse"
        }));
    }
}

export async function updateWarehouse(params, dispatch, list, setWarehouses) {
    try {
        dispatch(addLoader("updateWarehouse"));

        const response = (await apiConnector("POST", warehouseEndpoints.UPDATE_WAREHOUSE, params)).data;

        if (response.success) {
            setWarehouses(list.map((c) => {
                if (c._id === params.warehouseId) {
                    c.name = params.name || c.name;
                    c.address = params.address || c.address;
                    c.phoneNumber = params.phoneNumber || c.phoneNumber;
                }
                return c;
            }))

            dispatch(showSuccess({ id: "updateWarehouse", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "updateWarehouse",
            message: err?.response?.data?.message || "Failed to update warehouse"
        }));
    }
}

// ➕ Add Varient
export async function showWarehouse(params, dispatch, list, setter) {
    try {
        dispatch(addLoader("showWarehouse"));

        const response = (await apiConnector("POST", warehouseEndpoints.SHOW_WAREHOUSES, params)).data;

        if (response.success) {
            setter(list.map((prev) => {
                if (prev._id === params.warehouseId) {
                    prev.visible = true;
                }
                return prev;
            }))

            dispatch(showSuccess({ id: "showWarehouse", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "showWarehouse",
            message: err?.response?.data?.message || "Failed to show Warehouse"
        }));
    }
}

// ➕ Add Varient
export async function hideWarehouse(params, dispatch, list, setWarehouses) {
    try {
        dispatch(addLoader("hideWarehouse"));

        const response = (await apiConnector("POST", warehouseEndpoints.HIDE_WAREHOUSES, params)).data;

        if (response.success) {
            setWarehouses(list.map((prev) => {
                if (prev._id === params.warehouseId) {
                    prev.visible = false;
                }
                return prev;
            }))

            dispatch(showSuccess({ id: "hideWarehouse", message: response.message }));
        }
    } catch (err) {
        dispatch(showError({
            id: "hideWarehouse",
            message: err?.response?.data?.message || "Failed to show Warehouse"
        }));
    }
}

export async function getAllWarehouseDetails(setWarehouses) {
    try {
        const response = (await apiConnector('GET', warehouseEndpoints.GET_ALL_WAREHOUSE_DETAILS)).data;

        if (response.success) {
            setWarehouses(response.data.list);
        }
    } catch (err) {
        return null;
    }
}

export async function getDataByWarehouses(id, setItemsList) {
    try {
        const response = (await apiConnector('POST', warehouseEndpoints.GET_DATA_BY_WAREHOUSES, { warehouse: id })).data;

        if (response.success) {
            setItemsList(response.data.items);
        }
    } catch (err) {
        console.log(err);
    }
}