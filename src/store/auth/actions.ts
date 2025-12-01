import {AuthUser, AuthActionTypes, AuthAction} from './types';

export const initAuth = (user: AuthUser | null): AuthAction => ({
  type: AuthActionTypes.INIT,
  payload: user,
});

export const setInitializing = (initializing: boolean): AuthAction => ({
  type: AuthActionTypes.SET_INITIALIZING,
  payload: initializing,
});

export const signInAction = (user: AuthUser): AuthAction => ({
  type: AuthActionTypes.SIGN_IN,
  payload: user,
});

export const signOutAction = (): AuthAction => ({
  type: AuthActionTypes.SIGN_OUT,
});
