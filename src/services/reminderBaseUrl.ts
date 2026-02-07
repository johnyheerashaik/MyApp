import { Platform } from 'react-native';

export const getReminderBaseUrl = () => {
    if (__DEV__) {
        return Platform.OS === 'android'
            ? 'http://10.0.2.2:5001/api'
            : 'http://localhost:5001/api';
    }
    return 'https://myapp-h8k7.onrender.com/api';
};
