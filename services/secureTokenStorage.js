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

/**
 * Store auth token securely and user data in AsyncStorage
 */
export async function storeUserSession(userData) {
  try {
    if (!userData) return;
    
    const token = userData.token;
    const profileData = { ...userData };
    delete profileData.token; // Don't store token in AsyncStorage
    
    // Store token in SecureStore (encrypted)
    if (token) {
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
    }
    
    // Store non-sensitive user data in AsyncStorage
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(profileData));
    
    // Also write to legacy key for backward compatibility during transition
    await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(userData));
    
    log.debug('User session stored securely');
  } catch (error) {
    log.error('Failed to store user session', error?.message || error);
    // Fallback: store everything in AsyncStorage if SecureStore fails
    try {
      await AsyncStorage.setItem(LEGACY_KEY, JSON.stringify(userData));
      log.warn('Fell back to AsyncStorage for full session');
    } catch (fallbackError) {
      log.error('Fallback storage also failed', fallbackError?.message);
    }
  }
}

/**
 * Retrieve the complete user session (token from SecureStore + data from AsyncStorage)
 */
export async function getUserSession() {
  try {
    // Try secure storage first
    const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    const profileRaw = await AsyncStorage.getItem(USER_DATA_KEY);
    
    if (token && profileRaw) {
      const profileData = JSON.parse(profileRaw);
      return { ...profileData, token };
    }
    
    // Migration: check legacy key
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacyData = JSON.parse(legacyRaw);
      if (legacyData && legacyData.token) {
        log.info('Migrating legacy session to secure storage');
        await storeUserSession(legacyData);
        return legacyData;
      }
      return legacyData;
    }
    
    return null;
  } catch (error) {
    log.error('Failed to retrieve user session', error?.message || error);
    // Fallback: try legacy key
    try {
      const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
      return legacyRaw ? JSON.parse(legacyRaw) : null;
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
    
    // Also update legacy key for backward compatibility
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const data = JSON.parse(legacyRaw);
      data.token = newToken;
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
