import { apiConnector } from "services/apiConnector";
import { userEndpoints } from "services/apis";
import { deleteUser, setAllUsers, updateUserDesignation, updateUserVerification } from "slices/userSlice";


export async function getAllUsers(dispatch) {
    try {
        const response = await apiConnector('GET', userEndpoints.GET_ALL_USER);
        dispatch(setAllUsers(response.data.users))
    } catch (err) {
        console.log("Error:", err);
    }
}

export async function verifyUser(id, dispatch) {
    try {
        const response = (await apiConnector('PUT', userEndpoints.VERIFY_USER, { userId: id })).data;

        if (response.success) {
            dispatch(updateUserVerification(id));
        }
    } catch (err) {
        console.log(err);
    }
}

export async function removeUser(id, dispatch) {
    try {
        const response = (await apiConnector('DELETE', userEndpoints.REMOVE_USER, { userId: id })).data;

        if (response.success) {
            dispatch(deleteUser(id))
        }
    } catch (err) {
        console.log(err);
    }
}

export async function changeUserDesignation(id, role, dispatch) {
    try {
        const response = (await apiConnector('PATCH', userEndpoints.CHANGE_DESIGNATION, { userId: id, role })).data;

        if (response.success) {
            dispatch(updateUserDesignation({ userId: id, role: role }));
        }
    } catch (err) {

    }
}