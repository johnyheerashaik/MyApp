import {Movie} from '../../services/movieApi';
import {
  FavoritesActionTypes,
  FavoritesAction,
} from './types';

export const initFavorites = (movies: Movie[]): FavoritesAction => ({
  type: FavoritesActionTypes.INIT,
  payload: movies,
});

export const addFavorite = (movie: Movie): FavoritesAction => ({
  type: FavoritesActionTypes.ADD_FAVORITE,
  payload: movie,
});

export const removeFavorite = (id: number): FavoritesAction => ({
  type: FavoritesActionTypes.REMOVE_FAVORITE,
  payload: id,
});

export const toggleFavorite = (movie: Movie): FavoritesAction => ({
  type: FavoritesActionTypes.TOGGLE_FAVORITE,
  payload: movie,
});
