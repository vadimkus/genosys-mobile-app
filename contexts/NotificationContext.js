/**
 * NotificationContext
 * Handles incoming push notifications and provides navigation on tap.
 * Displays beautiful in-app alerts for foreground notifications.
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform, Alert, Vibration } from 'react-native';
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

  useEffect(() => {
    // Setup Android channel
    setupOrdersChannel();

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      log.debug('📩 Notification received in foreground:', notification.request.content.title);
      setLastNotification(notification);
      
      // Vibrate briefly to get attention
      if (Platform.OS === 'android') {
        Vibration.vibrate(200);
      }
      
      // The notification will automatically show as a banner because of setNotificationHandler
      // configured in pushNotificationsService.js
    });

    // Listener for when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      log.debug('👆 Notification tapped:', response.notification.request.content.data);
      
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      if (data?.type === 'order_status' && data?.orderId) {
        // Navigate to orders page when user taps order notification
        log.debug('Navigating to orders for order:', data.orderId);
        
        // Small delay to ensure app is fully foregrounded
        setTimeout(() => {
          router.push('/profile/orders');
        }, 100);
      }
    });

    // Check if app was opened from a notification (cold start)
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        log.debug('App opened from notification:', response.notification.request.content.data);
        
        const data = response.notification.request.content.data;
        if (data?.type === 'order_status' && data?.orderId) {
          // Delay navigation to ensure app is mounted
          setTimeout(() => {
            router.push('/profile/orders');
          }, 500);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
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
