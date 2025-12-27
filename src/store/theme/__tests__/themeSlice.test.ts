import reducer, { setThemeMode, toggleTheme, loadTheme, type ThemeState } from '../themeSlice';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logThemeChange, logError } from '../../../services/analytics';

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../services/analytics', () => ({
    logThemeChange: jest.fn(),
    logError: jest.fn(),
}));

jest.mock('../../../constants/colors', () => ({
    DARK_THEME_COLORS: { background: 'dark-bg', text: 'dark-text' },
    LIGHT_THEME_COLORS: { background: 'light-bg', text: 'light-text' },
}));

jest.mock('../../initialState', () => ({
    initialThemeState: { mode: 'dark' },
}));

describe('themeSlice', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return initial state', () => {
        const state = reducer(undefined, { type: 'unknown' });
        expect(state.mode).toBe('dark');
        expect(state.colors).toEqual({ background: 'dark-bg', text: 'dark-text' });
    });

    it('setThemeMode should set mode + colors and persist + log', () => {
        const prev: ThemeState = {
            mode: 'dark',
            colors: { background: 'dark-bg', text: 'dark-text' } as any,
        };

        const next = reducer(prev, setThemeMode('light'));

        expect(next.mode).toBe('light');
        expect(next.colors).toEqual({ background: 'light-bg', text: 'light-text' });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(logThemeChange).toHaveBeenCalledWith('light');
        expect(logError).not.toHaveBeenCalled();
    });

    it('toggleTheme should switch dark -> light and persist + log', () => {
        const prev: ThemeState = {
            mode: 'dark',
            colors: { background: 'dark-bg', text: 'dark-text' } as any,
        };

        const next = reducer(prev, toggleTheme());

        expect(next.mode).toBe('light');
        expect(next.colors).toEqual({ background: 'light-bg', text: 'light-text' });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(logThemeChange).toHaveBeenCalledWith('light');
    });

    it('toggleTheme should switch light -> dark and persist + log', () => {
        const prev: ThemeState = {
            mode: 'light',
            colors: { background: 'light-bg', text: 'light-text' } as any,
        };

        const next = reducer(prev, toggleTheme());

        expect(next.mode).toBe('dark');
        expect(next.colors).toEqual({ background: 'dark-bg', text: 'dark-text' });

        expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(logThemeChange).toHaveBeenCalledWith('dark');
    });

    it('loadTheme should set mode + colors but NOT persist/log', () => {
        const prev: ThemeState = {
            mode: 'dark',
            colors: { background: 'dark-bg', text: 'dark-text' } as any,
        };

        const next = reducer(prev, loadTheme('light'));

        expect(next.mode).toBe('light');
        expect(next.colors).toEqual({ background: 'light-bg', text: 'light-text' });

        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        expect(logThemeChange).not.toHaveBeenCalled();
    });

    it('setThemeMode should call logError if AsyncStorage.setItem rejects', async () => {
        (AsyncStorage.setItem as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('disk full')));

        const prev: ThemeState = {
            mode: 'dark',
            colors: { background: 'dark-bg', text: 'dark-text' } as any,
        };

        reducer(prev, setThemeMode('light'));

        await Promise.resolve();

        expect(logError).toHaveBeenCalled();
        expect(logThemeChange).toHaveBeenCalledWith('light');
    });

    it('toggleTheme should call logError if AsyncStorage.setItem rejects', async () => {
        (AsyncStorage.setItem as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('disk full')));

        const prev: ThemeState = {
            mode: 'dark',
            colors: { background: 'dark-bg', text: 'dark-text' } as any,
        };

        reducer(prev, toggleTheme());

        await Promise.resolve();

        expect(logError).toHaveBeenCalled();
        expect(logThemeChange).toHaveBeenCalledWith('light');
    });
});
