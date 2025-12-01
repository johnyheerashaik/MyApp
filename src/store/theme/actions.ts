import {ThemeActionTypes, ThemeMode, SetThemeModeAction, ToggleThemeAction} from './types';

export const setThemeMode = (mode: ThemeMode): SetThemeModeAction => ({
  type: ThemeActionTypes.SET_THEME_MODE,
  payload: mode,
});

export const toggleTheme = (): ToggleThemeAction => ({
  type: ThemeActionTypes.TOGGLE_THEME,
});
