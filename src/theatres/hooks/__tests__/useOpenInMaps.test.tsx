jest.mock('../../../services/analytics', () => ({
    logTheaterDirections: jest.fn(),
    logError: jest.fn(),
}));

import { renderHook, act } from '@testing-library/react-hooks';
import { Alert, Linking, Platform } from 'react-native';
import { useOpenInMaps } from '../useOpenInMaps';
import * as analytics from '../../../services/analytics';

describe('useOpenInMaps', () => {
    const theater = {
        id: '1',
        name: 'AMC Test',
        address: '123 Test St',
        distance: 1.2,
        latitude: 30.123,
        longitude: -97.456,
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        // default: iOS
        (Platform as any).OS = 'ios';
        (Platform.select as jest.Mock).mockImplementation((obj: any) => obj.ios);

        (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
        (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    });

    it('iOS: opens Apple Maps URL when canOpenURL is true', async () => {
        const { result } = renderHook(() => useOpenInMaps());

        await act(async () => {
            await result.current(theater);
        });

        expect(analytics.logTheaterDirections).toHaveBeenCalledWith('AMC Test');

        const expectedUrl = `maps://app?daddr=${theater.latitude},${theater.longitude}`;
        expect(Linking.canOpenURL).toHaveBeenCalledWith(expectedUrl);
        expect(Linking.openURL).toHaveBeenCalledWith(expectedUrl);
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('Android: opens Google navigation URL when canOpenURL is true', async () => {
        (Platform as any).OS = 'android';
        (Platform.select as jest.Mock).mockImplementation((obj: any) => obj.android);

        const { result } = renderHook(() => useOpenInMaps());

        await act(async () => {
            await result.current(theater);
        });

        const expectedUrl = `google.navigation:q=${theater.latitude},${theater.longitude}`;
        expect(Linking.canOpenURL).toHaveBeenCalledWith(expectedUrl);
        expect(Linking.openURL).toHaveBeenCalledWith(expectedUrl);
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('shows alert when canOpenURL returns false', async () => {
        (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

        const { result } = renderHook(() => useOpenInMaps());

        await act(async () => {
            await result.current(theater);
        });

        expect(Linking.openURL).not.toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalled();
    });

    it('logs error and shows alert if Linking.openURL throws', async () => {
        const thrown = new Error('openURL failed');
        (Linking.openURL as jest.Mock).mockRejectedValue(thrown);

        const { result } = renderHook(() => useOpenInMaps());

        await act(async () => {
            await result.current(theater);
        });

        expect(analytics.logError).toHaveBeenCalledWith(thrown, 'Open maps failed');
        expect(Alert.alert).toHaveBeenCalled();
    });

    it('logs error and shows alert if Linking.canOpenURL throws', async () => {
        const thrown = new Error('canOpenURL failed');
        (Linking.canOpenURL as jest.Mock).mockRejectedValue(thrown);

        const { result } = renderHook(() => useOpenInMaps());

        await act(async () => {
            await result.current(theater);
        });

        expect(analytics.logError).toHaveBeenCalledWith(thrown, 'Open maps failed');
        expect(Alert.alert).toHaveBeenCalled();
        expect(Linking.openURL).not.toHaveBeenCalled();
    });
});
