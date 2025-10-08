import toast from "react-hot-toast";
import { apiConnector } from "services/apiConnector";
import { userEndpoints } from "services/apis";
import { setUserData } from "slices/authSlice";
import { deleteUser, setAllUsers, updateUserDesignation, updateUserVerification } from "slices/userSlice";


export async function getAllUsers(dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector('GET', userEndpoints.GET_ALL_USER);
        dispatch(setAllUsers(response.data.users))
        toast.dismiss(toastId);
        toast.success('Successfully fetched all the users')
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function verifyUser(id, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('PUT', userEndpoints.VERIFY_USER, { userId: id })).data;

        if (response.success) {
            dispatch(updateUserVerification(id));
        }
        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function removeUser(id, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('DELETE', userEndpoints.REMOVE_USER, { userId: id })).data;

        if (response.success) {
            dispatch(deleteUser(id))
        }
        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function changeUserDesignation(id, role, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('PATCH', userEndpoints.CHANGE_DESIGNATION, { userId: id, role })).data;

        if (response.success) {
            dispatch(updateUserDesignation({ userId: id, role: role }));
        }
        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}


export async function updateUser(params, dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('PUT', userEndpoints.UPDATE_USER, params)).data;

        if (response.success) {
            dispatch(setUserData(response.user));
        }
        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}