import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../rtkHooks';
import {
    addFavorite as addFavoriteAction,
    removeFavorite as removeFavoriteAction,
    toggleFavorite as toggleFavoriteAction,
    fetchFavorites,
    addFavoriteAsync,
    removeFavoriteAsync,
} from './favoritesSlice';
import type { Movie } from '../movies/types';

export const useFavorites = () => {
    const favorites = useAppSelector((state) => state.favorites.favorites);
    const loading = useAppSelector((state) => state.favorites.loading);
    const isFavorite = useCallback(
        (id: number) => favorites.some(movie => movie.id === id),
        [favorites]
    );
    return { favorites, loading, isFavorite };
};

export const useFavoritesActions = () => {
    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.user?.token);
    const favorites = useAppSelector((state) => state.favorites.favorites);

    const addFavorite = useCallback(
        (movie: Movie) => {
            if (token) {
                dispatch(addFavoriteAsync({ token, movie }));
            } else {
                dispatch(addFavoriteAction(movie));
            }
        },
        [dispatch, token]
    );

    const removeFavorite = useCallback(
        (id: number) => {
            if (token) {
                dispatch(removeFavoriteAsync({ token, movieId: id }));
            } else {
                dispatch(removeFavoriteAction(id));
            }
        },
        [dispatch, token]
    );

    const toggleFavorite = useCallback(
        (movie: Movie) => {
            const isFavorite = favorites.some(m => m.id === movie.id);
            if (token) {
                if (isFavorite) {
                    dispatch(removeFavoriteAsync({ token, movieId: movie.id }));
                } else {
                    dispatch(addFavoriteAsync({ token, movie }));
                }
            } else {
                dispatch(toggleFavoriteAction(movie));
            }
        },
        [dispatch, token, favorites]
    );

    const fetchAllFavorites = useCallback(
        (token: string) => {
            dispatch(fetchFavorites(token));
        },
        [dispatch]
    );

    return { addFavorite, removeFavorite, toggleFavorite, fetchAllFavorites };
};
