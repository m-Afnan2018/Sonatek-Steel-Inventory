const { createSlice } = require("@reduxjs/toolkit")


const initialState = {
    bestSuggestion: null,
    allSuggestion: null,
    allChoices: null,
    pagination: null,
    requirement: null,
    options: null,
    bookings: null,
    incompleteBookings: null,
    pendingBookings: null,
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
            const updated = action.payload;
            state.parties = state.parties.map(p => p._id === updated._id ? updated : p);
        },
        deleteParty(state, action) {
            state.parties = state.parties.filter(p => p._id !== action.payload);
        },
        addParty(state, action) {
            state.parties = [...state.parties, action.payload];
        },
        setIncompleteBookings(state, action) {
            state.incompleteBookings = action.payload;
        },
        addIncompleteBookings(state, action) {
            const bookingItem = action.payload;
            if (state.incompleteBookings) {
                state.incompleteBookings = [bookingItem, ...state.incompleteBookings];
            } else {
                state.incompleteBookings = [bookingItem];
            }
        },
        removeIncompleteBookings(state, action) {
            const bookingId = action.payload;
            state.incompleteBookings = state.incompleteBookings.filter(i => i._id !== bookingId);
        },
        addBooking(state, action) {
            const { bookingId, vehicleNumber, reason, status } = action.payload;
            const item = state.incompleteBookings.find(i => i._id === bookingId);
            function transformBooking(raw) {
                if (!raw || typeof raw !== "object") return null;

                const listView = ({
                    _id: raw._id,
                    bookedBy: raw.bookedBySnapshot?.name,
                    bookingDate: raw.bookingDate,
                    items: raw.items,
                    status: status || raw.status,
                    vehicleNumber: vehicleNumber || raw.vehicleNumber,
                    reason: reason || raw.reason,
                    remark: raw.description || "-",
                    party: raw.partySnapshot?.name || "-",
                });
                return listView;
            }

            if (item) {
                state.incompleteBookings = state.incompleteBookings.filter(i => i._id !== bookingId);
                if (state.bookings) {
                    state.bookings = [transformBooking(item), ...state.bookings];
                } else {
                    state.bookings = [item];
                }
            }
        },
        setPendingBookings(state, action) {
            state.pendingBookings = action.payload;
        },
        addPendingBooking(state, action) {
            state.pendingBookings = [...state.pendingBookings, action.payload];
        },
        removePendingBooking(state, action) {
            state.pendingBookings = state.pendingBookings.filter((item) => item._id !== action.payload);
        },
        updatePendingBooking(state, action) {
            const { bookingId, updates } = action.payload;
            state.pendingBookings = state.pendingBookings.map((item) =>
                item._id === bookingId ? { ...item, ...updates } : item
            );
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
    addNewBooking,
    setOptions,
    setParty,
    updateParty,
    deleteParty,
    addParty,
    updateBookingRemark,
    setPagination,
    addIncompleteBookings,
    removeIncompleteBookings,
    setIncompleteBookings,
    addBooking,
    setPendingBookings,
    addPendingBooking,
    removePendingBooking,
    updatePendingBooking
} = bookingSlice.actions;

export default bookingSlice.reducer