/**
 * Advanced Features Hook
 * Integrates analytics, notifications, offline support, and deep linking
 */

import { useEffect, useCallback, useState } from 'react';
import { AppState } from 'react-native';
import {
  analyticsService,
  trackScreenView,
  trackAction,
  trackEcommerce,
  identifyUser,
} from '../services/analyticsService';
import {
  notificationService,
  sendLocalNotification,
  requestNotificationPermissions,
} from '../services/notificationService';
import {
  offlineService,
  storeOffline,
  getOfflineData,
  cacheData,
  getSyncStatus,
} from '../services/offlineService';
import {
  deepLinkService,
  processPendingDeepLink,
  generateDeepLink,
} from '../services/deepLinkService';
import {
  appStateService,
  setAppStateCallbacks,
} from '../services/appStateService';

interface AdvancedFeaturesState {
  isAnalyticsEnabled: boolean;
  isNotificationsEnabled: boolean;
  isOfflineMode: boolean;
  syncStatus: {
    isOnline: boolean;
    pendingCount: number;
    failedCount: number;
    syncedCount: number;
  };
  appState: string;
  sessionDuration: number;
}

interface AdvancedFeaturesActions {
  // Analytics
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackScreen: (screenName: string, properties?: Record<string, any>) => void;
  trackUserAction: (action: string, properties?: Record<string, any>) => void;
  trackPurchase: (orderId: string, amount: number, items: any[]) => void;
  identifyUser: (userId: string, properties?: any) => void;

  // Notifications
  sendNotification: (
    title: string,
    body: string,
    data?: any
  ) => Promise<string>;
  requestPermissions: () => Promise<boolean>;
  scheduleNotification: (
    title: string,
    body: string,
    delay: number
  ) => Promise<string>;

  // Offline
  storeDataOffline: (
    key: string,
    data: any,
    syncAction?: string
  ) => Promise<void>;
  getOfflineData: (key: string) => Promise<any>;
  cacheData: (key: string, data: any) => Promise<void>;
  forceSync: () => Promise<void>;

  // Deep Links
  generateLink: (path: string, params?: Record<string, string>) => string;
  shareLink: (path: string, params?: Record<string, string>) => Promise<string>;

  // App State
  refreshAppState: () => void;
  endSession: () => Promise<void>;
}

