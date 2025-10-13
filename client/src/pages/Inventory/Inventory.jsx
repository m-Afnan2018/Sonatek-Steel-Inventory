import React, { useEffect, useState } from 'react'
import style from './Inventory.module.css'
import { getAllItem, getUpcomingItem } from 'services/operations/itemAPI';
import { useDispatch, useSelector } from 'react-redux';
import { useOverlay } from 'hooks/useOverlay';
import AddItemForm from 'components/common/Overlay/AddItemForm';
import Items from 'components/core/Dashboard/Items';
import Upcoming from 'components/core/Inventory/Upcoming';

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

    useEffect(() => {
        getAllItem({ search: '' }, dispatch);
        getUpcomingItem({}, dispatch);
    }, [dispatch])

    return (
        <div className={style.Inventory}>
            <h2>Manage Inventory</h2>
            {userData && ['admin', 'director', 'inventory_associate'].includes(userData.role) && <div className={style.addNew}>
                <button onClick={() => showOverlay(AddItemForm, { showForm, setShowForm })}>Add new Item</button>
                {/* <Form setShowForm={setShowForm} showForm={showForm} /> */}


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
            <Items />
        </div>
    )
}

export default Inventory