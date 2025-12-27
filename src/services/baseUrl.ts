import { Platform } from 'react-native';

export const getFavoritesBaseUrl = () =>
    Platform.OS === 'android'
        ? 'http://10.0.2.2:5001/api/favorites'
        : 'http://localhost:5001/api/favorites';
