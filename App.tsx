import { registerGlobalErrorHandler } from './src/utils/globalErrorHandler';
registerGlobalErrorHandler();
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as ReduxProvider} from 'react-redux';

import RootNavigator from './src/navigation/RootNavigator';
import configureAppStore from './src/store';
import {AuthProvider, useAuth} from './src/auth/AuthContext';
import {ThemeProvider} from './src/theme/ThemeContext';
import {FavoritesProvider} from './src/favorites/FavoritesContext';
import {initializePushNotifications} from './src/services/pushNotifications';
import * as reminderApi from './src/services/reminderApi';
import {initializeFirebaseServices, setUserId, logScreenView} from './src/services/analytics';
import {initializePerformanceMonitoring} from './src/services/performance';

const store = configureAppStore();

function AppContent() {
  const {user} = useAuth();
  useEffect(() => {
    Promise.all([
      initializeFirebaseServices(),
      initializePerformanceMonitoring()
    ])
      .catch((error) => {
        console.error('Firebase initialization failed:', error);
      });
  }, []);

  useEffect(() => {
    if (user?.token) {
      if (user.id) {
        setUserId(user.id);
      }

      // Initialize push notifications
      // initializePushNotifications(async (fcmToken) => {
      //   try {
      //     await reminderApi.updatePushToken(user.token, fcmToken);
      //   } catch (error) {
      //     console.error('Failed to register push token:', error);
      //   }
      // });
    }
  }, [user?.token]);

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
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
