const BASE_URL = 'https://api.themoviedb.org/3';

const TMDB_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3OTExM2VmOTk3MzIwMWQyNjE0NzBhY2RhNTViOWRjNCIsIm5iZiI6MTYzMzk3MDYyOC43NjYsInN1YiI6IjYxNjQ2OWM0ODQ1OTFjMDA4ZmJlNjlkNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.VE-aAIeebCtBKdwSpGcstiA100HDkr4wyLbO716HXxY';

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
