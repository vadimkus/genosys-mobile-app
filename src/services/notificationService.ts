/**
 * Push Notifications Service
 * Handles push notifications, local notifications, and user engagement
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from './analyticsService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  categoryId?: string;
  sound?: boolean;
  badge?: number;
}

interface NotificationCategory {
  id: string;
  actions: NotificationAction[];
}

interface NotificationAction {
  identifier: string;
  buttonTitle: string;
  options?: {
    isDestructive?: boolean;
    isAuthenticationRequired?: boolean;
  };
  textInput?: {
    submitButtonTitle: string;
    placeholder: string;
  };
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Register for push notifications
      await this.registerForPushNotifications();

      // Set up notification categories
      await this.setupNotificationCategories();

      // Set up listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('🔔 Notification service initialized');
    } catch (error) {
      console.error('❌ Notification initialization error:', error);
      analyticsService.trackError(error as Error, { service: 'notifications' });
    }
  }

  /**
   * Register for push notifications
   */
  private async registerForPushNotifications(): Promise<void> {
    try {
      if (!Device.isDevice) {
        console.log('📱 Must use physical device for push notifications');
        return;
      }

      // Check existing permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permission denied');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expo_push_token', this.expoPushToken);

      console.log('🔔 Push token:', this.expoPushToken);

      // Track permission granted
      analyticsService.track('notification_permission_granted', {
        token: this.expoPushToken,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('❌ Push notification registration error:', error);
      analyticsService.trackError(error as Error, {
        service: 'push_notifications',
      });
    }
  }

  /**
   * Set up notification categories for interactive notifications
   */
  private async setupNotificationCategories(): Promise<void> {
    try {
      const categories: NotificationCategory[] = [
        {
          id: 'product_update',
          actions: [
            {
              identifier: 'view_product',
              buttonTitle: 'View Product',
            },
            {
              identifier: 'add_to_cart',
              buttonTitle: 'Add to Cart',
            },
            {
              identifier: 'dismiss',
              buttonTitle: 'Dismiss',
            },
          ],
        },
        {
          id: 'order_update',
          actions: [
            {
              identifier: 'view_order',
              buttonTitle: 'View Order',
            },
            {
              identifier: 'track_order',
              buttonTitle: 'Track Order',
            },
          ],
        },
        {
          id: 'promotion',
          actions: [
            {
              identifier: 'view_offer',
              buttonTitle: 'View Offer',
            },
            {
              identifier: 'share_offer',
              buttonTitle: 'Share',
            },
            {
              identifier: 'dismiss',
              buttonTitle: 'Dismiss',
            },
          ],
        },
      ];

      await Notifications.setNotificationCategoryAsync(
        'product_update',
        categories[0].actions
      );
      await Notifications.setNotificationCategoryAsync(
        'order_update',
        categories[1].actions
      );
      await Notifications.setNotificationCategoryAsync(
        'promotion',
        categories[2].actions
      );

      console.log('📂 Notification categories set up');
    } catch (error) {
      console.error('❌ Notification categories setup error:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners(): void {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('🔔 Notification received:', notification);

        analyticsService.track('notification_received', {
          notification_id: notification.request.identifier,
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
      }
    );

    // Listen for notification responses (user taps notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification response:', response);

        const { notification, actionIdentifier } = response;
        const data = notification.request.content.data;

        analyticsService.track('notification_tapped', {
          notification_id: notification.request.identifier,
          action: actionIdentifier,
          data,
        });

        // Handle notification actions
        this.handleNotificationAction(actionIdentifier, data);
      });
  }

  /**
   * Handle notification actions
   */
  private handleNotificationAction(
    actionId: string,
    data: Record<string, any>
  ): void {
    switch (actionId) {
      case 'view_product':
        if (data.productId) {
          // Navigate to product detail
          this.navigateToProduct(data.productId);
        }
        break;
      case 'add_to_cart':
        if (data.productId) {
          // Add product to cart
          this.addToCart(data.productId);
        }
        break;
      case 'view_order':
        if (data.orderId) {
          // Navigate to order detail
          this.navigateToOrder(data.orderId);
        }
        break;
      case 'track_order':
        if (data.orderId) {
          // Navigate to order tracking
          this.navigateToOrderTracking(data.orderId);
        }
        break;
      case 'view_offer':
        if (data.offerId) {
          // Navigate to offer
          this.navigateToOffer(data.offerId);
        }
        break;
      case 'share_offer':
        if (data.offerId) {
          // Share offer
          this.shareOffer(data.offerId);
        }
        break;
      default:
        console.log('🔔 Unknown notification action:', actionId);
    }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          categoryIdentifier: notification.categoryId,
          sound: notification.sound !== false,
          badge: notification.badge,
        },
        trigger: null, // Show immediately
      });

      analyticsService.track('local_notification_sent', {
        notification_id: notificationId,
        title: notification.title,
        category: notification.categoryId,
      });

      console.log('📱 Local notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Local notification error:', error);
      analyticsService.trackError(error as Error, {
        service: 'local_notifications',
      });
      throw error;
    }
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          categoryIdentifier: notification.categoryId,
          sound: notification.sound !== false,
        },
        trigger,
      });

      analyticsService.track('notification_scheduled', {
        notification_id: notificationId,
        title: notification.title,
        trigger_type: typeof trigger,
      });

      console.log('⏰ Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Notification scheduling error:', error);
      analyticsService.trackError(error as Error, {
        service: 'scheduled_notifications',
      });
      throw error;
    }
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Notification cancellation error:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ All notifications cancelled');
    } catch (error) {
      console.error('❌ Cancel all notifications error:', error);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<{
    permissions: Notifications.NotificationPermissionsStatus;
    expoPushToken: string | null;
  }> {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      return {
        permissions,
        expoPushToken: this.expoPushToken,
      };
    } catch (error) {
      console.error('❌ Get notification settings error:', error);
      return {
        permissions: {
          status: 'undetermined' as any,
          expires: 'never' as any,
          granted: false,
          canAskAgain: true,
        },
        expoPushToken: null,
      };
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';

      analyticsService.track('notification_permission_requested', {
        granted,
        status,
      });

      return granted;
    } catch (error) {
      console.error('❌ Permission request error:', error);
      return false;
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('🔢 Badge count set to:', count);
    } catch (error) {
      console.error('❌ Set badge count error:', error);
    }
  }

  /**
   * Clear notification badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log('🔢 Badge cleared');
    } catch (error) {
      console.error('❌ Clear badge error:', error);
    }
  }

  /**
   * Navigation handlers (to be implemented by the app)
   */
  private navigateToProduct(productId: string): void {
    // This would be implemented by the navigation service
    console.log('🧭 Navigate to product:', productId);
  }

  private addToCart(productId: string): void {
    // This would be implemented by the cart service
    console.log('🛒 Add to cart:', productId);
  }

  private navigateToOrder(orderId: string): void {
    // This would be implemented by the navigation service
    console.log('🧭 Navigate to order:', orderId);
  }

  private navigateToOrderTracking(orderId: string): void {
    // This would be implemented by the navigation service
    console.log('🧭 Navigate to order tracking:', orderId);
  }

  private navigateToOffer(offerId: string): void {
    // This would be implemented by the navigation service
    console.log('🧭 Navigate to offer:', offerId);
  }

  private shareOffer(offerId: string): void {
    // This would be implemented by the sharing service
    console.log('📤 Share offer:', offerId);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }

    console.log('🧹 Notification service cleaned up');
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Convenience functions
export const sendLocalNotification = (notification: NotificationData) =>
  notificationService.sendLocalNotification(notification);

export const scheduleNotification = (
  notification: NotificationData,
  trigger: Notifications.NotificationTriggerInput
) => notificationService.scheduleNotification(notification, trigger);

export const cancelNotification = (notificationId: string) =>
  notificationService.cancelNotification(notificationId);

export const requestNotificationPermissions = () =>
  notificationService.requestPermissions();

export const setBadgeCount = (count: number) =>
  notificationService.setBadgeCount(count);

export const clearBadge = () => notificationService.clearBadge();

export default notificationService;
