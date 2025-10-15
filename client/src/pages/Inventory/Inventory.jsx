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
import toast from 'react-hot-toast';
import axios from 'axios';

const Inventory = () => {
    const [showForm, setShowForm] = useState(false);
    const dispatch = useDispatch();

    const { showOverlay } = useOverlay();
    const { userData } = useSelector(state => state.auth);

    // const [items, setItems] = useState([]);
    // const [limit, setLimit] = useState(50);
    // const [statusFilter, setStatusFilter] = useState("");
    // const [sortBy, setSortBy] = useState("createdAt");
    // const [booking, setOrder] = useState("desc");
    // const [page, setPage] = useState(1);
    // const [pages, setPages] = useState(1);

    useEffect(() => {
        if (showForm) {
            showOverlay(AddItemForm, { showForm, setShowForm })
        }
    }, [showForm, showOverlay])

    // useEffect(() => {
    //     const scrollToTop = () => {
    //         document.querySelector(`.${style.Inventory}`).scrollTo({
    //             top: 0,
    //             behavior: 'smooth',
    //         });
    //     };
    //     if (showForm) {
    //         scrollToTop();
    //     }
    // }, [showForm])

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const inputRef = useRef();

    const handleFileChange = async (e) => {
        setFile(e.target.files[0]);

        if (e.target.files[0]) {
            const formData = new FormData();
            formData.append("file", e.target.files[0]);

            try {
                setUploading(true);
                toast.loading("Uploading file...");

                await axios.post("http://localhost:4000/api/v1/item/uploadCSV", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.dismiss();
                toast.success("File uploaded successfully!");

                setFile(null);
            } catch (err) {
                toast.dismiss();
                toast.error(err.response?.data?.message || "Upload failed");
            } finally {
                setUploading(false);
                inputRef.current.value = null;
            }
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

            </div>}
            <Upcoming />
            {/* <div className={style.allItems}>
                <h3>All Items</h3>
                <div className={style.search}>
                    <input type='text' placeholder='Search Item' value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button onClick={onSearch}>Search</button>
                    <button onClick={onReset}>Reset</button>
                    <select>
                        <option value='' disabled>Sort By</option>
                        <option value='weight'>Weight</option>
                        <option value='challanDate'>Challan Date</option>
                        <option value='quantity'>Quantity</option>
                        <option value='createdAt'>Time</option>
                    </select>
                </div>
                <Filter filterOptions={filterOptions} setFilterOptions={setFilterOptions} />
                <ViewAll list={currentList} />
            </div> */}
            {/* <Items /> */}
            <Items />
        </div >
    )
}

export default Inventory