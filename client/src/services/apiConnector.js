import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headers, params) => {
    const newHeaders = headers ? { ...headers } : {};

    const token = sessionStorage.getItem('id');

    // Add Authorization header with bearer token if available
    if (token) {
        newHeaders["Authorization"] = `Bearer ${token}`;
    }
    return axiosInstance({
        method,
        url,
        data: bodyData ? bodyData : null,
        headers: newHeaders,
        params: params ? params : null,
        withCredentials: true,
    })
}