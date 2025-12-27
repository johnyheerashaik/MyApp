import reducer, {
    addFavorite,
    removeFavorite,
    toggleFavorite,
    fetchFavorites,
} from '../favoritesSlice';

import type { FavoritesState } from '../types';
import type { Movie } from '../../movies/types';

import { getFavorites } from '../../../services/favoritesApi';

jest.mock('../../../services/favoritesApi', () => ({
    getFavorites: jest.fn(),
}));

const makeMovie = (id: number): Movie =>
    ({
        id,
        title: `Movie ${id}`,
        year: '2024',
        releaseDate: '2024-01-01',
        rating: 7.5,
        poster: null,
        genres: [],
        overview: '',
    }) as Movie;

describe('favoritesSlice', () => {
    const baseState: FavoritesState = {
        favorites: [],
        loading: true,
        error: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return initial state when passed unknown action', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual(baseState);
    });

    it('addFavorite should add movie to favorites', () => {
        const movie = makeMovie(1);
        const next = reducer(
            { ...baseState, loading: false },
            addFavorite(movie),
        );

        expect(next.favorites).toHaveLength(1);
        expect(next.favorites[0].id).toBe(1);
    });

    it('removeFavorite should remove movie by id', () => {
        const m1 = makeMovie(1);
        const m2 = makeMovie(2);

        const start: FavoritesState = {
            ...baseState,
            loading: false,
            favorites: [m1, m2],
        };

        const next = reducer(start, removeFavorite(1));
        expect(next.favorites.map(m => m.id)).toEqual([2]);
    });

    it('toggleFavorite should add movie if not exists', () => {
        const movie = makeMovie(1);

        const start: FavoritesState = {
            ...baseState,
            loading: false,
            favorites: [],
        };

        const next = reducer(start, toggleFavorite(movie));
        expect(next.favorites.map(m => m.id)).toEqual([1]);
    });

    it('toggleFavorite should remove movie if exists', () => {
        const movie = makeMovie(1);

        const start: FavoritesState = {
            ...baseState,
            loading: false,
            favorites: [movie],
        };

        const next = reducer(start, toggleFavorite(movie));
        expect(next.favorites).toEqual([]);
    });

    it('fetchFavorites.pending should set loading true and clear error', () => {
        const start: FavoritesState = {
            ...baseState,
            loading: false,
            error: 'some error',
        };

        const next = reducer(start, { type: fetchFavorites.pending.type });
        expect(next.loading).toBe(true);
        expect(next.error).toBeNull();
    });

    it('fetchFavorites.fulfilled should set favorites and stop loading', () => {
        const payload = [makeMovie(1), makeMovie(2)];

        const start: FavoritesState = {
            ...baseState,
            loading: true,
            error: 'old error',
            favorites: [],
        };

        const next = reducer(start, {
            type: fetchFavorites.fulfilled.type,
            payload,
        });

        expect(next.loading).toBe(false);
        expect(next.error).toBeNull();
        expect(next.favorites.map(m => m.id)).toEqual([1, 2]);
    });

    it('fetchFavorites.rejected should set error from payload and stop loading', () => {
        const start: FavoritesState = {
            ...baseState,
            loading: true,
            error: null,
        };

        const next = reducer(start, {
            type: fetchFavorites.rejected.type,
            payload: 'Failed to fetch favorites',
            error: { message: 'ignored when payload exists' },
        });

        expect(next.loading).toBe(false);
        expect(next.error).toBe('Failed to fetch favorites');
    });

    it('fetchFavorites thunk should call getFavorites and resolve movies', async () => {
        const token = 'token123';
        const payload = [makeMovie(1)];
        (getFavorites as jest.Mock).mockResolvedValueOnce(payload);

        const dispatch = jest.fn();
        const getState = jest.fn();
        const result = await fetchFavorites(token)(dispatch, getState, undefined);

        expect(getFavorites).toHaveBeenCalledTimes(1);
        expect(getFavorites).toHaveBeenCalledWith(token);

        expect(result.type).toBe(fetchFavorites.fulfilled.type);
        expect((result as any).payload).toEqual(payload);
    });

    it('fetchFavorites thunk should rejectWithValue when api throws', async () => {
        const token = 'token123';
        (getFavorites as jest.Mock).mockRejectedValueOnce(
            new Error('boom'),
        );

        const dispatch = jest.fn();
        const getState = jest.fn();
        const result = await fetchFavorites(token)(dispatch, getState, undefined);

        expect(getFavorites).toHaveBeenCalledWith(token);
        expect(result.type).toBe(fetchFavorites.rejected.type);
        expect((result as any).payload).toBe('boom');
    });
});
