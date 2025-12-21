
import { Movie } from './movieApi';
import {apiCall} from './api';

import { Platform } from 'react-native';
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5001/api/favorites'
    : 'http://localhost:5001/api/favorites';

export const getFavorites = async (token: string): Promise<Movie[]> => {
  const response = await apiCall<any>({
    url: API_URL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = response.data;
  if (data.success) {
    return data.favorites.map((fav: any) => ({
      id: fav.movieId,
      title: fav.title,
      poster: fav.posterPath,
      year: fav.releaseDate?.split('-')[0] || fav.releaseDate || 'N/A',
      releaseDate: fav.releaseDate,
      rating: fav.voteAverage,
      overview: fav.overview,
      reminderEnabled: fav.reminderEnabled || false,
      reminderSent: fav.reminderSent || false,
    }));
  }
  throw new Error(data.message || 'Failed to fetch favorites');
};

export const addFavorite = async (token: string, movie: Movie): Promise<void> => {
  const response = await apiCall<any>({
    url: API_URL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster,
      releaseDate: movie.releaseDate || movie.year,
      voteAverage: movie.rating,
      overview: movie.overview || '',
    },
  });
  const data = response.data;
  if (!data.success) {
    throw new Error(data.message || 'Failed to add favorite');
  }
};

export const removeFavorite = async (token: string, movieId: number): Promise<void> => {
  const response = await apiCall<any>({
    url: `${API_URL}/${movieId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = response.data;
  if (!data.success) {
    throw new Error(data.message || 'Failed to remove favorite');
  }
};
