jest.mock('@react-native-community/geolocation', () => ({
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
}));
import { renderHook, act } from '@testing-library/react-hooks';
import { useLocationFetch } from '../useLocationFetch';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Alert, Platform } from 'react-native';

jest.mock('../../../services/analytics', () => ({
    logError: jest.fn(),
    logTheaterSearch: jest.fn(),
}));

const fetchByCoords = jest.fn();
const getTheaterCount = jest.fn(() => 5);

describe('useLocationFetch', () => {

    it('shows permission denied alert with correct buttons when error.code === 1', () => {
        (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(
            (_, error) => error({ code: 1, message: 'Permission denied' }),
        );
        const alertSpy = jest.spyOn(Alert, 'alert');
        const { result } = renderHook(() =>
            useLocationFetch({ fetchByCoords, getTheaterCount }),
        );
        act(() => {
            result.current.requestLocationPermission();
        });
        expect(alertSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.arrayContaining([
                expect.objectContaining({ text: expect.any(String) }),
                expect.objectContaining({ text: expect.any(String), onPress: expect.any(Function) }),
            ])
        );
    });

    it('calls logTheaterSearch on successful location fetch', () => {
        (Platform as any).OS = 'ios';
        (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(success => {
            success({ coords: { latitude: 1, longitude: 2 } });
        });
        const { result } = renderHook(() =>
            useLocationFetch({ fetchByCoords, getTheaterCount }),
        );
        act(() => {
            result.current.requestLocationPermission();
        });
        expect(require('../../../services/analytics').logTheaterSearch).toHaveBeenCalledWith('gps', 5);
    });

    it('shows alert and logs error if permission request throws', async () => {
        (Platform as any).OS = 'android';
        (PermissionsAndroid.request as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
        const alertSpy = jest.spyOn(Alert, 'alert');
        const { result } = renderHook(() =>
            useLocationFetch({ fetchByCoords, getTheaterCount }),
        );
        await act(async () => {
            await result.current.requestLocationPermission();
        });
        expect(require('../../../services/analytics').logError).toHaveBeenCalledWith(expect.any(Error), 'Permission request failed');
        expect(alertSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String)
        );
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('iOS: calls Geolocation directly', () => {
        (Platform as any).OS = 'ios';

        (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(success => {
            success({ coords: { latitude: 1, longitude: 2 } });
        });

        const { result } = renderHook(() =>
            useLocationFetch({ fetchByCoords, getTheaterCount }),
        );

        act(() => {
            result.current.requestLocationPermission();
        });

        expect(fetchByCoords).toHaveBeenCalledWith(1, 2);
    });

    it('Android: requests permission and fetches location when granted', async () => {
        (Platform as any).OS = 'android';

        (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');

        (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(success => {
            success({ coords: { latitude: 10, longitude: 20 } });
        });

        const { result } = renderHook(() =>
            useLocationFetch({ fetchByCoords, getTheaterCount }),
        );

        await act(async () => {
            await result.current.requestLocationPermission();
        });

        expect(PermissionsAndroid.request).toHaveBeenCalled();
        expect(fetchByCoords).toHaveBeenCalledWith(10, 20);
    });

    it('Android: shows alert when permission denied', async () => {
        (Platform as any).OS = 'android';
        (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');

        const { result } = renderHook(() =>
            useLocationFetch({ fetchByCoords, getTheaterCount }),
        );

        await act(async () => {
            await result.current.requestLocationPermission();
        });

        expect(Alert.alert).toHaveBeenCalled();
    });
});
