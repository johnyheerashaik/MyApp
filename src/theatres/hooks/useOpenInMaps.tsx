import { useCallback } from "react";
import { Platform, Linking, Alert } from "react-native";
import { STRINGS } from "../../common/strings";
import { logTheaterDirections, logError } from "../../services/analytics";
import { Theater } from "../../services/theatersApi";

export const useOpenInMaps = () => {
    return useCallback(async (theater: Theater) => {
        try {
            logTheaterDirections(theater.name);

            const url = Platform.select({
                ios: `maps://app?daddr=${theater.latitude},${theater.longitude}`,
                android: `google.navigation:q=${theater.latitude},${theater.longitude}`,
            });

            if (!url) return;

            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                Alert.alert(STRINGS.ERROR, STRINGS.UNABLE_TO_OPEN_MAPS);
                return;
            }

            await Linking.openURL(url);
        } catch (e: any) {
            logError(e, 'Open maps failed');
            Alert.alert(STRINGS.ERROR, STRINGS.UNABLE_TO_OPEN_MAPS);
        }
    }, []);
}
