import { registerGlobalErrorHandler } from './src/utils/globalErrorHandler';
registerGlobalErrorHandler();

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import RootNavigator from './src/navigation/RootNavigator';
import store from './src/store';

import { useAppSelector } from './src/store/rtkHooks';
import {
  initializeFirebaseServices,
  setUserId,
  logScreenView,
} from './src/services/analytics';
import { initializePerformanceMonitoring } from './src/services/performance';
import { getCrashlytics } from '@react-native-firebase/crashlytics';

function AppContent() {
  const user = useAppSelector(s => s.auth.user);

  useEffect(() => {
    Promise.all([initializeFirebaseServices(), initializePerformanceMonitoring()])
      .then(() => {
        if (__DEV__) {
          try {
            const crashlytics = getCrashlytics();
            // This will log to the console if Crashlytics is enabled
            console.log('[DEV] Crashlytics enabled:', !!crashlytics);
            crashlytics.log('[DEV] Crashlytics test log');
          } catch (e) {
            console.warn('[DEV] Crashlytics not available:', e);
          }
        }
      })
      .catch(error => {
        console.error('Firebase initialization failed:', error);
      });
  }, []);

  useEffect(() => {
    if (user?.token && user.id) {
      setUserId(user.id);
    }
  }, [user?.token, user?.id]);

  const routeNameRef = React.useRef<string | undefined>(undefined);
  const navigationRef = React.useRef<any>(null);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName && currentRouteName) {
          await logScreenView(currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <AppContent />
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
