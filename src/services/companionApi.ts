import { Movie } from '../store/movies/types';
import { apiCall } from './api';
import { trackOperation } from './performance';

import { getCompanionBaseUrl } from './companionBaseUrl';

export async function askCompanion(
  question: string,
  favorites: Movie[],
  userName: string,
  userId?: string,
  baseUrl: string = getCompanionBaseUrl(),
): Promise<string> {
  return trackOperation('ai_companion_chat', async () => {
    const response = await apiCall<any>({
      url: `${baseUrl}/companion`,
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

export async function getMovieDataForAI(baseUrl: string = getCompanionBaseUrl()): Promise<{
  popular: Movie[];
  nowPlaying: Movie[];
  upcoming: Movie[];
  topRated: Movie[];
}> {
  return trackOperation('getMovieDataForAI', async () => {
    const response = await apiCall<any>({
      url: `${baseUrl}/movies/all`,
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
  });
}
