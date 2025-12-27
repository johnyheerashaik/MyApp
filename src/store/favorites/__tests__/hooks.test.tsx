import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react-native';

import favoritesReducer from '../favoritesSlice';
import { useFavorites, useFavoritesActions } from '../hooks';

import {
    addFavorite as addFavoriteAction,
    removeFavorite as removeFavoriteAction,
    toggleFavorite as toggleFavoriteAction,
    fetchFavorites,
} from '../favoritesSlice';

import type { Movie } from '../../movies/types';

jest.mock('../favoritesSlice', () => {
    const actual = jest.requireActual('../favoritesSlice');
    return {
        __esModule: true,
        ...actual,

        addFavorite: jest.fn((movie: any) => ({
            type: 'favorites/addFavorite',
            payload: movie,
        })),
        removeFavorite: jest.fn((id: any) => ({
            type: 'favorites/removeFavorite',
            payload: id,
        })),
        toggleFavorite: jest.fn((movie: any) => ({
            type: 'favorites/toggleFavorite',
            payload: movie,
        })),

        fetchFavorites: jest.fn((token: string) => ({
            type: 'favorites/fetchFavorites',
            payload: token,
        })),
    };
});

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

const makeStore = (preloadedFavorites?: any) =>
    configureStore({
        reducer: { favorites: favoritesReducer },
        preloadedState: preloadedFavorites
            ? { favorites: preloadedFavorites }
            : undefined,
    });

const makeWrapper =
    (store: ReturnType<typeof makeStore>) =>
        ({ children }: { children: React.ReactNode }) => {
            return <Provider store={store}>{children}</Provider>;
        };

describe('favorites hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('useFavorites should return favorites + loading from state', () => {
        const store = makeStore({
            favorites: [makeMovie(1), makeMovie(2)],
            loading: false,
            error: null,
        });

        const { result } = renderHook(() => useFavorites(), {
            wrapper: makeWrapper(store),
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.favorites.map(m => m.id)).toEqual([1, 2]);
    });

    it('useFavorites.isFavorite should return true if id exists', () => {
        const store = makeStore({
            favorites: [makeMovie(7)],
            loading: false,
            error: null,
        });

        const { result } = renderHook(() => useFavorites(), {
            wrapper: makeWrapper(store),
        });

        expect(result.current.isFavorite(7)).toBe(true);
        expect(result.current.isFavorite(8)).toBe(false);
    });

    it('useFavoritesActions.addFavorite should dispatch addFavoriteAction(movie)', () => {
        const store = makeStore({
            favorites: [],
            loading: false,
            error: null,
        });

        const spyDispatch = jest.spyOn(store, 'dispatch');
        const movie = makeMovie(1);

        const { result } = renderHook(() => useFavoritesActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.addFavorite(movie);
        });

        expect(addFavoriteAction).toHaveBeenCalledWith(movie);
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'favorites/addFavorite',
            payload: movie,
        });
    });

    it('useFavoritesActions.removeFavorite should dispatch removeFavoriteAction(id)', () => {
        const store = makeStore({
            favorites: [makeMovie(1)],
            loading: false,
            error: null,
        });

        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useFavoritesActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.removeFavorite(1);
        });

        expect(removeFavoriteAction).toHaveBeenCalledWith(1);
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'favorites/removeFavorite',
            payload: 1,
        });
    });

    it('useFavoritesActions.toggleFavorite should dispatch toggleFavoriteAction(movie)', () => {
        const store = makeStore({
            favorites: [],
            loading: false,
            error: null,
        });

        const spyDispatch = jest.spyOn(store, 'dispatch');
        const movie = makeMovie(5);

        const { result } = renderHook(() => useFavoritesActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.toggleFavorite(movie);
        });

        expect(toggleFavoriteAction).toHaveBeenCalledWith(movie);
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'favorites/toggleFavorite',
            payload: movie,
        });
    });

    it('useFavoritesActions.fetchAllFavorites should dispatch fetchFavorites(token)', () => {
        const store = makeStore({
            favorites: [],
            loading: false,
            error: null,
        });

        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useFavoritesActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.fetchAllFavorites('token123');
        });

        expect(fetchFavorites).toHaveBeenCalledWith('token123');
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'favorites/fetchFavorites',
            payload: 'token123',
        });
    });
});
