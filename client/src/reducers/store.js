import { combineReducers } from "@reduxjs/toolkit";
import authSlice from '../slices/authSlice'
import userSlice from 'slices/userSlice'
import varientSlice from 'slices/varientSlice';


const rootReducer = combineReducers({
    auth: authSlice,
    user: userSlice,
    varient: varientSlice,
})

export default rootReducer