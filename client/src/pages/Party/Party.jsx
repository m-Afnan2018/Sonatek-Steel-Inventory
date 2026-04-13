import React, { useEffect, useMemo, useState } from "react";
import style from "./Party.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllPartyDetails,
    createParty,
    editParty,
    removeParty,
} from "services/operations/bookingAPI";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus } from "react-icons/fi";

const Party = () => {
    // ── Local State ────
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Add form
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Inline edit
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    // Delete confirmation
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // ── Redux ─────
    const { parties } = useSelector((state) => state.booking);
    const dispatch = useDispatch();

    // ── Initial Fetch ─────
    useEffect(() => {
        getAllPartyDetails(dispatch);
    }, [dispatch]);

    useEffect(() => {
        if (parties) setLoading(false);
    }, [parties]);

    // ── Filtered List ─────
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return parties ?? [];
        return (parties ?? []).filter((p) =>
            (p.name || "").toLowerCase().includes(q)
        );
    }, [parties, search]);

    // ── Handlers: Create ─────
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setSubmitting(true);
        const ok = await createParty({ name: newName.trim() }, dispatch);
        if (ok) {
            setNewName("");
            setShowForm(false);
        }
        setSubmitting(false);
    };

    // ── Handlers: Edit ────
    const startEdit = (party) => {
        setEditingId(party._id);
        setEditName(party.name);
        setConfirmDeleteId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const saveEdit = async (id) => {
        if (!editName.trim()) return;
        setSubmitting(true);
        await editParty({ id, name: editName.trim() }, dispatch);
        setEditingId(null);
        setEditName("");
        setSubmitting(false);
    };

    // ── Handlers: Delete ─────────────────────────────────────────
    const askDelete = (id) => {
        setConfirmDeleteId(id);
        setEditingId(null);
    };

    const confirmDelete = async (id) => {
        setSubmitting(true);
        await removeParty({ id }, dispatch);
        setConfirmDeleteId(null);
        setSubmitting(false);
    };

    return (
        <div className={style.Warehouse}>
            <h2>Manage Parties</h2>

            {/* ── Header ── */}
            <div className={style.header}>
                <div>
                    <h3>Party Details</h3>
                    <p className={style.count}>
                        Total Parties: {parties?.length || 0}
                    </p>
                </div>
                <div className={style.controls}>
                    <input
                        className={style.search}
                        placeholder="Search by name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {!showForm && (
                        <button
                            className={style.addBtn}
                            onClick={() => setShowForm(true)}
                        >
                            <FiPlus style={{ marginRight: "6px" }} />
                            Add Party
                        </button>
                    )}
                </div>
            </div>

            {/* ── Add Form ── */}
            {showForm && (
                <form className={style.form} onSubmit={handleCreate}>
                    <div className={style.formRow}>
                        <input
                            type="text"
                            placeholder="Party Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className={style.formActions}>
                        <button type="submit" disabled={submitting}>
                            {submitting ? "Saving…" : "Add"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setNewName("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* ── Table ── */}
            <div className={style.tableWrap}>
                {loading ? (
                    <div className={style.loader}>Loading…</div>
                ) : (
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th style={{ width: "2rem" }}>#</th>
                                <th>Name</th>
                                <th style={{ width: "6rem" }}>Total Bookings</th>
                                <th style={{ width: "10rem" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className={style.noData}>
                                        No parties found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((party, idx) => (
                                    <React.Fragment key={party._id}>
                                        <tr className={style.row}>
                                            {/* # */}
                                            <td className={style.center}>
                                                {idx + 1}
                                            </td>

                                            {/* Name — inline edit */}
                                            <td>
                                                {editingId === party._id ? (
                                                    <input
                                                        className={style.inlineInput}
                                                        value={editName}
                                                        onChange={(e) =>
                                                            setEditName(e.target.value)
                                                        }
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className={style.cellPrimary}>
                                                        {party.name || "—"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Booking Count */}
                                            <td className={style.center}>
                                                {party.totalBookings ?? 0}
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                {editingId === party._id ? (
                                                    /* Save / Cancel row */
                                                    <div className={style.actionGroup}>
                                                        <button
                                                            className={style.saveBtn}
                                                            onClick={() => saveEdit(party._id)}
                                                            disabled={submitting}
                                                            title="Save"
                                                        >
                                                            <FiCheck />
                                                        </button>
                                                        <button
                                                            className={style.cancelBtn}
                                                            onClick={cancelEdit}
                                                            title="Cancel"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                ) : confirmDeleteId === party._id ? (
                                                    /* Delete confirmation */
                                                    <div className={style.actionGroup}>
                                                        <span className={style.cellSecondary}>
                                                            Sure?
                                                        </span>
                                                        <button
                                                            className={style.saveBtn}
                                                            onClick={() => confirmDelete(party._id)}
                                                            disabled={submitting}
                                                            title="Confirm delete"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            className={style.cancelBtn}
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            title="Cancel"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                ) : (
                                                    /* Default: Edit + Delete */
                                                    <div className={style.actionGroup}>
                                                        <button
                                                            className={style.editBtn}
                                                            onClick={() => startEdit(party)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        {(party.totalBookings ?? 0) === 0 && <button
                                                            className={style.deleteBtn}
                                                            onClick={() => askDelete(party._id)}
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 />
                                                        </button>}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Party;
