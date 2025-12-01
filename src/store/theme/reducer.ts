import {ThemeState, ThemeActionTypes, ThemeAction} from './types';

const initialState: ThemeState = {
  mode: 'dark',
};

export function themeReducer(
  state: ThemeState = initialState,
  action: ThemeAction,
): ThemeState {
  switch (action.type) {
    case ThemeActionTypes.SET_THEME_MODE:
      return {
        ...state,
        mode: action.payload,
      };

    case ThemeActionTypes.TOGGLE_THEME:
      return {
        ...state,
        mode: state.mode === 'dark' ? 'light' : 'dark',
      };

    default:
      return state;
  }
}
