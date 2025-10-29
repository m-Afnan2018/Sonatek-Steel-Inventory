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
            const item = action.payload;

            if (item.wagonNumber) {
                const originalItem = state.listViewList.find((i) => i._id === item._id);
                if (originalItem) {
                    console.log(`GOT ORIGINAL ITEM: ${originalItem}`)
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
            state.upcomingItem = [action.payload, ...state.upcomingItem];
        },
        deleteFromUpcomingItem(state, action) {
            state.upcomingItem = state.upcomingItem.filter(i => i._id !== action.payload);
        },
        setPagination(state, action) {
            state.pagination = action.payload;
        },
        setTotalQuantity(state, action) {
            state.totalQuantity = action.payload;
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
    addUpcomingItem,
    deleteFromUpcomingItem,
    setTotalQuantity
} = itemSlice.actions;

export default itemSlice.reducer;
