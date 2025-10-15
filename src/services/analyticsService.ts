/**
 * Analytics Service
 * Comprehensive analytics tracking for user behavior and app performance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/environment';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: string;
  lastActive?: string;
}

interface SessionData {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  screenViews: number;
  events: number;
}

class AnalyticsService {
  private sessionId: string = '';
  private userId: string | null = null;
  private sessionData: SessionData | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSession();
    this.startFlushTimer();
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    try {
      await this.initializeSession();
      console.log('📊 Analytics service initialized');
    } catch (error) {
      console.error('❌ Analytics initialization error:', error);
    }
  }

  /**
   * Initialize analytics session
   */
  private async initializeSession(): Promise<void> {
    try {
      this.sessionId = this.generateSessionId();
      this.sessionData = {
        sessionId: this.sessionId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        screenViews: 0,
        events: 0,
      };

      // Load user ID from storage
      const storedUserId = await AsyncStorage.getItem('analytics_user_id');
      if (storedUserId) {
        this.userId = storedUserId;
      }

      console.log('📊 Analytics initialized:', {
        sessionId: this.sessionId,
        userId: this.userId,
      });
    } catch (error) {
      console.error('❌ Analytics initialization error:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start automatic event flushing
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Stop automatic event flushing
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Identify user
   */
  async identify(userId: string, properties?: UserProperties): Promise<void> {
    try {
      this.userId = userId;
      await AsyncStorage.setItem('analytics_user_id', userId);

      const identifyEvent: AnalyticsEvent = {
        event: 'user_identified',
        properties: {
          userId,
          ...properties,
        },
        timestamp: Date.now(),
        userId,
        sessionId: this.sessionId,
      };

      this.trackEvent(identifyEvent);
      console.log('👤 User identified:', userId);
    } catch (error) {
      console.error('❌ User identification error:', error);
    }
  }

  /**
   * Track custom event
   */
  track(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      const analyticsEvent: AnalyticsEvent = {
        event,
        properties: {
          ...properties,
          platform: 'mobile',
          appVersion: ENV.APP_VERSION,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        userId: this.userId || undefined,
        sessionId: this.sessionId,
      };

      this.trackEvent(analyticsEvent);
    } catch (error) {
      console.error('❌ Event tracking error:', error);
    }
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      if (this.sessionData) {
        this.sessionData.screenViews++;
        this.sessionData.lastActivity = Date.now();
      }

      this.track('screen_view', {
        screen_name: screenName,
        ...properties,
      });

      console.log('📱 Screen viewed:', screenName);
    } catch (error) {
      console.error('❌ Screen tracking error:', error);
    }
  }

  /**
   * Track user action
   */
  trackAction(action: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      this.track('user_action', {
        action,
        ...properties,
      });

      console.log('🎯 Action tracked:', action);
    } catch (error) {
      console.error('❌ Action tracking error:', error);
    }
  }

  /**
   * Track e-commerce event
   */
  trackEcommerce(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      this.track('ecommerce', {
        ecommerce_event: event,
        ...properties,
      });

      console.log('🛒 E-commerce event:', event);
    } catch (error) {
      console.error('❌ E-commerce tracking error:', error);
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(
    metric: string,
    value: number,
    properties?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    try {
      this.track('performance', {
        metric,
        value,
        ...properties,
      });

      console.log('⚡ Performance metric:', metric, value);
    } catch (error) {
      console.error('❌ Performance tracking error:', error);
    }
  }

  /**
   * Track error
   */
  trackError(error: Error, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      this.track('error', {
        error_message: error.message,
        error_stack: error.stack,
        error_name: error.name,
        ...properties,
      });

      console.log('❌ Error tracked:', error.message);
    } catch (trackingError) {
      console.error('❌ Error tracking failed:', trackingError);
    }
  }

  /**
   * Add event to queue
   */
  private trackEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    if (this.sessionData) {
      this.sessionData.events++;
      this.sessionData.lastActivity = Date.now();
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Flush events to server
   */
  async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToFlush = [...this.eventQueue];
      this.eventQueue = [];

      // In a real app, you would send these to your analytics server
      // For now, we'll store them locally and log them
      await this.storeEventsLocally(eventsToFlush);

      console.log(`📤 Flushed ${eventsToFlush.length} analytics events`);
    } catch (error) {
      console.error('❌ Event flush error:', error);
      // Re-add events to queue if flush failed
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  /**
   * Store events locally (for demo purposes)
   */
  private async storeEventsLocally(events: AnalyticsEvent[]): Promise<void> {
    try {
      const existingEvents = await AsyncStorage.getItem('analytics_events');
      const allEvents = existingEvents ? JSON.parse(existingEvents) : [];

      allEvents.push(...events);

      // Keep only last 1000 events
      if (allEvents.length > 1000) {
        allEvents.splice(0, allEvents.length - 1000);
      }

      await AsyncStorage.setItem('analytics_events', JSON.stringify(allEvents));
    } catch (error) {
      console.error('❌ Local storage error:', error);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalyticsData(): Promise<{
    sessionData: SessionData | null;
    eventCount: number;
    recentEvents: AnalyticsEvent[];
  }> {
    try {
      const existingEvents = await AsyncStorage.getItem('analytics_events');
      const allEvents = existingEvents ? JSON.parse(existingEvents) : [];

      return {
        sessionData: this.sessionData,
        eventCount: allEvents.length,
        recentEvents: allEvents.slice(-10), // Last 10 events
      };
    } catch (error) {
      console.error('❌ Analytics data retrieval error:', error);
      return {
        sessionData: this.sessionData,
        eventCount: 0,
        recentEvents: [],
      };
    }
  }

  /**
   * Clear analytics data
   */
  async clearAnalyticsData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('analytics_events');
      await AsyncStorage.removeItem('analytics_user_id');
      this.eventQueue = [];
      console.log('🗑️ Analytics data cleared');
    } catch (error) {
      console.error('❌ Analytics data clear error:', error);
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log('📊 Analytics', enabled ? 'enabled' : 'disabled');
  }

  /**
   * End session
   */
  async endSession(): Promise<void> {
    try {
      if (this.sessionData) {
        const sessionDuration = Date.now() - this.sessionData.startTime;

        this.track('session_end', {
          session_duration: sessionDuration,
          screen_views: this.sessionData.screenViews,
          events: this.sessionData.events,
        });
      }

      await this.flushEvents();
      this.stopFlushTimer();

      console.log('📊 Session ended');
    } catch (error) {
      console.error('❌ Session end error:', error);
    }
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    sessionId: string;
    userId: string | null;
    isEnabled: boolean;
    eventQueueLength: number;
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      isEnabled: this.isEnabled,
      eventQueueLength: this.eventQueue.length,
    };
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

// Convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) =>
  analyticsService.track(event, properties);

export const trackScreenView = (
  screenName: string,
  properties?: Record<string, any>
) => analyticsService.trackScreenView(screenName, properties);

export const trackAction = (action: string, properties?: Record<string, any>) =>
  analyticsService.trackAction(action, properties);

export const trackEcommerce = (
  event: string,
  properties?: Record<string, any>
) => analyticsService.trackEcommerce(event, properties);

export const trackPerformance = (
  metric: string,
  value: number,
  properties?: Record<string, any>
) => analyticsService.trackPerformance(metric, value, properties);

export const trackError = (error: Error, properties?: Record<string, any>) =>
  analyticsService.trackError(error, properties);

export const identifyUser = (userId: string, properties?: UserProperties) =>
  analyticsService.identify(userId, properties);

export default analyticsService;
