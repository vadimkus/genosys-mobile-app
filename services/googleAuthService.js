/**
 * Direct Google OAuth Service
 * Bypasses Expo's development OAuth proxy to use production Google OAuth setup
 */

import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('googleAuth');

// Ensure any pending auth sessions are completed (recommended by Expo)
WebBrowser.maybeCompleteAuthSession();

// Client ID selection:
// - Expo Go: we keep using the web client id + AuthSession proxy.
// - Standalone/TestFlight: on iOS we should use the iOS client id + reversed-scheme redirect
//   to avoid "404" redirects in the browser and ensure iOS can reopen the app.
const IOS_CLIENT_ID = AUTH_CONFIG?.GOOGLE_OAUTH?.iosClientId || AUTH_CONFIG?.GOOGLE_OAUTH?.clientId;
const WEB_CLIENT_ID = AUTH_CONFIG?.GOOGLE_OAUTH?.webClientId || AUTH_CONFIG?.GOOGLE_OAUTH?.clientId;
const IOS_URL_SCHEME = AUTH_CONFIG?.GOOGLE_OAUTH?.iosUrlScheme; // com.googleusercontent.apps....
const GENOSYS_SCHEME_REDIRECT = AUTH_CONFIG?.GOOGLE_OAUTH?.redirectUri || 'genosys://oauth/google';

const getStandaloneRedirectUri = () => {
  if (Platform.OS === 'ios' && IOS_URL_SCHEME) {
    // Standard iOS OAuth redirect format.
    return `${IOS_URL_SCHEME}:/oauthredirect`;
  }
  return GENOSYS_SCHEME_REDIRECT;
};

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

  // Standalone / TestFlight / APK builds.
  const googleRedirectUri = getStandaloneRedirectUri();
  const returnUrl = googleRedirectUri;
  return { googleRedirectUri, returnUrl, mode: 'standalone' };
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

const parseQueryParamsFromUrl = (url) => {
  const u = String(url || '');
  const q = u.includes('?') ? u.split('?')[1] : '';
  const query = (q || '').split('#')[0] || '';
  return new URLSearchParams(query);
};

const extractAuthCodeFromUrl = (url) => {
  try {
    const sp = parseQueryParamsFromUrl(url);
    return sp.get('code');
  } catch {
    return null;
  }
};

const exchangeCodeForIdToken = async ({ code, codeVerifier, redirectUri, clientId }) => {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const body = new URLSearchParams({
    code: String(code || ''),
    client_id: String(clientId || ''),
    code_verifier: String(codeVerifier || ''),
    redirect_uri: String(redirectUri || ''),
    grant_type: 'authorization_code',
  }).toString();

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const err = json?.error || res.statusText || 'token_exchange_failed';
    const desc = json?.error_description || text || '';
    throw new Error([err, desc].filter(Boolean).join(': '));
  }

  const idToken = json?.id_token;
  if (!idToken) throw new Error('Token exchange succeeded but id_token is missing');
  return idToken;
};

/**
 * Direct Google OAuth login (bypasses Expo development proxy)
 * This will show your production "Genosys Middle East FZ-LLC" OAuth consent
 */
export const loginWithGoogleDirect = async () => {
  try {
    log.debug('Starting direct Google OAuth...');
    
    const isStandaloneIos = !isExpoGo && Platform.OS === 'ios';
    const googleClientId = (isExpoGo ? WEB_CLIENT_ID : (isStandaloneIos ? IOS_CLIENT_ID : WEB_CLIENT_ID));
    if (!googleClientId) {
      return { success: false, error: 'Google OAuth client ID missing' };
    }

    const { googleRedirectUri, returnUrl, mode } = getRedirectConfig();
    log.debug(`Google OAuth redirect mode=${mode} googleRedirectUri=${googleRedirectUri} returnUrl=${returnUrl}`);

    const nonce = await randomPkceVerifier(32);
    const state = await randomPkceVerifier(16);

    // For iOS standalone/TestFlight, Google's iOS OAuth client does NOT accept response_type=id_token.
    // Use Authorization Code + PKCE (no client_secret required for native iOS clients), then exchange for id_token.
    let pkceVerifier = null;
    let pkceChallenge = null;
    let responseType = 'id_token';
    let responseMode = 'fragment';
    if (isStandaloneIos) {
      pkceVerifier = await randomPkceVerifier(64);
      pkceChallenge = await sha256Base64Url(pkceVerifier);
      responseType = 'code';
      responseMode = 'query';
    }

    // Create Google OAuth URL directly
    const authUrl = createGoogleAuthUrl({
      clientId: googleClientId,
      redirectUri: googleRedirectUri,
      nonce,
      state,
      responseType,
      responseMode,
      codeChallenge: pkceChallenge,
    });
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
      if (isStandaloneIos) {
        const code = extractAuthCodeFromUrl(result.url);
        if (!code || !pkceVerifier) {
          const oauthErr = extractOAuthErrorFromUrl(result.url);
          if (oauthErr?.error || oauthErr?.errorDescription) {
            log.error('Google OAuth error from redirect', oauthErr);
            const msg = [oauthErr.error, oauthErr.errorDescription].filter(Boolean).join(': ');
            return { success: false, error: msg || 'Google OAuth failed' };
          }
          log.error('No code found in redirect URL', String(result.url).slice(0, 200));
          return { success: false, error: 'Google did not return an authorization code' };
        }
        const idToken = await exchangeCodeForIdToken({
          code,
          codeVerifier: pkceVerifier,
          redirectUri: googleRedirectUri,
          clientId: googleClientId,
        });
        return { success: true, idToken };
      }

      // Expo Go / other platforms: implicit id_token in fragment
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
const createGoogleAuthUrl = ({ clientId, redirectUri, nonce, state, responseType, responseMode, codeChallenge }) => {
  // Avoid URLSearchParams here: some native runtimes/polyfills can produce malformed query strings
  // which results in a Google 404 ("requested URL was not found on this server").
  const params = {
    client_id: String(clientId || ''),
    redirect_uri: String(redirectUri || ''),
    response_type: String(responseType || 'id_token'),
    response_mode: String(responseMode || 'fragment'),
    scope: 'openid profile email',
    prompt: 'select_account',
    nonce: String(nonce || ''),
    state: String(state || ''),
  };

  if (params.response_type === 'code') {
    if (!codeChallenge) throw new Error('Missing PKCE code_challenge');
    params.code_challenge = String(codeChallenge);
    params.code_challenge_method = 'S256';
  }

  if (!params.client_id || !params.redirect_uri) {
    throw new Error('Missing Google client_id or redirect_uri');
  }

  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  return `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
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