/**
 * WebView Authentication Utility
 *
 * Builds authenticated URLs for the in-app WebView.
 * When a user is logged in, the URL is routed through the
 * /api/auth/mobile-session bridge endpoint which sets a
 * `genosys_session` cookie before redirecting to the target page.
 *
 * This ensures WebView pages (e.g. bundle-builder, training) see
 * the user as logged in and can display prices, etc.
 */
import AUTH_CONFIG from '../config/auth';

const BASE_URL = 'https://genosys.ae';

/**
 * Build a WebView URL that is optionally authenticated.
 *
 * @param {string} urlPath  - Target path, e.g. '/bundle-builder'
 * @param {string} locale   - Current locale ('en', 'ar', 'ru')
 * @param {object|null} user - User object from AuthContext (needs .token)
 * @returns {string} The URL to load in the WebView
 */
export function buildAuthenticatedWebViewUrl(urlPath, locale, user) {
  const localePrefix = locale === 'ar' ? '/ar' : locale === 'ru' ? '/ru' : '';

  // If user is logged in, route through the mobile-session bridge
  if (user?.token) {
    const localeParam = locale === 'ar' || locale === 'ru' ? locale : '';
    return (
      `${BASE_URL}/api/auth/mobile-session` +
      `?token=${encodeURIComponent(user.token)}` +
      `&apiKey=${encodeURIComponent(AUTH_CONFIG.API_KEY)}` +
      `&redirect=${encodeURIComponent(urlPath)}` +
      (localeParam ? `&locale=${encodeURIComponent(localeParam)}` : '')
    );
  }

  // Not logged in – load the page directly
  return `${BASE_URL}${localePrefix}${urlPath}`;
}
