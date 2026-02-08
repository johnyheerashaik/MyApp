function detectGenreFilter(text) {
    const wantsRomCom = /r[po]m[\s-]?com|romantic comedy/i.test(text);
    if (wantsRomCom) {
        console.log('✅ ROM-COM detected from query:', text);
        return { anyOf: ['Romance', 'Comedy'], preferBoth: true };
    }

    if (text.includes('romance') || text.includes('romantic')) return { anyOf: ['Romance'] };
    if (text.includes('comedy') || text.includes('funny') || text.includes('laugh')) return { anyOf: ['Comedy'] };
    if (text.includes('action')) return { anyOf: ['Action'] };
    if (text.includes('horror') || text.includes('scary')) return { anyOf: ['Horror'] };
    if (text.includes('thriller')) return { anyOf: ['Thriller'] };
    if (text.includes('sci-fi') || text.includes('science fiction')) return { anyOf: ['Science Fiction'] };
    if (text.includes('fantasy')) return { anyOf: ['Fantasy'] };
    if (text.includes('drama')) return { anyOf: ['Drama'] };
    if (text.includes('animation') || text.includes('animated')) return { anyOf: ['Animation'] };
    if (text.includes('family') || text.includes('kids')) return { anyOf: ['Family'] };
    return null;
}

/**
 * Merge multiple movie lists and remove duplicates
 */
function mergeAndDedupe(lists) {
    const seen = new Set();
    const merged = [];
    lists.forEach((list) => {
        (list || []).forEach((movie) => {
            if (!seen.has(movie.id)) {
                seen.add(movie.id);
                merged.push(movie);
            }
        });
    });
    return merged;
}

/**
 * Build movie context string for AI based on user's question
 * @param {Object} tmdbData - Movie data from TMDB (popular, nowPlaying, upcoming, topRated)
 * @param {Object} genreMap - Genre ID to name mapping
 * @param {string} question - User's question
 * @param {Array} favorites - User's favorite movies
 * @returns {string} Formatted movie context for AI
 */
