/**
 * App State Management Service
 * Handles app lifecycle, background/foreground transitions, and state persistence
 */

import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from './analyticsService';
import { offlineService } from './offlineService';
import { notificationService } from './notificationService';

interface AppStateData {
  isActive: boolean;
  lastActiveTime: number;
  backgroundTime: number;
  sessionStartTime: number;
  sessionDuration: number;
  appVersion: string;
  lastUpdateTime: number;
}

interface AppStateCallbacks {
  onAppActive?: () => void;
  onAppBackground?: () => void;
  onAppInactive?: () => void;
  onAppStateChange?: (nextAppState: AppStateStatus) => void;
}

class AppStateService {
  private currentState: AppStateStatus = 'active';
  private appStateData: AppStateData;
  private callbacks: AppStateCallbacks = {};
  private appStateListener: any = null;
  private isInitialized: boolean = false;
  private readonly STORAGE_KEY = 'app_state_data';

  constructor() {
    this.appStateData = {
      isActive: true,
      lastActiveTime: Date.now(),
      backgroundTime: 0,
      sessionStartTime: Date.now(),
      sessionDuration: 0,
      appVersion: '1.0.0',
      lastUpdateTime: Date.now(),
    };
  }

  /**
   * Initialize app state service
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Load previous app state data
      await this.loadAppStateData();

      // Set up app state listener
      this.setupAppStateListener();

      // Start session tracking
      this.startSessionTracking();

      this.isInitialized = true;
      console.log('📱 App state service initialized');
    } catch (error) {
      console.error('❌ App state initialization error:', error);
      analyticsService.trackError(error as Error, { service: 'app_state' });
    }
  }

  /**
   * Load app state data from storage
   */
  private async loadAppStateData(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        this.appStateData = {
          ...this.appStateData,
          ...parsedData,
          sessionStartTime: Date.now(), // Reset session start time
        };
        console.log('📱 App state data loaded');
      }
    } catch (error) {
      console.error('❌ Load app state data error:', error);
    }
  }

  /**
   * Save app state data to storage
   */
  private async saveAppStateData(): Promise<void> {
    try {
      this.appStateData.lastUpdateTime = Date.now();
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.appStateData)
      );
    } catch (error) {
      console.error('❌ Save app state data error:', error);
    }
  }

  /**
   * Set up app state listener
   */
  private setupAppStateListener(): void {
    this.appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        this.handleAppStateChange(nextAppState);
      }
    );
  }

  /**
   * Handle app state change
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    const previousState = this.currentState;
    this.currentState = nextAppState;

    console.log('📱 App state changed:', previousState, '->', nextAppState);

    // Track app state change
    analyticsService.track('app_state_changed', {
      previousState,
      nextState: nextAppState,
      sessionDuration: Date.now() - this.appStateData.sessionStartTime,
    });

    // Handle state transitions
    switch (nextAppState) {
      case 'active':
        this.handleAppActive();
        break;
      case 'background':
        this.handleAppBackground();
        break;
      case 'inactive':
        this.handleAppInactive();
        break;
    }

    // Call custom callback
    if (this.callbacks.onAppStateChange) {
      this.callbacks.onAppStateChange(nextAppState);
    }

    // Save state data
    this.saveAppStateData();
  }

  /**
   * Handle app becoming active
   */
  private handleAppActive(): void {
    this.appStateData.isActive = true;
    this.appStateData.lastActiveTime = Date.now();

    // Calculate background time
    if (this.appStateData.backgroundTime > 0) {
      const backgroundDuration = Date.now() - this.appStateData.backgroundTime;
      console.log('📱 App was in background for:', backgroundDuration, 'ms');

      analyticsService.track('app_returned_from_background', {
        backgroundDuration,
      });
    }

    // Resume services
    this.resumeServices();

    // Call custom callback
    if (this.callbacks.onAppActive) {
      this.callbacks.onAppActive();
    }

    console.log('📱 App became active');
  }

  /**
   * Handle app going to background
   */
  private handleAppBackground(): void {
    this.appStateData.isActive = false;
    this.appStateData.backgroundTime = Date.now();

    // Pause services
    this.pauseServices();

    // Call custom callback
    if (this.callbacks.onAppBackground) {
      this.callbacks.onAppBackground();
    }

    console.log('📱 App went to background');
  }

  /**
   * Handle app becoming inactive
   */
  private handleAppInactive(): void {
    // Call custom callback
    if (this.callbacks.onAppInactive) {
      this.callbacks.onAppInactive();
    }

    console.log('📱 App became inactive');
  }

  /**
   * Resume services when app becomes active
   */
  private resumeServices(): void {
    try {
      // Resume analytics
      analyticsService.setEnabled(true);

      // Resume offline sync
      offlineService.forceSync().catch(error => {
        console.error('❌ Resume offline sync error:', error);
      });

      // Clear notification badge
      notificationService.clearBadge().catch(error => {
        console.error('❌ Clear badge error:', error);
      });

      console.log('🔄 Services resumed');
    } catch (error) {
      console.error('❌ Resume services error:', error);
    }
  }

  /**
   * Pause services when app goes to background
   */
  private pauseServices(): void {
    try {
      // Save current session duration
      this.appStateData.sessionDuration =
        Date.now() - this.appStateData.sessionStartTime;

      // Flush analytics
      analyticsService.flushEvents().catch(error => {
        console.error('❌ Flush analytics error:', error);
      });

      // Save offline data
      offlineService.forceSync().catch(error => {
        console.error('❌ Save offline data error:', error);
      });

      console.log('⏸️ Services paused');
    } catch (error) {
      console.error('❌ Pause services error:', error);
    }
  }

  /**
   * Start session tracking
   */
  private startSessionTracking(): void {
    // Track session start
    analyticsService.track('session_started', {
      sessionStartTime: this.appStateData.sessionStartTime,
      appVersion: this.appStateData.appVersion,
    });

    console.log('📊 Session tracking started');
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    try {
      const sessionDuration = Date.now() - this.appStateData.sessionStartTime;

      // Track session end
      analyticsService.track('session_ended', {
        sessionDuration,
        backgroundTime: this.appStateData.backgroundTime,
        lastActiveTime: this.appStateData.lastActiveTime,
      });

      // End analytics session
      await analyticsService.endSession();

      // Save final state
      this.appStateData.sessionDuration = sessionDuration;
      await this.saveAppStateData();

      console.log('📊 Session ended, duration:', sessionDuration, 'ms');
    } catch (error) {
      console.error('❌ End session error:', error);
    }
  }

  /**
   * Set app state callbacks
   */
  setCallbacks(callbacks: AppStateCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    console.log('📱 App state callbacks updated');
  }

  /**
   * Get current app state
   */
  getCurrentState(): AppStateStatus {
    return this.currentState;
  }

  /**
   * Get app state data
   */
  getAppStateData(): AppStateData {
    return { ...this.appStateData };
  }

  /**
   * Check if app is active
   */
  isAppActive(): boolean {
    return this.appStateData.isActive;
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.appStateData.sessionStartTime;
  }

  /**
   * Get time since last active
   */
  getTimeSinceLastActive(): number {
    return Date.now() - this.appStateData.lastActiveTime;
  }

  /**
   * Force app state refresh
   */
  refreshAppState(): void {
    this.handleAppStateChange(AppState.currentState);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }

    console.log('🧹 App state service cleaned up');
  }
}

// Singleton instance
export const appStateService = new AppStateService();

// Convenience functions
export const setAppStateCallbacks = (callbacks: AppStateCallbacks) =>
  appStateService.setCallbacks(callbacks);

export const getCurrentAppState = () => appStateService.getCurrentState();

export const isAppActive = () => appStateService.isAppActive();

export const getSessionDuration = () => appStateService.getSessionDuration();

export const endAppSession = () => appStateService.endSession();

export default appStateService;
