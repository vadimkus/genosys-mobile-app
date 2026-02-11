/**
 * Expo Updates (OTA) Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install: npx expo install expo-updates
 * 2. Add to app.json:
 *    "updates": {
 *      "url": "https://u.expo.dev/YOUR_PROJECT_ID",
 *      "enabled": true,
 *      "checkAutomatically": "ON_LOAD",
 *      "fallbackToCacheTimeout": 5000
 *    },
 *    "runtimeVersion": { "policy": "appVersion" }
 * 3. Configure EAS Update: eas update:configure
 * 4. Publish updates: eas update --branch production
 * 
 * This file provides a safe wrapper for expo-updates that
 * handles the case where the module isn't installed yet.
 */

import { createLogger } from '../utils/logger';

const log = createLogger('Updates');

/**
 * Check for and apply OTA updates.
 * Safe to call even if expo-updates is not installed.
 * 
 * @returns {Promise<{hasUpdate: boolean, manifest?: object}>}
 */
export async function checkForUpdates() {
  try {
    const Updates = await import('expo-updates');
    
    // Don't check in dev mode (updates only work in production builds)
    if (__DEV__) {
      log.debug('Skipping update check in development');
      return { hasUpdate: false };
    }
    
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      log.info('Update available, downloading...');
      await Updates.fetchUpdateAsync();
      log.info('Update downloaded, will apply on next restart');
      return { hasUpdate: true, manifest: update.manifest };
    }
    
    log.debug('App is up to date');
    return { hasUpdate: false };
  } catch (error) {
    // expo-updates not installed or not configured
    log.debug('Update check skipped:', error?.message);
    return { hasUpdate: false };
  }
}

/**
 * Apply a downloaded update by reloading the app.
 * Only call this after a successful fetchUpdateAsync().
 */
export async function applyUpdate() {
  try {
    const Updates = await import('expo-updates');
    if (!__DEV__) {
      await Updates.reloadAsync();
    }
  } catch (error) {
    log.error('Failed to apply update', error?.message);
  }
}

export default { checkForUpdates, applyUpdate };
