import {
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid, Alert} from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const messaging = getMessaging();
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === 1 || // AuthorizationStatus.AUTHORIZED
        authStatus === 2;   // AuthorizationStatus.PROVISIONAL

      return enabled;
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const messaging = getMessaging();
    
    const token = await getToken(messaging);
    // Only one log per function
    console.log('getFCMToken called');
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export function setupNotificationListeners() {
  const messaging = getMessaging();
  
  const unsubscribeForeground = onMessage(messaging, async remoteMessage => {
    if (remoteMessage.notification) {
      Alert.alert(
        remoteMessage.notification.title || 'Notification',
        remoteMessage.notification.body || '',
      );
    }
  });

  return () => {
    unsubscribeForeground();
  };
}

export async function initializePushNotifications(
  updateTokenCallback?: (token: string) => Promise<void>,
): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermission();
    const token = await getFCMToken();
    if (token && updateTokenCallback) {
      await updateTokenCallback(token);
    }
    setupNotificationListeners();
    // Only one log per function
    console.log('initializePushNotifications called');
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
}
