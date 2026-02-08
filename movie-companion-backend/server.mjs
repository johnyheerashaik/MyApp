import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

import { fetchAllMoviesFromTMDB, getGenreMap } from './helpers/tmdb.mjs';
import { getUserSession, analyzeGenresFromFavorites, cleanOldSessions } from './helpers/userSession.mjs';
import { buildMovieContext } from './helpers/movieContext.mjs';
import { generateSystemPrompt } from './prompts/systemPrompt.mjs';
import { generateUserPrompt } from './prompts/userPrompt.mjs';

const app = express();
const port = process.env.PORT || 4000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Clean old sessions every hour
setInterval(() => {
  cleanOldSessions();
}, 60 * 60 * 1000);

/**
 * GET /movies/all
 * Fetch all movie categories for frontend
 */
app.get('/movies/all', async (req, res) => {
  try {
    const movies = await fetchAllMoviesFromTMDB();
    res.json(movies);
  } catch (error) {
    console.error('Error in /movies/all:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

/**
 * POST /companion
 * AI companion chat endpoint
 */
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

    // Analyze favorites for genre preferences
    const genreAnalysis = analyzeGenresFromFavorites(favorites, genreMap);
    session.analytics.favoriteGenres = genreAnalysis;

    // Build conversation context
    const conversationContext = session.conversationHistory
      .slice(-6)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const favSummary =
      favorites && favorites.length
        ? favorites
          .slice(0, 15)
          .map(m => `${m.title} (${m.year})`)
          .join(', ')
        : 'No favorites yet';

    // Build context about available movies
    const movieContext = buildMovieContext(tmdbData, genreMap, question, favorites);
    console.log('\n🎬 FORMATTED MOVIE CONTEXT FOR AI:');
    console.log(movieContext);
    console.log('\n=================================================');

    // Generate prompts
    const systemPrompt = generateSystemPrompt({
      userName,
      favorites,
      movieContext,
      conversationContext,
      genreAnalysis
    });

    const userPrompt = generateUserPrompt({
      userName,
      question,
      favSummary
    });

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...session.conversationHistory.slice(-6),
      { role: 'user', content: userPrompt }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.9,
      max_tokens: 800,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    const answer = response.choices[0].message.content;

    // Update conversation history
    session.conversationHistory.push({ role: 'user', content: question });
    session.conversationHistory.push({ role: 'assistant', content: answer });

    // Keep only last 10 messages (5 exchanges)
    if (session.conversationHistory.length > 10) {
      session.conversationHistory = session.conversationHistory.slice(-10);
    }

    console.log('✅ Response sent successfully\n');

    res.json({ answer });
  } catch (error) {
    console.error('❌ Companion error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

/**
 * GET /analytics/:userId
 * Get user analytics and conversation stats
 */
app.get('/analytics/:userId', (req, res) => {
  const session = getUserSession(req.params.userId);
  res.json({
    analytics: session.analytics,
    preferences: session.preferences,
    conversationCount: session.conversationHistory.length
  });
});

/**
 * GET /theaters/nearby
 * Find nearby movie theaters using Google Places API
 */
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

/**
 * GET /geocode/zipcode
 * Convert zip code to coordinates
 */
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

// ============================================
// START SERVER
// ============================================
app.listen(port, () => {
  console.log(`🎬 Movie Companion server listening on http://localhost:${port}`);
});
