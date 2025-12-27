import Config from 'react-native-config';
import { apiCall } from './api';

import { getTmdbBaseUrl } from './tmdbBaseUrl';
const TMDB_TOKEN = Config.TMDB_API_TOKEN || '';

if (!TMDB_TOKEN) {
  console.warn('⚠️ TMDB_API_TOKEN not configured. Check your .env file.');
}

export const tmdbFetch = async (endpoint: string, baseUrl: string = getTmdbBaseUrl()) => {
  const data = await apiCall<any>({
    url: `${baseUrl}${endpoint}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  if (!data) {
    throw new Error('TMDB API failed');
  }
  return data;
};
