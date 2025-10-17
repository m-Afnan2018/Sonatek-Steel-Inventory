import React, { useEffect, useRef, useState } from 'react'
import style from './Inventory.module.css'
import { getAllItem, getUpcomingItem } from 'services/operations/itemAPI';
import { useDispatch, useSelector } from 'react-redux';
import { useOverlay } from 'hooks/useOverlay';
import AddItemForm from 'components/common/Overlay/AddItemForm';
// import Items from 'components/core/Inventory/Items';
import Upcoming from 'components/core/Inventory/Upcoming';
import AddForm from 'components/core/Inventory/AddForm';
import Items from 'components/core/Inventory/Items';
import { downloadTemplate, uploadCSV } from 'services/operations/utilAPI';

const Inventory = () => {
    const [showForm, setShowForm] = useState(false);
    const dispatch = useDispatch();

    const { showOverlay } = useOverlay();
    const { userData } = useSelector(state => state.auth);

    useEffect(() => {
        if (showForm) {
            showOverlay(AddItemForm, { showForm, setShowForm })
        }
    }, [showForm, showOverlay])

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const inputRef = useRef();

    const handleFileChange = async (e) => {
        if (e.target.files[0]) {
            uploadCSV(e.target.files[0], setUploading, inputRef);
            setFile(null);
        }
    };
    const handleUpload = async () => {
        if (!file) {
            inputRef.current.click();
            return;
        }
    };

    useEffect(() => {
        getAllItem({ search: '' }, dispatch);
        getUpcomingItem({}, dispatch);
    }, [dispatch])

    return (
        <div className={style.Inventory}>
            <h2>Manage Inventory</h2>
            <AddForm />
            {userData && ['admin', 'director', 'inventory_associate'].includes(userData.role) && <div className={style.addNew}>
                <button onClick={() => showOverlay(AddItemForm, { showForm, setShowForm })}>Add new Item</button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="block w-full mb-4 border border-gray-300 rounded-lg p-2 cursor-pointer"
                    disabled={uploading}
                    hidden
                />
                <button onClick={handleUpload} >
                    {uploading ? "Uploading..." : "Import"}
                </button>
                <button onClick={downloadTemplate}>Download Template</button>
            </div>}
            <Upcoming />
            <Items />
        </div >
    )
}

export default Inventory