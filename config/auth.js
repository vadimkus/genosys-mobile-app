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
  
  // Mobile App API Key - matches backend authentication
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
    // Use iOS client ID as the main client ID for mobile app
    clientId: '590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com',
    iosClientId: '590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com',
    androidClientId: '590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com',
    webClientId: '590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com',
    // Custom scheme for deep linking
    redirectUri: 'genosys://oauth/google',
  },
  
  // App Settings
  TOKEN_STORAGE_KEY: '@user',
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days (matches backend JWT expiration)
};

export default AUTH_CONFIG;