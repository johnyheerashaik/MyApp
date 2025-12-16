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
    let mounted = true;
    
    const bootstrap = async () => {
      try {
        const [userData, token] = await Promise.all([
          getUserData(),
          getAuthToken()
        ]);
        
        if (!mounted) return;
        
        if (userData && token) {
          const userWithToken: AuthUser = {
            ...userData,
            token,
          };
          dispatch(initAuth(userWithToken));
        } else if (userData || token) {
          // Inconsistent state, clear everything
          await clearAuthData();
          dispatch(initAuth(null));
        } else {
          dispatch(initAuth(null));
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        try {
          await clearAuthData();
        } catch (clearError) {
          console.error('Error clearing auth data:', clearError);
        }
        if (mounted) {
          dispatch(initAuth(null));
        }
      } finally {
        if (mounted) {
          dispatch(setInitializing(false));
        }
      }
    };

    bootstrap();
    
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizeString(password);
    
    const {user: apiUser, token} = await loginApi(sanitizedEmail, sanitizedPassword);

    const userWithToken: AuthUser = {
      ...apiUser,
      token,
    };

    // Store token and user data separately in secure storage
    const tokenStored = await storeAuthToken(token);
    const userStored = await storeUserData(apiUser);
    
    if (!tokenStored || !userStored) {
      throw new Error('Failed to save authentication data');
    }

    dispatch(signInAction(userWithToken));
  };

  const signOut = async () => {
    await clearAuthData();
    dispatch(signOutAction());
    const {logUserLogout} = await import('../services/analyticsEvents');
    logUserLogout();
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