export function buildMovieContext(tmdbData, genreMap, question, favorites = []) {
    const questionLower = question.toLowerCase();

    // Get list of favorite movie IDs for filtering
    const favoriteIds = new Set(favorites.map(f => f.id));
    const favoriteTitles = new Set(favorites.map(f => f.title.toLowerCase()));

    // Check if user is asking about a specific movie in their favorites
    const isAskingAboutFavorite = favorites.some(f =>
        questionLower.includes(f.title.toLowerCase()) ||
        questionLower.includes(f.title.toLowerCase().split(':')[0])
    );

    console.log('🚫 Filtering out favorites:', favorites.map(f => f.title).join(', ') || 'none');
    if (isAskingAboutFavorite) {
        console.log('⚠️ WAIT! User is asking about a favorite movie - NOT filtering it out!');
    }

    // Detect what the user is asking for
    // IMPORTANT: Genre detection takes PRIORITY - genres search across ALL categories
    const genreFilter = detectGenreFilter(questionLower);

    // Category-specific requests (only if NO genre detected)
    const isAskingUpcoming = !genreFilter && (questionLower.includes('upcoming') || questionLower.includes('soon') || questionLower.includes('coming out'));
    const isAskingNowPlaying = !genreFilter && (questionLower.includes('now playing') || questionLower.includes('in theaters') || questionLower.includes('cinema'));
    const isAskingPopular = !genreFilter && (questionLower.includes('popular') || questionLower.includes('trending'));
    const isAskingTopRated = !genreFilter && (questionLower.includes('top rated') || questionLower.includes('highest rated'));

    console.log('🔍 Query Analysis:', { hasGenreFilter: !!genreFilter, isAskingUpcoming, isAskingNowPlaying, isAskingPopular, isAskingTopRated });

    // Filter out favorites from movie list (UNLESS they're asking about a specific favorite)
    const filterFavorites = (movies) => {
        if (isAskingAboutFavorite) {
            return movies;
        }
        return movies.filter(m => !favoriteIds.has(m.id) && !favoriteTitles.has(m.title.toLowerCase()));
    };

    // Format movie list with FULL RELEASE DATES AND GENRES
    const formatMovies = (movies, limit = 12, genreFilterOverride = null) => {
        const genreFilter = genreFilterOverride ?? detectGenreFilter(questionLower);

        console.log(`📊 formatMovies called with ${movies.length} movies, genreFilter:`, genreFilter);

        const filtered = filterFavorites(movies).filter((movie) => {
            if (!genreFilter) return true;
            const movieGenres = (movie.genre_ids || []).map((id) => genreMap[id]).filter(Boolean);

            if (genreFilter.allOf) {
                return genreFilter.allOf.every((g) => movieGenres.includes(g));
            }
            if (genreFilter.anyOf) {
                const match = genreFilter.anyOf.some((g) => movieGenres.includes(g));
                if (match && genreFilter.preferBoth) {
                    console.log(`   ✓ ${movie.title} - genres: [${movieGenres.join(', ')}]`);
                }
                return match;
            }
            return true;
        });

        // Sort by preference if rom-com (prefer movies with both genres)
        if (genreFilter?.preferBoth) {
            filtered.sort((a, b) => {
                const aGenres = (a.genre_ids || []).map((id) => genreMap[id]);
                const bGenres = (b.genre_ids || []).map((id) => genreMap[id]);
                const aHasBoth = aGenres.includes('Romance') && aGenres.includes('Comedy');
                const bHasBoth = bGenres.includes('Romance') && bGenres.includes('Comedy');
                if (aHasBoth && !bHasBoth) return -1;
                if (!aHasBoth && bHasBoth) return 1;
                return (b.vote_average || 0) - (a.vote_average || 0);
            });
        }

        console.log(`🎯 Genre filter results: ${filtered.length} movies found (showing ${Math.min(filtered.length, limit)})`);

        if (filtered.length === 0) {
            console.log('⚠️ WARNING: No movies matched the genre filter!');
            console.log('   Genre filter was:', genreFilter);
            console.log('   Sample movie genres:', movies.slice(0, 3).map(m => ({
                title: m.title,
                genres: (m.genre_ids || []).map(id => genreMap[id])
            })));
        }

        return filtered.slice(0, limit).map(m => {
            const releaseDate = m.release_date || 'TBA';
            const year = releaseDate.split('-')[0] || 'TBA';
            const rating = m.vote_average?.toFixed(1) || 'N/A';

            // Get genre names
            const genres = m.genre_ids?.map(id => genreMap[id]).filter(Boolean).join(', ') || 'Unknown';

            // Format: *Title* (Release: Dec 25, 2025) ⭐rating [Genres: Action, Adventure]
            let dateStr = releaseDate;
            if (releaseDate !== 'TBA' && releaseDate.includes('-')) {
                const [y, mo, d] = releaseDate.split('-');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = months[Number.parseInt(mo) - 1] || mo;
                dateStr = `${monthName} ${Number.parseInt(d)}, ${y}`;
            }
            return `*${m.title}* (Release: ${dateStr}) ⭐${rating} [${genres}]`;
        }).join(', ');
    };

    // Build context based on question type
    let context = '';

    // GENRE REQUESTS: Search across ALL movie sources (this is for HOME VIEWING)
    if (genreFilter) {
        console.log('🎭 GENRE REQUEST DETECTED - Searching ALL categories (popular, top rated, upcoming, now playing)');

        // Prioritize popular and top-rated for home viewing, but include all sources
        const combined = mergeAndDedupe([
            tmdbData.topRated,      // Best quality movies
            tmdbData.popular,       // Currently trending
            tmdbData.nowPlaying,    // Recent releases
            tmdbData.upcoming,      // Coming soon
        ]);
        const movieList = formatMovies(combined, 25, genreFilter);  // Increased limit for more variety

        if (movieList.trim() === '') {
            // Fallback: no matches found
            context = `\n⚠️ No movies matching the requested genre were found.\n\nLet me suggest from popular movies instead:\n🔥 ${formatMovies(tmdbData.popular, 8)}`;
        } else {
            context = `\n🎬 MOVIES FOR HOME VIEWING (Streaming/Digital/Physical) - All from the requested genre:\n${movieList}\n\nThese are movies you can watch at home now or add to your watchlist. Suggest 4-6 movies with brief reasons why they would enjoy them.`;
        }
    } else if (isAskingUpcoming) {
        context = `\n📅 UPCOMING RELEASES (Coming to theaters/streaming soon):\n${formatMovies(tmdbData.upcoming, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
    } else if (isAskingNowPlaying) {
        context = `\n🎬 NOW IN THEATERS:\n${formatMovies(tmdbData.nowPlaying, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
    } else if (isAskingPopular) {
        context = `\n🔥 POPULAR RIGHT NOW (Great for home viewing):\n${formatMovies(tmdbData.popular, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
    } else if (isAskingTopRated) {
        context = `\n⭐ HIGHEST RATED MOVIES (Classics & Must-Watch):\n${formatMovies(tmdbData.topRated, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
    } else {
        // For general questions, focus on home viewing options
        const popularForHome = formatMovies(tmdbData.popular, 8);
        const topForHome = formatMovies(tmdbData.topRated, 6);
        context = `\n🏠 GREAT MOVIES FOR HOME VIEWING:\n\n🔥 POPULAR: ${popularForHome}\n\n⭐ TOP RATED: ${topForHome}\n\nUSE THESE TITLES EXACTLY. Focus on what's available for streaming or home entertainment.`;
    }

    return context;
}
