import { useCallback, useRef, useState } from 'react';
import { Alert, Keyboard, TextInput } from 'react-native';
import { STRINGS } from '../../common/strings';
import { logTheaterSearch } from '../../services/analytics';

type Params = {
    fetchByZip: (zipCode: string) => void;
    requestLocationPermission: () => void;
    getTheaterCount: () => number;
};

export const useTheatreSearch = ({
    fetchByZip,
    requestLocationPermission,
    getTheaterCount,
}: Params) => {
    const [zipCode, setZipCode] = useState('');
    const zipInputRef = useRef<TextInput>(null);

    const validateZip = useCallback((zip: string) => {
        if (zip.length !== 5) {
            Alert.alert(STRINGS.INVALID_ZIP_CODE, STRINGS.ENTER_VALID_ZIP);
            return false;
        }
        return true;
    }, []);

    const runZipSearch = useCallback(() => {
        const zip = zipCode.trim();
        if (!validateZip(zip)) return;

        fetchByZip(zip);
        logTheaterSearch('zipcode', getTheaterCount());
    }, [zipCode, validateZip, fetchByZip, getTheaterCount]);

    const handleSearch = useCallback(() => {
        runZipSearch();
        Keyboard.dismiss();
        zipInputRef.current?.blur();
    }, [runZipSearch]);

    const handleRefresh = useCallback(() => {
        const zip = zipCode.trim();
        if (zip.length === 5) {
            runZipSearch();
        } else {
            requestLocationPermission();
        }
    }, [zipCode, runZipSearch, requestLocationPermission]);

    return {
        zipCode,
        setZipCode,
        zipInputRef,
        handleSearch,
        handleRefresh,
    };
};
