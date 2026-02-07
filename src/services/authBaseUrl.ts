import { Platform } from 'react-native';

export const getAuthBaseUrl = () => {
    if (__DEV__) {
        return Platform.OS === 'android'
            ? 'http://10.0.2.2:5001/api/auth'
            : 'http://localhost:5001/api/auth';
    }
    return 'https://myapp-h8k7.onrender.com/api/auth';
};
