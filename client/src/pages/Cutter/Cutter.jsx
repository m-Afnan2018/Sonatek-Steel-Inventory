import React, { useEffect, useMemo, useState } from "react";
import style from "./Cutter.module.css";
import { useDispatch } from "react-redux";
import {
    addCutter,
    getAllCutterDetails,
    getDataByCutters,
    hideCutter,
    showCutter,
    updateCutter,
} from "services/operations/cuttersAPI";

const Cutter = () => {
    const [cutters, setCutters] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editFields, setEditFields] = useState({ name: "", address: "", phoneNumber: "" });

    // Expandable Items
    const [expandedCutterId, setExpandedCutterId] = useState(null);
    const [itemsList, setItemsList] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        setLoading(true);
        getAllCutterDetails((data) => {
            const list = Array.isArray(data) ? data : data.list ?? [];
            setCutters(list);
            setLoading(false);
        });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        addCutter({ name, address, phoneNumber }, dispatch, cutters, setCutters);
        setShowForm(false);
        setName("");
        setAddress("");
        setPhoneNumber("");
    };

    useEffect(()=>{
        console.log(cutters);
    }, [cutters])

    const startEdit = (c) => {
        setEditingId(c._id);
        setEditFields({ name: c.name || "", address: c.address || "", phoneNumber: c.phoneNumber || "" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditFields({ name: "", address: "", phoneNumber: "" });
    };

    const saveEdit = async (id) => {
        setCutters((prev) => prev.map((c) => (c._id === id ? { ...c, ...editFields } : c)));
        setEditingId(null);
        updateCutter({ ...editFields, cutterId: id }, dispatch, cutters, setCutters);
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return cutters;
        return cutters.filter((c) =>
            (c.name || "").toLowerCase().includes(q) ||
            (c.address || "").toLowerCase().includes(q) ||
            (c.phoneNumber || "").toLowerCase().includes(q)
        );
    }, [cutters, search]);

    const handleLoadItems = async (cutterId) => {
        if (expandedCutterId === cutterId) {
            // toggle close
            setExpandedCutterId(null);
            setItemsList([]);
            return;
        }
        setLoadingItems(true);
        setItemsList([]);
        try {
            getDataByCutters(cutterId, setItemsList, dispatch); // expects data in res.data
            // const cutterData = res?.data;
            // setItemsList(cutterData?.items ?? []);
            setExpandedCutterId(cutterId);
        } catch (err) {
            console.error("Failed to load items:", err);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleVisibility = (id, visible) => {
        if (visible) {
            hideCutter({ cutterId: id }, dispatch, cutters, setCutters);
        } else {
            showCutter({ cutterId: id }, dispatch, cutters, setCutters);
        }
    }

    return (
        <div className={style.Cutter}>
            <h2>Manage Cutters</h2>
            <div className={style.header}>
                <div>
                    <h3>Cutter Details</h3>
                    <p className={style.count}>Total Cutters: {cutters?.length || 0}</p>
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
                            ➕ Add New Cutter
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <form className={style.form} onSubmit={onSubmit}>
                    <div className={style.formRow}>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Cutter Name" required />
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
                                <th>Name</th>
                                <th>Address</th>
                                <th>Phone</th>
                                <th>Total Items</th>
                                <th>Total Qty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={style.noData}>No cutters found</td>
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
                                        <td className={style.center}>{c.totalQuantity.toFixed(3) || 0}</td>
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
                                                        {expandedCutterId === c._id ? "Hide Items" : "Load Items"}
                                                    </button>
                                                    <button className={style.itemsBtn} onClick={() => handleVisibility(c._id, c.visible)}>
                                                        {c.visible ? "Hide" : "Show"}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedCutterId === c._id && (
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

export default Cutter;
