import { combineReducers } from "@reduxjs/toolkit";
import authSlice from '../slices/authSlice'
import itemSlice from 'slices/itemSlice'
import orderSlice from 'slices/orderSlice'
import userSlice from 'slices/userSlice'
import varientSlice from 'slices/varientSlice';


const rootReducer = combineReducers({
    auth: authSlice,
    item: itemSlice,
    order: orderSlice,
    user: userSlice,
    varient: varientSlice,
})

export default rootReducer