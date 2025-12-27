import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react-native';

import { useReminder } from '../hooks';
import reminderReducer from '../reminderSlice';
import { toggleReminder as toggleReminderAction } from '../reminderSlice';

jest.mock('../reminderSlice', () => {
    const actual = jest.requireActual('../reminderSlice');
    return {
        __esModule: true,
        ...actual,
        toggleReminder: jest.fn((payload: any) => ({
            type: 'reminder/toggleReminder',
            payload,
        })),
    };
});

type PreloadedReminder = {
    reminders: number[];
};

const makeStore = (preloadedReminder?: PreloadedReminder) =>
    configureStore({
        reducer: {
            reminder: reminderReducer,
        },
        preloadedState: preloadedReminder
            ? { reminder: preloadedReminder }
            : undefined,
    });

const makeWrapper =
    (store: ReturnType<typeof makeStore>) =>
        ({ children }: { children: React.ReactNode }) =>
            <Provider store={store}>{children}</Provider>;

describe('useReminder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('isReminderEnabled returns false when movieId is not in reminders', () => {
        const store = makeStore({ reminders: [] });
        const { result } = renderHook(() => useReminder(), {
            wrapper: makeWrapper(store),
        });

        expect(result.current.isReminderEnabled(1)).toBe(false);
    });

    it('isReminderEnabled returns true when movieId is in reminders', () => {
        const store = makeStore({ reminders: [42] });
        const { result } = renderHook(() => useReminder(), {
            wrapper: makeWrapper(store),
        });

        expect(result.current.isReminderEnabled(42)).toBe(true);
    });

    it('toggleReminder dispatches toggleReminderAction with enabled=true', () => {
        const store = makeStore({ reminders: [] });
        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useReminder(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.toggleReminder(7, true);
        });

        expect(toggleReminderAction).toHaveBeenCalledWith({ movieId: 7, enabled: true });
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'reminder/toggleReminder',
            payload: { movieId: 7, enabled: true },
        });
    });

    it('toggleReminder dispatches toggleReminderAction with enabled=false', () => {
        const store = makeStore({ reminders: [7] });
        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useReminder(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.toggleReminder(7, false);
        });

        expect(toggleReminderAction).toHaveBeenCalledWith({ movieId: 7, enabled: false });
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'reminder/toggleReminder',
            payload: { movieId: 7, enabled: false },
        });
    });
});
