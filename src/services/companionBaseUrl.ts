import { Platform } from 'react-native';

export const getCompanionBaseUrl = () => {
    if (__DEV__) {
        return Platform.OS === 'android'
            ? 'http://10.0.2.2:4000'
            : 'http://localhost:4000';
    }
    return 'https://your-production-backend-url.com';
};
