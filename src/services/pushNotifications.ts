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

      if (enabled) {
        console.log('✅ iOS: Notification permission granted');
      } else {
        console.log('❌ iOS: Notification permission denied');
      }

      return enabled;
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Android: Notification permission granted');
          return true;
        } else {
          console.log('❌ Android: Notification permission denied');
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
    
    // Register device for remote messages first (required for iOS)
    await registerDeviceForRemoteMessages(messaging);
    console.log('✅ Device registered for remote messages');
    
    // Now get the FCM token
    const token = await getToken(messaging);
    console.log('📱 FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export function setupNotificationListeners() {
  const messaging = getMessaging();
  
  // Handle foreground notifications
  const unsubscribeForeground = onMessage(messaging, async remoteMessage => {
    console.log('🔔 Foreground notification:', remoteMessage);
    
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
    // Request permission
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log('⚠️  Push notifications permission not granted');
      return;
    }

    // Get FCM token
    const token = await getFCMToken();
    
    if (token && updateTokenCallback) {
      await updateTokenCallback(token);
    }

    // Setup listeners
    setupNotificationListeners();

    console.log('✅ Push notifications initialized');
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
}
