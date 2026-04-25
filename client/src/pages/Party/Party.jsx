import React, { useEffect, useMemo, useRef, useState } from "react";
import style from "./Party.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllPartyDetails,
    createParty,
    downloadPartyTemplate,
    editParty,
    importParties,
    removeParty,
} from "services/operations/bookingAPI";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiDownload, FiUpload } from "react-icons/fi";

const Party = () => {
    // ── Local State ────
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Add form
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newOwner, setNewOwner] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    // Inline edit
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editOwner, setEditOwner] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");

    // Delete confirmation
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // Error state
    const [formError, setFormError] = useState("");

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
            (p.name || "").toLowerCase().includes(q) ||
            (p.owner || "").toLowerCase().includes(q) ||
            (p.phone || "").toLowerCase().includes(q) ||
            (p.address || "").toLowerCase().includes(q)
        );
    }, [parties, search]);

    // ── Handlers: Create ─────
    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");
        if (!newName.trim()) return;
        if (newPhone && !/^\d{10,15}$/.test(newPhone)) {
            setFormError("Please enter a valid phone number");
            return;
        }
        setSubmitting(true);
        const ok = await createParty({
            name: newName.trim(),
            owner: newOwner.trim(),
            phone: newPhone.trim(),
            address: newAddress.trim()
        }, dispatch);
        if (ok) {
            setNewName("");
            setNewOwner("");
            setNewPhone("");
            setNewAddress("");
            setShowForm(false);
        }
        setSubmitting(false);
    };

    // ── Handlers: Edit ────
    const startEdit = (party) => {
        setEditingId(party._id);
        setEditName(party.name);
        setEditOwner(party.owner || "");
        setEditPhone(party.phone || "");
        setEditAddress(party.address || "");
        setConfirmDeleteId(null);
        setFormError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditOwner("");
        setEditPhone("");
        setEditAddress("");
        setFormError("");
    };

    const saveEdit = async (id) => {
        setFormError("");
        if (!editName.trim()) return;
        if (editPhone && !/^\d{10,15}$/.test(editPhone)) {
            setFormError("Please enter a valid phone number");
            return;
        }
        setSubmitting(true);
        await editParty({
            id,
            name: editName.trim(),
            owner: editOwner.trim(),
            phone: editPhone.trim(),
            address: editAddress.trim()
        }, dispatch);
        setEditingId(null);
        setEditName("");
        setEditOwner("");
        setEditPhone("");
        setEditAddress("");
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

    const handleDownloadTemplate = async () => {
        setFormError("");
        const ok = await downloadPartyTemplate();
        if (!ok) setFormError("Unable to download party template");
    };

    const handleImportClick = () => {
        setFormError("");
        setImportResult(null);
        fileInputRef.current?.click();
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const isExcelFile = /\.(xlsx|xls|csv)$/i.test(file.name);
        if (!isExcelFile) {
            setFormError("Please upload an .xlsx, .xls, or .csv file");
            return;
        }

        setImporting(true);
        setFormError("");
        const result = await importParties(file, dispatch);
        setImportResult(result);
        if (!result.success) setFormError(result.message);
        setImporting(false);
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
                    <button
                        className={style.secondaryBtn}
                        onClick={handleDownloadTemplate}
                        type="button"
                    >
                        <FiDownload style={{ marginRight: "6px" }} />
                        Template
                    </button>
                    <button
                        className={style.addBtn}
                        onClick={handleImportClick}
                        type="button"
                        disabled={importing}
                    >
                        <FiUpload style={{ marginRight: "6px" }} />
                        {importing ? "Importing..." : "Import Excel"}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className={style.fileInput}
                        onChange={handleImportFile}
                    />
                </div>
            </div>

            {importResult?.success && (
                <div className={style.importSummary}>
                    <strong>{importResult.importedCount || 0} parties imported.</strong>
                    {importResult.skippedRows?.length > 0 && (
                        <span>
                            {" "}
                            {importResult.skippedRows.length} rows skipped. First issue:
                            row {importResult.skippedRows[0].row} - {importResult.skippedRows[0].reason}
                        </span>
                    )}
                    {!importing && (
                        <button
                            className={style.importCloseBtn}
                            onClick={() => {
                                setImportResult(null);
                            }}
                            type="button"
                        >
                            <FiX />
                        </button>
                    )}
                </div>
            )}

            {/* ── Add Form ── */}
            {formError && !showForm && (
                <p className={style.errorMsg}>{formError}</p>
            )}

            {showForm && (
                <form className={style.form} onSubmit={handleCreate}>
                    <div className={style.formGrid}>
                        <div className={style.formGroup}>
                            <label>Party Name</label>
                            <input
                                type="text"
                                placeholder="Enter party name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className={style.formGroup}>
                            <label>Owner</label>
                            <input
                                type="text"
                                placeholder="Enter owner name"
                                value={newOwner}
                                onChange={(e) => setNewOwner(e.target.value)}
                            />
                        </div>
                        <div className={style.formGroup}>
                            <label>Phone</label>
                            <input
                                type="tel"
                                placeholder="Phone number"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                                pattern="[0-9]{10,15}"
                                maxLength="15"
                            />
                        </div>
                        <div className={style.formGroup}>
                            <label>Address</label>
                            <input
                                type="text"
                                placeholder="Enter address"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    {formError && <p className={style.errorMsg}>{formError}</p>}

                    <div className={style.formActions}>
                        <button type="submit" disabled={submitting}>
                            {submitting ? "Saving…" : "Add"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setNewName("");
                                setNewOwner("");
                                setNewPhone("");
                                setNewAddress("");
                                setFormError("");
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
                                <th>Owner</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th style={{ width: "6rem" }}>Total Bookings</th>
                                <th style={{ width: "10rem" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={style.noData}>
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

                                            {/* Owner — inline edit */}
                                            <td>
                                                {editingId === party._id ? (
                                                    <input
                                                        className={style.inlineInput}
                                                        value={editOwner}
                                                        onChange={(e) =>
                                                            setEditOwner(e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    <span className={style.cellPrimary}>
                                                        {party.owner || "—"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Phone — inline edit */}
                                            <td>
                                                {editingId === party._id ? (
                                                    <input
                                                        type="tel"
                                                        className={style.inlineInput}
                                                        value={editPhone}
                                                        onChange={(e) =>
                                                            setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 15))
                                                        }
                                                        pattern="[0-9]{10,15}"
                                                        maxLength="15"
                                                    />
                                                ) : (
                                                    <span className={style.cellPrimary}>
                                                        {party.phone || "—"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Address — inline edit */}
                                            <td>
                                                {editingId === party._id ? (
                                                    <input
                                                        className={style.inlineInput}
                                                        value={editAddress}
                                                        onChange={(e) =>
                                                            setEditAddress(e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    <span className={style.cellPrimary}>
                                                        {party.address || "—"}
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
                                                        {formError && <span className={style.errorMsg} style={{ position: 'absolute', bottom: '-15px', right: '14px', whiteSpace: 'nowrap' }}>{formError}</span>}
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
