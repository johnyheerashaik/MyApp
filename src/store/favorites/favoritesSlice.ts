import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { initialFavoritesState } from '../initialState';
import { getFavorites } from '../../services/favoritesApi';
import type { Movie } from '../movies/types';
import type { FavoritesState } from './types';

const initialState: FavoritesState = {
    ...initialFavoritesState,
    error: null,
};

export const fetchFavorites = createAsyncThunk<
    Movie[],
    string,
    { rejectValue: string }
>('favorites/fetchFavorites', async (token, { rejectWithValue }) => {
    try {
        return await getFavorites(token);
    } catch (error: any) {
        return rejectWithValue(error?.message || 'Failed to fetch favorites');
    }
});

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addFavorite: (state, action: PayloadAction<Movie>) => {
            state.favorites.push(action.payload);
        },
        removeFavorite: (state, action: PayloadAction<number>) => {
            state.favorites = state.favorites.filter(m => m.id !== action.payload);
        },
        toggleFavorite: (state, action: PayloadAction<Movie>) => {
            const exists = state.favorites.some(m => m.id === action.payload.id);
            state.favorites = exists
                ? state.favorites.filter(m => m.id !== action.payload.id)
                : [...state.favorites, action.payload];
        },

        setFavoritesLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setFavorites: (state, action: PayloadAction<Movie[]>) => {
            state.favorites = action.payload;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchFavorites.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFavorites.fulfilled, (state, action) => {
                state.favorites = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload || action.error.message || 'Failed to fetch favorites';
            });
    },
});

export const {
    addFavorite,
    removeFavorite,
    toggleFavorite,
    setFavoritesLoading,
    setFavorites,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
