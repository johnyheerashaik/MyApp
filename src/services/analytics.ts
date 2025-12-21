import { getAnalytics, logEvent as firebaseLogEvent, setUserProperty as firebaseSetUserProperty, setUserId as analyticsSetUserId, setAnalyticsCollectionEnabled, logScreenView as firebaseLogScreenView } from '@react-native-firebase/analytics';
import { getCrashlytics, log, recordError, crash, setUserId as crashlyticsSetUserId, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';

export const initializeFirebaseServices = async () => {
  try {
    const analytics = getAnalytics();
    const crashlytics = getCrashlytics();

    await setAnalyticsCollectionEnabled(analytics, true);
    await setCrashlyticsCollectionEnabled(crashlytics, true);

    // Log Crashlytics state for diagnostics
    console.log('[Crashlytics] Initialized:', !!crashlytics);
    console.log('[Crashlytics] setCrashlyticsCollectionEnabled is always available');

    await firebaseLogEvent(analytics, 'app_initialized', {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

export const logScreenView = async (screenName: string, screenClass?: string) => {
  try {
    const analytics = getAnalytics();
    await firebaseLogEvent(analytics, 'screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenClass || screenName,
    });
    console.log(`Screen view logged: ${screenName}`);
  } catch (error) {
    console.error('Error logging screen view:', error);
  }
};

export const logEvent = async (eventName: string, params?: {[key: string]: any}) => {
  try {
    const analytics = getAnalytics();
    await firebaseLogEvent(analytics, eventName, params);
    console.log(`Event logged: ${eventName}`);
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

export const setUserProperty = async (name: string, value: string) => {
  try {
    const analytics = getAnalytics();
    await firebaseSetUserProperty(analytics, name, value);
    console.log(`User property set: ${name}`);
  } catch (error) {
    console.error('Error setting user property:', error);
  }
};

export const setUserId = async (userId: string) => {
  try {
    const analytics = getAnalytics();
    const crashlytics = getCrashlytics();
    await analyticsSetUserId(analytics, userId);
    await crashlyticsSetUserId(crashlytics, userId);
    console.log(`User ID set: ${userId}`);
  } catch (error) {
    console.error('Error setting user ID:', error);
  }
};

export const logError = (error: Error, context?: string) => {
  try {
    const crashlytics = getCrashlytics();
    if (context) {
      log(crashlytics, context);
    }
    recordError(crashlytics, error);
    console.log('Error logged to crashlytics');
  } catch (e) {
    console.error('Error logging to crashlytics:', e);
  }
};

export const testCrash = () => {
  const crashlytics = getCrashlytics();
  crash(crashlytics);
  console.log('Crash test triggered');
};

export const logUserLogin = (method: string) => {
  logEvent('login', {method});
};

export const logUserSignup = (method: string) => {
  logEvent('sign_up', {method});
};

export const logUserLogout = () => {
  logEvent('logout', {});
};

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

export const logCollectionView = (sortType: string) => {
  logEvent('view_collection', {
    sort_type: sortType,
  });
};

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
