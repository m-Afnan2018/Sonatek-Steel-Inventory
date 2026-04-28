import axios from "axios";
import toast from "react-hot-toast";
import { utilEndpoints } from "services/apis";


export async function downloadTemplate() {
    try {


        // const response = await fetch('http://localhost:4000/api/v1/booking/getExcelBooking', {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${localStorage.getItem(token)}`
        //     }
        // });
        const response = await fetch(utilEndpoints.DOWNLOAD_TEMPLATE, {
            method: 'GET',
        });
        // const response = await fetch('http://localhost:4000/api/v1/item/getExcelItem', {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${localStorage.getItem(token)}`
        //     }
        // });
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Item-Data-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
    }
}

export async function getExcelBooking() {
    try {
        const response = await fetch(utilEndpoints.GET_EXCEL_BOOKING, {
            method: 'GET',
        });
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Item-Data-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
    }
}

export async function getExcelItem() {
    try {
        const response = await fetch(utilEndpoints.GET_EXCEL_ITEM, {
            method: 'GET',
        });
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Item-Data-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
    }
}

export async function uploadCSV(file, setUploading, inputRef) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        setUploading(true);
        toast.loading("Uploading file...");

        const { data } = await axios.post(utilEndpoints.UPLOAD_CSV, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        toast.dismiss();
        toast.success("File uploaded successfully!");
        return data;
    } catch (err) {
        toast.dismiss();
        toast.error(err.response?.data?.message || "Upload failed");
    } finally {
        setUploading(false);
        inputRef.current.value = null;
    }
}