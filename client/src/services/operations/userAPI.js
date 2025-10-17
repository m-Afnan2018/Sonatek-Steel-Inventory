import { apiConnector } from "services/apiConnector";
import { userEndpoints } from "services/apis";
import { setUserData } from "slices/authSlice";
import {
    setAllUsers,
    updateAddUser,
    updateDeleteRequest,
    updateRemoveUser,
    updateUserDesignation,
    updateUserVerification,
} from "slices/userSlice";
import { addLoader, showError } from "slices/loaderSlice";

// 🧩 Get All Users
export async function getAllUsers(dispatch) {
    try {
        dispatch(addLoader("getAllUsers"));

        const response = await apiConnector("GET", userEndpoints.GET_ALL_USER);
        dispatch(setAllUsers(response.data.users));

        dispatch(
            // showSuccess({ id: "getAllUsers", message: "Successfully fetched all users" })
        );
    } catch (err) {
        dispatch(
            showError({
                id: "getAllUsers",
                message: err?.response?.data?.message || "Failed to fetch users",
            })
        );
    }
}

// ✅ Verify User
export async function verifyUser(params, dispatch) {
    try {
        dispatch(addLoader("verifyUser"));

        const response = (
            await apiConnector("PUT", userEndpoints.VERIFY_USER, params)
        ).data;

        if (response.success) {
            dispatch(updateUserVerification(params.userId));
            // dispatch(showSuccess({ id: "verifyUser", message: response.message }));
        } else {
            dispatch(showError({ id: "verifyUser", message: response.message }));
        }
    } catch (err) {
        dispatch(
            showError({
                id: "verifyUser",
                message: err?.response?.data?.message || "Verification failed",
            })
        );
    }
}

// ✅ Active User
export async function activeUser(id, dispatch) {
    try {
        dispatch(addLoader("activeUser"));

        const response = (
            await apiConnector("PATCH", userEndpoints.ACTIVE_USER, { userId: id })
        ).data;

        if (response.success) {
            dispatch(updateAddUser(id));
            // dispatch(showSuccess({ id: "activeUser", message: response.message }));
        } else {
            dispatch(showError({ id: "activeUser", message: response.message }));
        }
    } catch (err) {
        dispatch(
            showError({
                id: "activeUser",
                message: err?.response?.data?.message || "Failed to active  user",
            })
        );
    }
}

// 🗑️ Delete User
export async function deleteRequest(id, dispatch) {
    try {
        dispatch(addLoader("deleteRequest"));

        const response = (
            await apiConnector("DELETE", userEndpoints.DELETE_USER, { userId: id })
        ).data;

        if (response.success) {
            dispatch(updateDeleteRequest(id));
            // dispatch(showSuccess({ id: "deleteRequest", message: response.message }));
        } else {
            dispatch(showError({ id: "deleteRequest", message: response.message }));
        }
    } catch (err) {
        dispatch(
            showError({
                id: "deleteRequest",
                message: err?.response?.data?.message || "Failed to delete user",
            })
        );
    }
}

// 🗑️ Remove User
export async function removeUser(id, dispatch) {
    try {
        dispatch(addLoader("removeUser"));

        const response = (
            await apiConnector("DELETE", userEndpoints.REMOVE_USER, { userId: id })
        ).data;

        if (response.success) {
            dispatch(updateRemoveUser(id));
            // dispatch(showSuccess({ id: "removeUser", message: response.message }));
        } else {
            dispatch(showError({ id: "removeUser", message: response.message }));
        }
    } catch (err) {
        dispatch(
            showError({
                id: "removeUser",
                message: err?.response?.data?.message || "Failed to remove user",
            })
        );
    }
}

// 🧑‍💼 Change User Designation
export async function changeUserDesignation(id, role, dispatch) {
    try {
        dispatch(addLoader("changeUserDesignation"));

        const response = (
            await apiConnector("PATCH", userEndpoints.CHANGE_DESIGNATION, {
                userId: id,
                role,
            })
        ).data;

        if (response.success) {
            dispatch(updateUserDesignation({ userId: id, role }));
            // dispatch(showSuccess({ id: "changeUserDesignation", message: response.message }));
        } else {
            dispatch(showError({ id: "changeUserDesignation", message: response.message }));
        }
    } catch (err) {
        dispatch(
            showError({
                id: "changeUserDesignation",
                message: err?.response?.data?.message || "Failed to change designation",
            })
        );
    }
}

// ✏️ Update User
export async function updateUser(params, dispatch) {
    try {
        dispatch(addLoader("updateUser"));

        const response = (
            await apiConnector("PUT", userEndpoints.UPDATE_USER, params)
        ).data;

        if (response.success) {
            dispatch(setUserData(response.user));
            // dispatch(showSuccess({ id: "updateUser", message: response.message }));
        } else {
            dispatch(showError({ id: "updateUser", message: response.message }));
        }
    } catch (err) {
        dispatch(
            showError({
                id: "updateUser",
                message: err?.response?.data?.message || "Failed to update user",
            })
        );
    }
}
