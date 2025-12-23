import {useCallback} from 'react';
import {Movie, searchMovies} from '../../services/movieApi';
import {logError} from '../../services/analytics';

export function useExtractAndSearchMovies(favorites: Movie[]) {
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  return useCallback(
    async (responseText: string, maxTitles = 8): Promise<Movie[]> => {
      const cleanedText = responseText.replace(/^\d+\.\s+/gm, '');

      const patterns = [
        /\*\*([^*]+)\*\*/g, // **Title**
        /\*([^*]+)\*/g, // *Title*
        /[""]([^"""]+)[""]|"([^"]+)"/g, // "Title"
        /'([^']+)'/g, // 'Title'
      ];

      const potentialTitles = new Set<string>();

      patterns.forEach((pattern) => {
        const matches = [...cleanedText.matchAll(pattern)];
        matches.forEach((match) => {
          const title = match[1] || match[2];
          if (title && title.length > 2 && title.length < 100 && !title.includes('\n')) {
            let t = title.trim();
            t = t.split(' - ')[0].trim();
            t = t.replace(/[.,!?;:]+$/, '').trim();
            if (t.length > 3) potentialTitles.add(t);
          }
        });
      });

      if (potentialTitles.size === 0) return [];

      const titles = Array.from(potentialTitles).slice(0, maxTitles);

      const moviePromises = titles.map(async (title) => {
        try {
          const results = await searchMovies(title);
          return results.length > 0 ? results[0] : null;
        } catch (error) {
          logError(error as any, 'Error searching movies in CompanionCard');
          return null;
        }
      });

      const movies = await Promise.all(moviePromises);
      const validMovies = movies.filter((m): m is Movie => m !== null);

      const favoriteIds = new Set(favorites.map((f) => f.id));
      const favoriteTitles = new Set(favorites.map((f) => f.title.toLowerCase()));

      const filtered = validMovies.filter((movie) => {
        const isInFavorites =
          favoriteIds.has(movie.id) || favoriteTitles.has(movie.title.toLowerCase());
        return !isInFavorites;
      });

      return shuffleArray(filtered);
    },
    [favorites, shuffleArray],
  );
}
