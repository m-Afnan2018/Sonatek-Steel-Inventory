// =======================
// Core Imports
// =======================
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

// =======================
// Styles
// =======================
import style from './Inventory.module.css';

// =======================
// API
// =======================
import { getAllItem, getUpcomingItem } from 'services/operations/itemAPI';

// =======================
// Overlay
// =======================
import { useOverlay } from 'hooks/useOverlay';
import AddItemForm from 'components/common/Overlay/AddItemForm';

// =======================
// Components
// =======================
import Items from 'components/core/Inventory/Items';

const Inventory = () => {

    // =======================
    // Local State
    // =======================
    const [showForm, setShowForm] = useState(false);

    // =======================
    // Redux
    // =======================
    const dispatch = useDispatch();

    // =======================
    // Overlay Hook
    // =======================
    const { showOverlay } = useOverlay();

    // =======================
    // Show Add Item Overlay
    // =======================
    useEffect(() => {
        if (showForm) {
            showOverlay(AddItemForm, { showForm, setShowForm });
        }
    }, [showForm, showOverlay]);

    // =======================
    // Initial Data Fetch
    // =======================
    useEffect(() => {
        getAllItem({ search: '' }, dispatch);
        getUpcomingItem({}, dispatch);
    }, [dispatch]);

    // =======================
    // Render
    // =======================
    return (
        <div className={`page-shell ${style.Inventory}`}>
            <Items />
        </div>
    );
};

export default Inventory;
