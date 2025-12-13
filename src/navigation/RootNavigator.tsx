import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, ActivityIndicator, Text} from 'react-native';
import type {AuthStackParamList, AppStackParamList} from '../navigation/types';

import LoginScreen from '../login/LoginScreen';
import SignUpScreen from '../signup/SignUpScreen';
import HomeScreen from '../home/HomeScreen';
import MoviesScreen from '../movies/MoviesScreen';
import TheatresScreen from '../theatres/TheatresScreen';
import {useAuth} from '../store/hooks';
import {useTheme} from '../theme/ThemeContext';
import MovieDetailsScreen from '../movieDetail/MovieDetailScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.card,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 24, color}}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MoviesTab"
        component={MoviesScreen}
        options={{
          tabBarLabel: 'Movies',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 24, color}}>🎥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="TheatresTab"
        component={TheatresScreen}
        options={{
          tabBarLabel: 'Theaters',
          tabBarIcon: ({color}) => (
            <Text style={{fontSize: 24, color}}>🎬</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{headerShown: false}}>
      <AppStack.Screen name="Home" component={TabNavigator} />
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
