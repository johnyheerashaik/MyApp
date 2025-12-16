import { getAnalytics, logEvent as firebaseLogEvent, setUserProperty as firebaseSetUserProperty, setUserId as analyticsSetUserId } from '@react-native-firebase/analytics';
import { getCrashlytics, log, recordError, crash, setUserId as crashlyticsSetUserId } from '@react-native-firebase/crashlytics';

// Initialize Firebase services
export const initializeFirebaseServices = async () => {
  try {
    const analytics = getAnalytics();
    const crashlytics = getCrashlytics();

    await firebaseLogEvent(analytics, 'app_initialized', {
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

// Log screen views
export const logScreenView = async (screenName: string, screenClass?: string) => {
  try {
    const analytics = getAnalytics();
    await firebaseLogEvent(analytics, 'screen_view' as any, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log(`Screen view logged: ${screenName}`);
  } catch (error) {
    console.error('Error logging screen view:', error);
  }
};

// Log custom events
export const logEvent = async (eventName: string, params?: {[key: string]: any}) => {
  try {
    const analytics = getAnalytics();
    await firebaseLogEvent(analytics, eventName, params);
    console.log(`Event logged: ${eventName}`);
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

// Set user properties
export const setUserProperty = async (name: string, value: string) => {
  try {
    const analytics = getAnalytics();
    await firebaseSetUserProperty(analytics, name, value);
    console.log(`User property set: ${name}`);
  } catch (error) {
    console.error('Error setting user property:', error);
  }
};

// Set user ID for analytics
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

// Log non-fatal errors to Crashlytics
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

// Test crash (for testing purposes only)
export const testCrash = () => {
  const crashlytics = getCrashlytics();
  crash(crashlytics);
  console.log('Crash test triggered');
};
