/**
 * Performance Monitoring Utilities
 * Track and monitor app performance metrics
 */

import { Performance } from 'react-native-performance';
import { ENV } from '../config/environment';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = ENV.ENABLE_DEBUG_LOGS;

  /**
   * Start tracking a performance metric
   */
  startMetric(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const startTime = Date.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata,
    });

    console.log(`🚀 Performance: Started tracking "${name}"`);
  }

  /**
   * End tracking a performance metric
   */
  endMetric(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ Performance: Metric "${name}" not found`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    console.log(
      `✅ Performance: "${name}" completed in ${duration.toFixed(2)}ms`
    );

    // Log slow operations
    if (duration > 1000) {
      console.warn(
        `🐌 Performance: Slow operation detected - "${name}" took ${duration.toFixed(2)}ms`
      );
    }

    this.metrics.delete(name);
    return duration;
  }

  /**
   * Track screen load time
   */
  trackScreenLoad(screenName: string): () => void {
    const metricName = `screen_load_${screenName}`;
    this.startMetric(metricName, { screen: screenName });

    return () => {
      const duration = this.endMetric(metricName);
      if (duration !== null) {
        this.logScreenPerformance(screenName, duration);
      }
    };
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string): () => void {
    const metricName = `api_call_${endpoint}`;
    this.startMetric(metricName, { endpoint });

    return () => {
      const duration = this.endMetric(metricName);
      if (duration !== null) {
        this.logApiPerformance(endpoint, duration);
      }
    };
  }

  /**
   * Track image load performance
   */
  trackImageLoad(imageUrl: string): () => void {
    const metricName = `image_load_${imageUrl.substring(0, 20)}`;
    this.startMetric(metricName, { imageUrl });

    return () => {
      const duration = this.endMetric(metricName);
      if (duration !== null) {
        this.logImagePerformance(imageUrl, duration);
      }
    };
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string): () => void {
    const metricName = `component_render_${componentName}`;
    this.startMetric(metricName, { component: componentName });

    return () => {
      this.endMetric(metricName);
    };
  }

  /**
   * Get memory usage information
   */
  getMemoryInfo(): void {
    if (!this.isEnabled) return;

    // This would require additional native modules in a real implementation
    console.log('📊 Memory: Memory usage tracking would be implemented here');
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  private logScreenPerformance(screenName: string, duration: number): void {
    const level = duration > 2000 ? 'warn' : 'log';
    console[level](
      `📱 Screen Performance: ${screenName} loaded in ${duration.toFixed(2)}ms`
    );
  }

  private logApiPerformance(endpoint: string, duration: number): void {
    const level = duration > 3000 ? 'warn' : 'log';
    console[level](
      `🌐 API Performance: ${endpoint} completed in ${duration.toFixed(2)}ms`
    );
  }

  private logImagePerformance(imageUrl: string, duration: number): void {
    const level = duration > 1000 ? 'warn' : 'log';
    console[level](
      `🖼️ Image Performance: ${imageUrl.substring(0, 30)}... loaded in ${duration.toFixed(2)}ms`
    );
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const trackScreenLoad = (screenName: string) =>
  performanceMonitor.trackScreenLoad(screenName);
export const trackApiCall = (endpoint: string) =>
  performanceMonitor.trackApiCall(endpoint);
export const trackImageLoad = (imageUrl: string) =>
  performanceMonitor.trackImageLoad(imageUrl);
export const trackComponentRender = (componentName: string) =>
  performanceMonitor.trackComponentRender(componentName);

// Performance hooks for React components
export const usePerformanceTracking = (componentName: string) => {
  const startTracking = () =>
    performanceMonitor.startMetric(`component_${componentName}`);
  const endTracking = () =>
    performanceMonitor.endMetric(`component_${componentName}`);

  return { startTracking, endTracking };
};

// Bundle size analysis
export const analyzeBundleSize = (): void => {
  if (!ENV.IS_DEVELOPMENT) return;

  console.log('📦 Bundle Analysis:');
  console.log(
    '- Use "npx react-native-bundle-visualizer" to analyze bundle size'
  );
  console.log('- Consider code splitting for large components');
  console.log('- Use dynamic imports for non-critical features');
};

// Performance recommendations
export const getPerformanceRecommendations = (): string[] => {
  return [
    'Use FastImage for better image performance',
    'Implement FlashList for large lists',
    'Add image caching and lazy loading',
    'Use React.memo for expensive components',
    'Implement virtual scrolling for long lists',
    'Optimize bundle size with code splitting',
    'Use native drivers for animations',
    'Implement proper error boundaries',
  ];
};

export default performanceMonitor;
