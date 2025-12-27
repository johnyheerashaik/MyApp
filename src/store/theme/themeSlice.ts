
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME_COLORS, LIGHT_THEME_COLORS } from '../../constants/colors';
import { logThemeChange, logError } from '../../services/analytics';
import { initialThemeState } from '../initialState';

export type ThemeMode = 'light' | 'dark';
export type ThemeState = {
    mode: ThemeMode;
    colors: typeof DARK_THEME_COLORS;
};

const getColors = (mode: ThemeMode) =>
    mode === 'dark' ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;

const initialState: ThemeState = {
    mode: initialThemeState.mode as ThemeMode,
    colors: getColors(initialThemeState.mode as ThemeMode),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
            state.colors = getColors(action.payload);
            AsyncStorage.setItem('theme', action.payload).catch(error => {
                logError(error, 'Error saving theme');
            });
            logThemeChange(action.payload);
        },
        toggleTheme: state => {
            const newMode = state.mode === 'dark' ? 'light' : 'dark';
            state.mode = newMode;
            state.colors = getColors(newMode);
            AsyncStorage.setItem('theme', newMode).catch(error => {
                logError(error, 'Error saving theme');
            });
            logThemeChange(newMode);
        },
        loadTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
            state.colors = getColors(action.payload);
        },
    },
});

export const { setThemeMode, toggleTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;
