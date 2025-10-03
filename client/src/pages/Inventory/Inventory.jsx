import React, { useState } from 'react'
import style from './Inventory.module.css'
import Form from 'components/core/Inventory/Form'

const Inventory = () => {
    const [showForm, setShowForm] = useState(false);

    const [items, setItems] = useState([]);
    const [limit, setLimit] = useState(50);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    return (
        <div className={style.Inventory}>
            <h2>Manage Inventory</h2>
            <div className={style.addNew}>
                <button style={{ height: showForm ? '0' : '2rem' }} onClick={() => setShowForm(!showForm)}>Add new Item</button>
                <Form setShowForm={setShowForm} showForm={showForm} />
            </div>
            <div className={style.allItems}>
                <h3>All Items</h3>
                <div>
                    <input type='text' placeholder='Search Item' />
                    <button>Filter</button>
                    <select>
                        <option value=''>Sort By</option>
                    </select>
                    <button>Search</button>
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}

export default Inventory