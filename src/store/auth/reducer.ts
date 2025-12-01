import {AuthState, AuthActionTypes, AuthAction} from './types';

const initialState: AuthState = {
  user: null,
  initializing: true,
};

export function authReducer(
  state: AuthState = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case AuthActionTypes.INIT:
      return {
        ...state,
        user: action.payload,
        initializing: false,
      };

    case AuthActionTypes.SET_INITIALIZING:
      return {
        ...state,
        initializing: action.payload,
      };

    case AuthActionTypes.SIGN_IN:
      return {
        ...state,
        user: action.payload,
      };

    case AuthActionTypes.SIGN_OUT:
      return {
        ...state,
        user: null,
      };

    default:
      return state;
  }
}
