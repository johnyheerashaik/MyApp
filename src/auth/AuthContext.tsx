import React, {createContext, useContext, useEffect, ReactNode} from 'react';
import {loginApi} from '../services/authApi';
import {
  storeAuthToken,
  storeUserData,
  getUserData,
  getAuthToken,
  clearAuthData,
} from '../utils/secureStorage';
import {sanitizeEmail, sanitizeString} from '../utils/sanitization';

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
        const userData = await getUserData();
        const token = await getAuthToken();
        
        console.log('🔐 Bootstrap: Has user data?', !!userData);
        console.log('🔐 Bootstrap: Has token?', !!token);
        
        if (userData && token) {
          const userWithToken: AuthUser = {
            ...userData,
            token,
          };
          dispatch(initAuth(userWithToken));
        } else if (userData || token) {
          // Inconsistent state, clear everything
          console.log('⚠️ Bootstrap: Inconsistent auth state, clearing');
          await clearAuthData();
          dispatch(initAuth(null));
        } else {
          dispatch(initAuth(null));
        }
      } finally {
        dispatch(setInitializing(false));
      }
    };

    bootstrap();
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizeString(password);
    
    const {user: apiUser, token} = await loginApi(sanitizedEmail, sanitizedPassword);
    console.log('🔐 SignIn: API response user:', apiUser);
    console.log('🔐 SignIn: Token received:', !!token);

    const userWithToken: AuthUser = {
      ...apiUser,
      token,
    };

    // Store token and user data separately in secure storage
    await storeAuthToken(token);
    await storeUserData(apiUser);
    console.log('🔐 SignIn: Saved to secure storage');

    dispatch(signInAction(userWithToken));
    console.log('🔐 SignIn: Dispatched to Redux');
  };

  const signOut = async () => {
    await clearAuthData();
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
