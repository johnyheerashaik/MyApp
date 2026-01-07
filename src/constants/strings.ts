
export const APP_STRINGS = {
  APP_NAME: 'MyApp',

  WELCOME: 'Welcome',
  SIGN_IN_TO_CONTINUE: 'Sign in to continue',
  EMAIL: 'Email',
  PASSWORD: 'Password',
  SIGN_IN: 'Sign In',
  SIGNING_IN: 'Signing in…',
  LOGIN_FAILED: 'Login failed',
  LOGOUT: 'Logout',

  YOUR_FAVORITES: 'Your Favourites',
  NO_MOVIES_ADDED: "You haven't added any movies yet.",
  RATING_LABEL: '⭐ Rating',
  YEAR_LABEL: '📅 Year',
  TITLE_LABEL: '🔤 Title',

  MOVIES: 'Movies',
  SEARCH_MOVIES: 'Search movies...',
  POPULAR: 'Popular',
  NOW_PLAYING: 'Now Playing',
  UPCOMING: 'Upcoming',
  TOP_RATED: 'Top Rated',
  FAILED_TO_LOAD_MOVIES: 'Failed to load movies',

  OVERVIEW: 'Overview',
  NO_OVERVIEW_AVAILABLE: 'No overview available.',
  CAST: 'Cast',
  MINUTES: 'min',
  AS: 'as',

  HEY_USER: (name: string) => `Hey ${name} 👋`,
  HEY_THERE: 'Hey there 👋',
  ASK_ABOUT_MOVIES: 'Ask about movies or favourites...',
  ASK: 'Ask',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',

  NO_DATA: 'No data',
  ERROR: 'Error',

  DARK_MODE: 'Dark Mode',
  LIGHT_MODE: 'Light Mode',

  // Feedback Form
  FEEDBACK_TITLE: 'Report a Bug',
  FEEDBACK_NAME_LABEL: 'Name',
  FEEDBACK_EMAIL_LABEL: 'Email',
  FEEDBACK_DESCRIPTION_LABEL: 'Description',
  FEEDBACK_NAME_PLACEHOLDER: 'Your Name',
  FEEDBACK_EMAIL_PLACEHOLDER: 'your.email@example.org',
  FEEDBACK_DESCRIPTION_PLACEHOLDER: "What's the bug? What did you expect?",
  FEEDBACK_SUBMIT_BUTTON: 'Submit',
  FEEDBACK_CANCEL_BUTTON: 'Cancel',
  FEEDBACK_SENDING: 'Sending...',
  FEEDBACK_REQUIRED: '*',
  FEEDBACK_SUCCESS_TITLE: '✓ Thank You!',
  FEEDBACK_SUCCESS_MESSAGE: 'Your feedback has been submitted successfully.',
} as const;

export const MOVIE_ENDPOINTS = {
  POPULAR: '/movie/popular',
  NOW_PLAYING: '/movie/now_playing',
  UPCOMING: '/movie/upcoming',
  TOP_RATED: '/movie/top_rated',
} as const;

export const STORAGE_KEYS = {
  THEME: '@app_theme_mode',
  FAVORITES: '@favorites',
  AUTH: '@auth_user',
} as const;
