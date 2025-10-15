/**
 * Environment Configuration
 * Centralized configuration management for the Genosys Mobile App
 */

export const ENV = {
  // API Configuration
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL || 'https://genosys.ae/api',
  API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
  API_RETRY_ATTEMPTS: parseInt(
    process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS || '3',
    10
  ),

  // Environment
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  IS_DEVELOPMENT: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development',
  IS_PRODUCTION: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',

  // Monitoring & Analytics
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  ANALYTICS_ID: process.env.EXPO_PUBLIC_ANALYTICS_ID,

  // Feature Flags
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING:
    process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
  ENABLE_DEBUG_LOGS:
    process.env.EXPO_PUBLIC_ENABLE_DEBUG_LOGS === 'true' || __DEV__,
  ENABLE_PUSH_NOTIFICATIONS:
    process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== 'false',
  ENABLE_OFFLINE_SUPPORT:
    process.env.EXPO_PUBLIC_ENABLE_OFFLINE_SUPPORT !== 'false',
  ENABLE_DEEP_LINKING: process.env.EXPO_PUBLIC_ENABLE_DEEP_LINKING !== 'false',

  // App Configuration
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',

  // Rate Limiting
  RATE_LIMIT_DELAY: parseInt(
    process.env.EXPO_PUBLIC_RATE_LIMIT_DELAY || '10000',
    10
  ),
  CIRCUIT_BREAKER_TIMEOUT: parseInt(
    process.env.EXPO_PUBLIC_CIRCUIT_BREAKER_TIMEOUT || '300000',
    10
  ),

  // Cache Configuration
  CACHE_DURATION: parseInt(
    process.env.EXPO_PUBLIC_CACHE_DURATION || '300000',
    10
  ), // 5 minutes
  IMAGE_CACHE_DURATION: parseInt(
    process.env.EXPO_PUBLIC_IMAGE_CACHE_DURATION || '86400000',
    10
  ), // 24 hours

  // Analytics Configuration
  ANALYTICS_BATCH_SIZE: parseInt(
    process.env.EXPO_PUBLIC_ANALYTICS_BATCH_SIZE || '10',
    10
  ),
  ANALYTICS_FLUSH_INTERVAL: parseInt(
    process.env.EXPO_PUBLIC_ANALYTICS_FLUSH_INTERVAL || '30000',
    10
  ), // 30 seconds
  ANALYTICS_MAX_RETRIES: parseInt(
    process.env.EXPO_PUBLIC_ANALYTICS_MAX_RETRIES || '3',
    10
  ),

  // Notification Configuration
  NOTIFICATION_SOUND: process.env.EXPO_PUBLIC_NOTIFICATION_SOUND !== 'false',
  NOTIFICATION_BADGE: process.env.EXPO_PUBLIC_NOTIFICATION_BADGE !== 'false',

  // Offline Configuration
  OFFLINE_CACHE_SIZE: parseInt(
    process.env.EXPO_PUBLIC_OFFLINE_CACHE_SIZE || '104857600',
    10
  ), // 100MB
  OFFLINE_SYNC_INTERVAL: parseInt(
    process.env.EXPO_PUBLIC_OFFLINE_SYNC_INTERVAL || '30000',
    10
  ), // 30 seconds
  OFFLINE_RETRY_INTERVAL: parseInt(
    process.env.EXPO_PUBLIC_OFFLINE_RETRY_INTERVAL || '60000',
    10
  ), // 1 minute
  OFFLINE_MAX_RETRIES: parseInt(
    process.env.EXPO_PUBLIC_OFFLINE_MAX_RETRIES || '3',
    10
  ),

  // Deep Link Configuration
  DEEP_LINK_SCHEME: process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME || 'genosys',
  DEEP_LINK_HOST: process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'app.genosys.com',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@genosys_auth_token',
  USER_DATA: '@genosys_user_data',
  THEME: '@genosys_theme',
  CART: '@genosys_cart',
  WISHLIST: '@genosys_wishlist',
  SETTINGS: '@genosys_settings',
  CACHE_TIMESTAMP: '@genosys_cache_timestamp',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/:id',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
  },
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: '/orders/:id',
    CANCEL: '/orders/:id/cancel',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    ADDRESSES: '/user/addresses',
    WISHLIST: '/user/wishlist',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: false,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  },
} as const;

// App Constants
export const APP_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  PULL_TO_REFRESH_THRESHOLD: 60,
  INFINITE_SCROLL_THRESHOLD: 0.8,
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: '#dc2626',
  PRIMARY_LIGHT: '#ef4444',
  PRIMARY_DARK: '#b91c1c',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',

  // Neutral Colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    '2XL': 24,
    '3XL': 30,
    '4XL': 36,
  },
  FONT_WEIGHTS: {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
  LINE_HEIGHTS: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
} as const;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
  '3XL': 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  '2XL': 24,
  FULL: 9999,
} as const;

// Shadow Presets
export const SHADOWS = {
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  XL: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// Environment validation
export const validateEnvironment = (): void => {
  const requiredEnvVars = ['EXPO_PUBLIC_API_BASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0 && ENV.IS_PRODUCTION) {
    console.warn('Missing required environment variables:', missingVars);
  }

  if (ENV.IS_DEVELOPMENT) {
    console.log('Environment Configuration:', {
      API_BASE_URL: ENV.API_BASE_URL,
      ENVIRONMENT: ENV.ENVIRONMENT,
      DEBUG_LOGS: ENV.ENABLE_DEBUG_LOGS,
    });
  }
};

// Initialize environment validation
validateEnvironment();
