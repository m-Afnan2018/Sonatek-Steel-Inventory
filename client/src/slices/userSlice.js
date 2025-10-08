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
        deleteUser: (state, action) => {
            const userId = action.payload;
            state.allUsers = state.allUsers.filter(user =>
                user._id !== userId
            )
        },
        updateUserDesignation: (state, action) => {
            const { userId, role } = action.payload;
            state.allUsers = state.allUsers.map(user =>
                user._id === userId ? { ...user, role: role } : user
            );
        }
    }
})

export const { setAllUsers, updateUserVerification, deleteUser, updateUserDesignation } = userSlice.actions;
export default userSlice.reducer;