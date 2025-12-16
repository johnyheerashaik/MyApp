import {logEvent} from './analytics';

// User Events
export const logUserLogin = (method: string) => {
  logEvent('login', {method});
};

export const logUserSignup = (method: string) => {
  logEvent('sign_up', {method});
};

export const logUserLogout = () => {
  logEvent('logout', {});
};

// Movie Events
export const logMovieView = (movieId: string, movieTitle: string) => {
  logEvent('view_movie_details', {
    movie_id: movieId,
    movie_title: movieTitle,
  });
};

export const logMovieSearch = (searchTerm: string) => {
  logEvent('search', {
    search_term: searchTerm,
  });
};

export const logMovieFavorited = (movieId: string, movieTitle: string) => {
  logEvent('add_to_favorites', {
    movie_id: movieId,
    movie_title: movieTitle,
  });
};

export const logMovieUnfavorited = (movieId: string, movieTitle: string) => {
  logEvent('remove_from_favorites', {
    movie_id: movieId,
    movie_title: movieTitle,
  });
};

export const logTrailerPlay = (movieId: string, movieTitle: string) => {
  logEvent('play_trailer', {
    movie_id: movieId,
    movie_title: movieTitle,
  });
};

// AI Companion Events
export const logAIChat = (messageType: string) => {
  logEvent('ai_chat', {
    message_type: messageType,
  });
};

export const logAIRecommendation = (movieCount: number) => {
  logEvent('ai_recommendation', {
    movie_count: movieCount,
  });
};

// Theater Events
export const logTheaterSearch = (searchMethod: 'gps' | 'zipcode', resultCount: number) => {
  logEvent('search_theaters', {
    search_method: searchMethod,
    result_count: resultCount,
  });
};

export const logTheaterDirections = (theaterName: string) => {
  logEvent('get_directions', {
    theater_name: theaterName,
  });
};

// Collection Events
export const logCollectionView = (sortType: string) => {
  logEvent('view_collection', {
    sort_type: sortType,
  });
};

// App Events
export const logThemeChange = (theme: 'light' | 'dark') => {
  logEvent('theme_change', {
    theme,
  });
};

export const logAppError = (errorName: string, errorMessage: string) => {
  logEvent('app_error', {
    error_name: errorName,
    error_message: errorMessage,
  });
};
