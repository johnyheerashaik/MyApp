import { configureStore } from '@reduxjs/toolkit';

import authReducer from './auth/authSlice';
import favoritesReducer from './favorites/favoritesSlice';
import themeReducer from './theme/themeSlice';
import reminderReducer from './reminder/reminderSlice';
import moviesReducer from './movies/moviesSlice';
import theatresReducer from './theatres/theatresSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    favorites: favoritesReducer,
    theme: themeReducer,
    reminder: reminderReducer,
    movies: moviesReducer,
    theatres: theatresReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
