
import { Platform } from 'react-native';
import { apiCall } from './api';
import { trackOperation } from './performance';
const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5001/api'
    : 'http://localhost:5001/api';

token: string,
  movieId: number,
    reminderEnabled: boolean,
): Promise<void> =>
trackOperation('toggleReminder', async () => {
  const response = await apiCall<any>({
    url: `${API_URL}/reminders/${movieId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { reminderEnabled },
  });
  const data = response.data;
  if (!data.success) {
    throw new Error(data.message || 'Failed to toggle reminder');
  }
});

return trackOperation('getReminders', async () => {
  const response = await apiCall<any>({
    url: `${API_URL}/reminders`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = response.data;
  if (data.success) {
    return data.reminders;
  }
  throw new Error(data.message || 'Failed to get reminders');
});

export const updatePushToken = async (
  token: string,
  pushToken: string,
): Promise<void> => {
  const response = await apiCall<any>({
    url: `${API_URL}/users/push-token`,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: { pushToken },
  });
  const data = response.data;
  if (!data.success) {
    throw new Error(data.message || 'Failed to update push token');
  }
};

// Removed duplicate getReminders code block

export const updateNotificationPreferences = async (
  token: string,
  preferences: {
    releaseReminders?: boolean;
    reminderTime?: string;
  },
): Promise<void> => {
  const response = await apiCall<any>({
    url: `${API_URL}/users/notification-preferences`,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: preferences,
  });
  const data = response.data;
  if (!data.success) {
    throw new Error(data.message || 'Failed to update notification preferences');
  }
};
