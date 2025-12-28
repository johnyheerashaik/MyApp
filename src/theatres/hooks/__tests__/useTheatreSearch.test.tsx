jest.mock('../../../services/analytics', () => ({
    logTheaterSearch: jest.fn(),
}));

import { renderHook, act } from '@testing-library/react-hooks';
import { Alert, Keyboard } from 'react-native';
import { useTheatreSearch } from '../useTheatreSearch';
import * as analytics from '../../../services/analytics';

describe('useTheatreSearch', () => {
    const fetchByZip = jest.fn();
    const requestLocationPermission = jest.fn();
    const getTheaterCount = jest.fn(() => 7);

    beforeEach(() => {
        jest.clearAllMocks();

        (Alert as any).alert = (Alert as any).alert ?? jest.fn();
        (Keyboard as any).dismiss = (Keyboard as any).dismiss ?? jest.fn();
    });

    it('invalid zip: shows alert and does not fetch/log', () => {
        const { result } = renderHook(() =>
            useTheatreSearch({ fetchByZip, requestLocationPermission, getTheaterCount }),
        );

        act(() => result.current.setZipCode('123'));
        act(() => result.current.handleSearch());

        expect(Alert.alert).toHaveBeenCalled();
        expect(fetchByZip).not.toHaveBeenCalled();
        expect(analytics.logTheaterSearch).not.toHaveBeenCalled();
        expect(Keyboard.dismiss).toHaveBeenCalled();
    });

    it('valid zip + handleSearch: calls fetchByZip, logs, dismisses keyboard and blurs input', () => {
        const { result } = renderHook(() =>
            useTheatreSearch({ fetchByZip, requestLocationPermission, getTheaterCount }),
        );

        const blur = jest.fn();
        (result.current.zipInputRef as any).current = { blur };

        act(() => result.current.setZipCode('75075'));
        act(() => result.current.handleSearch());

        expect(fetchByZip).toHaveBeenCalledWith('75075');
        expect(analytics.logTheaterSearch).toHaveBeenCalledWith('zipcode', 7);
        expect(Keyboard.dismiss).toHaveBeenCalled();
        expect(blur).toHaveBeenCalled();
    });

    it('valid zip + handleRefresh: runs zip search', () => {
        const { result } = renderHook(() =>
            useTheatreSearch({ fetchByZip, requestLocationPermission, getTheaterCount }),
        );

        act(() => result.current.setZipCode('75075'));
        act(() => result.current.handleRefresh());

        expect(fetchByZip).toHaveBeenCalledWith('75075');
        expect(analytics.logTheaterSearch).toHaveBeenCalledWith('zipcode', 7);
        expect(requestLocationPermission).not.toHaveBeenCalled();
    });

    it('invalid zip + handleRefresh: calls requestLocationPermission', () => {
        const { result } = renderHook(() =>
            useTheatreSearch({ fetchByZip, requestLocationPermission, getTheaterCount }),
        );

        act(() => result.current.setZipCode('12'));
        act(() => result.current.handleRefresh());

        expect(requestLocationPermission).toHaveBeenCalled();
        expect(fetchByZip).not.toHaveBeenCalled();
    });
});
