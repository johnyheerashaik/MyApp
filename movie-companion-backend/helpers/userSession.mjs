const userSessions = new Map();

/**
 * Get or create user session with conversation history and preferences
 */
export function getUserSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            conversationHistory: [],
            preferences: {
                likedGenres: [],
                dislikedGenres: [],
                preferredDecades: [],
                avoidedThemes: [],
                watchedRecently: [],
                mood: null,
                lastInteraction: Date.now()
            },
            analytics: {
                totalQuestions: 0,
                addedFromSuggestions: 0,
                favoriteGenres: {}
            }
        });
    }
    return userSessions.get(userId);
}

/**
 * Clean old sessions (older than 24 hours)
 * Call this on an interval
 */
export function cleanOldSessions() {
    const now = Date.now();
    for (const [userId, session] of userSessions.entries()) {
        if (now - session.preferences.lastInteraction > 24 * 60 * 60 * 1000) {
            userSessions.delete(userId);
        }
    }
}

/**
 * Analyze user's favorite movies to extract genre preferences
 */
export function analyzeGenresFromFavorites(favorites, genreMap) {
    if (!favorites || favorites.length === 0) return {};

    const genreCounts = {};

    favorites.forEach(fav => {
        if (fav.genres && Array.isArray(fav.genres)) {
            fav.genres.forEach(genreId => {
                const genreName = genreMap[genreId];
                if (genreName) {
                    genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
                }
            });
        }
    });

    return genreCounts;
}

// Clean old sessions every hour
setInterval(cleanOldSessions, 60 * 60 * 1000);
