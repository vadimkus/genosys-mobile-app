/**
 * Authenticated Fetch Wrapper
 * 
 * Intercepts 401 responses, attempts to refresh the token, and retries.
 * If refresh fails, triggers logout so the user can re-authenticate.
 * 
 * This prevents the cascade of 401 errors when a token expires while
 * the user is actively using the app.
 */

import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';
import { getSecureToken, updateSecureToken, clearUserSession, getUserSession, storeUserSession } from './secureTokenStorage';

const log = createLogger('authFetch');

const { API_BASE_URL, API_KEY } = AUTH_CONFIG;

// Singleton: prevent multiple simultaneous refresh attempts
let _refreshPromise = null;

// Callback to notify AuthContext of forced logout (set by AuthContext)
let _onAuthExpired = null;

/**
 * Register a callback that fires when token refresh fails and user must re-login.
 * Called by AuthContext during initialization.
 */
export function setOnAuthExpired(callback) {
  _onAuthExpired = callback;
}

/**
 * Attempt to refresh the JWT token using the backend /auth/refresh endpoint.
 * Returns the new token string on success, or null on failure.
 * 
 * @param {string} expiredToken - The current (possibly expired) token
 * @returns {Promise<{token: string, user: object}|null>}
 */
export async function refreshToken(expiredToken) {
  // Deduplicate: if a refresh is already in flight, wait for it
  if (_refreshPromise) {
    log.debug('Token refresh already in progress, waiting...');
    return _refreshPromise;
  }

  _refreshPromise = (async () => {
    // 10s timeout — shorter than the main 15s request limit so a hung refresh
    // fails fast (and triggers logout) instead of stalling every queued
    // authenticated request behind it.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      log.info('Attempting token refresh...');

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${expiredToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        log.warn('Token refresh failed', { status: response.status, body: text.slice(0, 200) });
        return null;
      }

      const result = await response.json();

      if (result.success && result.token) {
        log.info('Token refreshed successfully');
        return { token: result.token, user: result.user || null };
      }

      log.warn('Token refresh response invalid', result);
      return null;
    } catch (error) {
      log.error('Token refresh network error', error?.message || error);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  })();

  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

/**
 * Persist a refreshed token+user into secure storage and return the merged user object.
 * 
 * @param {{token: string, user: object|null}} refreshResult
 * @returns {Promise<object>} The updated user object with new token
 */
export async function persistRefreshedToken(refreshResult) {
  try {
    const storedUser = await getUserSession() || {};
    const updatedUser = {
      ...storedUser,
      ...(refreshResult.user || {}),
      token: refreshResult.token,
    };
    await storeUserSession(updatedUser);
    log.debug('Persisted refreshed token to storage');
    return updatedUser;
  } catch (e) {
    log.error('Failed to persist refreshed token', e?.message || e);
    return null;
  }
}

/**
 * Perform an authenticated fetch. If the response is 401, attempt to refresh
 * the token and retry once. If refresh fails, trigger auth expiration.
 * 
 * @param {string} url - Full URL to fetch
 * @param {object} options - Standard fetch options (must include Authorization header)
 * @param {string} currentToken - The token used in this request (for refresh)
 * @returns {Promise<Response>} The fetch Response object
 */
export async function authenticatedFetch(url, options = {}, currentToken = null) {
  const response = await fetch(url, options);

  // If not 401, return as-is
  if (response.status !== 401) {
    return response;
  }

  // The caller aborted (timeout/unmount) — don't start a refresh + retry
  // cycle whose result nobody will consume.
  if (options.signal?.aborted) {
    return response;
  }

  // 401 received - attempt token refresh
  if (!currentToken) {
    // Try to extract token from the Authorization header
    const authHeader = options.headers?.['Authorization'] || options.headers?.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    currentToken = match ? match[1] : null;
  }

  if (!currentToken) {
    log.warn('401 received but no token available for refresh');
    _handleAuthExpired();
    return response;
  }

  // Attempt refresh
  const refreshResult = await refreshToken(currentToken);

  if (!refreshResult) {
    log.warn('Token refresh failed - triggering auth expiration');
    _handleAuthExpired();
    return response;
  }

  // Persist the new token (also keeps storage fresh for the next caller even
  // if this particular request was aborted while refreshing).
  await persistRefreshedToken(refreshResult);

  // Caller aborted while the token was refreshing — skip the retry.
  if (options.signal?.aborted) {
    return response;
  }

  // Retry the original request with the new token
  const retryHeaders = { ...options.headers };
  retryHeaders['Authorization'] = `Bearer ${refreshResult.token}`;

  log.debug('Retrying request with refreshed token:', url);
  const retryResponse = await fetch(url, { ...options, headers: retryHeaders });

  // If still 401 after refresh, give up
  if (retryResponse.status === 401) {
    log.error('Request still 401 after token refresh - forcing logout');
    _handleAuthExpired();
  }

  return retryResponse;
}

/**
 * Internal: notify listeners that authentication has expired.
 */
function _handleAuthExpired() {
  if (_onAuthExpired) {
    log.info('Notifying app of auth expiration');
    _onAuthExpired();
  }
}

/**
 * Get the latest token from secure storage.
 * Useful after a refresh has happened in another call.
 */
export async function getLatestToken() {
  try {
    return await getSecureToken();
  } catch {
    return null;
  }
}

export default {
  authenticatedFetch,
  setOnAuthExpired,
  getLatestToken,
  refreshToken,
  persistRefreshedToken,
};
