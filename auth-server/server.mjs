import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from './models/User.mjs';
import Favorite from './models/Favorite.mjs';
import { startNotificationScheduler, sendPushNotification, checkAndSendReminders } from './services/notificationScheduler.mjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Validation middleware
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register - Register new user
app.post('/api/auth/register', registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// POST /api/auth/login - Login user
app.post('/api/auth/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// GET /api/auth/me - Get current user (protected route)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============= FAVORITES ENDPOINTS =============

// GET /api/favorites - Get user's favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId }).sort({ addedAt: -1 });
    
    res.status(200).json({
      success: true,
      favorites: favorites.map(fav => ({
        id: fav.movieId,
        title: fav.title,
        poster_path: fav.posterPath,
        release_date: fav.releaseDate,
        vote_average: fav.voteAverage,
        overview: fav.overview,
        reminderEnabled: fav.reminderEnabled || false,
        reminderSent: fav.reminderSent || false
      }))
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/favorites - Add a favorite
app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { movieId, title, posterPath, releaseDate, voteAverage, overview } = req.body;

    // Check if already favorited
    const existing = await Favorite.findOne({ userId: req.userId, movieId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in favorites'
      });
    }

    const favorite = new Favorite({
      userId: req.userId,
      movieId,
      title,
      posterPath,
      releaseDate,
      voteAverage,
      overview
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favorite: {
        id: favorite.movieId,
        title: favorite.title,
        poster_path: favorite.posterPath,
        release_date: favorite.releaseDate,
        vote_average: favorite.voteAverage,
        overview: favorite.overview
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/favorites/:movieId - Remove a favorite
app.delete('/api/favorites/:movieId', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.params;

    const result = await Favorite.findOneAndDelete({
      userId: req.userId,
      movieId: parseInt(movieId)
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/reminders - Get all reminders for the authenticated user
app.get('/api/reminders', authenticateToken, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId, reminderEnabled: true });
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
import Reminder from './models/Reminder.mjs';
app.patch('/api/reminders/:movieId', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { reminderEnabled } = req.body;

    if (typeof reminderEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'reminderEnabled must be a boolean'
      });
    }

    // Upsert reminder for this user and movie
    const reminder = await Reminder.findOneAndUpdate(
      { userId: req.userId, movieId: parseInt(movieId) },
      { reminderEnabled, reminderSent: false },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: reminderEnabled ? 'Reminder enabled' : 'Reminder disabled',
      reminder: {
        id: reminder.movieId,
        reminderEnabled: reminder.reminderEnabled
      }
    });
  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/favorites/reminders - Get all favorites with reminders enabled
app.get('/api/favorites/reminders', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ 
      userId: req.userId, 
      reminderEnabled: true 
    }).sort({ releaseDate: 1 });
    
    res.status(200).json({
      success: true,
      reminders: favorites.map(fav => ({
        id: fav.movieId,
        title: fav.title,
        poster_path: fav.posterPath,
        release_date: fav.releaseDate,
        vote_average: fav.voteAverage,
        overview: fav.overview,
        reminderEnabled: fav.reminderEnabled,
        reminderSent: fav.reminderSent
      }))
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/users/push-token - Store/update user's push notification token
app.put('/api/users/push-token', authenticateToken, async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken || typeof pushToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid push token is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { pushToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Push token updated successfully'
    });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/users/notification-preferences - Update notification preferences
app.put('/api/users/notification-preferences', authenticateToken, async (req, res) => {
  try {
    const { releaseReminders, reminderTime } = req.body;

    const updateData = {};
    if (typeof releaseReminders === 'boolean') {
      updateData['notificationPreferences.releaseReminders'] = releaseReminders;
    }
    if (reminderTime && ['09:00', '12:00', '18:00', '21:00'].includes(reminderTime)) {
      updateData['notificationPreferences.reminderTime'] = reminderTime;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid preferences provided'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' });
});

// Test notification endpoint
app.post('/api/test/send-notification', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || !user.pushToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'No push token found for user' 
      });
    }

    const result = await sendPushNotification(
      user.pushToken,
      '🎬 Test Notification',
      'This is a test push notification from your Movie App!',
      { test: 'true', timestamp: new Date().toISOString() }
    );

    if (result) {
      res.json({ 
        success: true, 
        message: 'Test notification sent successfully',
        messageId: result
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send notification' 
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Manual reminder check endpoint (for testing)
app.post('/api/test/check-reminders', authenticateToken, async (req, res) => {
  try {
    await checkAndSendReminders();
    res.json({ 
      success: true, 
      message: 'Reminder check completed. Check server logs for details.' 
    });
  } catch (error) {
    console.error('Error checking reminders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  
  // Start the notification scheduler
  startNotificationScheduler();
});
