// App.tsx
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

const store = configureAppStore();

function AppContent() {
  const {user} = useAuth();

  useEffect(() => {
    if (user?.token) {
      // Initialize push notifications when user is logged in
      initializePushNotifications(async (fcmToken) => {
        try {
          await reminderApi.updatePushToken(user.token, fcmToken);
          console.log('✅ Push token registered with backend');
        } catch (error) {
          console.error('❌ Failed to register push token:', error);
        }
      });
    }
  }, [user?.token]);

  return (
    <NavigationContainer>
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
