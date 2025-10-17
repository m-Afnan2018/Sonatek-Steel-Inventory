import React, { useEffect, useState } from 'react';
import style from './Inventory.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllItem, updateItem } from 'services/operations/itemAPI';
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
    const { token } = useSelector((state) => state.auth);

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

    const onDownload = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/v1/item/getExcelItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Access-Control-Allow-Origin': 'http://localhost:3000'
                },
                body: JSON.stringify({ search, filters })
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
    };

    // Fetch all items
    useEffect(() => {
        if (listViewList) {
            setItems(listViewList);
            setLoading(false);
        }
    }, [listViewList]);

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
                                    <th>Ship To</th>
                                    <th>Vehicle Number</th>
                                    <th>Loader</th>
                                    <th>Transport</th>
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
                <button onClick={onDownload}>Download</button>

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

    const { grades, thicknesses, widths, cutters } = useSelector(state => state.varient);
    const dispatch = useDispatch();

    const [select, setSelect] = useState('');
    const [value, setValue] = useState('');

    const clickHandler = (type) => {
        setSelect(type);
        setValue(item[type]);
    };

    const handleSave = (e) => {
        e.stopPropagation(); const grade = grades.find(g => g.name === item.grade)._id;
        const thickness = thicknesses.find(t => t.name === item.thickness)._id;
        const width = widths.find(w => w.name === item.width)._id;
        const cutter = cutters.find(c => c.name === item.shipTo)?._id;
        let Item = { ...item, grade, thickness, width, shipTo: cutter };
        let updatedItem = { ...Item, [select]: value };
        updateItem(updatedItem, dispatch);
        setSelect('');
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setValue(item[select]);
        setSelect('');
    };

    const renderEditableField = (type, inputType = 'text') => (
        <div onClick={(e) => e.stopPropagation()}>
            <input
                type={inputType}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
            />
            <div className={style.inlineButtons}>
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );

    const renderDropdownField = (type, options) => (
        <div onClick={(e) => e.stopPropagation()}>
            <select
                value={value?._id}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
            >
                <option value="">Select</option>
                {options.map((opt) => (
                    <option key={opt._id} value={opt._id}>
                        {opt.name || opt.value}
                    </option>
                ))}
            </select>
            <div className={style.inlineButtons}>
                <button type="button" onClick={handleSave}>Save</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    );

    return (
        <tr
            className={`${view === item._id ? style.activeRow : ''}`}
            onClick={() => setView(item._id)}
        >
            {/* Wagon Number */}
            <td onClick={() => clickHandler('wagonNumber')}>
                {select === 'wagonNumber'
                    ? renderEditableField('wagonNumber')
                    : item.wagonNumber || '-'}
            </td>

            {/* Challan Date */}
            <td onClick={() => clickHandler('challanDate')}>
                {select === 'challanDate'
                    ? renderEditableField('challanDate', 'date')
                    : challanDate || '-'}
            </td>

            {/* Challan Number */}
            <td onClick={() => clickHandler('challanNumber')}>
                {select === 'challanNumber'
                    ? renderEditableField('challanNumber')
                    : item.challanNumber || '-'}
            </td>

            {/* Type */}
            <td onClick={() => clickHandler('type')}>
                {select === 'type' ? (
                    <div onClick={(e) => e.stopPropagation()}>
                        <select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoFocus
                        >
                            <option value="">Select</option>
                            <option value="Hot Rolled">Hot Rolled</option>
                            <option value="Cold Rolled">Cold Rolled</option>
                        </select>
                        <div className={style.inlineButtons}>
                            <button type="button" onClick={handleSave}>Save</button>
                            <button type="button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    item.type
                )}
            </td>

            {/* Thickness x Width x Grade */}
            <td style={{ display: 'flex', gap: '5px' }}>
                {/* Thickness */}
                <div onClick={() => clickHandler('thickness')}>
                    {select === 'thickness'
                        ? renderDropdownField('thickness', thicknesses)
                        : <span>{item.thickness}</span>}
                </div>
                X
                {/* Width */}
                <div onClick={() => clickHandler('width')}>
                    {select === 'width'
                        ? renderDropdownField('width', widths)
                        : <span>{item.width}</span>}
                </div>
                X
                {/* Grade */}
                <div onClick={() => clickHandler('grade')}>
                    {select === 'grade'
                        ? renderDropdownField('grade', grades)
                        : <span>{item.grade}</span>}
                </div>
            </td>

            {/* Quantity */}
            <td onClick={() => clickHandler('quantity')}>
                {select === 'quantity'
                    ? renderEditableField('quantity', 'number')
                    : item.quantity}
            </td>

            {/* Ship To */}
            <td onClick={() => clickHandler('shipTo')}>
                {select === 'shipTo' ? (
                    <div onClick={() => clickHandler('shipTo')}>
                        {select === 'shipTo'
                            ? renderDropdownField('shipTo', cutters)
                            : <span>{item.width}</span>}
                    </div>
                ) : (
                    item.shipTo
                )}
            </td>

            {/* Vehicle */}
            <td onClick={() => clickHandler('vehicleNumber')}>
                {select === 'vehicleNumber'
                    ? renderEditableField('vehicleNumber')
                    : item.vehicleNumber || '-'}
            </td>

            {/* Ship To */}
            <td onClick={() => clickHandler('loader')}>
                {select === 'loader'
                    ? renderEditableField('loader')
                    : item.loader || '-'}
            </td>

            {/* Ship To */}
            <td onClick={() => clickHandler('transporterName')}>
                {select === 'transporterName'
                    ? renderEditableField('transporterName')
                    : item.transporterName || '-'}
            </td>
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
                <option value='remaining'> In Stock </option>
                <option value='finished'> Sold Out </option>
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

        {/* 📅 Date Range Filter */}
        <div>
            <label>From Date:</label>
            <input type="date" {...register("fromDate")} />
        </div>

        <div>
            <label>To Date:</label>
            <input type="date" {...register("toDate")} />
        </div>

        <div className={style.buttonGroup}>
            <button type='submit'>Filter</button>
            <button type='button' onClick={handleReset}>Reset</button>
        </div>
    </form>
}

export default Items;
