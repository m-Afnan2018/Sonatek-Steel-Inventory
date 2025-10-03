const { createSlice } = require("@reduxjs/toolkit")


const initialState = {
    grades: null,
    thicknesses: null,
    cutters: null,
    widths: null
}

const varientSlice = createSlice({
    name: 'varients',
    initialState: initialState,
    reducers: {
        setGrades(state, action) {
            state.grades = action.payload;
        },
        setThicknesses(state, action) {
            state.thicknesses = action.payload;
        },
        setCutters(state, action) {
            state.cutters = action.payload;
        },
        setWidths(state, action) {
            state.widths = action.payload
        }
    }
})

export const { setGrades, setThicknesses, setCutters, setWidths } = varientSlice.actions;
export default varientSlice.reducer;