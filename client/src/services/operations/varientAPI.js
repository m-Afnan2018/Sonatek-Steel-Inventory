import { apiConnector } from "services/apiConnector";
import { varientEndpoints } from "services/apis";
import { setCutters, setGrades, setThicknesses, setWidths } from "slices/varientSlice";


export async function getAllVarients(dispatch) {
    try {
        const response = (await apiConnector('GET', varientEndpoints.GET_ALL_VARIENT)).data;

        if (response.success) {
            dispatch(setGrades(response.grades));
            dispatch(setCutters(response.cutters))
            dispatch(setThicknesses(response.thickness))
            dispatch(setWidths(response.widths));
        }
    } catch (err) {
        console.log(err);
    }
}

export async function addVarient(type, value, dispatch, list) {
    try {
        const response = (await apiConnector('POST', varientEndpoints.ADD_VARIENT, { type, value })).data;

        if (response.success) {
            const newList = [...list, response.value];

            if (type === 'grade') {
                dispatch(setGrades(newList));
            }

            if (type === 'cutter') {
                dispatch(setCutters(newList));
            }

            if (type === 'thickness') {
                dispatch(setThicknesses(newList));
            }

            if (type === 'width') {
                dispatch(setWidths(newList));
            }
        }
    } catch (err) {
        console.log(err);
    }
}

export async function updateVarient(id, type, value, dispatch, list) {
    try {
        const response = (await apiConnector('PATCH', varientEndpoints.UPDATE_VARIENT, {
            id, type, value
        })).data;

        if (response.success) {
            const newList = list.map((vari) => {
                if (vari._id === id) {
                    return { ...vari, name: value }; // create new object with updated name
                }
                return vari;
            });

            if (type === 'grade') {
                dispatch(setGrades(newList));
            }

            if (type === 'cutter') {
                dispatch(setCutters(newList));
            }

            if (type === 'thickness') {
                dispatch(setThicknesses(newList));
            }

            if (type === 'width') {
                dispatch(setWidths(newList));
            }
        }
    } catch (err) {
        console.log(err);
    }
}

export async function deleteVarient(id, type, dispatch, list) {
    try {
        const response = (await apiConnector('DELETE', varientEndpoints.DELETE_VARIENT, { id, type })).data;

        if (response.success) {
            const newList = list.filter((vari) => vari._id !== id);

            if (type === 'grade') {
                dispatch(setGrades(newList));
            }

            if (type === 'cutter') {
                dispatch(setCutters(newList));
            }

            if (type === 'thickness') {
                dispatch(setThicknesses(newList));
            }

            if (type === 'width') {
                dispatch(setWidths(newList));
            }
        }
    } catch (err) {
        console.log(err);
    }
}

export async function getAllVarientsDetail(setData, setLoading) {
    try {
        const response = (await apiConnector('GET', varientEndpoints.GET_ALL_VARIENT_DETAIL)).data;

        if (response) {
            setData(response.data)
            setLoading(false);
        }
    } catch (err) {
        console.log(err);
    }
}