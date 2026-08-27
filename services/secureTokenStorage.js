/**
 * Secure Token Storage
 * Uses expo-secure-store for sensitive auth tokens (encrypted)
 * Uses AsyncStorage for non-sensitive user profile data
 * 
 * SecureStore has a 2KB limit per key, so we split:
 * - Token → SecureStore (encrypted)
 * - User data → AsyncStorage (faster, no size limit)
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../utils/logger';

const log = createLogger('SecureTokenStorage');

const SECURE_TOKEN_KEY = 'auth_token_secure';
const USER_DATA_KEY = '@user_profile';
const LEGACY_KEY = '@user'; // Old key for migration
const PRODUCT_CACHE_KEY = '@product_catalog';

export function sanitizeUserSession(userData) {
  if (!userData || typeof userData !== 'object') return userData;

  const discountType = String(userData.discountType || userData.discount_type || '').trim();
  const discountPercentage = Number(userData.discountPercentage ?? userData.discount_percentage ?? 0);
  const hasActiveDiscount =
    discountType &&
    Number.isFinite(discountPercentage) &&
    discountPercentage > 0 &&
    discountPercentage < 100;

  return {
    ...userData,
    discountType: hasActiveDiscount ? discountType : null,
    discountPercentage: hasActiveDiscount ? discountPercentage : 0,
  };
}

const getDiscountSignature = (userData) => {
  const sanitized = sanitizeUserSession(userData) || {};
  return `${sanitized.discountType || 'none'}:${Number(sanitized.discountPercentage) || 0}`;
};

/**
 * Store auth token securely and user data in AsyncStorage
 */
export async function storeUserSession(userData) {
  try {
    if (!userData) return;

    const sanitizedUserData = sanitizeUserSession(userData);
    
    const token = sanitizedUserData.token;
    const profileData = { ...sanitizedUserData };
    delete profileData.token;
    
    if (token) {
      try {
        await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
      } catch (secureErr) {
        log.error('SecureStore write failed, aborting session store', secureErr?.message || secureErr);
        return;
      }
    }
    
    const previousRaw = await AsyncStorage.getItem(USER_DATA_KEY);
    let previousProfile = null;
    try {
      previousProfile = previousRaw ? JSON.parse(previousRaw) : null;
    } catch {
      previousProfile = null;
    }
    const discountChanged = previousProfile && getDiscountSignature(previousProfile) !== getDiscountSignature(profileData);

    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profileData));
    await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(profileData));

    if (discountChanged) {
      await AsyncStorage.removeItem(PRODUCT_CACHE_KEY).catch(() => {});
      log.debug('Product cache cleared after user discount changed');
    }
    
    log.debug('User session stored securely');
  } catch (error) {
    log.error('Failed to store user session', error?.message || error);
  }
}

/**
 * Retrieve the complete user session (token from SecureStore + data from AsyncStorage)
 */
export async function getUserSession() {
  try {
    // Independent reads - run in parallel. SecureStore (encrypted) is slower
    // than AsyncStorage, so serializing them added ~50-150ms to cold-start
    // auth restore for no reason.
    const [token, profileRaw] = await Promise.all([
      SecureStore.getItemAsync(SECURE_TOKEN_KEY),
      AsyncStorage.getItem(USER_DATA_KEY),
    ]);
    
    if (token && profileRaw) {
      const profileData = JSON.parse(profileRaw);
      return sanitizeUserSession({ ...profileData, token });
    }
    
    // Migration: check legacy key
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacyData = JSON.parse(legacyRaw);
      if (legacyData && legacyData.token) {
        log.info('Migrating legacy session to secure storage');
        await storeUserSession(legacyData);
        await AsyncStorage.removeItem(LEGACY_KEY).catch(() => {});
        return sanitizeUserSession(legacyData);
      }
      return sanitizeUserSession(legacyData);
    }
    
    return null;
  } catch (error) {
    log.error('Failed to retrieve user session', error?.message || error);
    // Fallback: try legacy key
    try {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
      return legacyRaw ? sanitizeUserSession(JSON.parse(legacyRaw)) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Get just the auth token (fast path for API calls)
 */
export async function getSecureToken() {
  try {
    const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    if (token) return token;
    
    // Fallback to legacy
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const data = JSON.parse(legacyRaw);
      return data?.token || null;
    }
    return null;
  } catch (error) {
    log.error('Failed to get secure token', error?.message || error);
    return null;
  }
}

/**
 * Clear all session data
 */
export async function clearUserSession() {
  try {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    await AsyncStorage.removeItem(LEGACY_KEY);
    log.debug('User session cleared');
  } catch (error) {
    log.error('Failed to clear user session', error?.message || error);
    // Best effort: try to clear what we can
    try {
      await AsyncStorage.removeItem(LEGACY_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch {}
  }
}

/**
 * Update just the token (after refresh)
 */
export async function updateSecureToken(newToken) {
  try {
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, newToken);
    
    // Ensure legacy key doesn't contain the token
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const data = JSON.parse(legacyRaw);
      delete data.token;
      await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(data));
    }
    
    log.debug('Secure token updated');
  } catch (error) {
    log.error('Failed to update secure token', error?.message || error);
  }
}

export default {
  storeUserSession,
  getUserSession,
  getSecureToken,
  clearUserSession,
  updateSecureToken,
};
