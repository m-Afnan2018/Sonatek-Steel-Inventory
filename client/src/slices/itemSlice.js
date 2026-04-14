const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
    currentList: null,
    listViewList: null,
    totalQuantity: 0,
    pagination: null,
    selectUpdate: null,
    upcomingItem: null,
    loader: false,
};

const itemSlice = createSlice({
    name: "items",
    initialState,
    reducers: {
        setCurrentList(state, action) {
            state.currentList = action.payload;
        },
        addToCurrentList(state, action) {
            const newItem = action.payload;
            const existingWagon = state.currentList.find(
                w => w.wagonNumber === newItem.wagonNumber
            );

            if (existingWagon) {
                // Check if item already exists (avoid duplicates)
                const alreadyExists = existingWagon.items.some(
                    i => i.data._id === newItem._id
                );

                if (!alreadyExists) {
                    existingWagon.items.unshift({
                        name: `${newItem.thickness} X ${newItem.width} X ${newItem.grade}`,
                        data: newItem
                    });
                }
            } else {
                // Create new wagon entry
                state.currentList.unshift({
                    wagonNumber: newItem.wagonNumber,
                    items: [
                        {
                            name: `${newItem.thickness} X ${newItem.width} X ${newItem.grade}`,
                            data: newItem
                        }
                    ]
                });
            }
        },
        updateFromCurrentList(state, action) {
            const { id, data } = action.payload; // { id, data: {name: 'newName', ...} }
            state.currentList = state.currentList.map(item =>
                item._id === id ? { ...item, ...data } : item
            );
        },
        deleteFromCurrentList(state, action) {
            const id = action.payload; // just id
            state.currentList = state.currentList.filter(item => item._id !== id);
        },
        setListviewList(state, action) {
            state.listViewList = action.payload;
        },
        updateListViewList(state, action) {
            const { item } = action.payload;

            if (item.challanNumber && state.listViewList) {
                const originalItem = state.listViewList?.find((i) => i._id === item._id);
                if (originalItem) {
                    state.listViewList = state.listViewList.map((i) => {
                        if (i._id === item._id) {
                            return item;
                        }
                        return i;
                    })
                } else {
                    state.listViewList = [item, ...(state.listViewList)];
                }
                state.upcomingItem = state.upcomingItem.filter((i) => i._id !== item._id);
            } else {
                if (item.challanNumber) {
                    state.upcomingItem = state.upcomingItem.filter((i) => i._id !== item._id);
                }
                state.upcomingItem = state.upcomingItem.map((i) => {
                    if (i._id === item._id) {
                        return item;
                    }
                    return i;
                })
            }

        },
        setLoader(state, action) {
            state.loader = action.payload;
        },
        setSelectUpdate(state, action) {
            state.selectUpdate = action.payload;
        },
        setUpcomingItem(state, action) {
            state.upcomingItem = action.payload;
        },
        addUpcomingItem(state, action) {
            if (state.upcomingItem === null) {
                state.upcomingItem = [action.payload];
            } else {
                state.upcomingItem = [action.payload, ...state.upcomingItem];
            }
        },
        deleteFromUpcomingItem(state, action) {
            state.upcomingItem = state.upcomingItem.filter(i => i._id !== action.payload);
        },
        setPagination(state, action) {
            state.pagination = action.payload;
        },
        setTotalQuantity(state, action) {
            state.totalQuantity = action.payload;
        },
        setUpdateQuantity(state, action) {
            const { item, updatedQuantity } = action.payload;

            state.listViewList = state.listViewList.map((prev) => {
                if (prev._id === item) {

                    const newRemaining = Number(updatedQuantity) - (Number(prev.originalQuantity || 0) - prev.remaining);

                    return {
                        ...prev,
                        remaining: newRemaining,
                        originalQuantity: Number(updatedQuantity), // optional
                    };
                }

                return prev;
            });
        },

        updateUpcomingSaveForBooking(state, action) {
            const detail = action.payload;
            state.upcomingItem = state.upcomingItem.map((prev) => {
                if (prev._id === detail.item) {
                    return { ...prev, marking: detail.marking }
                }
                return prev;
            })
        },
        updateListViewListData(state, action) {
            const { updatedItem } = action.payload;

            if (!state.listViewList) return;

            state.listViewList = state.listViewList.map((item) =>
                item._id === updatedItem._id
                    ? { ...item, ...updatedItem } // merge to avoid losing fields
                    : item
            );
        }
    },
});

export const {
    setCurrentList,
    addToCurrentList,
    updateFromCurrentList,
    deleteFromCurrentList,
    setLoader,
    setSelectUpdate,
    setListviewList,
    setUpcomingItem,
    setPagination,
    updateListViewList,
    updateListViewData,
    addUpcomingItem,
    deleteFromUpcomingItem,
    setTotalQuantity,
    setUpdateQuantity,
    updateListViewListData,
    updateUpcomingSaveForBooking
} = itemSlice.actions;

export default itemSlice.reducer;
