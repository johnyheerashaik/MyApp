import { Platform } from 'react-native';

export const getReminderBaseUrl = () =>
    Platform.OS === 'android'
        ? 'http://10.0.2.2:5001/api'
        : 'http://localhost:5001/api';
