const { createSlice } = require("@reduxjs/toolkit")


const initialState = {
    bestSuggestion: null,
    allSuggestion: null,
    allChoices: null,
    requirement: null,
    options: null,
    orders: null,
    loader: false,
}

const orderSlice = createSlice({
    name: 'order',
    initialState: initialState,
    reducers: {
        setBestSuggestion(state, action) {
            state.bestSuggestion = action.payload;
        },
        setAllSuggestion(state, action) {
            state.allSuggestion = action.payload;
        },
        setAllChoices(state, action) {
            state.allChoices = action.payload;
        },
        setRequirement(state, action) {
            state.requirement = action.payload;
        },
        setOrders(state, action) {
            state.orders = action.payload;
        }
    }
})

export const {
    setBestSuggestion,
    setAllChoices,
    setAllSuggestion,
    setRequirement,
    setOrders
} = orderSlice.actions;

export default orderSlice.reducer