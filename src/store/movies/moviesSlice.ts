import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMoviesByCollection, getMoviesByKeyword, getMovieDetails, getPopularMovies, getNowPlayingMovies, getTopRatedMovies, getUpcomingMovies } from '../../services/movieApi';
import type { Movie } from '../movies/types';
import type { MovieDetails } from '../movies/types';


interface MoviesState {
    popular: Movie[];
    nowPlaying: Movie[];
    upcoming: Movie[];
    topRated: Movie[];
    movieDetails: Record<number, MovieDetails>;
    loading: boolean;
    error: string | null;
    currentCollectionMovies: Movie[];
    currentCollectionLoading: boolean;
    currentCollectionError: string | null;
}

const initialState: MoviesState = {
    popular: [],
    nowPlaying: [],
    upcoming: [],
    topRated: [],
    movieDetails: {},
    loading: false,
    error: null,
    currentCollectionMovies: [],
    currentCollectionLoading: false,
    currentCollectionError: null,
};

export const fetchMoviesByCollection = createAsyncThunk(
    'movies/fetchByCollection',
    async (collectionId: number) => {
        return await getMoviesByCollection(collectionId);
    }
);

export const fetchPopularMovies = createAsyncThunk(
    'movies/fetchPopular',
    async () => {
        return await getPopularMovies();
    }
);

export const fetchNowPlayingMovies = createAsyncThunk(
    'movies/fetchNowPlaying',
    async () => {
        return await getNowPlayingMovies();
    }
);

export const fetchUpcomingMovies = createAsyncThunk(
    'movies/fetchUpcoming',
    async () => {
        return await getUpcomingMovies();
    }
);

export const fetchTopRatedMovies = createAsyncThunk(
    'movies/fetchTopRated',
    async () => {
        return await getTopRatedMovies();
    }
);

export const fetchMoviesByKeyword = createAsyncThunk(
    'movies/fetchByKeyword',
    async (keywordId: number) => {
        return await getMoviesByKeyword(keywordId);
    }
);

export const fetchMovieDetails = createAsyncThunk(
    'movies/fetchDetails',
    async (movieId: number) => {
        return await getMovieDetails(movieId);
    }
);

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchPopularMovies.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPopularMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.popular = action.payload;
                state.loading = false;
            })
            .addCase(fetchPopularMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch popular movies';
            })
            .addCase(fetchNowPlayingMovies.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNowPlayingMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.nowPlaying = action.payload;
                state.loading = false;
            })
            .addCase(fetchNowPlayingMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch now playing movies';
            })
            .addCase(fetchUpcomingMovies.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUpcomingMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.upcoming = action.payload;
                state.loading = false;
            })
            .addCase(fetchUpcomingMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch upcoming movies';
            })
            .addCase(fetchTopRatedMovies.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopRatedMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.topRated = action.payload;
                state.loading = false;
            })
            .addCase(fetchTopRatedMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch top rated movies';
            })
            .addCase(fetchMoviesByCollection.pending, state => {
                state.currentCollectionLoading = true;
                state.currentCollectionError = null;
            })
            .addCase(fetchMoviesByCollection.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.currentCollectionMovies = action.payload;
                state.currentCollectionLoading = false;
            })
            .addCase(fetchMoviesByCollection.rejected, (state, action) => {
                state.currentCollectionLoading = false;
                state.currentCollectionError = action.error.message || 'Failed to fetch collection movies';
            })
            .addCase(fetchMoviesByKeyword.pending, state => {
                state.currentCollectionLoading = true;
                state.currentCollectionError = null;
            })
            .addCase(fetchMoviesByKeyword.fulfilled, (state, action: PayloadAction<Movie[]>) => {
                state.currentCollectionMovies = action.payload;
                state.currentCollectionLoading = false;
            })
            .addCase(fetchMoviesByKeyword.rejected, (state, action) => {
                state.currentCollectionLoading = false;
                state.currentCollectionError = action.error.message || 'Failed to fetch keyword movies';
            })
            .addCase(fetchMovieDetails.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMovieDetails.fulfilled, (state, action) => {
                state.movieDetails[action.payload.id] = action.payload;
                state.loading = false;
            })
            .addCase(fetchMovieDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch movie details';
            });
    },
});

export default moviesSlice.reducer;
