
import React, {createContext, useContext, useEffect} from 'react';
import {Movie} from '../services/movieApi';
import {useAuth} from '../auth/AuthContext';
import {useSelector, useDispatch} from 'react-redux';
import type {RootState} from '../store';
import {
  initFavorites as initFavoritesAction,
  addFavorite as addFavoriteAction,
  removeFavorite as removeFavoriteAction,
  toggleFavorite as toggleFavoriteAction,
} from '../store/favorites/actions';
import * as favoritesApi from '../services/favoritesApi';
import * as reminderApi from '../services/reminderApi';

type FavoritesContextValue = {
  favorites: Movie[];
  loading: boolean;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (movie: Movie) => void;
  addFavorite: (movie: Movie) => void;
  removeFavorite: (id: number) => void;
  toggleReminder: (movieId: number, enabled: boolean) => Promise<void>;
  isReminderEnabled: (id: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export const FavoritesProvider = ({children}: {children: React.ReactNode}) => {
  const {user} = useAuth();
  const dispatch = useDispatch();
  const favoritesState = useSelector((s: RootState) => s.favorites);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.token) {
        dispatch(initFavoritesAction([]));
        return;
      }

      try {
        const favorites = await favoritesApi.getFavorites(user.token);
        dispatch(initFavoritesAction(favorites));
      } catch (error) {
        console.error('Failed to load favorites from server:', error);
        dispatch(initFavoritesAction([]));
      }
    };

    loadFavorites();
  }, [user?.id, user?.token, dispatch]);

  const isFavorite = (id: number) => {
    return favoritesState.favorites.some(movie => movie.id === id);
  };

  const toggleFavorite = async (movie: Movie) => {
    console.log('🔄 Toggle favorite called for:', movie.title, 'ID:', movie.id);
    console.log('🔄 User token exists:', !!user?.token);
    
    if (!user?.token) {
      console.warn('❌ Cannot toggle favorite: user not logged in');
      return;
    }

    const isCurrentlyFavorite = isFavorite(movie.id);
    console.log('🔄 Currently favorite?', isCurrentlyFavorite);

    if (isCurrentlyFavorite) {
      dispatch(removeFavoriteAction(movie.id));
    } else {
      dispatch(addFavoriteAction(movie));
    }

    try {
      if (isCurrentlyFavorite) {
        console.log('🗑️ Removing favorite from server...');
        await favoritesApi.removeFavorite(user.token, movie.id);
        console.log('✅ Successfully removed from server');
      } else {
        console.log('➕ Adding favorite to server...');
        await favoritesApi.addFavorite(user.token, movie);
        console.log('✅ Successfully added to server');
      }
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error);
      if (isCurrentlyFavorite) {
        dispatch(addFavoriteAction(movie));
      } else {
        dispatch(removeFavoriteAction(movie.id));
      }
    }
  };

  const addFavorite = async (movie: Movie) => {
    if (!user?.token) {
      console.warn('Cannot add favorite: user not logged in');
      return;
    }

    dispatch(addFavoriteAction(movie));

    try {
      await favoritesApi.addFavorite(user.token, movie);
    } catch (error) {
      console.error('Failed to add favorite:', error);
      dispatch(removeFavoriteAction(movie.id));
    }
  };

  const removeFavorite = async (id: number) => {
    if (!user?.token) {
      console.warn('Cannot remove favorite: user not logged in');
      return;
    }

    dispatch(removeFavoriteAction(id));

    try {
      await favoritesApi.removeFavorite(user.token, id);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      console.error('Cannot revert remove - movie data not available');
    }
  };

  const toggleReminder = async (movieId: number, enabled: boolean) => {
    if (!user?.token) {
      console.warn('Cannot toggle reminder: user not logged in');
      return;
    }

    try {
      await reminderApi.toggleReminder(user.token, movieId, enabled);
      
      // Update the local state
      const updatedFavorites = favoritesState.favorites.map(fav =>
        fav.id === movieId ? {...fav, reminderEnabled: enabled} : fav,
      );
      dispatch(initFavoritesAction(updatedFavorites));
      
      console.log(`✅ Reminder ${enabled ? 'enabled' : 'disabled'} for movie ${movieId}`);
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      throw error;
    }
  };

  const isReminderEnabled = (id: number) => {
    const movie = favoritesState.favorites.find(m => m.id === id);
    return movie?.reminderEnabled || false;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites: favoritesState.favorites,
        loading: favoritesState.loading,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        toggleReminder,
        isReminderEnabled,
      }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);

  if (!ctx) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }

  return ctx;
};
