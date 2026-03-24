import React, { useEffect, useMemo, useState } from "react";
import style from "./Warehouse.module.css";
import { useDispatch } from "react-redux";
import {
    addWarehouse,
    getAllWarehouseDetails,
    getDataByWarehouses,
    hideWarehouse,
    showWarehouse,
    updateWarehouse,
} from "services/operations/warehouseAPI";

const Warehouse = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editFields, setEditFields] = useState({ name: "", address: "", phoneNumber: "" });

    // Expandable Items
    const [expandedWarehouseId, setExpandedWarehouseId] = useState(null);
    const [itemsList, setItemsList] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        setLoading(true);
        getAllWarehouseDetails((data) => {
            const list = Array.isArray(data) ? data : data.list ?? [];
            setWarehouses(list);
            setLoading(false);
        });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        addWarehouse({ name, address, phoneNumber }, dispatch, warehouses, setWarehouses);
        setShowForm(false);
        setName("");
        setAddress("");
        setPhoneNumber("");
    };

    const startEdit = (c) => {
        setEditingId(c._id);
        setEditFields({ name: c.name || "", address: c.address || "", phoneNumber: c.phoneNumber || "" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditFields({ name: "", address: "", phoneNumber: "" });
    };

    const saveEdit = async (id) => {
        setWarehouses((prev) => prev.map((c) => (c._id === id ? { ...c, ...editFields } : c)));
        setEditingId(null);
        updateWarehouse({ ...editFields, warehouseId: id }, dispatch, warehouses, setWarehouses);
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return warehouses;
        return warehouses.filter((c) =>
            (c.name || "").toLowerCase().includes(q) ||
            (c.address || "").toLowerCase().includes(q) ||
            (c.phoneNumber || "").toLowerCase().includes(q)
        );
    }, [warehouses, search]);

    const handleLoadItems = async (warehouseId) => {
        if (expandedWarehouseId === warehouseId) {
            // toggle close
            setExpandedWarehouseId(null);
            setItemsList([]);
            return;
        }
        setLoadingItems(true);
        setItemsList([]);
        try {
            getDataByWarehouses(warehouseId, setItemsList, dispatch); // expects data in res.data
            // const warehouseData = res?.data;
            // setItemsList(warehouseData?.items ?? []);
            setExpandedWarehouseId(warehouseId);
        } catch (err) {
            console.error("Failed to load items:", err);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleVisibility = (id, visible) => {
        if (visible) {
            hideWarehouse({ warehouseId: id }, dispatch, warehouses, setWarehouses);
        } else {
            showWarehouse({ warehouseId: id }, dispatch, warehouses, setWarehouses);
        }
    }

    return (
        <div className={style.Warehouse}>
            <h2>Manage Warehouses</h2>
            <div className={style.header}>
                <div>
                    <h3>Warehouse Details</h3>
                    <p className={style.count}>Total Warehouses: {warehouses?.length || 0}</p>
                </div>
                <div className={style.controls}>
                    <input
                        className={style.search}
                        placeholder="Search by name, address, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {!showForm && (
                        <button className={style.addBtn} onClick={() => setShowForm(true)}>
                            ➕ Add New Warehouse
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <form className={style.form} onSubmit={onSubmit}>
                    <div className={style.formRow}>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Warehouse Name" required />
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
                        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" />
                    </div>
                    <div className={style.formActions}>
                        <button type="submit">Add</button>
                        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className={style.tableWrap}>
                {loading ? (
                    <div className={style.loader}>Loading...</div>
                ) : (
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th style={{width: '6rem'}}>Name</th>
                                <th style={{width: '10rem'}}>Address</th>
                                <th style={{width: '6rem'}}>Phone</th>
                                <th style={{width: '5rem'}}>Total Items</th>
                                <th style={{width: '5rem'}}>Total Qty</th>
                                <th style={{minWidth: '16rem'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={style.noData}>No warehouses found</td>
                                </tr>
                            ) : filtered.map((c) => (
                                <React.Fragment key={c._id}>
                                    <tr className={style.row}>
                                        <td>
                                            {editingId === c._id ? (
                                                <input
                                                    className={style.inlineInput}
                                                    value={editFields.name}
                                                    onChange={(e) => setEditFields((s) => ({ ...s, name: e.target.value }))}
                                                />
                                            ) : <div className={style.cellPrimary}>{c.name}</div>}
                                        </td>
                                        <td>
                                            {editingId === c._id ? (
                                                <input
                                                    className={style.inlineInput}
                                                    value={editFields.address}
                                                    onChange={(e) => setEditFields((s) => ({ ...s, address: e.target.value }))}
                                                />
                                            ) : <div className={style.cellSecondary}>{c.address}</div>}
                                        </td>
                                        <td>
                                            {editingId === c._id ? (
                                                <input
                                                    className={style.inlineInput}
                                                    value={editFields.phoneNumber}
                                                    onChange={(e) => setEditFields((s) => ({ ...s, phoneNumber: e.target.value }))}
                                                />
                                            ) : <div className={style.cellSecondary}>{c.phoneNumber}</div>}
                                        </td>
                                        <td className={style.center}>{c.totalItems || 0}</td>
                                        <td className={style.center}>{c.totalQuantity != null ? Number(c.totalQuantity).toFixed(3) : '0.000'}</td>
                                        <td>
                                            {editingId === c._id ? (
                                                <div className={style.actionGroup}>
                                                    <button className={style.saveBtn} onClick={() => saveEdit(c._id)}>Save</button>
                                                    <button className={style.cancelBtn} onClick={cancelEdit}>Cancel</button>
                                                </div>
                                            ) : (
                                                <div className={style.actionGroup}>
                                                    <button className={style.editBtn} onClick={() => startEdit(c)}>Edit</button>
                                                    <button className={style.itemsBtn} onClick={() => handleLoadItems(c._id)}>
                                                        {expandedWarehouseId === c._id ? "Hide Items" : "Load Items"}
                                                    </button>
                                                    <button className={style.itemsBtn} onClick={() => handleVisibility(c._id, c.visible)}>
                                                        {c.visible ? "Hide" : "Show"}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedWarehouseId === c._id && (
                                        <tr className={style.itemsRow}>
                                            <td colSpan={6}>
                                                {loadingItems ? (
                                                    <div className={style.loader}>Loading items...</div>
                                                ) : itemsList.length === 0 ? (
                                                    <div className={style.noData}>No items found</div>
                                                ) : (
                                                    <table className={style.itemsTable} style={{ width: '100%' }}>
                                                        <thead>
                                                            <tr>
                                                                <th>Type</th>
                                                                <th>Grade</th>
                                                                <th>Thickness</th>
                                                                <th>Width</th>
                                                                <th>Quantity</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {itemsList.map(item => (
                                                                <tr key={item._id}>
                                                                    <td>{item.type}</td>
                                                                    <td>{item.grade?.name || "-"}</td>
                                                                    <td>{item.thickness?.name || "-"}</td>
                                                                    <td>{item.width?.name || "-"}</td>
                                                                    <td>{item.quantity}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Warehouse;
