import { Movie } from '../movies/types';

export type FavoritesState = {
  favorites: Movie[];
  loading: boolean;
  error?: string | null;
};

export enum FavoritesActionTypes {
  INIT = 'favorites/INIT',
  ADD_FAVORITE = 'favorites/ADD_FAVORITE',
  REMOVE_FAVORITE = 'favorites/REMOVE_FAVORITE',
  TOGGLE_FAVORITE = 'favorites/TOGGLE_FAVORITE',
}

export type FavoritesAction =
  | { type: FavoritesActionTypes.INIT; payload: Movie[] }
  | { type: FavoritesActionTypes.ADD_FAVORITE; payload: Movie }
  | { type: FavoritesActionTypes.REMOVE_FAVORITE; payload: number }
  | { type: FavoritesActionTypes.TOGGLE_FAVORITE; payload: Movie };
