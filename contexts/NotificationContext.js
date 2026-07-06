/**
 * NotificationContext
 * Handles incoming push notifications and provides navigation on tap.
 * Displays beautiful in-app alerts for foreground notifications.
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform, AppState, Vibration } from 'react-native';
import { createLogger } from '../utils/logger';

const log = createLogger('Notification');

const NotificationContext = createContext({
  lastNotification: null,
  expoPushToken: null,
});

// Android notification channel for orders (higher priority)
async function setupOrdersChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#dc2626',
      sound: 'default',
      description: 'Notifications about your order status',
    });
  }
}

export function NotificationProvider({ children }) {
  const [lastNotification, setLastNotification] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Clear the app icon badge when the app comes to the foreground.
  // This ensures the badge disappears once the user opens the app,
  // regardless of how many notifications were received while it was in the background.
  useEffect(() => {
    const clearBadge = () => {
      try {
        Notifications.setBadgeCountAsync(0);
      } catch (e) {
        log.warn('Failed to clear badge:', e?.message);
      }
    };

    // Clear badge immediately on mount (app open / cold start)
    clearBadge();

    // Clear badge when app returns from background
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        clearBadge();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    try {
      // Setup Android channel
      setupOrdersChannel();

      // Listener for notifications received while app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        try {
          log.debug('📩 Notification received in foreground:', notification.request.content.title);
          setLastNotification(notification);
          
          // Vibrate briefly to get attention
          if (Platform.OS === 'android') {
            Vibration.vibrate(200);
          }
        } catch (e) {
          log.warn('Error handling foreground notification:', e.message);
        }
      });

      // Listener for when user taps on a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        try {
          log.debug('👆 Notification tapped:', response.notification.request.content.data);
          
          // Clear badge when user interacts with a notification
          Notifications.setBadgeCountAsync(0);
          
          const data = response.notification.request.content.data;
          
          // Handle navigation based on notification type — deep-link straight
          // to the order detail screen (the push payload carries orderId)
          if (data?.type === 'order_status' && data?.orderId) {
            log.debug('Navigating to order detail:', data.orderId);
            setTimeout(() => {
              router.push(`/profile/orders/${data.orderId}`);
            }, 100);
          }
        } catch (e) {
          log.warn('Error handling notification tap:', e.message);
        }
      });

      // Check if app was opened from a notification (cold start)
      Notifications.getLastNotificationResponseAsync()
        .then(response => {
          if (response) {
            log.debug('App opened from notification:', response.notification.request.content.data);
            // Clear badge on cold start from notification
            Notifications.setBadgeCountAsync(0);
            const data = response.notification.request.content.data;
            if (data?.type === 'order_status' && data?.orderId) {
              setTimeout(() => {
                router.push(`/profile/orders/${data.orderId}`);
              }, 500);
            }
          }
        })
        .catch(e => {
          log.warn('Error checking last notification:', e.message);
        });
    } catch (e) {
      // If expo-notifications fails to initialize, don't crash the app
      log.warn('Failed to setup notification listeners:', e.message);
    }

    return () => {
      try {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } catch (e) {
        // silent cleanup
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ lastNotification, expoPushToken }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
