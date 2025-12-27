import React, { memo, useEffect, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/rtkHooks';
import { bootstrapAuth } from '../store/auth/authSlice';
import type { AuthStackParamList, AppStackParamList } from '../navigation/types';

import LoginScreen from '../login/LoginScreen';
import SignUpScreen from '../signup/SignUpScreen';
import HomeScreen from '../home/HomeScreen';
import MoviesScreen from '../movies/MoviesScreen';
import TheatresScreen from '../theatres/TheatresScreen';
import CollectionScreen from '../collections/CollectionScreen';
import MovieDetailsScreen from '../movieDetail/MovieDetailScreen';


import { ICON_SIZE } from '../constants';
import { isFeatureEnabled } from '../config/featureToggles';
import type { ThemeState } from '../store/theme/themeSlice';


const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const TabEmojiIcon = memo(function TabEmojiIcon({
  emoji,
  color,
}: {
  emoji: string;
  color: string;
}) {
  return <Text style={{ fontSize: ICON_SIZE.MD, color }}>{emoji}</Text>;
});

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}



type TabNavigatorProps = {
  theme: ThemeState;
};

function TabNavigator({ theme }: TabNavigatorProps) {
  const tabScreens = useMemo(() => {
    const screens: Array<{
      name: string;
      component: React.ComponentType<any>;
      label: string;
      emoji: string;
    }> = [
        { name: 'HomeTab', component: HomeScreen, label: 'Home', emoji: '🏠' },
      ];

    if (isFeatureEnabled('ENABLE_MOVIES')) {
      screens.push({
        name: 'MoviesTab',
        component: MoviesScreen,
        label: 'Movies',
        emoji: '🎥',
      });
    }

    if (isFeatureEnabled('ENABLE_THEATERS')) {
      screens.push({
        name: 'TheatresTab',
        component: TheatresScreen,
        label: 'Theaters',
        emoji: '🎬',
      });
    }

    return screens;
  }, []);

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
      {tabScreens.map(s => (
        <Tab.Screen
          key={s.name}
          name={s.name as never}
          component={s.component}
          options={{
            tabBarLabel: s.label,
            tabBarIcon: ({ color }) => <TabEmojiIcon emoji={s.emoji} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}


type AppNavigatorProps = {
  theme: ThemeState;
};

function AppNavigator({ theme }: AppNavigatorProps) {
  const TabNavigatorWithTheme = useMemo(() => {
    const Comp = () => <TabNavigator theme={theme} />;
    Comp.displayName = 'TabNavigatorWithTheme';
    return Comp;
  }, [theme]);

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Home" component={TabNavigatorWithTheme} />
      <AppStack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <AppStack.Screen name="Collection" component={CollectionScreen} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const theme = useAppSelector(state => state.theme);
  const dispatch = useAppDispatch();

  const user = useAppSelector(s => s.auth.user);
  const initializing = useAppSelector(s => s.auth.initializing);

  useEffect(() => {
    void dispatch(bootstrapAuth() as any);
  }, [dispatch]);

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

  return user ? <AppNavigator theme={theme} /> : <AuthNavigator />;
}