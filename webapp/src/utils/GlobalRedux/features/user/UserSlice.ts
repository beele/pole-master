'use client';

import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { User } from 'prisma-client';

export interface UserState {
    value: User | null;
    loading: boolean;
}

const initialState: UserState = {
    value: null,
    loading: false
}

// Tutorial: https://codevoweb.com/setup-redux-toolkit-in-nextjs-13-app-directory/
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state: UserState, action: PayloadAction<User>) => { state.value = action.payload; },
        clearUser: (state: UserState) => { state.value = null; },
        setLoading: (state: UserState, action: PayloadAction<boolean>) => {state.loading = action.payload}
    }
});

export const { setUser, clearUser, setLoading } = userSlice.actions;

export default userSlice.reducer;
