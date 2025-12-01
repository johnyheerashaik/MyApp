import {combineReducers, createStore, Store} from 'redux';
import {favoritesReducer} from './favorites/reducer';
import {authReducer} from './auth/reducer';
import {themeReducer} from './theme/reducer';

export const rootReducer = combineReducers({
  favorites: favoritesReducer,
  auth: authReducer,
  theme: themeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function configureAppStore(preloadedState?: Partial<RootState>): Store {
  const store = createStore(rootReducer, preloadedState as any);
  return store;
}

export default configureAppStore;
