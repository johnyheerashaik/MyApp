import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useThemeMode, useThemeActions} from '../store/hooks';
import {DARK_THEME_COLORS, LIGHT_THEME_COLORS, STORAGE_KEYS, ThemeColors} from '../constants';
import {logThemeChange} from '../services/analyticsEvents';

type ThemeMode = 'light' | 'dark';

type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const mode = useThemeMode();
  const {setThemeMode, toggleTheme: toggleThemeAction} = useThemeActions();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      }
    };
    loadTheme();
  }, [setThemeMode]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.THEME, mode).catch(error =>
      console.log('Error saving theme:', error)
    );
    logThemeChange(mode);
  }, [mode]);

  const value = useMemo<Theme>(
    () => ({
      mode,
      colors: mode === 'dark' ? DARK_THEME_COLORS : LIGHT_THEME_COLORS,
      toggleTheme: toggleThemeAction,
    }),
    [mode, toggleThemeAction],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
};
