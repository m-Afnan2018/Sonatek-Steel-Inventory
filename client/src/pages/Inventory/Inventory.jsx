import React, { useEffect, useState } from 'react'
import style from './Inventory.module.css'
import Form from 'components/core/Inventory/Form'
import Filter from 'components/core/Inventory/Filter';
import { getAllItem } from 'services/operations/itemAPI';
import ViewAll from 'components/core/Inventory/ViewAll';
import { useDispatch, useSelector } from 'react-redux';

const Inventory = () => {
    const [showForm, setShowForm] = useState(false);
    const dispatch = useDispatch();

    const { currentList } = useSelector(state => state.item);

    const [search, setSearch] = useState("");

    // const [items, setItems] = useState([]);
    // const [limit, setLimit] = useState(50);
    // const [statusFilter, setStatusFilter] = useState("");
    // const [sortBy, setSortBy] = useState("createdAt");
    // const [order, setOrder] = useState("desc");
    // const [page, setPage] = useState(1);
    // const [pages, setPages] = useState(1);

    const [filterOptions, setFilterOptions] = useState(false);

    const onSearch = () => {
        getAllItem({ search: search }, dispatch)
    }

    useEffect(() => {
        const scrollToTop = () => {
            console.log('here')
            document.querySelector(`.${style.Inventory}`).scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        };
        if (showForm) {
            scrollToTop();
        }
    }, [showForm])

    useEffect(() => {
        getAllItem({ search: '' }, dispatch);
    }, [dispatch])

    return (
        <div className={style.Inventory}>
            <h2>Manage Inventory</h2>
            <div className={style.addNew}>
                <button style={{ height: showForm ? '0' : '2rem' }} onClick={() => setShowForm(!showForm)}>Add new Item</button>
                <Form setShowForm={setShowForm} showForm={showForm} />
            </div>
            <div className={style.allItems}>
                <h3>All Items</h3>
                <div className={style.search}>
                    <input type='text' placeholder='Search Item' value={search} onChange={(e) => setSearch(e.target.value)} />
                    {/* <button onClick={() => setFilterOptions(!filterOptions)}>Filter</button> */}
                    <button onClick={onSearch}>Search</button>
                    <select>
                        <option value='' disabled>Sort By</option>
                        <option value='weight'>Weight</option>
                        <option value='challanDate'>Challan Date</option>
                        <option value='quantity'>Quantity</option>
                        <option value='createdAt'>Time</option>
                    </select>
                </div>
                <Filter filterOptions={filterOptions} setFilterOptions={setFilterOptions} />
                {<ViewAll list={currentList} />}
            </div>
        </div>
    )
}

export default Inventory