import toast from "react-hot-toast";
import { apiConnector } from "services/apiConnector";
import { varientEndpoints } from "services/apis";
import { setCutters, setGrades, setThicknesses, setWidths } from "slices/varientSlice";


export async function getAllVarients(dispatch) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('GET', varientEndpoints.GET_ALL_VARIENT)).data;

        if (response.success) {
            // dispatch(setGrades(response.grades));
            // dispatch(setCutters(response.cutters))
            // dispatch(setThicknesses(response.thickness))
            // dispatch(setWidths(response.widths));

            // safe extractor that handles objects, strings, numbers, missing values
            const toName = (item, key = 'name') => {
                if (item == null) return '';                     // null/undefined -> empty
                if (typeof item === 'string' || typeof item === 'number') return String(item);
                const v = item[key];
                return v == null ? '' : String(v);
            };

            const sortByName = (arr = [], key = 'name') =>
                [...arr].sort((a, b) =>
                    toName(a, key).localeCompare(toName(b, key), undefined, { numeric: true, sensitivity: 'base' })
                );

            // use before dispatch
            dispatch(setGrades(sortByName(response.grades)));
            dispatch(setCutters(sortByName(response.cutters)));
            dispatch(setThicknesses(sortByName(response.thickness)));
            dispatch(setWidths(sortByName(response.widths)));
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        console.log(err);
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function addVarient(type, value, dispatch, list) {
    const toastId = toast.loading("Loading...")
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

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function updateVarient(id, type, value, dispatch, list) {
    const toastId = toast.loading("Loading...")
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

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function deleteVarient(id, type, dispatch, list) {
    const toastId = toast.loading("Loading...")
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

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}

export async function getAllVarientsDetail(setData, setLoading) {
    const toastId = toast.loading("Loading...")
    try {
        const response = (await apiConnector('GET', varientEndpoints.GET_ALL_VARIENT_DETAIL)).data;

        if (response) {
            setData(response.data)
            setLoading(false);
        }

        toast.dismiss(toastId);
        toast.success(response.message)
    } catch (err) {
        toast.dismiss(toastId);
        toast.error(err.response.data.message)
    }
}