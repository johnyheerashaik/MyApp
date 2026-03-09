import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { initialFavoritesState } from '../initialState';
import { getFavorites, addFavorite as addFavoriteApi, removeFavorite as removeFavoriteApi } from '../../services/favoritesApi';
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
        const result = await getFavorites(token);
        return result;
    } catch (error: any) {
        return rejectWithValue(error?.message || 'Failed to fetch favorites');
    }
});

export const addFavoriteAsync = createAsyncThunk<
    Movie,
    { token: string; movie: Movie },
    { rejectValue: string }
>('favorites/addFavorite', async ({ token, movie }, { rejectWithValue }) => {
    try {
        await addFavoriteApi(token, movie);
        return movie;
    } catch (error: any) {
        return rejectWithValue(error?.message || 'Failed to add favorite');
    }
});

export const removeFavoriteAsync = createAsyncThunk<
    number,
    { token: string; movieId: number },
    { rejectValue: string }
>('favorites/removeFavorite', async ({ token, movieId }, { rejectWithValue }) => {
    try {
        await removeFavoriteApi(token, movieId);
        return movieId;
    } catch (error: any) {
        return rejectWithValue(error?.message || 'Failed to remove favorite');
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
                console.log('🏪 [Redux] fetchFavorites.fulfilled - Setting favorites:', action.payload.length);
                state.favorites = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                console.error('🏪 [Redux] fetchFavorites.rejected:', action.payload);
                state.loading = false;
                state.error =
                    action.payload || action.error.message || 'Failed to fetch favorites';
            })
            .addCase(addFavoriteAsync.pending, state => {
                state.loading = true;
            })
            .addCase(addFavoriteAsync.fulfilled, (state, action) => {
                console.log('🏪 [Redux] addFavoriteAsync.fulfilled - Adding:', action.payload.title);
                const exists = state.favorites.some(m => m.id === action.payload.id);
                if (!exists) {
                    state.favorites.push(action.payload);
                    console.log('🏪 [Redux] New favorites count:', state.favorites.length);
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(addFavoriteAsync.rejected, (state, action) => {
                console.error('🏪 [Redux] addFavoriteAsync.rejected:', action.payload);
                state.loading = false;
                state.error = action.payload || 'Failed to add favorite';
            })
            .addCase(removeFavoriteAsync.pending, state => {
                state.loading = true;
            })
            .addCase(removeFavoriteAsync.fulfilled, (state, action) => {
                state.favorites = state.favorites.filter(m => m.id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(removeFavoriteAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to remove favorite';
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
