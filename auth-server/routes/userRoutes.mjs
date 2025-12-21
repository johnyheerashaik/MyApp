import { Router } from 'express';
import authenticateToken from '../middleware/authenticateToken.mjs';
import User from '../models/User.mjs';

const router = Router();

router.use(authenticateToken);

// PUT /api/users/push-token - Store/update user's push notification token
router.put('/push-token', async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken || typeof pushToken !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid push token is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { pushToken },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'Push token updated successfully' });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating push token' });
  }
});

export default router;
