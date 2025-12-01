import {FavoritesState, FavoritesActionTypes, FavoritesAction} from './types';

const initialState: FavoritesState = {
  favorites: [],
  loading: true,
};

export function favoritesReducer(
  state: FavoritesState = initialState,
  action: FavoritesAction,
): FavoritesState {
  switch (action.type) {
    case FavoritesActionTypes.INIT: {
      return {
        favorites: action.payload,
        loading: false,
      };
    }

    case FavoritesActionTypes.ADD_FAVORITE: {
      const exists = state.favorites.some(m => m.id === action.payload.id);
      if (exists) {
        return state;
      }
      return {
        ...state,
        favorites: [action.payload, ...state.favorites],
      };
    }

    case FavoritesActionTypes.REMOVE_FAVORITE: {
      return {
        ...state,
        favorites: state.favorites.filter(m => m.id !== action.payload),
      };
    }

    case FavoritesActionTypes.TOGGLE_FAVORITE: {
      const exists = state.favorites.some(m => m.id === action.payload.id);

      const favorites = exists
        ? state.favorites.filter(m => m.id !== action.payload.id)
        : [action.payload, ...state.favorites];

      return {
        ...state,
        favorites,
      };
    }

    default:
      return state;
  }
}
