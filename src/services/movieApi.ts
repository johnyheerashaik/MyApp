import * as Sentry from '@sentry/react-native';
import { tmdbFetch } from './tmdbClient';
import { trackOperation } from './performance';
import type { Movie, MovieDetails } from '../store/movies/types';

const mapMovieData = (m: any): Movie => ({
  id: m.id,
  title: m.title,
  year: m.release_date?.split('-')[0] ?? 'N/A',
  releaseDate: m.release_date || null,
  rating: m.vote_average ?? 0,
  poster: m.poster_path
    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
    : null,
  genres: m.genre_ids || [],
  overview: m.overview || '',
});

export const fetchMoviesFromEndpoint = async (
  endpoint: string,
): Promise<Movie[]> =>
  trackOperation('fetchMoviesFromEndpoint', async () => {
    try {
      const response = await tmdbFetch(`${endpoint}?language=en-US`);
      const data = response.data;
      return (data.results || []).map(mapMovieData);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });

export const getPopularMovies = () => fetchMoviesFromEndpoint('/movie/popular');
export const getNowPlayingMovies = () =>
  fetchMoviesFromEndpoint('/movie/now_playing');
export const getUpcomingMovies = () =>
  fetchMoviesFromEndpoint('/movie/upcoming');
export const getTopRatedMovies = () =>
  fetchMoviesFromEndpoint('/movie/top_rated');

export const searchMovies = async (query: string): Promise<Movie[]> =>
  trackOperation('searchMovies', async () => {
    try {
      if (!query.trim()) {
        return [];
      }
      const response = await tmdbFetch(
        `/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`,
      );
      const data = response.data;
      return (data.results || []).slice(0, 5).map(mapMovieData);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });

export const getMoviesByCollection = async (collectionId: number): Promise<Movie[]> =>
  trackOperation('getMoviesByCollection', async () => {
    try {
      const response = await tmdbFetch(
        `/collection/${collectionId}?language=en-US`,
      );
      const data = response.data;
      return (data.parts || []).map(mapMovieData);
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  });

export const getMoviesByKeyword = async (keywordId: number): Promise<Movie[]> => {
  try {
    const response = await tmdbFetch(
      `/discover/movie?with_keywords=${keywordId}&sort_by=popularity.desc&language=en-US&page=1`,
    );
    const data = response.data;

    return (data.results || []).map(mapMovieData);
  } catch (error) {
    Sentry.captureException(error);
    return [];
  }
};

export const getMovieDetails = async (
  movieId: number,
): Promise<MovieDetails> => {
  try {
    const response = await tmdbFetch(
      `/movie/${movieId}?append_to_response=credits&language=en-US`,
    );
    const data = response.data;

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
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};

export const getMovieTrailer = async (movieId: number): Promise<string | null> => {
  try {
    const response = await tmdbFetch(`/movie/${movieId}/videos?language=en-US`);
    const videos = response.data.results || [];

    const trailer = videos.find((v: any) =>
      v.type === 'Trailer' && v.site === 'YouTube'
    );

    if (trailer) {
      return trailer.key;
    }

    return null;
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
};

export type WatchProviderData = {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  link?: string;
};

export const getMovieWatchProviders = async (movieId: number): Promise<WatchProviderData | null> => {
  try {
    const response = await tmdbFetch(`/movie/${movieId}/watch/providers`);
    const data = response.data;

    const usProviders = data.results?.US;

    if (!usProviders) {
      return null;
    }

    return {
      flatrate: usProviders.flatrate || [],
      rent: usProviders.rent || [],
      buy: usProviders.buy || [],
      link: usProviders.link || null,
    };
  } catch (error) {
    Sentry.captureException(error);
    return null;
  }
};
