import {tmdbFetch} from './tmdbClient';


export type Movie = {
  id: number;
  title: string;
  year: string;
  releaseDate?: string; // Full date YYYY-MM-DD for reminders
  rating: number;
  poster: string | null;
  genres?: string[]; // Add genres to Movie type
  overview?: string;
  reminderEnabled?: boolean;
  reminderSent?: boolean;
};

export const fetchMoviesFromEndpoint = async (
  endpoint: string,
): Promise<Movie[]> => {

  const data = await tmdbFetch(`${endpoint}?language=en-US`);

  return (data.results || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    year: m.release_date?.split('-')[0] ?? 'N/A',
    releaseDate: m.release_date || null,
    rating: m.vote_average ?? 0,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : null,
    genres: m.genre_ids || [], // Include genre IDs
    overview: m.overview || '',
  }));
};

export const getPopularMovies = () => fetchMoviesFromEndpoint('/movie/popular');
export const getNowPlayingMovies = () =>
  fetchMoviesFromEndpoint('/movie/now-playing');
export const getUpcomingMovies = () =>
  fetchMoviesFromEndpoint('/movie/upcoming');
export const getTopRatedMovies = () =>
  fetchMoviesFromEndpoint('/movie/top-rated');


export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query.trim()) {
    return [];
  }
  
  const data = await tmdbFetch(
    `/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`,
  );

  return (data.results || []).slice(0, 5).map((m: any) => ({
    id: m.id,
    title: m.title,
    year: m.release_date?.split('-')[0] ?? 'N/A',
    releaseDate: m.release_date || null,
    rating: m.vote_average ?? 0,
    poster: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : null,
    genres: m.genre_ids || [],
  }));
};


export const getAllMoviesData = async (): Promise<{
  popular: Movie[];
  nowPlaying: Movie[];
  upcoming: Movie[];
  topRated: Movie[];
}> => {
  const [popular, nowPlaying, upcoming, topRated] = await Promise.all([
    fetchMoviesFromEndpoint('/movie/popular'),
    fetchMoviesFromEndpoint('/movie/now_playing'),
    fetchMoviesFromEndpoint('/movie/upcoming'),
    fetchMoviesFromEndpoint('/movie/top_rated'),
  ]);

  return { popular, nowPlaying, upcoming, topRated };
};


export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
};

export type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  year: string;
  releaseDate?: string; // Full date YYYY-MM-DD
  rating: number;
  runtime: number | null;
  genres: string[];
  poster: string | null;
  backdrop: string | null;
  cast: CastMember[];
};

export const getMovieDetails = async (
  movieId: number,
): Promise<MovieDetails> => {
  const data = await tmdbFetch(
    `/movie/${movieId}?append_to_response=credits&language=en-US`,
  );

  return {
    id: data.id,
    title: data.title,
    overview: data.overview,
    year: data.release_date?.split('-')[0] ?? 'N/A',
    releaseDate: data.release_date || null,
    rating: data.vote_average,
    runtime: data.runtime ?? null,
    genres: (data.genres || []).map((g: any) => g.name),
    poster: data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : null,
    backdrop: data.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${data.backdrop_path}`
      : null,
    cast: (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : null,
    })),
  };
};

export const getMovieTrailer = async (movieId: number): Promise<string | null> => {
  try {
    const data = await tmdbFetch(`/movie/${movieId}/videos?language=en-US`);
    const videos = data.results || [];
    
    const trailer = videos.find((v: any) => 
      v.type === 'Trailer' && v.site === 'YouTube'
    );
    
    if (trailer) {
      return trailer.key;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch trailer:', error);
    return null;
  }
};
