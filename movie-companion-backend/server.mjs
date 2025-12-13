// server.mjs
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 4000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TMDB_API_KEY = process.env.TMDB_API_KEY || '79113ef9973201d261470acda55b9dc4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(cors());
app.use(express.json());

// 🧠 User conversation memory and preferences
const userSessions = new Map();

// Cache for TMDB data (refresh every 6 hours)
let movieDataCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// Fetch all movie data from TMDB
async function fetchAllMoviesFromTMDB() {
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

// Get genre map from TMDB
async function getGenreMap() {
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

// Get or create user session
const getUserSession = (userId) => {
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
};

// Clean old sessions (older than 24 hours)
setInterval(() => {
  const now = Date.now();
  for (const [userId, session] of userSessions.entries()) {
    if (now - session.preferences.lastInteraction > 24 * 60 * 60 * 1000) {
      userSessions.delete(userId);
    }
  }
}, 60 * 60 * 1000); 

// Endpoint to get all movie data for frontend
app.get('/movies/all', async (req, res) => {
  try {
    const movies = await fetchAllMoviesFromTMDB();
    res.json(movies);
  } catch (error) {
    console.error('Error in /movies/all:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

app.post('/companion', async (req, res) => {
  try {
    const { question, favorites, userName, userId = 'guest' } = req.body;
    
    console.log('\n🔵 NEW REQUEST ===================================');
    console.log('Question:', question);
    console.log('Favorites count:', favorites?.length || 0);
    console.log('User:', userName, '(ID:', userId, ')');

    // Get user session for personalization
    const session = getUserSession(userId);
    session.preferences.lastInteraction = Date.now();
    session.analytics.totalQuestions++;

    // Fetch real-time movie data from TMDB
    const tmdbData = await fetchAllMoviesFromTMDB();
    const genreMap = await getGenreMap();
    
    // LOG RAW TMDB DATA
    console.log('\n📊 RAW TMDB DATA SAMPLE:');
    if (tmdbData.upcoming && tmdbData.upcoming[0]) {
      console.log('First upcoming movie:', JSON.stringify(tmdbData.upcoming[0], null, 2));
    }

    // Analyze favorites for genre preferences using real genres
    const genreAnalysis = analyzeGenresFromFavorites(favorites, genreMap);
    session.analytics.favoriteGenres = genreAnalysis;

    // Build conversation context
    const conversationContext = session.conversationHistory
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const favSummary =
      favorites && favorites.length
        ? favorites
            .slice(0, 15)
            .map(m => `${m.title} (${m.year})`)
            .join(', ')
        : 'No favorites yet';

    // Build context about available movies (filtering out favorites)
    const movieContext = buildMovieContext(tmdbData, genreMap, question, favorites);
    console.log('\n🎬 FORMATTED MOVIE CONTEXT FOR AI:');
    console.log(movieContext);
    console.log('\n=================================================');

    const systemPrompt = `
You are an elite AI film curator with access to LIVE movie data from TMDB (The Movie Database).

🎬 CRITICAL RULES - FOLLOW EXACTLY:
1. EVERY movie title MUST be wrapped in *single asterisks*: *Movie Title*
2. You MUST ONLY suggest movies from the data provided below - NO EXCEPTIONS
3. DO NOT suggest movies from your memory - ONLY from the list below
4. Copy the EXACT title from the list (already has asterisks)
5. ALWAYS provide release date information when asked

🚫 ABSOLUTELY FORBIDDEN - DO NOT SUGGEST THESE (User already has them):
${favorites && favorites.length ? favorites.map(m => `- ${m.title} (${m.year})`).join('\n') : '- none yet'}

⚠️ If you suggest ANY movie from the forbidden list above, you FAIL.
⚠️ The movie list below has ALREADY been filtered to exclude favorites.

📊 AVAILABLE MOVIES WITH RELEASE DATES (USE ONLY THESE):
${movieContext}

🎯 YOUR CAPABILITIES:
- Suggest personalized movie recommendations (ONLY when asked)
- Answer release date questions (use EXACT dates shown: "Release: Dec 25, 2025")
- Recognize alternate movie names (e.g., "Avatar part 3" = "Avatar: Fire and Ash")
- Provide movie ratings and info
- Explain why a movie fits their taste
- Compare movies from their favorites

⚠️ CRITICAL BEHAVIOR RULES:
- If user asks a SPECIFIC QUESTION (release date, movie info, etc.), answer ONLY that question
- If user asks for GENRE-SPECIFIC movies (rom-com, action, horror, etc.), filter by genre from the list
- DO NOT suggest other movies unless explicitly asked for "recommendations", "suggestions", or "what should I watch"
- After answering a specific question, ask: "Would you like any other movie recommendations?"
- Keep answers concise and to the point
- Each movie shows genres in [brackets] - use this to filter

🎯 RESPONSE FORMAT:

FOR SPECIFIC QUESTIONS (release date, movie info):
Keep it brief and direct. Example:
"*Avatar: Fire and Ash* releases on December 17, 2025! 🎬

Anything else you'd like to know?"

FOR RECOMMENDATION REQUESTS ("suggest movies", "what should I watch"):
*Movie Title* (Release: Month Day, Year) ⭐rating - Brief reason
*Another Movie* (Release: Month Day, Year) ⭐rating - Another reason

✅ CORRECT EXAMPLES:
- Q: "When is Avatar releasing?" → A: "*Avatar: Fire and Ash* is coming out December 17, 2025! Anything else?"
- Q: "Suggest upcoming movies" → A: "Here are some great picks: *Movie* (date) ⭐X.X - reason..."

❌ WRONG EXAMPLES:
- "Try Edge of Tomorrow" (no asterisks + not in list)
- "Check out Gladiator" (missing asterisks)
- "Coming out in 2025" (too vague - use exact date)

**CONVERSATION MEMORY:**
${conversationContext || 'First interaction'}

📊 USER PROFILE:
Favorite Genres: ${Object.keys(genreAnalysis).length > 0 ? Object.entries(genreAnalysis).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g, c]) => `${g} (${c})`).join(', ') : 'Learning...'}

🎭 TONE: Enthusiastic, conversational, helpful. Answer questions directly and provide context.
Remember: ONLY movies from the list above with *asterisks*!
    `.trim();

    const userPrompt = `
👤 ${userName || 'User'} ${userId !== 'guest' ? `(ID: ${userId.slice(0, 8)})` : ''}
❤️ Their Favorites: ${favSummary}

💬 They asked: "${question}"

NOTE: If they ask about "Avatar part 3" or similar, they mean *Avatar: Fire and Ash*.
If they ask about sequels, look for similar titles in the list.

IMPORTANT: 
- If this is a specific question (release date, info about one movie), answer ONLY that question
- DO NOT suggest other movies unless they explicitly ask for recommendations
- After answering, simply ask: "Anything else you'd like to know?"
- Be brief and direct

Remember:
- Wrap EVERY movie title in *asterisks*
- Suggest 8-12 movies with smart variety (for recommendations)
- Answer release date questions with specific years
- Be conversational and helpful
- Explain connections to their taste
- Be proactive and predictive
- Make discovery effortless
    `.trim();

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...session.conversationHistory.slice(-6), // Include recent history
      { role: 'user', content: userPrompt }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.8, // More creative
      max_tokens: 1000,
    });

    const message = response.choices[0]?.message?.content ||
      'Sorry, I could not think of anything right now.';
    
    console.log('🤖 AI Response:', message.substring(0, 500));

    // Save to conversation history
    session.conversationHistory.push(
      { role: 'user', content: question },
      { role: 'assistant', content: message }
    );

    // Keep only last 10 messages to avoid token overflow
    if (session.conversationHistory.length > 10) {
      session.conversationHistory = session.conversationHistory.slice(-10);
    }

    res.json({ answer: message });
  } catch (err) {
    console.error('Companion error', err);
    res.status(500).json({ error: 'Failed to contact AI companion' });
  }
});

// Helper: Build movie context from TMDB data based on user's question
function buildMovieContext(tmdbData, genreMap, question, favorites = []) {
  const questionLower = question.toLowerCase();
  
  // Get list of favorite movie IDs for filtering
  const favoriteIds = new Set(favorites.map(f => f.id));
  const favoriteTitles = new Set(favorites.map(f => f.title.toLowerCase()));
  
  // Check if user is asking about a specific movie in their favorites
  const isAskingAboutFavorite = favorites.some(f => 
    questionLower.includes(f.title.toLowerCase()) || 
    questionLower.includes(f.title.toLowerCase().split(':')[0]) // Match "avatar" in "Avatar: Fire and Ash"
  );
  
  console.log('🚫 Filtering out favorites:', favorites.map(f => f.title).join(', ') || 'none');
  if (isAskingAboutFavorite) {
    console.log('⚠️ WAIT! User is asking about a favorite movie - NOT filtering it out!');
  }
  
  let context = '';
  
  // Detect what the user is asking for
  const isAskingUpcoming = questionLower.includes('upcoming') || questionLower.includes('soon') || questionLower.includes('coming') || questionLower.includes('release') || questionLower.includes('releasing');
  const isAskingNowPlaying = questionLower.includes('now playing') || questionLower.includes('in theaters') || questionLower.includes('cinema');
  const isAskingPopular = questionLower.includes('popular') || questionLower.includes('trending') || questionLower.includes('hot');
  const isAskingTopRated = questionLower.includes('best') || questionLower.includes('top rated') || questionLower.includes('classic');
  
  // Filter out favorites from movie list (UNLESS they're asking about a specific favorite)
  const filterFavorites = (movies) => {
    if (isAskingAboutFavorite) {
      return movies; // Don't filter if asking about a favorite
    }
    return movies.filter(m => !favoriteIds.has(m.id) && !favoriteTitles.has(m.title.toLowerCase()));
  };
  
  // Format movie list with FULL RELEASE DATES AND GENRES
  const formatMovies = (movies, limit = 12) => {
    const filtered = filterFavorites(movies);
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
        const monthName = months[parseInt(mo) - 1] || mo;
        dateStr = `${monthName} ${parseInt(d)}, ${y}`;
      }
      return `*${m.title}* (Release: ${dateStr}) ⭐${rating} [${genres}]`;
    }).join(', ');
  };
  
  // CRITICAL: Only send the SPECIFIC category they asked for
  if (isAskingUpcoming) {
    context = `\n📅 UPCOMING MOVIES - Suggest ONLY from this list:\n${formatMovies(tmdbData.upcoming, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
  } else if (isAskingNowPlaying) {
    context = `\n🎬 NOW PLAYING - Suggest ONLY from this list:\n${formatMovies(tmdbData.nowPlaying, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
  } else if (isAskingPopular) {
    context = `\n🔥 POPULAR - Suggest ONLY from this list:\n${formatMovies(tmdbData.popular, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
  } else if (isAskingTopRated) {
    context = `\n⭐ TOP RATED - Suggest ONLY from this list:\n${formatMovies(tmdbData.topRated, 15)}\n\nUSE THESE TITLES EXACTLY AS SHOWN.`;
  } else {
    // For general questions, provide a smaller mix
    context = `\n🔥 POPULAR: ${formatMovies(tmdbData.popular, 6)}\n🎬 NOW PLAYING: ${formatMovies(tmdbData.nowPlaying, 6)}\n\nUSE THESE TITLES EXACTLY.`;
  }
  
  return context;
}

// Helper: Analyze genres from favorites using real TMDB genres
function analyzeGenresFromFavorites(favorites, genreMap) {
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

// 📊 Analytics endpoint (optional - for future dashboard)
app.get('/analytics/:userId', (req, res) => {
  const session = getUserSession(req.params.userId);
  res.json({
    analytics: session.analytics,
    preferences: session.preferences,
    conversationCount: session.conversationHistory.length
  });
});

// 🎬 Nearby theaters endpoint
app.get('/theaters/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 32186.9 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=movie_theater&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    console.log('Google Places API status:', data.status);
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('API Error:', data.error_message);
      return res.status(403).json({ 
        error: 'API request denied', 
        message: data.error_message 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Theater search error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby theaters' });
  }
});

// 📍 Geocode zip code endpoint
app.get('/geocode/zipcode', async (req, res) => {
  try {
    const { zip } = req.query;
    
    if (!zip) {
      return res.status(400).json({ error: 'Zip code is required' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    console.log('Geocoding API status:', data.status);
    
    if (data.status === 'ZERO_RESULTS') {
      return res.status(404).json({ error: 'Zip code not found' });
    }

    if (data.status !== 'OK') {
      console.error('Geocoding Error:', data.error_message);
      return res.status(400).json({ 
        error: 'Failed to geocode zip code', 
        message: data.error_message 
      });
    }

    const location = data.results[0].geometry.location;
    res.json({ location });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode zip code' });
  }
});

app.listen(port, () => {
  console.log(`Companion server listening on http://localhost:${port}`);
});
