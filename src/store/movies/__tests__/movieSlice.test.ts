import reducer, {
    fetchPopularMovies,
    fetchNowPlayingMovies,
    fetchUpcomingMovies,
    fetchTopRatedMovies,
    fetchMoviesByCollection,
    fetchMoviesByKeyword,
    fetchMovieDetails,
} from '../moviesSlice';

import type { Movie, MovieDetails } from '../types';

describe('moviesSlice reducer', () => {
    const initialState = {
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

    const mkMovie = (id: number): Movie =>
        ({
            id,
            title: `Movie ${id}`,
            year: '2025',
            releaseDate: '2025-01-01',
            rating: 7.2,
            poster: null,
            genres: [],
            overview: '',
        }) as any;

    const mkDetails = (id: number): MovieDetails =>
        ({
            id,
            title: `Movie ${id}`,
            overview: 'overview',
            year: '2025',
            releaseDate: '2025-01-01',
            rating: 8.1,
            runtime: 120,
            genres: ['Action'],
            poster: null,
            backdrop: null,
            cast: [],
        }) as any;

    it('should return initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });


    it('fetchPopularMovies.pending sets loading=true and clears error', () => {
        const state = reducer(initialState as any, { type: fetchPopularMovies.pending.type });
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('fetchPopularMovies.fulfilled stores popular and stops loading', () => {
        const payload = [mkMovie(1), mkMovie(2)];
        const state = reducer(initialState as any, {
            type: fetchPopularMovies.fulfilled.type,
            payload,
        });
        expect(state.popular).toEqual(payload);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetchPopularMovies.rejected sets error and stops loading', () => {
        const state = reducer(initialState as any, {
            type: fetchPopularMovies.rejected.type,
            error: { message: 'boom' },
        });
        expect(state.loading).toBe(false);
        expect(state.error).toBe('boom');
    });

    it('fetchNowPlayingMovies.pending sets loading=true and clears error', () => {
        const state = reducer(initialState as any, { type: fetchNowPlayingMovies.pending.type });
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('fetchNowPlayingMovies.fulfilled stores nowPlaying and stops loading', () => {
        const payload = [mkMovie(10)];
        const state = reducer(initialState as any, {
            type: fetchNowPlayingMovies.fulfilled.type,
            payload,
        });
        expect(state.nowPlaying).toEqual(payload);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetchNowPlayingMovies.rejected sets error and stops loading', () => {
        const state = reducer(initialState as any, {
            type: fetchNowPlayingMovies.rejected.type,
            error: { message: 'np fail' },
        });
        expect(state.loading).toBe(false);
        expect(state.error).toBe('np fail');
    });


    it('fetchUpcomingMovies.pending sets loading=true and clears error', () => {
        const state = reducer(initialState as any, { type: fetchUpcomingMovies.pending.type });
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('fetchUpcomingMovies.fulfilled stores upcoming and stops loading', () => {
        const payload = [mkMovie(20)];
        const state = reducer(initialState as any, {
            type: fetchUpcomingMovies.fulfilled.type,
            payload,
        });
        expect(state.upcoming).toEqual(payload);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetchUpcomingMovies.rejected sets error and stops loading', () => {
        const state = reducer(initialState as any, {
            type: fetchUpcomingMovies.rejected.type,
            error: { message: 'up fail' },
        });
        expect(state.loading).toBe(false);
        expect(state.error).toBe('up fail');
    });

    it('fetchTopRatedMovies.pending sets loading=true and clears error', () => {
        const state = reducer(initialState as any, { type: fetchTopRatedMovies.pending.type });
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('fetchTopRatedMovies.fulfilled stores topRated and stops loading', () => {
        const payload = [mkMovie(30)];
        const state = reducer(initialState as any, {
            type: fetchTopRatedMovies.fulfilled.type,
            payload,
        });
        expect(state.topRated).toEqual(payload);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetchTopRatedMovies.rejected sets error and stops loading', () => {
        const state = reducer(initialState as any, {
            type: fetchTopRatedMovies.rejected.type,
            error: { message: 'tr fail' },
        });
        expect(state.loading).toBe(false);
        expect(state.error).toBe('tr fail');
    });


    it('fetchMoviesByCollection.pending sets currentCollectionLoading=true and clears currentCollectionError', () => {
        const state = reducer(initialState as any, { type: fetchMoviesByCollection.pending.type });
        expect(state.currentCollectionLoading).toBe(true);
        expect(state.currentCollectionError).toBeNull();
    });

    it('fetchMoviesByCollection.fulfilled stores currentCollectionMovies and stops currentCollectionLoading', () => {
        const payload = [mkMovie(100), mkMovie(101)];
        const state = reducer(initialState as any, {
            type: fetchMoviesByCollection.fulfilled.type,
            payload,
        });
        expect(state.currentCollectionMovies).toEqual(payload);
        expect(state.currentCollectionLoading).toBe(false);
        expect(state.currentCollectionError).toBeNull();
    });

    it('fetchMoviesByCollection.rejected sets currentCollectionError and stops currentCollectionLoading', () => {
        const state = reducer(initialState as any, {
            type: fetchMoviesByCollection.rejected.type,
            error: { message: 'collection fail' },
        });
        expect(state.currentCollectionLoading).toBe(false);
        expect(state.currentCollectionError).toBe('collection fail');
    });

    it('fetchMoviesByKeyword.pending sets currentCollectionLoading=true and clears currentCollectionError', () => {
        const state = reducer(initialState as any, { type: fetchMoviesByKeyword.pending.type });
        expect(state.currentCollectionLoading).toBe(true);
        expect(state.currentCollectionError).toBeNull();
    });

    it('fetchMoviesByKeyword.fulfilled stores currentCollectionMovies and stops currentCollectionLoading', () => {
        const payload = [mkMovie(200)];
        const state = reducer(initialState as any, {
            type: fetchMoviesByKeyword.fulfilled.type,
            payload,
        });
        expect(state.currentCollectionMovies).toEqual(payload);
        expect(state.currentCollectionLoading).toBe(false);
        expect(state.currentCollectionError).toBeNull();
    });

    it('fetchMoviesByKeyword.rejected sets currentCollectionError and stops currentCollectionLoading', () => {
        const state = reducer(initialState as any, {
            type: fetchMoviesByKeyword.rejected.type,
            error: { message: 'keyword fail' },
        });
        expect(state.currentCollectionLoading).toBe(false);
        expect(state.currentCollectionError).toBe('keyword fail');
    });

    it('fetchMovieDetails.pending sets loading=true and clears error', () => {
        const state = reducer(initialState as any, { type: fetchMovieDetails.pending.type });
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('fetchMovieDetails.fulfilled caches details by id and stops loading', () => {
        const payload = mkDetails(999);

        const state = reducer(initialState as any, {
            type: fetchMovieDetails.fulfilled.type,
            payload,
        });

        expect(state.movieDetails[999]).toEqual(payload);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetchMovieDetails.rejected sets error and stops loading', () => {
        const state = reducer(initialState as any, {
            type: fetchMovieDetails.rejected.type,
            error: { message: 'details fail' },
        });
        expect(state.loading).toBe(false);
        expect(state.error).toBe('details fail');
    });
});
