import cron from 'node-cron';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.mjs';
import Favorite from '../models/Favorite.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
let firebaseApp;
try {
  const serviceAccountPath = join(__dirname, '../config/serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  console.log('⚠️  Push notifications will not be sent until you add serviceAccountKey.json');
}

/**
 * Send a push notification to a user
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  if (!firebaseApp) {
    console.log('⚠️  Firebase not initialized, skipping notification send');
    return null;
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token: pushToken,
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return null;
  }
}

/**
 * Check for movies releasing in 24 hours and send reminders
 */
async function checkAndSendReminders() {
  try {
    console.log('🔍 Checking for upcoming movie releases...');

    // Calculate tomorrow's date (24 hours from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`📅 Looking for movies releasing on: ${tomorrowDate}`);

    // Find all favorites with reminders enabled for movies releasing tomorrow
    const favorites = await Favorite.find({
      reminderEnabled: true,
      reminderSent: false,
      releaseDate: tomorrowDate,
    }).populate('userId');

    console.log(`📬 Found ${favorites.length} reminders to send`);

    for (const favorite of favorites) {
      const user = await User.findById(favorite.userId);
      
      if (!user || !user.pushToken) {
        console.log(`⚠️  No push token for user ${favorite.userId}, skipping`);
        continue;
      }

      // Check if user has release reminders enabled
      if (!user.notificationPreferences?.releaseReminders) {
        console.log(`⚠️  User ${user.name} has disabled release reminders`);
        continue;
      }

      // Send the notification
      const title = '🎬 Movie Reminder';
      const body = `${favorite.title} releases tomorrow! Don't miss it!`;
      const data = {
        movieId: favorite.movieId.toString(),
        movieTitle: favorite.title,
        releaseDate: favorite.releaseDate,
      };

      const result = await sendPushNotification(user.pushToken, title, body, data);

      if (result) {
        // Mark reminder as sent
        favorite.reminderSent = true;
        await favorite.save();
        console.log(`✅ Sent reminder to ${user.name} for "${favorite.title}"`);
      }
    }

    console.log('✅ Reminder check completed');
  } catch (error) {
    console.error('❌ Error checking/sending reminders:', error);
  }
}

/**
 * Initialize the notification scheduler
 * Runs every day at 9:00 AM
 */
export function startNotificationScheduler() {
  // Run every day at 9:00 AM
  // Cron format: '0 9 * * *' = minute hour day month weekday
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Running scheduled reminder check at 9:00 AM');
    checkAndSendReminders();
  });

  console.log('✅ Notification scheduler started (runs daily at 9:00 AM)');

  // Optional: Run once on startup for testing
  // Uncomment the line below to test immediately
  // checkAndSendReminders();
}

// Export for manual testing
export { sendPushNotification, checkAndSendReminders };
