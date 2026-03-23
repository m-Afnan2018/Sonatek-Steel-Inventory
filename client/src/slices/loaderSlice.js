const { createSlice } = require("@reduxjs/toolkit")


const initialState = {
    loader: [],
    success: [],
    error: []
}

const loaderSlice = createSlice({
    name: 'loader',
    initialState,
    reducers: {
        addLoader(state, action) {
            state.loader = [...state.loader, action.payload];
        },
        removeLoader(state, action) {
            state.loader = state.loader.filter(item => item !== action.payload);
        },
        showError(state, action) {
            const { id } = action.payload
            state.loader = state.loader.filter(item => item !== id);
            state.error.push(action.payload);
        },
        removeError(state, action) {
            state.error = state.error.filter(item => item.id !== action.payload);
        },
        showSuccess(state, action) {
            const { id } = action.payload
            state.loader = state.loader.filter(item => item !== id);
            state.success.push(action.payload);
        },
        removeSuccess(state, action) {
            state.success = state.success.filter(item => item.id !== action.payload);
        }
    }
})

export const { addLoader, removeLoader, showSuccess, showError, removeSuccess, removeError } = loaderSlice.actions;
export default loaderSlice.reducer;