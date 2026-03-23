import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loader: true,
  userData: null,
  token: null,
  isLogin: localStorage.getItem('isLogin') ? true : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoader(state, action) {
      state.loader = action.payload;
    },
    setUserData(state, action) {
      state.userData = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setIsLogin(state, action) {
      state.isLogin = action.payload;
    },
  },
});

export const { setUserData, setToken, setLoader, setIsLogin } = authSlice.actions;
export default authSlice.reducer;
