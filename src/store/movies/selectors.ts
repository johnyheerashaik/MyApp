import { RootState } from '../index';

export const selectPopularMovies = (state: RootState) => state.movies.popular;
export const selectNowPlayingMovies = (state: RootState) => state.movies.nowPlaying;
export const selectUpcomingMovies = (state: RootState) => state.movies.upcoming;
export const selectTopRatedMovies = (state: RootState) => state.movies.topRated;
export const selectMovieDetails = (state: RootState) => state.movies.movieDetails;
export const selectMoviesLoading = (state: RootState) => state.movies.loading;
export const selectMoviesError = (state: RootState) => state.movies.error;

export const selectCurrentCollectionMovies = (state: RootState) => state.movies.currentCollectionMovies;
export const selectCurrentCollectionLoading = (state: RootState) => state.movies.currentCollectionLoading;
export const selectCurrentCollectionError = (state: RootState) => state.movies.currentCollectionError;
