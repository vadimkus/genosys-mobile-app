import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { createLogger } from '../utils/logger';
import { apiRequest } from './pushRequestShim';

const log = createLogger('Push');

// Configure default notification behavior (foreground)
// When app is in foreground, show alert banner with sound
// Wrapped in try-catch to prevent warning banner on Android without Firebase
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,  // Play sound for order updates
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  log.warn('Could not set notification handler:', e?.message);
}

export async function registerForPushNotificationsAsync() {
  // Android channels (required for proper behavior) - create BOTH before
  // requesting the token: the server sends order pushes on channelId 'orders',
  // so it must exist with the right importance before any push arrives.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#dc2626',
      sound: 'default',
      description: 'Notifications about your order status',
    });
  }

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

  // Get Expo push token with projectId (required for Android without Firebase)
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      log.warn('No EAS projectId found, push notifications may not work');
    }
    
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || 'b874a5c1-c47e-4c4e-9286-42e431978d51',
    });
    const token = tokenResponse.data;
    
    log.debug('Got Expo push token');
    return { success: true, token };
  } catch (error) {
    // On Android without Firebase, push tokens won't work in dev - this is expected
    log.warn('Could not get push token (expected in dev without Firebase):', error?.message);
    return {
      success: false,
      errorKey: 'profile.pushTokenError',
      error: error?.message || 'Could not get push token',
    };
  }
}

export async function savePushTokenToBackend(authToken, expoPushToken) {
  // Uses shared mobile API base + headers via databaseService-style shim
  return await apiRequest('/user/push-token', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ expoPushToken }),
  });
}

/**
 * Hand over an ActivityKit token so the server can drive the Lock Screen card.
 *
 * Not the Expo push token above. `push-to-start` is app-wide and raises a card while the
 * app is not running; `activity` updates the card raised for one order, and needs that
 * order's number.
 */
export async function saveLiveActivityToken(authToken, { kind, token, orderNumber }) {
  return await apiRequest('/user/live-activity-token', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ kind, token, orderNumber }),
  });
}

export async function clearPushTokenOnBackend(authToken) {
  return await apiRequest('/user/push-token', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
}


