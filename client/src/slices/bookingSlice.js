const { createSlice } = require("@reduxjs/toolkit")


const initialState = {
    bestSuggestion: null,
    allSuggestion: null,
    allChoices: null,
    requirement: null,
    options: null,
    bookings: null,
    loader: false,
}

const bookingSlice = createSlice({
    name: 'booking',
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
        setBookings(state, action) {
            state.bookings = action.payload;
        },
        updateBookingStatus(state, action) {
            const { bookingId, status } = action.payload;

            state.bookings = state.bookings.map(booking => {
                if (booking._id === bookingId) {
                    booking.status = status;
                }
                return booking;
            })
        },
        addNewBooking(state, action) {
            const payload = action.payload;
            state.bookings = [...state.bookings, payload];
        }
    }
})

export const {
    setBestSuggestion,
    setAllChoices,
    setAllSuggestion,
    setRequirement,
    setBookings,
    updateBookingStatus,
    addNewBooking
} = bookingSlice.actions;

export default bookingSlice.reducer