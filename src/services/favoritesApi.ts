
import { Movie } from './movieApi';

const API_URL = 'http://localhost:5001/api/favorites';

export const getFavorites = async (token: string): Promise<Movie[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.favorites.map((fav: any) => ({
        id: fav.id,
        title: fav.title,
        poster: fav.poster_path,
        year: fav.release_date?.split('-')[0] || fav.release_date || 'N/A',
        releaseDate: fav.release_date,
        rating: fav.vote_average,
        overview: fav.overview,
        reminderEnabled: fav.reminderEnabled || false,
        reminderSent: fav.reminderSent || false,
      }));
    }
    
    throw new Error(data.message || 'Failed to fetch favorites');
  } catch (error) {
    console.error('Get favorites error:', error);
    throw error;
  }
};

export const addFavorite = async (token: string, movie: Movie): Promise<void> => {
  try {
    console.log('📤 API: Adding favorite', {
      movieId: movie.id,
      title: movie.title,
      hasToken: !!token
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.poster,
        releaseDate: movie.releaseDate || movie.year,
        voteAverage: movie.rating,
        overview: movie.overview || '',
      }),
    });

    console.log('📥 API: Response status', response.status);
    const data = await response.json();
    console.log('📥 API: Response data', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to add favorite');
    }
  } catch (error) {
    console.error('❌ Add favorite error:', error);
    throw error;
  }
};

export const removeFavorite = async (token: string, movieId: number): Promise<void> => {
  try {
    console.log('📤 API: Removing favorite', movieId);
    
    const response = await fetch(`${API_URL}/${movieId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 API: Response status', response.status);
    const data = await response.json();
    console.log('📥 API: Response data', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to remove favorite');
    }
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    throw error;
  }
};
