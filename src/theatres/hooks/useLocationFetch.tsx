import { useCallback } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { STRINGS } from '../../common/strings';
import { logError, logTheaterSearch } from '../../services/analytics';

type Params = {
    fetchByCoords: (latitude: number, longitude: number) => void;
    getTheaterCount?: () => number;
};

export const useLocationFetch = ({ fetchByCoords, getTheaterCount }: Params) => {
    const getUserLocation = useCallback(() => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchByCoords(latitude, longitude);
                if (getTheaterCount) {
                    logTheaterSearch('gps', getTheaterCount());
                }
            },
            error => {
                if (error.code === 1) {
                    Alert.alert(
                        STRINGS.PERMISSION_DENIED,
                        STRINGS.LOCATION_PERMISSION_REQUIRED,
                        [
                            { text: STRINGS.CANCEL, style: 'cancel' },
                            { text: STRINGS.OPEN_SETTINGS, onPress: () => Linking.openSettings() },
                        ],
                    );
                    return;
                }

                logError(error as any, 'Location error');
                Alert.alert(
                    STRINGS.LOCATION_ERROR,
                    `${STRINGS.UNABLE_TO_GET_LOCATION}${error.message}`,
                );
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
        );
    }, [fetchByCoords, getTheaterCount]);

    const requestLocationPermission = useCallback(async () => {
        if (Platform.OS !== 'android') {
            getUserLocation();
            return;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: STRINGS.LOCATION_PERMISSION_TITLE,
                    message: STRINGS.LOCATION_PERMISSION_MESSAGE,
                    buttonNeutral: STRINGS.LOCATION_PERMISSION_NEUTRAL,
                    buttonNegative: STRINGS.LOCATION_PERMISSION_NEGATIVE,
                    buttonPositive: STRINGS.LOCATION_PERMISSION_POSITIVE,
                },
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                getUserLocation();
            } else {
                Alert.alert(STRINGS.PERMISSION_DENIED, STRINGS.LOCATION_PERMISSION_REQUIRED);
            }
        } catch (err: any) {
            logError(err, 'Permission request failed');
            Alert.alert(STRINGS.ERROR, STRINGS.SOMETHING_WENT_WRONG);
        }
    }, [getUserLocation]);

    return { requestLocationPermission };
};
