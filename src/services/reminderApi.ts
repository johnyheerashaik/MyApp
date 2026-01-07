import * as Sentry from '@sentry/react-native';
import { getReminderBaseUrl } from './reminderBaseUrl';
import { apiCall } from './api';
import { trackOperation } from './performance';

export const toggleReminder = (
  token: string,
  movieId: number,
  reminderEnabled: boolean,
  baseUrl: string = getReminderBaseUrl()
): Promise<void> =>
  trackOperation('toggleReminder', async () => {
    try {
      const response = await apiCall<any>({
        url: `${baseUrl}/reminders/${movieId}`,
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
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });

export const getReminders = (
  token: string,
  baseUrl: string = getReminderBaseUrl()
): Promise<any[]> =>
  trackOperation('getReminders', async () => {
    try {
      const response = await apiCall<any>({
        url: `${baseUrl}/reminders`,
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
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });

export const updatePushToken = async (
  token: string,
  pushToken: string,
  baseUrl: string = getReminderBaseUrl()
): Promise<void> => {
  try {
    const response = await apiCall<any>({
      url: `${baseUrl}/users/push-token`,
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
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};


export const updateNotificationPreferences = async (
  token: string,
  preferences: {
    releaseReminders?: boolean;
    reminderTime?: string;
  },
  baseUrl: string = getReminderBaseUrl()
): Promise<void> => {
  try {
    const response = await apiCall<any>({
      url: `${baseUrl}/users/notification-preferences`,
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
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
