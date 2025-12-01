export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  text: string;
  mutedText: string;
  primary: string;
  card: string;
  inputBackground: string;
  danger: string;
};

export type ThemeState = {
  mode: ThemeMode;
};

export enum ThemeActionTypes {
  SET_THEME_MODE = 'theme/SET_THEME_MODE',
  TOGGLE_THEME = 'theme/TOGGLE_THEME',
}

export type SetThemeModeAction = {
  type: ThemeActionTypes.SET_THEME_MODE;
  payload: ThemeMode;
};

export type ToggleThemeAction = {
  type: ThemeActionTypes.TOGGLE_THEME;
};

export type ThemeAction = SetThemeModeAction | ToggleThemeAction;
