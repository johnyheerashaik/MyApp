import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { startNotificationScheduler } from './services/notificationScheduler.mjs';
import authRoutes from './routes/authRoutes.mjs';
import favoriteRoutes from './routes/favoriteRoutes.mjs';
import reminderRoutes from './routes/reminderRoutes.mjs';
import notificationRoutes from './routes/notificationRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/test', notificationRoutes);
app.use('/api/users', userRoutes);

// JWT authentication middleware (for test endpoints)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.userId = decoded.id;
    next();
  });
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`);
  startNotificationScheduler();
});
