import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { createLogger } from '../utils/logger';
import { apiRequest } from './pushRequestShim';

const log = createLogger('Push');

// Configure default notification behavior (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    // Keep service UI-agnostic: return a translation key (and a fallback message)
    return {
      success: false,
      errorKey: 'profile.pushPermissionDenied',
      error: 'Push permission not granted',
    };
  }

  // Get Expo push token
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Android channel (required for proper behavior)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  log.debug('Got Expo push token');
  return { success: true, token };
}

export async function savePushTokenToBackend(authToken, expoPushToken) {
  // Uses shared mobile API base + headers via databaseService-style shim
  return await apiRequest('/user/push-token', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ expoPushToken }),
  });
}

export async function clearPushTokenOnBackend(authToken) {
  return await apiRequest('/user/push-token', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
}


