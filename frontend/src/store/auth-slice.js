import { createSlice } from "@reduxjs/toolkit";

const savedUser = localStorage.getItem('user');
const initialState = {
    isAuth: !!savedUser,
    user: savedUser ? JSON.parse(savedUser) : null,
    email: ''
};

export const authSlice = createSlice({
    name: 'authSlice',
    initialState,
    reducers: {
        setAuth: (state, action) => {
            const user = action.payload;
            state.isAuth = !!user;
            state.user = user;
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('userType', user.type);
            } else {
                localStorage.removeItem('user');
                localStorage.removeItem('userType');
            }
        },
        setEmail: (state, action) => {
            state.email = action.payload;
        }
    }
});

export const { setAuth, setEmail } = authSlice.actions;
export default authSlice.reducer;
