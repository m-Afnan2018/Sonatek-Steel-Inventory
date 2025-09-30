import { apiConnector } from "services/apiConnector";
import { userEndpoints } from "services/apis";
import { setUsers } from "slices/userSlice";


export async function getAllUsers(dispatch) {
    try {
        const response = await apiConnector('GET', userEndpoints.GET_ALL_USER);

        setUsers(response.data.users);
        dispatch(setUsers(response.data.users))
    } catch (err) {
        console.log("Error:", err);
    }
}