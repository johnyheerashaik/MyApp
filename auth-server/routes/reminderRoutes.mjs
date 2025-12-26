import { Router } from 'express';
import User from '../models/User.mjs';
import authenticateToken from '../middleware/authenticateToken.mjs';

const router = Router();
router.use(authenticateToken);

// GET /api/reminders - Get all reminders for the authenticated user
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('favorites');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const reminders = (user.favorites || []).filter(fav => fav.reminderEnabled);
    res.json({ success: true, reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ success: false, message: 'Server error while getting reminders' });
  }
});

// PATCH /api/reminders/:movieId - Toggle reminder for a favorite
router.patch('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { reminderEnabled } = req.body;
    if (typeof reminderEnabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'reminderEnabled must be a boolean' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const fav = user.favorites.find(fav => fav.movieId === Number.parseInt(movieId));
    if (!fav) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    fav.reminderEnabled = reminderEnabled;
    fav.reminderSent = false;
    await user.save();
    res.status(200).json({
      success: true,
      message: reminderEnabled ? 'Reminder enabled' : 'Reminder disabled',
      reminder: {
        id: fav.movieId,
        reminderEnabled: fav.reminderEnabled
      }
    });
  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error while toggling reminder' });
  }
});

// GET /api/favorites/reminders - Get all favorites with reminders enabled
router.get('/favorites', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('favorites');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const reminders = (user.favorites || []).filter(fav => fav.reminderEnabled);
    res.status(200).json({
      success: true,
      reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ success: false, message: 'Server error while getting reminders' });
  }
});

export default router;
