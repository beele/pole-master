'use client';

import { configureStore } from '@reduxjs/toolkit';
import userReducer, { userSlice } from './features/user/UserSlice';

export const store = configureStore({
    reducer: {
        [userSlice.name]: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
