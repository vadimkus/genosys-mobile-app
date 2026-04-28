import Constants from 'expo-constants';

/**
 * Sentry Crash Reporting Configuration
 * 
 * Set EXPO_PUBLIC_SENTRY_DSN in local env/EAS secrets to enable event upload.
 * The native package and Expo config plugin are installed; without a DSN this
 * module intentionally no-ops so production builds remain stable.
 */

const SENTRY_DSN = (() => {
  try {
    return process?.env?.EXPO_PUBLIC_SENTRY_DSN || '';
  } catch {
    return '';
  }
})();

const APP_VERSION = Constants.expoConfig?.version || '0.0.0';
const RUNTIME_VERSION = Constants.expoConfig?.runtimeVersion || APP_VERSION;
const SENTRY_ENVIRONMENT = (() => {
  try {
    return process?.env?.EXPO_PUBLIC_APP_ENV || (__DEV__ ? 'development' : 'production');
  } catch {
    return __DEV__ ? 'development' : 'production';
  }
})();

/**
 * Initialize Sentry if the package and DSN are available.
 * Safe to call even if @sentry/react-native is not installed.
 */
export async function initSentry() {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('[Sentry] No DSN configured, skipping initialization');
    }
    return;
  }

  try {
    // Dynamic import to avoid crash if package isn't installed
    const Sentry = await import('@sentry/react-native');
    
    Sentry.init({
      dsn: SENTRY_DSN,
      debug: __DEV__,
      environment: SENTRY_ENVIRONMENT,
      release: `genosys-mobile@${APP_VERSION}`,
      dist: RUNTIME_VERSION,
      
      // Performance monitoring
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      
      // Session tracking
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      
      // Filter out development noise
      beforeSend(event) {
        // Don't send events in development unless explicitly enabled
        if (__DEV__ && !process?.env?.EXPO_PUBLIC_SENTRY_DEBUG) {
          return null;
        }
        return event;
      },
      
      // Breadcrumb filtering
      beforeBreadcrumb(breadcrumb) {
        // Filter out noisy console breadcrumbs in production
        if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
          return null;
        }
        return breadcrumb;
      },
    });
    
    if (__DEV__) {
      console.log('[Sentry] Initialized successfully');
    }
  } catch (error) {
    // Sentry package not installed - that's OK
    if (__DEV__) {
      console.log('[Sentry] Package not available, skipping:', error?.message);
    }
  }
}

/**
 * Capture an exception in Sentry (safe wrapper)
 */
export async function captureException(error, context) {
  try {
    const Sentry = await import('@sentry/react-native');
    if (context) {
      Sentry.withScope((scope) => {
        if (context.screen) scope.setTag('screen', context.screen);
        scope.setTag('runtimeVersion', RUNTIME_VERSION);
        if (context.user) scope.setUser(context.user);
        if (context.extra) scope.setExtras(context.extra);
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch {
    // Sentry not available
  }
}

/**
 * Set user context in Sentry
 */
export async function setSentryUser(user) {
  try {
    const Sentry = await import('@sentry/react-native');
    if (user) {
      Sentry.setUser({
        id: user.id ? String(user.id) : undefined,
        username: user.name,
      });
    } else {
      Sentry.setUser(null);
    }
  } catch {
    // Sentry not available
  }
}

export default { initSentry, captureException, setSentryUser };
