const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
    currentList: null,
    selectUpdate: null,
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
            state.currentList = [action.payload, ...state.currentList];
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

        setLoader(state, action) {
            state.loader = action.payload;
        },
        setSelectUpdate(state, action) {
            state.selectUpdate = action.payload;
        },
    },
});

export const {
    setCurrentList,
    addToCurrentList,
    updateFromCurrentList,
    deleteFromCurrentList,
    setLoader,
    setSelectUpdate,
} = itemSlice.actions;

export default itemSlice.reducer;
