import {useCallback} from 'react';
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';
import type {RootState} from './index';
import type {Dispatch} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginApi} from '../services/authApi';
import type {Movie} from '../services/movieApi';
import {
  signInAction,
  signOutAction,
} from './auth/actions';
import {
  addFavorite as addFavoriteAction,
  removeFavorite as removeFavoriteAction,
  toggleFavorite as toggleFavoriteAction,
} from './favorites/actions';

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => {
  const auth = useAppSelector(state => state.auth);
  return {
    user: auth.user,
    initializing: auth.initializing,
  };
};

export const useAuthActions = () => {
  const dispatch = useAppDispatch();

  const signIn = useCallback(
    async (email: string, password: string) => {
      const {user, token} = await loginApi(email, password);
      
      const userWithToken = {
        ...user,
        token,
      };
      
      console.log('🔐 hooks.ts signIn: User with token:', userWithToken);
      
      await AsyncStorage.setItem('auth_user', JSON.stringify(userWithToken));
      dispatch(signInAction(userWithToken));
    },
    [dispatch],
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem('auth_user');
    dispatch(signOutAction());
  }, [dispatch]);

  return {signIn, signOut};
};

export const useFavorites = () => {
  const favorites = useAppSelector(state => state.favorites);
  return {
    favorites: favorites.favorites,
    loading: favorites.loading,
    isFavorite: (id: number) =>
      favorites.favorites.some(movie => movie.id === id),
  };
};

export const useFavoritesActions = () => {
  const dispatch = useAppDispatch();

  const addFavorite = useCallback(
    (movie: Movie) => {
      dispatch(addFavoriteAction(movie));
    },
    [dispatch],
  );

  const removeFavorite = useCallback(
    (id: number) => {
      dispatch(removeFavoriteAction(id));
    },
    [dispatch],
  );

  const toggleFavorite = useCallback(
    (movie: Movie) => {
      dispatch(toggleFavoriteAction(movie));
    },
    [dispatch],
  );

  return {addFavorite, removeFavorite, toggleFavorite};
};

export const useThemeMode = () => {
  return useAppSelector(state => state.theme.mode);
};

export const useThemeActions = () => {
  const dispatch = useAppDispatch();

  const setThemeMode = useCallback(
    (mode: 'light' | 'dark') => {
      dispatch({type: 'theme/SET_THEME_MODE', payload: mode});
    },
    [dispatch],
  );

  const toggleTheme = useCallback(() => {
    dispatch({type: 'theme/TOGGLE_THEME'});
  }, [dispatch]);

  return {setThemeMode, toggleTheme};
};
