import {Movie} from './movieApi';
import {trackOperation} from './performance';

const BASE_URL = __DEV__
  ? 'http://localhost:4000' 
  : 'https://your-production-backend-url.com';

export async function askCompanion(
  question: string,
  favorites: Movie[],
  userName: string,
  userId?: string,
): Promise<string> {
  return trackOperation('ai_companion_chat', async () => {
    const res = await fetch(`${BASE_URL}/companion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question, 
      favorites, 
      userName,
      userId: userId || 'guest'
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Companion API failed');
  }

    const json = await res.json();
    return json.answer as string;
  });
}

export async function getMovieDataForAI(): Promise<{
  popular: Movie[];
  nowPlaying: Movie[];
  upcoming: Movie[];
  topRated: Movie[];
}> {
  const res = await fetch(`${BASE_URL}/movies/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch movie data');
  }

  return res.json();
}
