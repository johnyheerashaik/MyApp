import { Router } from 'express';
import User from '../models/User.mjs';
import authenticateToken from '../middleware/authenticateToken.mjs';

const router = Router();
router.use(authenticateToken);

// GET /api/favorites - Get user's favorites
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('favorites');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      favorites: user.favorites || []
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Server error while getting favorites' });
  }
});

// POST /api/favorites - Add a favorite
router.post('/', async (req, res) => {
  try {
    const { movieId, title, posterPath, releaseDate, voteAverage, overview } = req.body;
    if (!movieId || typeof movieId !== 'number' || movieId <= 0) {
      return res.status(400).json({ success: false, message: 'Valid movieId is required' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const alreadyExists = user.favorites.some(fav => fav.movieId === movieId);
    if (alreadyExists) {
      return res.status(400).json({ success: false, message: 'Movie already in favorites' });
    }
    const favorite = { movieId, title, posterPath, releaseDate, voteAverage, overview };
    user.favorites.push(favorite);
    await user.save();
    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding favorite' });
  }
});

// DELETE /api/favorites/:movieId - Remove a favorite
router.delete('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(fav => fav.movieId !== parseInt(movieId));
    if (user.favorites.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    await user.save();
    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error while removing favorite' });
  }
});

export default router;
