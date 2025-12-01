import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, ActivityIndicator} from 'react-native';
import type {AuthStackParamList, AppStackParamList} from '../navigation/types';

import LoginScreen from '../login/LoginScreen';
import SignUpScreen from '../signup/SignUpScreen';
import HomeScreen from '../home/HomeScreen';
import MoviesScreen from '../movies/MoviesScreen';
import {useAuth} from '../store/hooks';
import {useTheme} from '../theme/ThemeContext';
import MovieDetailsScreen from '../movieDetail/MovieDetailScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{headerShown: false}}>
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Movies" component={MoviesScreen} />
      <AppStack.Screen name="MovieDetails" component={MovieDetailsScreen} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const {user, initializing} = useAuth();
  const theme = useTheme();

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}>
        <ActivityIndicator />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}
