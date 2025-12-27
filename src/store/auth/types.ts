export type AuthUser = {
  id: string;
  name: string;
  email: string;
  token: string;
};

export type AuthState = {
  error: any;
  loading: any;
  user: AuthUser | null;
  initializing: boolean;
};

export enum AuthActionTypes {
  INIT = 'auth/INIT',
  SET_INITIALIZING = 'auth/SET_INITIALIZING',
  SIGN_IN = 'auth/SIGN_IN',
  SIGN_OUT = 'auth/SIGN_OUT',
}

export type AuthAction =
  | { type: AuthActionTypes.INIT; payload: AuthUser | null }
  | { type: AuthActionTypes.SET_INITIALIZING; payload: boolean }
  | { type: AuthActionTypes.SIGN_IN; payload: AuthUser }
  | { type: AuthActionTypes.SIGN_OUT };
