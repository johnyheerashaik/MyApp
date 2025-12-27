import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchNearbyTheaters, geocodeZipCode, Theater } from '../../services/theatersApi';

interface TheatresState {
    theaters: Theater[];
    loading: boolean;
    error: string | null;
}

const initialState: TheatresState = {
    theaters: [],
    loading: false,
    error: null,
};

export const fetchTheatersByCoords = createAsyncThunk(
    'theatres/fetchByCoords',
    async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
        return await fetchNearbyTheaters(latitude, longitude);
    }
);

export const fetchTheatersByZip = createAsyncThunk(
    'theatres/fetchByZip',
    async (zipCode: string) => {
        const coords = await geocodeZipCode(zipCode);
        if (!coords) throw new Error('Invalid zip code');
        return await fetchNearbyTheaters(coords.lat, coords.lng);
    }
);

const theatresSlice = createSlice({
    name: 'theatres',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchTheatersByCoords.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTheatersByCoords.fulfilled, (state, action: PayloadAction<Theater[]>) => {
                state.theaters = action.payload;
                state.loading = false;
            })
            .addCase(fetchTheatersByCoords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch theaters';
            })
            .addCase(fetchTheatersByZip.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTheatersByZip.fulfilled, (state, action: PayloadAction<Theater[]>) => {
                state.theaters = action.payload;
                state.loading = false;
            })
            .addCase(fetchTheatersByZip.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch theaters';
            });
    },
});

export default theatresSlice.reducer;
