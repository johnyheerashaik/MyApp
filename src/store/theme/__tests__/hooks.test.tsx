import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react-native';

import { useThemeMode, useThemeActions } from '../hooks';

import { setThemeMode, toggleTheme, loadTheme } from '../themeSlice';

jest.mock('../themeSlice', () => ({
    __esModule: true,
    setThemeMode: jest.fn((mode: any) => ({ type: 'theme/setThemeMode', payload: mode })),
    toggleTheme: jest.fn(() => ({ type: 'theme/toggleTheme' })),
    loadTheme: jest.fn((mode: any) => ({ type: 'theme/loadTheme', payload: mode })),
}));

const defaultThemeState = { mode: 'dark' };
const themeReducer = (state = defaultThemeState) => state;

const makeStore = (preloadedTheme?: any) =>
    configureStore({
        reducer: { theme: themeReducer },
        preloadedState: preloadedTheme ? { theme: preloadedTheme } : undefined,
    });

const makeWrapper =
    (store: ReturnType<typeof makeStore>) =>
        ({ children }: { children: React.ReactNode }) =>
            <Provider store={store}>{children}</Provider>;

describe('theme hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('useThemeMode should return theme.mode from state', () => {
        const store = makeStore({ mode: 'light' });

        const { result } = renderHook(() => useThemeMode(), {
            wrapper: makeWrapper(store),
        });

        expect(result.current).toBe('light');
    });

    it('useThemeActions.setMode should dispatch setThemeMode(mode)', () => {
        const store = makeStore({ mode: 'dark' });
        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useThemeActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.setMode('light' as any);
        });

        expect(setThemeMode).toHaveBeenCalledWith('light');
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'theme/setThemeMode',
            payload: 'light',
        });
    });

    it('useThemeActions.toggle should dispatch toggleTheme()', () => {
        const store = makeStore({ mode: 'dark' });
        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useThemeActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.toggle();
        });

        expect(toggleTheme).toHaveBeenCalledTimes(1);
        expect(spyDispatch).toHaveBeenCalledWith({ type: 'theme/toggleTheme' });
    });

    it('useThemeActions.load should dispatch loadTheme(mode)', () => {
        const store = makeStore({ mode: 'dark' });
        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useThemeActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.load('dark' as any);
        });

        expect(loadTheme).toHaveBeenCalledWith('dark');
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'theme/loadTheme',
            payload: 'dark',
        });
    });
});
