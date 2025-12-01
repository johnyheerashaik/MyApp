// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as ReduxProvider} from 'react-redux';

import RootNavigator from './src/navigation/RootNavigator';
import configureAppStore from './src/store';
import {AuthProvider} from './src/auth/AuthContext';
import {ThemeProvider} from './src/theme/ThemeContext';
import {FavoritesProvider} from './src/favorites/FavoritesContext';

const store = configureAppStore();

export default function App() {
  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <FavoritesProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </FavoritesProvider>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
