import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react-native';

import authReducer from '../authSlice';
import { useAuth, useAuthActions } from '../hooks';

import { signInThunk, signOutThunk } from '../authSlice';

jest.mock('../authSlice', () => {
    const actual = jest.requireActual('../authSlice');
    return {
        __esModule: true,
        ...actual,
        signInThunk: jest.fn((payload: any) => ({
            type: 'auth/signInThunk',
            payload,
        })),
        signOutThunk: jest.fn(() => ({
            type: 'auth/signOutThunk',
        })),
    };
});

const makeStore = (preloadedAuth?: any) =>
    configureStore({
        reducer: {
            auth: authReducer,
        },
        preloadedState: preloadedAuth ? { auth: preloadedAuth } : undefined,
    });

const makeWrapper =
    (store: ReturnType<typeof makeStore>) =>
        ({ children }: { children: React.ReactNode }) =>
            <Provider store={store}>{children}</Provider>;

describe('auth hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('useAuth should return user and initializing from state', () => {
        const store = makeStore({
            user: { id: '1', name: 'Test', email: 't@test.com', token: 'tok' },
            initializing: false,
        });

        const { result } = renderHook(() => useAuth(), {
            wrapper: makeWrapper(store),
        });

        expect(result.current.user).toEqual({
            id: '1',
            name: 'Test',
            email: 't@test.com',
            token: 'tok',
        });
        expect(result.current.initializing).toBe(false);
    });

    it('useAuthActions.signIn should dispatch signInThunk with payload', async () => {
        const store = makeStore({
            user: null,
            initializing: false,
        });

        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useAuthActions(), {
            wrapper: makeWrapper(store),
        });

        await act(async () => {
            await result.current.signIn('abc@test.com', 'pass123');
        });

        expect(signInThunk).toHaveBeenCalledWith({
            email: 'abc@test.com',
            password: 'pass123',
        });

        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'auth/signInThunk',
            payload: { email: 'abc@test.com', password: 'pass123' },
        });
    });

    it('useAuthActions.signOut should dispatch signOutThunk', async () => {
        const store = makeStore({
            user: { id: '1', name: 'Test', email: 't@test.com', token: 'tok' },
            initializing: false,
        });

        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useAuthActions(), {
            wrapper: makeWrapper(store),
        });

        await act(async () => {
            await result.current.signOut();
        });

        expect(signOutThunk).toHaveBeenCalledTimes(1);
        expect(spyDispatch).toHaveBeenCalledWith({ type: 'auth/signOutThunk' });
    });
});
