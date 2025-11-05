const { createSlice } = require("@reduxjs/toolkit")


const initialState = {
    bestSuggestion: null,
    allSuggestion: null,
    allChoices: null,
    pagination: null,
    requirement: null,
    options: null,
    bookings: null,
    loader: false,
    parties: [],
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
        updateBookingRemark(state, action) {
            const { bookingId, remark } = action.payload;

            state.bookings = state.bookings.map(booking => {
                if (booking._id === bookingId) {
                    booking.remark = remark;
                }
                return booking;
            })
        },
        setOptions(state, action) {
            state.options = action.payload;
        },
        addNewBooking(state, action) {
            const payload = action.payload;
            state.bookings = [payload, ...state.bookings];
        },
        setPagination(state, action) {
            state.pagination = action.payload;
        },
        setParty(state, action) {
            state.parties = action.payload;
        },
        updateParty(state, action) {
            state.parties = [...state.party, action.payload];
        },
    }
})

export const {
    setBestSuggestion,
    setAllChoices,
    setAllSuggestion,
    setRequirement,
    setBookings,
    updateBookingStatus,
    addNewBooking,
    setOptions,
    setParty,
    updateParty,
    updateBookingRemark
} = bookingSlice.actions;

export default bookingSlice.reducer