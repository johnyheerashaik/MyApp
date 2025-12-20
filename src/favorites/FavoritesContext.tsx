
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
import { logMovieFavorited, logMovieUnfavorited } from '../services/analytics';

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
  const [reminders, setReminders] = React.useState<{[movieId: number]: boolean}>({});

  useEffect(() => {
    const loadFavoritesAndReminders = async () => {
      if (!user?.token) {
        dispatch(initFavoritesAction([]));
        setReminders({});
        return;
      }

      try {
        const favorites = await favoritesApi.getFavorites(user.token);
        dispatch(initFavoritesAction(favorites));
      } catch (error) {
        console.error('Failed to load favorites from server:', error);
        dispatch(initFavoritesAction([]));
      }

      try {
        const remindersList = await reminderApi.getReminders(user.token);
        const remindersMap: {[movieId: number]: boolean} = {};
        remindersList.forEach(r => {
          remindersMap[r.movieId] = !!r.reminderEnabled;
        });
        setReminders(remindersMap);
      } catch (error) {
        console.error('Failed to load reminders from server:', error);
        setReminders({});
      }
    };

    loadFavoritesAndReminders();
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
        await favoritesApi.removeFavorite(user.token, movie.id);
        logMovieUnfavorited(movie.id.toString(), movie.title);
      } else {
        await favoritesApi.addFavorite(user.token, movie);
        logMovieFavorited(movie.id.toString(), movie.title);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
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
      logMovieFavorited(movie.id.toString(), movie.title);
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
      setReminders(prev => ({ ...prev, [movieId]: enabled }));
      console.log(`✅ Reminder ${enabled ? 'enabled' : 'disabled'} for movie ${movieId}`);
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      throw error;
    }
  };

  const isReminderEnabled = (id: number) => {
    return !!reminders[id];
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
