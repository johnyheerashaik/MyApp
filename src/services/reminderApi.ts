
import { Platform } from 'react-native';
import { perfFetch } from './performance';
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5001/api'
    : 'http://localhost:5001/api';

export const toggleReminder = async (
  token: string,
  movieId: number,
  reminderEnabled: boolean,
): Promise<void> => {
  try {
    const response = await perfFetch(`${API_URL}/reminders/${movieId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({reminderEnabled}),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to toggle reminder');
    }
  } catch (error) {
    console.error('Toggle reminder error:', error);
    throw error;
  }
};

export const getReminders = async (token: string): Promise<any[]> => {
  try {
    const response = await perfFetch(`${API_URL}/reminders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.reminders;
    }

    throw new Error(data.message || 'Failed to get reminders');
  } catch (error) {
    console.error('Get reminders error:', error);
    throw error;
  }
};

export const updatePushToken = async (
  token: string,
  pushToken: string,
): Promise<void> => {
  try {
    const response = await perfFetch(`${API_URL}/users/push-token`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({pushToken}),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to update push token');
    }
  } catch (error) {
    console.error('Update push token error:', error);
    throw error;
  }
};

export const updateNotificationPreferences = async (
  token: string,
  preferences: {
    releaseReminders?: boolean;
    reminderTime?: string;
  },
): Promise<void> => {
  try {
    const response = await perfFetch(`${API_URL}/users/notification-preferences`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to update preferences');
    }
  } catch (error) {
    console.error('Update notification preferences error:', error);
    throw error;
  }
};
