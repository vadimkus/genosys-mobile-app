/**
 * Authentication Configuration
 * Update these values to match your backend settings
 */

const env = (key, fallback) => {
  try {
    const v = process?.env?.[key];
    const s = typeof v === 'string' ? v.trim() : '';
    return s ? s : fallback;
  } catch {
    return fallback;
  }
};

const normalizeUrl = (u) => {
  const raw = String(u || '').trim();
  if (!raw) return raw;
  // remove trailing slashes
  let out = raw.replace(/\/+$/, '');
  // collapse accidental double /mobile in our API base
  out = out.replace(/\/api\/mobile\/mobile(\/|$)/, '/api/mobile');
  // collapse any accidental double slashes (keep protocol intact)
  out = out.replace(/([^:])\/{2,}/g, '$1/');
  return out;
};

const normalizeMobileApiBaseUrl = (u, webOrigin) => {
  const raw = normalizeUrl(u);
  if (!raw) return normalizeUrl(`${webOrigin}/api/mobile`);

  // If someone provided just the site origin, assume /api/mobile
  if (raw === normalizeUrl(webOrigin)) return normalizeUrl(`${webOrigin}/api/mobile`);

  // If someone provided /api (website api root), assume /api/mobile (mobile api root)
  if (raw.endsWith('/api')) return `${raw}/mobile`;

  // If someone provided /api/ (should be stripped already), or something close
  if (raw.endsWith('/api/')) return normalizeUrl(`${raw}mobile`);

  // If already points at /api/mobile, keep it
  if (raw.includes('/api/mobile')) return raw.replace(/\/api\/mobile\/mobile(\/|$)/, '/api/mobile');

  return raw;
};

const DEFAULT_WEB_ORIGIN = 'https://genosys.ae';
const WEB_ORIGIN = normalizeUrl(env('EXPO_PUBLIC_WEB_ORIGIN', DEFAULT_WEB_ORIGIN));
const ASSET_ORIGIN = normalizeUrl(env('EXPO_PUBLIC_ASSET_ORIGIN', WEB_ORIGIN));

export const AUTH_CONFIG = {
  // Backend API Configuration - LIVE API NOW AVAILABLE! 🚀
  API_BASE_URL: normalizeMobileApiBaseUrl(
    env('EXPO_PUBLIC_API_BASE_URL', `${WEB_ORIGIN}/api/mobile`),
    WEB_ORIGIN
  ),
  
  // SECURITY: Set EXPO_PUBLIC_API_KEY in EAS secrets for production builds.
  // The fallback value below is for development only and should be rotated.
  API_KEY: env('EXPO_PUBLIC_API_KEY', 'genosys_secure_mobile_2025_v1'),

  // Canonical web origins used across the app for image/link building.
  WEB_ORIGIN,
  ASSET_ORIGIN,
  LOGO_URL: env(
    'EXPO_PUBLIC_LOGO_URL',
    `${WEB_ORIGIN}/_next/image?url=%2Fimages%2Fprd_logo.png&w=512&q=75`
  ),
  
  // Google OAuth Configuration (production setup for Genosys Middle East FZ-LLC)
  GOOGLE_OAUTH: {
    // Prefer env overrides so we can adjust without code changes.
    // Defaults match the currently active Google Cloud project/client IDs.
    clientId: env(
      'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
      '998688135686-qmhvfcksth50r9ukk0pefqu1r7cqil73.apps.googleusercontent.com'
    ),
    iosClientId: env(
      'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
      '998688135686-qmhvfcksth50r9ukk0pefqu1r7cqil73.apps.googleusercontent.com'
    ),
    // TODO: Google Sign-In on Android requires a separate OAuth 2.0 Android client ID.
    // Steps to enable:
    //   1. Go to Google Cloud Console > APIs & Services > Credentials
    //   2. Create an OAuth 2.0 client ID for Android
    //   3. Use package name: ae.genosys.app
    //   4. Add the SHA-1 fingerprint from your signing key (debug + production)
    //   5. Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in your .env
    // Without this, Google Sign-In will not work on Android builds.
    androidClientId: env(
      'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
      '590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com'
    ),
    // Used by Expo Go / web contexts
    webClientId: env(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
      '998688135686-hguci501u33atkitfurgcitb7qiu0s86.apps.googleusercontent.com'
    ),
    // Custom scheme for deep linking
    redirectUri: 'genosys://oauth/google',
    // iOS URL scheme (reversed client id). Used for iOS standalone/TestFlight redirects.
    iosUrlScheme: 'com.googleusercontent.apps.998688135686-qmhvfcksth50r9ukk0pefqu1r7cqil73',
  },
  
  // App Settings
  TOKEN_STORAGE_KEY: '@user',
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days (matches backend JWT expiration)
};

export default AUTH_CONFIG;