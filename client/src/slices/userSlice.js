import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    allUsers: [],
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAllUsers(state, action) {
            state.allUsers = action.payload;
        },
        updateUserVerification: (state, action) => {
            const userId = action.payload;
            state.allUsers = state.allUsers.map(user =>
                user._id === userId ? { ...user, isVerified: true } : user
            );
        },
        updateRemoveUser: (state, action) => {
            const userId = action.payload;
            state.allUsers = state.allUsers.map(user =>
                user._id === userId ? { ...user, status: 'inactive' } : user
            )
        },
        updateAddUser: (state, action) => {
            const userId = action.payload;
            state.allUsers = state.allUsers.map(user =>
                user._id === userId ? { ...user, status: 'active' } : user
            )
        },
        updateUserDesignation: (state, action) => {
            const { userId, role } = action.payload;
            state.allUsers = state.allUsers.map(user =>
                user._id === userId ? { ...user, role: role } : user
            );
        },
        updateDeleteRequest: (state, action) => {
            const userId = action.payload;
            state.allUsers = state.allUsers.filter(user => user._id !== userId);
        }
    }
})

export const { setAllUsers, updateUserVerification, updateAddUser, updateRemoveUser, updateUserDesignation, updateDeleteRequest } = userSlice.actions;
export default userSlice.reducer;