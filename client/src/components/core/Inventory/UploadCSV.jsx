import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const UploadCSV = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            toast.loading("Uploading file...");

            const BASE_URL = process.env.REACT_APP_BASE_URL;
            const res = await axios.post(`${BASE_URL}/item/uploadCSV`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const inserted = res.data?.data?.inserted ?? res.data?.length ?? 0;
            const skipped = res.data?.data?.skipped ?? 0;

            toast.dismiss();
            toast.success("File uploaded successfully!");

            setResult({ inserted, skipped });
            setFile(null);
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-2xl mt-10 border">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                Upload Items CSV/Excel
            </h2>

            <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full mb-4 border border-gray-300 rounded-lg p-2 cursor-pointer"
                disabled={uploading}
            />

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-2 rounded-lg text-white font-medium transition ${uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>

            {result && (
                <div className="mt-5 bg-green-50 p-3 rounded-md text-sm text-green-700 border border-green-300">
                    {result.inserted} items created successfully{result.skipped > 0 ? `, ${result.skipped} rows skipped.` : "!"}
                </div>
            )}
        </div>
    );
};

export default UploadCSV;
