import Config from 'react-native-config';

const BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = Config.TMDB_API_TOKEN || '';

if (!TMDB_TOKEN) {
  console.warn('⚠️ TMDB_API_TOKEN not configured. Check your .env file.');
}

export const tmdbFetch = async (endpoint: string) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'TMDB API failed');
  }

  return res.json();
};
