import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../rtkHooks';
import {
    addFavorite as addFavoriteAction,
    removeFavorite as removeFavoriteAction,
    toggleFavorite as toggleFavoriteAction,
    fetchFavorites,
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

    const addFavorite = useCallback(
        (movie: Movie) => {
            dispatch(addFavoriteAction(movie));
        },
        [dispatch]
    );

    const removeFavorite = useCallback(
        (id: number) => {
            dispatch(removeFavoriteAction(id));
        },
        [dispatch]
    );

    const toggleFavorite = useCallback(
        (movie: Movie) => {
            dispatch(toggleFavoriteAction(movie));
        },
        [dispatch]
    );

    const fetchAllFavorites = useCallback(
        (token: string) => {
            dispatch(fetchFavorites(token));
        },
        [dispatch]
    );

    return { addFavorite, removeFavorite, toggleFavorite, fetchAllFavorites };
};
