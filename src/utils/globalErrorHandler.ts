import crashlytics from '@react-native-firebase/crashlytics';

export function registerGlobalErrorHandler() {
  if (typeof ErrorUtils !== 'undefined' && ErrorUtils.getGlobalHandler) {
    const defaultHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      crashlytics().recordError(error);
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });
  }
}
