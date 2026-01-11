 import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuth: false,
    user: null,
    email: ''
};

export const authSlice = createSlice({
    name: 'authSlice',
    initialState,
    reducers: {
        setAuth: (state, action) => {
            const user = action.payload;
            // If user is null, set isAuth to false, otherwise true
            state.isAuth = !!user; 
            state.user = user;
        },
        setEmail: (state, action) => {
            state.email = action.payload;
        }
    }
});

export const { setAuth, setEmail } = authSlice.actions;
export default authSlice.reducer;