export const useAdvancedFeatures = (): [
  AdvancedFeaturesState,
  AdvancedFeaturesActions,
] => {
  const [state, setState] = useState<AdvancedFeaturesState>({
    isAnalyticsEnabled: true,
    isNotificationsEnabled: false,
    isOfflineMode: false,
    syncStatus: {
      isOnline: true,
      pendingCount: 0,
      failedCount: 0,
      syncedCount: 0,
    },
    appState: AppState.currentState,
    sessionDuration: 0,
  });

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize analytics
        await analyticsService.initialize();

        // Initialize notifications
        await notificationService.initialize();
        const notificationSettings =
          await notificationService.getNotificationSettings();

        // Initialize offline service
        await offlineService.initialize();
        const syncStatus = offlineService.getSyncStatus();

        // Initialize deep link service
        await deepLinkService.initialize();
        await processPendingDeepLink();

        // Initialize app state service
        await appStateService.initialize();

        // Set up app state callbacks
        setAppStateCallbacks({
          onAppActive: () => {
            setState(prev => ({ ...prev, appState: 'active' }));
          },
          onAppBackground: () => {
            setState(prev => ({ ...prev, appState: 'background' }));
          },
          onAppInactive: () => {
            setState(prev => ({ ...prev, appState: 'inactive' }));
          },
        });

        setState(prev => ({
          ...prev,
          isNotificationsEnabled:
            notificationSettings.permissions.status === 'granted',
          syncStatus,
        }));

        console.log('🚀 Advanced features initialized');
      } catch (error) {
        console.error('❌ Advanced features initialization error:', error);
      }
    };

    initializeServices();
  }, []);

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const syncStatus = offlineService.getSyncStatus();
      setState(prev => ({ ...prev, syncStatus }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionDuration = appStateService.getSessionDuration();
      setState(prev => ({ ...prev, sessionDuration }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Analytics actions
  const trackEvent = useCallback(
    (event: string, properties?: Record<string, any>) => {
      analyticsService.track(event, properties);
    },
    []
  );

  const trackScreen = useCallback(
    (screenName: string, properties?: Record<string, any>) => {
      trackScreenView(screenName, properties);
    },
    []
  );

  const trackUserAction = useCallback(
    (action: string, properties?: Record<string, any>) => {
      trackAction(action, properties);
    },
    []
  );

  const trackPurchase = useCallback(
    (orderId: string, amount: number, items: any[]) => {
      trackEcommerce('purchase', {
        order_id: orderId,
        value: amount,
        currency: 'AED',
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    },
    []
  );

  const identifyUserAction = useCallback((userId: string, properties?: any) => {
    identifyUser(userId, properties);
  }, []);

  // Notification actions
  const sendNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      try {
        const notificationId = await sendLocalNotification({
          title,
          body,
          data,
          sound: true,
        });
        return notificationId;
      } catch (error) {
        console.error('❌ Send notification error:', error);
        throw error;
      }
    },
    []
  );

  const requestPermissions = useCallback(async () => {
    try {
      const granted = await requestNotificationPermissions();
      setState(prev => ({ ...prev, isNotificationsEnabled: granted }));
      return granted;
    } catch (error) {
      console.error('❌ Request permissions error:', error);
      return false;
    }
  }, []);

  const scheduleNotification = useCallback(
    async (title: string, body: string, delay: number) => {
      try {
        const notificationId = await notificationService.scheduleNotification(
          { title, body, sound: true },
          { type: 'timeInterval', seconds: delay } as any
        );
        return notificationId;
      } catch (error) {
        console.error('❌ Schedule notification error:', error);
        throw error;
      }
    },
    []
  );

  // Offline actions
  const storeDataOffline = useCallback(
    async (key: string, data: any, syncAction?: string) => {
      try {
        await storeOffline(key, data, syncAction);
      } catch (error) {
        console.error('❌ Store offline error:', error);
        throw error;
      }
    },
    []
  );

  const getOfflineDataAction = useCallback(async (key: string) => {
    try {
      return await getOfflineData(key);
    } catch (error) {
      console.error('❌ Get offline data error:', error);
      return null;
    }
  }, []);

  const cacheDataAction = useCallback(async (key: string, data: any) => {
    try {
      await cacheData(key, data);
    } catch (error) {
      console.error('❌ Cache data error:', error);
      throw error;
    }
  }, []);

  const forceSync = useCallback(async () => {
    try {
      await offlineService.forceSync();
      const syncStatus = offlineService.getSyncStatus();
      setState(prev => ({ ...prev, syncStatus }));
    } catch (error) {
      console.error('❌ Force sync error:', error);
      throw error;
    }
  }, []);

  // Deep link actions
  const generateLink = useCallback(
    (path: string, params?: Record<string, string>) => {
      return generateDeepLink(path, params);
    },
    []
  );

  const shareLink = useCallback(
    async (path: string, params?: Record<string, string>) => {
      try {
        return await deepLinkService.shareDeepLink(path, params);
      } catch (error) {
        console.error('❌ Share link error:', error);
        throw error;
      }
    },
    []
  );

  // App state actions
  const refreshAppState = useCallback(() => {
    appStateService.refreshAppState();
  }, []);

  const endSession = useCallback(async () => {
    try {
      await appStateService.endSession();
    } catch (error) {
      console.error('❌ End session error:', error);
      throw error;
    }
  }, []);

  const actions: AdvancedFeaturesActions = {
    // Analytics
    trackEvent,
    trackScreen,
    trackUserAction,
    trackPurchase,
    identifyUser: identifyUserAction,

    // Notifications
    sendNotification,
    requestPermissions,
    scheduleNotification,

    // Offline
    storeDataOffline,
    getOfflineData: getOfflineDataAction,
    cacheData: cacheDataAction,
    forceSync,

    // Deep Links
    generateLink,
    shareLink,

    // App State
    refreshAppState,
    endSession,
  };

  return [state, actions];
};
