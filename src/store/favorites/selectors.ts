import { RootState } from '../index';

export const selectFavorites = (state: RootState) => state.favorites.favorites;
export const selectFavoritesLoading = (state: RootState) => state.favorites.loading;
export const selectFavoritesError = (state: RootState) => state.favorites.error;
