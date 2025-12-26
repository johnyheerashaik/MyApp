import cron from 'node-cron';
import admin from 'firebase-admin';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import User from '../models/User.mjs';

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

    // Find all users with at least one favorite with reminders enabled for movies releasing tomorrow
    const users = await User.find({
      'favorites.reminderEnabled': true,
      'favorites.reminderSent': false,
      'favorites.releaseDate': tomorrowDate,
      pushToken: { $ne: null }
    });

    let remindersToSend = 0;
    for (const user of users) {
      if (!user.notificationPreferences?.releaseReminders) {
        console.log(`⚠️  User ${user.email} has disabled release reminders`);
        continue;
      }
      const favorites = (user.favorites || []).filter(fav => fav.reminderEnabled && !fav.reminderSent && fav.releaseDate === tomorrowDate);
      for (const fav of favorites) {
        const title = '🎬 Movie Reminder';
        const body = `${fav.title} releases tomorrow! Don't miss it!`;
        const data = {
          movieId: fav.movieId.toString(),
          movieTitle: fav.title,
          releaseDate: fav.releaseDate,
        };
        const result = await sendPushNotification(user.pushToken, title, body, data);
        if (result) {
          fav.reminderSent = true;
          remindersToSend++;
          console.log(`✅ Sent reminder to ${user.email} for "${fav.title}"`);
        }
      }
      await user.save();
    }
    console.log(`✅ Reminder check completed. Sent ${remindersToSend} reminders.`);
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
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Running scheduled reminder check at 9:00 AM');
    checkAndSendReminders();
  });

  console.log('✅ Notification scheduler started (runs daily at 9:00 AM)');
}

// Export for manual testing
export { sendPushNotification, checkAndSendReminders };
