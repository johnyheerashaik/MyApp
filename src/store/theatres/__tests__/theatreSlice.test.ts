import { configureStore } from '@reduxjs/toolkit';

import reducer, { fetchTheatersByCoords, fetchTheatersByZip } from '../theatresSlice';
import type { Theater } from '../../../services/theatersApi';
import * as theatersApi from '../../../services/theatersApi';

jest.mock('../../../services/theatersApi', () => ({
    __esModule: true,
    fetchNearbyTheaters: jest.fn(),
    geocodeZipCode: jest.fn(),
}));

const makeStore = () =>
    configureStore({
        reducer: {
            theatres: reducer,
        },
    });

describe('theatresSlice (reducer + thunks)', () => {
    const initialState = {
        theaters: [] as Theater[],
        loading: false,
        error: null as string | null,
    };

    const theatersMock: Theater[] = [
        {
            id: 't1',
            name: 'AMC',
            address: '123 St',
            distance: 1.2,
            latitude: 33.0,
            longitude: -96.0,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('reducer', () => {
        it('should return initial state', () => {
            expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
        });

        describe('fetchTheatersByCoords', () => {
            it('pending -> sets loading true and clears error', () => {
                const state = reducer(
                    { ...initialState, error: 'old error' },
                    { type: fetchTheatersByCoords.pending.type },
                );
                expect(state.loading).toBe(true);
                expect(state.error).toBeNull();
            });

            it('fulfilled -> sets theaters and loading false', () => {
                const state = reducer(
                    { ...initialState, loading: true },
                    { type: fetchTheatersByCoords.fulfilled.type, payload: theatersMock },
                );
                expect(state.loading).toBe(false);
                expect(state.theaters).toEqual(theatersMock);
                expect(state.error).toBeNull();
            });

            it('rejected -> sets loading false and error message', () => {
                const state = reducer(
                    { ...initialState, loading: true },
                    {
                        type: fetchTheatersByCoords.rejected.type,
                        error: { message: 'Boom' },
                    },
                );
                expect(state.loading).toBe(false);
                expect(state.error).toBe('Boom');
            });

            it('rejected (no message) -> uses fallback error', () => {
                const state = reducer(
                    { ...initialState, loading: true },
                    {
                        type: fetchTheatersByCoords.rejected.type,
                        error: {},
                    },
                );
                expect(state.loading).toBe(false);
                expect(state.error).toBe('Failed to fetch theaters');
            });
        });

        describe('fetchTheatersByZip', () => {
            it('pending -> sets loading true and clears error', () => {
                const state = reducer(
                    { ...initialState, error: 'old error' },
                    { type: fetchTheatersByZip.pending.type },
                );
                expect(state.loading).toBe(true);
                expect(state.error).toBeNull();
            });

            it('fulfilled -> sets theaters and loading false', () => {
                const state = reducer(
                    { ...initialState, loading: true },
                    { type: fetchTheatersByZip.fulfilled.type, payload: theatersMock },
                );
                expect(state.loading).toBe(false);
                expect(state.theaters).toEqual(theatersMock);
                expect(state.error).toBeNull();
            });

            it('rejected -> sets loading false and error message', () => {
                const state = reducer(
                    { ...initialState, loading: true },
                    {
                        type: fetchTheatersByZip.rejected.type,
                        error: { message: 'Invalid zip code' },
                    },
                );
                expect(state.loading).toBe(false);
                expect(state.error).toBe('Invalid zip code');
            });

            it('rejected (no message) -> uses fallback error', () => {
                const state = reducer(
                    { ...initialState, loading: true },
                    {
                        type: fetchTheatersByZip.rejected.type,
                        error: {},
                    },
                );
                expect(state.loading).toBe(false);
                expect(state.error).toBe('Failed to fetch theaters');
            });
        });
    });

    describe('thunks', () => {
        it('fetchTheatersByCoords: calls fetchNearbyTheaters and stores payload', async () => {
            (theatersApi.fetchNearbyTheaters as jest.Mock).mockResolvedValueOnce(theatersMock);

            const store = makeStore();
            const action = await store.dispatch(
                fetchTheatersByCoords({ latitude: 10, longitude: 20 }),
            );

            expect(theatersApi.fetchNearbyTheaters).toHaveBeenCalledWith(10, 20);
            expect(fetchTheatersByCoords.fulfilled.match(action)).toBe(true);

            const state = store.getState().theatres;
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.theaters).toEqual(theatersMock);
        });

        it('fetchTheatersByCoords: handles api failure', async () => {
            (theatersApi.fetchNearbyTheaters as jest.Mock).mockRejectedValueOnce(
                new Error('Coords fail'),
            );

            const store = makeStore();
            const action = await store.dispatch(
                fetchTheatersByCoords({ latitude: 10, longitude: 20 }),
            );

            expect(fetchTheatersByCoords.rejected.match(action)).toBe(true);

            const state = store.getState().theatres;
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Coords fail');
        });

        it('fetchTheatersByZip: geocodes then calls fetchNearbyTheaters', async () => {
            (theatersApi.geocodeZipCode as jest.Mock).mockResolvedValueOnce({
                lat: 33.22,
                lng: -96.44,
            });
            (theatersApi.fetchNearbyTheaters as jest.Mock).mockResolvedValueOnce(theatersMock);

            const store = makeStore();
            const action = await store.dispatch(fetchTheatersByZip('75075'));

            expect(theatersApi.geocodeZipCode).toHaveBeenCalledWith('75075');
            expect(theatersApi.fetchNearbyTheaters).toHaveBeenCalledWith(33.22, -96.44);
            expect(fetchTheatersByZip.fulfilled.match(action)).toBe(true);

            const state = store.getState().theatres;
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.theaters).toEqual(theatersMock);
        });

        it('fetchTheatersByZip: rejects when geocode returns null/undefined', async () => {
            (theatersApi.geocodeZipCode as jest.Mock).mockResolvedValueOnce(null);

            const store = makeStore();
            const action = await store.dispatch(fetchTheatersByZip('00000'));

            expect(theatersApi.geocodeZipCode).toHaveBeenCalledWith('00000');
            expect(theatersApi.fetchNearbyTheaters).not.toHaveBeenCalled();
            expect(fetchTheatersByZip.rejected.match(action)).toBe(true);

            const state = store.getState().theatres;
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Invalid zip code');
        });

        it('fetchTheatersByZip: handles fetchNearbyTheaters failure after geocode', async () => {
            (theatersApi.geocodeZipCode as jest.Mock).mockResolvedValueOnce({ lat: 1, lng: 2 });
            (theatersApi.fetchNearbyTheaters as jest.Mock).mockRejectedValueOnce(
                new Error('Zip fetch fail'),
            );

            const store = makeStore();
            const action = await store.dispatch(fetchTheatersByZip('75075'));

            expect(theatersApi.geocodeZipCode).toHaveBeenCalledWith('75075');
            expect(theatersApi.fetchNearbyTheaters).toHaveBeenCalledWith(1, 2);
            expect(fetchTheatersByZip.rejected.match(action)).toBe(true);

            const state = store.getState().theatres;
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Zip fetch fail');
        });
    });
});
