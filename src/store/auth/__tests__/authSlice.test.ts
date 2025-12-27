import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import reducer, { bootstrapAuth, signInThunk, signOutThunk } from '../authSlice';
import type { AuthUser } from '../types';
import { loginApi } from '../../../services/authApi';
import { STRINGS } from '../../../common/strings';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../../services/authApi', () => ({
  loginApi: jest.fn(),
}));

const makeStore = () =>
  configureStore({
    reducer: { auth: reducer },
  });

describe('authSlice thunks', () => {
  const user: AuthUser = {
    id: '1',
    name: 'Test',
    email: 'test@example.com',
    token: 'token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('bootstrapAuth', () => {
    it('returns null when AsyncStorage has no user', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const store = makeStore();
      const action = await store.dispatch(bootstrapAuth());

      expect(action.type).toBe('auth/bootstrapAuth/fulfilled');
      expect(action.payload).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('auth_user');
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.initializing).toBe(false);
    });

    it('returns user when AsyncStorage has valid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(user));

      const store = makeStore();
      const action = await store.dispatch(bootstrapAuth());

      expect(action.type).toBe('auth/bootstrapAuth/fulfilled');
      expect(action.payload).toEqual(user);
      expect(store.getState().auth.user).toEqual(user);
      expect(store.getState().auth.initializing).toBe(false);
    });

    it('returns null when AsyncStorage throws', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('boom'));

      const store = makeStore();
      const action = await store.dispatch(bootstrapAuth());

      expect(action.type).toBe('auth/bootstrapAuth/fulfilled');
      expect(action.payload).toBeNull();
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.initializing).toBe(false);
    });
  });

  describe('signInThunk', () => {
    it('stores user in AsyncStorage and sets state on success', async () => {
      (loginApi as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', name: 'Test', email: 'test@example.com' },
        token: 'token',
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      const store = makeStore();
      const action = await store.dispatch(
        signInThunk({ email: ' test@example.com ', password: 'pass' }),
      );

      expect(action.type).toBe('auth/signIn/fulfilled');
      expect(action.payload).toEqual(user);

      expect(loginApi).toHaveBeenCalledWith('test@example.com', 'pass');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'auth_user',
        JSON.stringify(user),
      );

      expect(store.getState().auth.user).toEqual(user);
    });

    it('rejects with message when loginApi throws with message', async () => {
      (loginApi as jest.Mock).mockRejectedValueOnce(new Error('Invalid creds'));

      const store = makeStore();
      const action = await store.dispatch(
        signInThunk({ email: 'a@b.com', password: 'bad' }),
      );

      expect(action.type).toBe('auth/signIn/rejected');
      expect(action.payload).toBe('Invalid creds');
    });

    it('rejects with STRINGS.LOGIN_FAILED when loginApi throws without message', async () => {
      (loginApi as jest.Mock).mockRejectedValueOnce({}); // no message

      const store = makeStore();
      const action = await store.dispatch(
        signInThunk({ email: 'a@b.com', password: 'bad' }),
      );

      expect(action.type).toBe('auth/signIn/rejected');
      expect(action.payload).toBe(STRINGS.LOGIN_FAILED);
    });
  });

  describe('signOutThunk', () => {
    it('removes user from AsyncStorage and clears state', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);

      const store = makeStore();

      store.dispatch({ type: 'auth/signIn/fulfilled', payload: user });
      expect(store.getState().auth.user).toEqual(user);

      const action = await store.dispatch(signOutThunk());

      expect(action.type).toBe('auth/signOut/fulfilled');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_user');
      expect(store.getState().auth.user).toBeNull();
    });
  });
});
