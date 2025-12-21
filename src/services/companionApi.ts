import {Movie} from './movieApi';
import {apiCall} from './api';
import {trackOperation} from './performance';

import { Platform } from 'react-native';
const BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000'
  : 'https://your-production-backend-url.com';

export async function askCompanion(
  question: string,
  favorites: Movie[],
  userName: string,
  userId?: string,
): Promise<string> {
  return trackOperation('ai_companion_chat', async () => {
      const response = await apiCall<any>({
        url: `${BASE_URL}/companion`,
        method: 'POST',
        data: {
          question,
          favorites,
          userName,
          userId: userId || 'guest',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      if (!data.answer) {
        throw new Error('Companion API failed');
      }
      return data.answer as string;
  });
}

export async function getMovieDataForAI(): Promise<{
  popular: Movie[];
  nowPlaying: Movie[];
  upcoming: Movie[];
  topRated: Movie[];
}> {
  const response = await apiCall<any>({
    url: `${BASE_URL}/movies/all`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = response.data;
  if (!data) {
    throw new Error('Failed to fetch movie data');
  }
  return data;
}
