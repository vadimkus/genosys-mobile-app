/**
 * Direct Google OAuth Service
 * Bypasses Expo's development OAuth proxy to use production Google OAuth setup
 */

import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('googleAuth');

// Ensure any pending auth sessions are completed (recommended by Expo)
WebBrowser.maybeCompleteAuthSession();

// Use the web client ID for OAuth code+PKCE with a custom scheme redirect.
// This must have `genosys://oauth/google` in Authorized redirect URIs in Google Cloud Console.
const GOOGLE_CLIENT_ID = AUTH_CONFIG?.GOOGLE_OAUTH?.webClientId || AUTH_CONFIG?.GOOGLE_OAUTH?.clientId;
const NATIVE_REDIRECT_URI = AUTH_CONFIG?.GOOGLE_OAUTH?.redirectUri || 'genosys://oauth/google';

// Expo Go cannot handle custom schemes reliably; use the AuthSession proxy in Expo Go.
const isExpoGo = Constants?.appOwnership === 'expo';
const getRedirectConfig = () => {
  if (isExpoGo) {
    // For Expo Go:
    // - Google must redirect to the Expo AuthSession proxy (https://auth.expo.io/@owner/slug)
    // - IMPORTANT: openAuthSessionAsync must listen for the same proxy URL, otherwise iOS will show "cancel"
    //   because the redirect never reaches the local exp:// URL.
    const owner = Constants?.expoConfig?.owner || 'anonymous';
    const slug = Constants?.expoConfig?.slug || 'genosys-mobile-app';
    const googleRedirectUri = `https://auth.expo.io/@${owner}/${slug}`;
    const returnUrl = googleRedirectUri;
    return { googleRedirectUri, returnUrl, mode: 'expoGo' };
  }

  // Standalone / TestFlight / APK builds: custom scheme works end-to-end.
  return { googleRedirectUri: NATIVE_REDIRECT_URI, returnUrl: NATIVE_REDIRECT_URI, mode: 'standalone' };
};

const base64ToBase64Url = (b64) =>
  String(b64 || '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

// PKCE verifier must be 43-128 chars from ALPHA / DIGIT / "-" / "." / "_" / "~"
const PKCE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
const randomPkceVerifier = async (length = 64) => {
  const bytes = await Crypto.getRandomBytesAsync(length);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += PKCE_CHARS[bytes[i] % PKCE_CHARS.length];
  }
  return out;
};

const sha256Base64Url = async (input) => {
  const digestB64 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    String(input),
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return base64ToBase64Url(digestB64);
};

/**
 * Direct Google OAuth login (bypasses Expo development proxy)
 * This will show your production "Genosys Middle East FZ-LLC" OAuth consent
 */
export const loginWithGoogleDirect = async () => {
  try {
    log.debug('Starting direct Google OAuth...');
    
    if (!GOOGLE_CLIENT_ID) {
      return { success: false, error: 'Google OAuth client ID missing (webClientId)' };
    }

    const { googleRedirectUri, returnUrl, mode } = getRedirectConfig();
    log.debug(`Google OAuth redirect mode=${mode} googleRedirectUri=${googleRedirectUri} returnUrl=${returnUrl}`);

    // We intentionally use the implicit ID token flow here (response_type=id_token).
    // Reason: exchanging an auth code via /token for a Web Client typically requires client_secret,
    // which we cannot (and should not) ship in a mobile app. The backend verifies id_token anyway.
    const nonce = await randomPkceVerifier(32);
    const state = await randomPkceVerifier(16);

    // Create Google OAuth URL directly
    const authUrl = createGoogleAuthUrl({ redirectUri: googleRedirectUri, nonce, state });
    log.debug('Auth URL created');
    
    // Open Google OAuth in browser
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      returnUrl,
      {
        showInRecents: false,
        createTask: false,
      }
    );
    
    log.debug('OAuth result', { type: result.type });
    
    if (result.type === 'success' && result.url) {
      // Extract id_token from redirect URL (fragment)
      const idToken = extractIdTokenFromUrl(result.url);
      if (!idToken) {
        const oauthErr = extractOAuthErrorFromUrl(result.url);
        if (oauthErr?.error || oauthErr?.errorDescription) {
          log.error('Google OAuth error from redirect', oauthErr);
          const msg = [oauthErr.error, oauthErr.errorDescription].filter(Boolean).join(': ');
          return { success: false, error: msg || 'Google OAuth failed' };
        }
        log.error('No id_token found in redirect URL', String(result.url).slice(0, 200));
        return { success: false, error: 'Google did not return an ID token (check Google Cloud redirect URIs / authorized domains)' };
      }
      return { success: true, idToken };
    } else if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Authentication cancelled'
      };
    } else {
      return {
        success: false,
        error: 'Google authentication failed'
      };
    }
  } catch (error) {
    log.error('Direct Google OAuth error', error?.message || error);
    return {
      success: false,
      error: 'Google authentication failed. Please try again.'
    };
  }
};

/**
 * Create Google OAuth URL with production configuration
 */
const createGoogleAuthUrl = ({ redirectUri, nonce, state }) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    // Implicit flow: return id_token directly (backend verifies it)
    response_type: 'id_token',
    response_mode: 'fragment',
    scope: 'openid profile email',
    prompt: 'select_account',
    nonce,
    state,
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Extract id_token from redirect URL (fragment)
 */
const extractIdTokenFromUrl = (url) => {
  try {
    const u = String(url || '');
    const parts = u.split('#');
    if (parts.length < 2) return null;
    const frag = parts[1] || '';
    const sp = new URLSearchParams(frag);
    return sp.get('id_token');
  } catch (error) {
    log.error('Error extracting id_token', error?.message || error);
    return null;
  }
};

/**
 * Extract OAuth error details (if Google redirects back with error)
 */
const extractOAuthErrorFromUrl = (url) => {
  try {
    const u = String(url || '');
    const [beforeHash, afterHash] = u.split('#');
    const query = beforeHash && beforeHash.includes('?') ? beforeHash.split('?')[1] : '';
    const frag = afterHash || '';
    const sp = new URLSearchParams(frag || query || '');
    const error = sp.get('error');
    const errorDescription = sp.get('error_description');
    if (!error && !errorDescription) return null;
    return { error, errorDescription };
  } catch {
    return null;
  }
};

export default {
  loginWithGoogleDirect,
};