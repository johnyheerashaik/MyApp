const TMDB_API_KEY = process.env.TMDB_API_KEY || '79113ef9973201d261470acda55b9dc4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Cache for TMDB data (refresh every 6 hours)
let movieDataCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch all movie categories from TMDB with caching
 */
export async function fetchAllMoviesFromTMDB() {
    const now = Date.now();

    // Return cache if still valid
    if (movieDataCache && (now - lastCacheUpdate) < CACHE_DURATION) {
        return movieDataCache;
    }

    try {
        const [popular, nowPlaying, upcoming, topRated] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`).then(r => r.json()),
            fetch(`${TMDB_BASE_URL}/movie/now-playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`).then(r => r.json()),
            fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`).then(r => r.json()),
            fetch(`${TMDB_BASE_URL}/movie/top-rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`).then(r => r.json()),
        ]);

        movieDataCache = {
            popular: popular.results || [],
            nowPlaying: nowPlaying.results || [],
            upcoming: upcoming.results || [],
            topRated: topRated.results || [],
        };
        lastCacheUpdate = now;

        return movieDataCache;
    } catch (error) {
        console.error('Error fetching TMDB data:', error);
        return movieDataCache || { popular: [], nowPlaying: [], upcoming: [], topRated: [] };
    }
}

/**
 * Get genre ID to name mapping from TMDB
 */
export async function getGenreMap() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
        const data = await response.json();

        const genreMap = {};
        (data.genres || []).forEach(g => {
            genreMap[g.id] = g.name;
        });
        return genreMap;
    } catch (error) {
        console.error('Error fetching genres:', error);
        return {};
    }
}
