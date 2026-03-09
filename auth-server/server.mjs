import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.mjs';
import favoriteRoutes from './routes/favoriteRoutes.mjs';
import reminderRoutes from './routes/reminderRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const getPortFromAuthApiUrl = () => {
  if (!process.env.AUTH_API_URL) return undefined;
  try {
    const authApiUrl = new URL(process.env.AUTH_API_URL);
    return authApiUrl.port ? Number(authApiUrl.port) : undefined;
  } catch {
    return undefined;
  }
};

const PORT = Number(process.env.PORT || process.env.AUTH_SERVER_PORT || getPortFromAuthApiUrl() || 5001);
const MONGODB_URI = process.env.MONGODB_URI;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

if (!MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in auth-server/.env');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connected successfully');
} catch (err) {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
}

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Auth server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Update AUTH_API_URL in root .env (or set PORT in auth-server/.env).`);
    process.exit(1);
  }
  throw err;
});
