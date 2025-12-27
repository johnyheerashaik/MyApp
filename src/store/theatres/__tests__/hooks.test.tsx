import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react-native';

import { useTheatres, useTheatresActions } from '../hooks';
import { fetchTheatersByCoords, fetchTheatersByZip } from '../theatresSlice';

jest.mock('../theatresSlice', () => ({
    __esModule: true,
    fetchTheatersByCoords: jest.fn((payload: { latitude: number; longitude: number }) => ({
        type: 'theatres/fetchTheatersByCoords',
        payload,
    })),
    fetchTheatersByZip: jest.fn((zipCode: string) => ({
        type: 'theatres/fetchTheatersByZip',
        payload: zipCode,
    })),
}));

const theatresReducer = (state = {}) => state;

const makeStore = (preloadedTheatres?: any) =>
    configureStore({
        reducer: { theatres: theatresReducer },
        preloadedState: preloadedTheatres ? { theatres: preloadedTheatres } : undefined,
    });

const makeWrapper =
    (store: ReturnType<typeof makeStore>) =>
        ({ children }: { children: React.ReactNode }) =>
            <Provider store={store}>{children}</Provider>;

describe('theatres hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('useTheatres should return theaters/loading/error from state', () => {
        const store = makeStore({
            theaters: [{ id: '1', name: 'AMC' }],
            loading: false,
            error: null,
        });

        const { result } = renderHook(() => useTheatres(), {
            wrapper: makeWrapper(store),
        });

        expect(result.current.theaters).toEqual([{ id: '1', name: 'AMC' }]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('useTheatresActions.fetchByCoords should dispatch fetchTheatersByCoords({latitude, longitude})', () => {
        const store = makeStore({ theaters: [], loading: false, error: null });
        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useTheatresActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.fetchByCoords(33.123, -96.456);
        });

        expect(fetchTheatersByCoords).toHaveBeenCalledWith({
            latitude: 33.123,
            longitude: -96.456,
        });

        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'theatres/fetchTheatersByCoords',
            payload: { latitude: 33.123, longitude: -96.456 },
        });
    });

    it('useTheatresActions.fetchByZip should dispatch fetchTheatersByZip(zipCode)', () => {
        const store = makeStore({ theaters: [], loading: false, error: null });
        const spyDispatch = jest.spyOn(store, 'dispatch');

        const { result } = renderHook(() => useTheatresActions(), {
            wrapper: makeWrapper(store),
        });

        act(() => {
            result.current.fetchByZip('75075');
        });

        expect(fetchTheatersByZip).toHaveBeenCalledWith('75075');
        expect(spyDispatch).toHaveBeenCalledWith({
            type: 'theatres/fetchTheatersByZip',
            payload: '75075',
        });
    });
});
