import React, { useEffect, useState } from 'react';
import style from './Dashboard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem } from 'services/operations/itemAPI';
import { useForm } from 'react-hook-form';

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [pagination, setPagination] = useState(null);
    const { listViewList } = useSelector(state => state.item);
    
    // eslint-disable-next-line no-unused-vars
    const [filters, setFilters] = useState({
        type: '',
        grade: '',
        formType: '',
        width: '',
        thickness: '',
        wagonNumber: '',
        challanNumber: '',
        challanDate: '',
        shipTo: '',
    })

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
            <Filters setFilters={setFilters} />
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
                                    <th>Wagon No.</th>
                                    <th>Challan date</th>
                                    <th>Challan No.</th>
                                    <th>Type</th>
                                    <th>Material Description</th>
                                    <th>Quantity</th>
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
            <td>{item.wagonNumber}</td>
            <td> {challanDate}  </td>
            <td> {item.challanNumber || '-'} <br /> </td>
            <td>{item.type}</td>
            <td>{item.thickness ? `${item.thickness} X ${item.width} X ${item.grade}` : '-'}</td>
            <td>{item.quantity}</td>
        </tr>
    );
};

const Filters = ({ setFilters }) => {
    const { grades, thicknesses, cutters, widths } = useSelector(state => state.varient)
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            type: '',
            grade: '',
            formType: '',
            width: '',
            thickness: '',
            wagonNumber: '',
            challanNumber: '',
            challanDate: '',
            quantity: '',
            shipTo: '',
        }
    })

    const onSubmit = (filters) => {
        getAllItem({ filters }, dispatch);
    }

    const handleReset = () => {
        getAllItem({}, dispatch);
    }

    return <form className={style.formBlock} onSubmit={handleSubmit(onSubmit)}>
        <div>
            <label htmlFor='remaining'>Quantity:</label>
            <select
                id='remaining'
                {...register('remaining')}
            >
                <option value=''>All</option>
                <option value='remaining'> Remaining </option>
                <option value='finished'> Finished </option>
            </select>
            {errors.grade && <span className={style.error}>{errors.remaining.message}</span>}
        </div>


        <div>
            <label htmlFor='type'>Type:</label>
            <select
                id='type'
                {...register('type')}
            >
                <option value=''>All</option>
                <option value='Hot Rolled'>  Hot Rolled </option>
                <option value='Cold Rolled'>  Cold Rolled </option>
            </select>
            {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
        </div>


        <div>
            <label htmlFor='grade'>Grade:</label>
            <select
                id='grade'
                {...register('grade')}
            >
                <option value=''>All</option>
                {grades && grades.map((grade) => (
                    <option key={grade._id} value={grade._id}>
                        {grade.name}
                    </option>
                ))}
            </select>
            {errors.grade && <span className={style.error}>{errors.grade.message}</span>}
        </div>

        <div>
            <label htmlFor='width'>Width: </label>
            <select
                id='width'
                {...register('width')}
            >
                <option value=''>All</option>
                {widths && widths.map((width) => (
                    <option key={width._id} value={width._id}>
                        {width.value || width.name}
                    </option>
                ))}
            </select>
            {errors.width && <span className={style.error}>{errors.width.message}</span>}
        </div>

        <div>
            <label htmlFor='thickness'>Thickness: </label>
            <select
                id='thickness'
                {...register('thickness')}
            >
                <option value=''>All</option>
                {thicknesses && thicknesses.map((thickness) => (
                    <option key={thickness._id} value={thickness._id}>
                        {thickness.value || thickness.name}
                    </option>
                ))}
            </select>
            {errors.thickness && <span className={style.error}>{errors.thickness.message}</span>}
        </div>

        <div>
            <label htmlFor='wagonNumber'>Wagon Number:</label>
            <input
                id='wagonNumber'
                type='text'
                placeholder='Enter wagon number'
                {...register('wagonNumber')}
            />
            {errors.wagonNumber && <span className={style.error}>{errors.wagonNumber.message}</span>}
        </div>

        <div>
            <label htmlFor='challanNumber'>Challan Number</label>
            <input
                id='challanNumber'
                type='text'
                placeholder='Enter challan number'
                {...register('challanNumber')}
            />
            {errors.challanNumber && <span className={style.error}>{errors.challanNumber.message}</span>}
        </div>
        <div>
            <label htmlFor='challanDate'>Challan Date</label>
            <input
                id='challanDate'
                type='date'
                {...register('challanDate')}
            />
            {errors.challanDate && <span className={style.error}>{errors.challanDate.message}</span>}
        </div>

        <div>
            <label htmlFor='quantity'>Quantity</label>
            <input
                id='quantity'
                type='number'
                step="any"
                placeholder='Enter quantity'
                {...register('quantity')}
            />
            {errors.quantity && <span className={style.error}>{errors.quantity.message}</span>}
        </div>

        <div>
            <label htmlFor='shipTo'>Ship To:</label>
            <select
                id='shipTo'
                {...register('shipTo')}
            >
                <option value=''>All</option>
                {cutters && cutters.map((cutter) => (
                    <option key={cutter._id} value={cutter._id}>
                        {cutter.name}
                    </option>
                ))}
            </select>
            {errors.shipTo && <span className={style.error}>{errors.shipTo.message}</span>}
        </div>

        <div className={style.buttonGroup}>
            <button type='submit'>Filter</button>
            <button type='button' onClick={handleReset}>Reset</button>
        </div>
    </form>
}

export default Items;
