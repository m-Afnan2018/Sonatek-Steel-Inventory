import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const { listViewList } = useSelector(state => state.item);
    const dispatch = useDispatch();

    const onSearch = (e) => {
        e.preventDefault();
        // Implement search functionality
        getAllItem({ search: search }, dispatch);
    }

    // Fetch all items
    useEffect(() => {
        if (listViewList) {
            setItems(listViewList);
            setLoading(false);
        }
    }, [listViewList]);

    useEffect(() => {
        getAllItem({ search: search, page }, dispatch);
    }, [dispatch, page, search])

    return (
        <div className={style.staffContainer}>
            <h3 className={style.heading}>Inventory Items</h3>

            <div className={style.card}>
                {loading ? (
                    <div className={style.loading}>Loading items...</div>
                ) : items.length === 0 ? (
                    <div className={style.empty}>No items found</div>
                ) : (
                    <div className={style.tableWrapper}>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Grade</th>
                                    <th>Width</th>
                                    <th>Thickness</th>
                                    <th>Quantity</th>
                                    <th>Wagon No.</th>
                                    <th>Challan number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <SingleItem key={item._id} item={item} view={view} setView={setView} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Pagination controls */}
            </div>
            {/* Top controls: Search and pagination info */}
            <div className={style.controlsRow}>
                <form onSubmit={onSearch} className={style.searchForm}>
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={style.searchInput}
                    />
                    <button type="submit" className={style.searchButton}>Search</button>
                </form>

                <div className={style.paginationControls}>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        Prev
                    </button>
                    <div className={style.paginationInfo}>
                        Page {page} of {pagination?.totalPages || 1}
                    </div>
                    <button
                        onClick={() => setPage((p) => (p < (pagination?.totalPages || 1) ? p + 1 : p))}
                        disabled={page >= (pagination?.totalPages || 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div >
    );
};

const SingleItem = ({ item, setView, view }) => {
    const challanDate = item.challanDate
        ? new Date(item.challanDate).toLocaleDateString()
        : '-';

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ''}`}
            onClick={() => setView(item._id)}
        >
            <td>{item.type}</td>
            <td>{item.grade || '-'}</td>
            <td>{item.width || '-'}</td>
            <td>{item.thickness || '-'}</td>
            <td>{item.quantity}</td>
            <td>{item.wagonNumber}</td>
            <td>
                {item.challanNumber || '-'} <br />
                <small>{challanDate}</small>
            </td>
        </tr>
    );
};

export default Items;
