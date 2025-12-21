import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';
import { sendPushNotification, checkAndSendReminders } from '../services/notificationScheduler.mjs';
import authenticateToken from '../middleware/authenticateToken.mjs';

const router = Router();

// JWT authentication middleware (for this router only)
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Access token required' });
//   }
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ success: false, message: 'Invalid or expired token' });
//     }
//     req.userId = decoded.id;
//     next();
//   });
// };

router.use(authenticateToken);

router.post('/send-notification', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.pushToken) {
      return res.status(400).json({ success: false, message: 'No push token found for user' });
    }
    const result = await sendPushNotification(
      user.pushToken,
      '🎬 Test Notification',
      'This is a test push notification from your Movie App!',
      { test: 'true', timestamp: new Date().toISOString() }
    );
    if (result) {
      res.json({ success: true, message: 'Test notification sent successfully', messageId: result });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/check-reminders', async (req, res) => {
  try {
    await checkAndSendReminders();
    res.json({ success: true, message: 'Reminder check completed. Check server logs for details.' });
  } catch (error) {
    console.error('Error checking reminders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
