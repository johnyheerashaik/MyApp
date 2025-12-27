import { Platform } from 'react-native';

export const getAuthBaseUrl = () =>
    Platform.OS === 'android'
        ? 'http://10.0.2.2:5001/api/auth'
        : 'http://localhost:5001/api/auth';
