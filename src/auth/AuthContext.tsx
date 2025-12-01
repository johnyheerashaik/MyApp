import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginApi} from '../services/authApi';

import {useSelector, useDispatch} from 'react-redux';
import type {RootState} from '../store';
import {
  initAuth,
  setInitializing,
  signInAction,
  signOutAction,
} from '../store/auth/actions';
import type {AuthUser} from '../store/auth/types';

type AuthContextType = {
  user: AuthUser | null;
  initializing: boolean; // only for startup
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const dispatch = useDispatch();
  const auth = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('auth_user');
        console.log('🔐 Bootstrap: Stored user data:', storedUser);
        const parsed = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
        console.log('🔐 Bootstrap: Parsed user:', parsed);
        console.log('🔐 Bootstrap: Has token?', !!parsed?.token);
        
        if (parsed && !parsed.token) {
          console.log('⚠️ Bootstrap: User data missing token, clearing old data');
          await AsyncStorage.removeItem('auth_user');
          dispatch(initAuth(null));
        } else {
          dispatch(initAuth(parsed));
        }
      } finally {
        dispatch(setInitializing(false));
      }
    };

    bootstrap();
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    const {user: apiUser, token} = await loginApi(email, password);
    console.log('🔐 SignIn: API response user:', apiUser);
    console.log('🔐 SignIn: API response token:', token);

    const userWithToken: AuthUser = {
      ...apiUser,
      token,
    };

    console.log('🔐 SignIn: User with token:', userWithToken);

    await AsyncStorage.setItem('auth_user', JSON.stringify(userWithToken));
    console.log('🔐 SignIn: Saved to AsyncStorage');

    dispatch(signInAction(userWithToken));
    console.log('🔐 SignIn: Dispatched to Redux');
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_user');
    dispatch(signOutAction());
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        initializing: auth.initializing,
        signIn,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
