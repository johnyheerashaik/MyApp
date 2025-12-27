import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi } from '../../services/authApi';
import type { AuthState, AuthUser } from './types';
import { STRINGS } from '../../common/strings';

const AUTH_USER_KEY = 'auth_user';

const initialState: AuthState = {
    user: null,
    initializing: true,
    error: undefined,
    loading: undefined
};

export const bootstrapAuth = createAsyncThunk<AuthUser | null>(
    'auth/bootstrapAuth',
    async () => {
        try {
            const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as AuthUser;
        } catch {
            return null;
        }
    },
);

export const signInThunk = createAsyncThunk<
    AuthUser,
    { email: string; password: string },
    { rejectValue: string }
>('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
    try {
        const { user, token } = await loginApi(email.trim(), password);
        const userWithToken: AuthUser = { ...user, token };
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userWithToken));
        return userWithToken;
    } catch (e: any) {
        return rejectWithValue(e?.message || STRINGS.LOGIN_FAILED);
    }
});

export const signOutThunk = createAsyncThunk<void>('auth/signOut', async () => {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(bootstrapAuth.pending, state => {
                state.initializing = true;
            })
            .addCase(bootstrapAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.initializing = false;
            })
            .addCase(bootstrapAuth.rejected, state => {
                state.user = null;
                state.initializing = false;
            })
            .addCase(signInThunk.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(signOutThunk.fulfilled, state => {
                state.user = null;
            });
    },
});

export default authSlice.reducer;
