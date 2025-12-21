import Config from 'react-native-config';
import {apiCall} from './api';

const BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = Config.TMDB_API_TOKEN || '';

if (!TMDB_TOKEN) {
  console.warn('⚠️ TMDB_API_TOKEN not configured. Check your .env file.');
}

export const tmdbFetch = async (endpoint: string) => {
  const data = await apiCall<any>({
    url: `${BASE_URL}${endpoint}`,
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
