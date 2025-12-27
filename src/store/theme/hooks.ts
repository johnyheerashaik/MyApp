import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../rtkHooks';
import { setThemeMode, toggleTheme, loadTheme, ThemeMode } from './themeSlice';

export const useThemeMode = (): ThemeMode => {
    return useAppSelector((state) => state.theme.mode);
};

export const useThemeActions = () => {
    const dispatch = useAppDispatch();

    const setMode = useCallback((mode: ThemeMode) => {
        dispatch(setThemeMode(mode));
    }, [dispatch]);

    const toggle = useCallback(() => {
        dispatch(toggleTheme());
    }, [dispatch]);

    const load = useCallback((mode: ThemeMode) => {
        dispatch(loadTheme(mode));
    }, [dispatch]);

    return { setMode, toggle, load };
};
