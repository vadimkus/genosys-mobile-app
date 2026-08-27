/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and fingerprint authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import { createLogger } from '../utils/logger';

const log = createLogger('biometric');

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

// Stored payload versions:
// - v1: { email, password } (legacy)
// - v2: { email, token } (preferred; avoids breaking Face ID after password changes)
const BIOMETRIC_PAYLOAD_VERSION = 2;

/**
 * Check if biometric authentication is available on device
 * @returns {Promise<Object>} Availability info
 */
export const checkBiometricSupport = async () => {
  try {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    const biometricTypes = supportedTypes.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris Recognition';
        default:
          return 'Biometric';
      }
    });

    return {
      isAvailable,
      isEnrolled,
      supportedTypes: biometricTypes,
      primaryType: biometricTypes[0] || 'Biometric',
    };
  } catch (error) {
    log.error('Error checking biometric support', error?.message || error);
    return {
      isAvailable: false,
      isEnrolled: false,
      supportedTypes: [],
      primaryType: null,
    };
  }
};

/**
 * Derive the display name from an already-fetched support object.
 * Lets callers avoid a second checkBiometricSupport() round-trip.
 * @param {Object} support - result of checkBiometricSupport()
 * @returns {string} Biometric type name
 */
export const biometricTypeNameFromSupport = (support) =>
  support?.primaryType || 'Biometric Authentication';

/**
 * Get the biometric type name for UI display
 * @returns {Promise<string>} Biometric type name
 */
export const getBiometricTypeName = async () => {
  const support = await checkBiometricSupport();
  return biometricTypeNameFromSupport(support);
};

/**
 * Check if user has biometric authentication enabled
 * @returns {Promise<boolean>} Whether biometric auth is enabled
 */
export const isBiometricEnabled = async () => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    log.error('Error checking if biometric is enabled', error?.message || error);
    return false;
  }
};

/**
 * Enable biometric authentication for user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Success result
 */
export const enableBiometricAuth = async (emailOrPayload, password) => {
  try {
    const payload =
      emailOrPayload && typeof emailOrPayload === 'object'
        ? emailOrPayload
        : { email: emailOrPayload, password };
    const email = String(payload?.email || '').trim();
    const token = payload?.token ? String(payload.token) : '';
    const pwd = payload?.password ? String(payload.password) : '';

    if (!email) {
      return { success: false, error: 'Email is required to enable biometric authentication' };
    }

    const support = await checkBiometricSupport();
    
    if (!support.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device'
      };
    }

    if (!support.isEnrolled) {
      const setupLabel = Platform.OS === 'ios' ? 'Face ID or Touch ID' : 'fingerprint or biometric authentication';
      return {
        success: false,
        error: `No biometric data is enrolled on this device. Please set up ${setupLabel} in Settings.`
      };
    }

    // Authenticate user first to enable biometric
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: `Enable ${support.primaryType}`,
      subtitle: 'Authenticate to enable biometric login',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
    });

    if (authResult.success) {
      // Store payload securely (prefer token to avoid password drift).
      const credentials = JSON.stringify(
        token
          ? { v: BIOMETRIC_PAYLOAD_VERSION, email, token }
          : { v: 1, email, password: pwd }
      );
      await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      
      return {
        success: true,
        message: `${support.primaryType} enabled successfully`
      };
    } else {
      return {
        success: false,
        error: authResult.error || 'Authentication failed'
      };
    }
  } catch (error) {
    log.error('Error enabling biometric auth', error?.message || error);
    return {
      success: false,
      error: 'Failed to enable biometric authentication'
    };
  }
};

/**
 * Silently upgrade an existing v1 {email, password} biometric payload to the
 * v2 {email, token} format WITHOUT re-prompting Face ID/Touch ID - used right
 * after a successful biometric login where the user just authenticated.
 * Purges the stored plaintext password.
 */
export const upgradeBiometricPayloadToToken = async (email, token) => {
  try {
    const cleanEmail = String(email || '').trim();
    const cleanToken = String(token || '').trim();
    if (!cleanEmail || !cleanToken) return { success: false };

    const credentials = JSON.stringify({ v: BIOMETRIC_PAYLOAD_VERSION, email: cleanEmail, token: cleanToken });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    log.info('Biometric payload upgraded to v2 (token) - stored password purged');
    return { success: true };
  } catch (error) {
    log.error('Failed to upgrade biometric payload', error?.message || error);
    return { success: false };
  }
};

/**
 * Disable biometric authentication
 * @returns {Promise<Object>} Success result
 */
export const disableBiometricAuth = async () => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    
    return {
      success: true,
      message: 'Biometric authentication disabled'
    };
  } catch (error) {
    log.error('Error disabling biometric auth', error?.message || error);
    return {
      success: false,
      error: 'Failed to disable biometric authentication'
    };
  }
};

/**
 * Authenticate user with biometrics
 * @returns {Promise<Object>} Authentication result with credentials
 */
export const authenticateWithBiometrics = async () => {
  try {
    const support = await checkBiometricSupport();
    
    if (!support.isAvailable || !support.isEnrolled) {
      return {
        success: false,
        error: 'Biometric authentication not available'
      };
    }

    // Check if biometric auth is enabled for user
    const isEnabled = await isBiometricEnabled();
    if (!isEnabled) {
      return {
        success: false,
        error: 'Biometric authentication not enabled'
      };
    }

    // Authenticate with biometrics
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login with ${support.primaryType}`,
      subtitle: 'Use biometric authentication to login',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
    });

    if (authResult.success) {
      // Retrieve stored credentials
      const credentialsString = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      
      if (credentialsString) {
        const credentials = JSON.parse(credentialsString);
        return {
          success: true,
          credentials,
          message: 'Biometric authentication successful'
        };
      } else {
        return {
          success: false,
          error: 'No stored credentials found'
        };
      }
    } else {
      return {
        success: false,
        error: authResult.error || 'Authentication cancelled'
      };
    }
  } catch (error) {
    log.error('Error authenticating with biometrics', error?.message || error);
    return {
      success: false,
      error: 'Biometric authentication failed'
    };
  }
};

/**
 * Show biometric authentication prompt with custom message
 * @param {string} message - Custom prompt message
 * @param {string} subtitle - Custom subtitle
 * @returns {Promise<Object>} Authentication result
 */
export const promptBiometricAuth = async (message = 'Authenticate', subtitle = 'Use biometric authentication') => {
  try {
    const support = await checkBiometricSupport();
    
    if (!support.isAvailable || !support.isEnrolled) {
      return {
        success: false,
        error: 'Biometric authentication not available'
      };
    }

    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: message,
      subtitle: subtitle,
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
    });

    return {
      success: authResult.success,
      error: authResult.error || (authResult.success ? null : 'Authentication failed')
    };
  } catch (error) {
    log.error('Error in biometric prompt', error?.message || error);
    return {
      success: false,
      error: 'Biometric authentication failed'
    };
  }
};

/**
 * Debug biometric status - helpful for troubleshooting
 * @returns {Promise<Object>} Debug information
 */
export const debugBiometricStatus = async () => {
  try {
    const support = await checkBiometricSupport();
    const enabled = await isBiometricEnabled();
    const credentialsExist = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    
    return {
      support,
      enabled,
      hasStoredCredentials: !!credentialsExist,
      credentialsPreview: credentialsExist ? 'Present' : 'Missing'
    };
  } catch (error) {
    return {
      error: error.message,
      support: null,
      enabled: false,
      hasStoredCredentials: false
    };
  }
};

/**
 * Test biometric authentication without login
 * Useful for debugging Face ID/Touch ID issues
 * @returns {Promise<Object>} Test result
 */
export const testBiometricAuth = async () => {
  try {
    const support = await checkBiometricSupport();
    
    if (!support.isAvailable || !support.isEnrolled) {
      return {
        success: false,
        error: 'Biometric authentication not available or not enrolled'
      };
    }

    const authOptions = {
      promptMessage: `Test ${support.primaryType}`,
      subtitle: 'Testing biometric authentication functionality',
      cancelLabel: 'Cancel',
    };
    
    // For Face ID, we want to avoid any fallback that might trigger password
    if (support.primaryType === 'Face ID') {
      authOptions.disableDeviceFallback = true;
    } else {
      authOptions.fallbackLabel = 'Use Passcode';
      authOptions.disableDeviceFallback = false;
    }
    
    const authResult = await LocalAuthentication.authenticateAsync(authOptions);
    
    return {
      success: authResult.success,
      error: authResult.error || (authResult.success ? null : 'Authentication test failed'),
      warning: authResult.warning,
      biometricType: support.primaryType
    };
  } catch (error) {
    log.error('Biometric test error', error?.message || error);
    return {
      success: false,
      error: `Test failed: ${error.message}`
    };
  }
};

/**
 * Handle biometric setup flow with user prompts
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Setup result
 */
export const setupBiometricAuth = async (email, password) => {
  try {
    const support = await checkBiometricSupport();
    
    if (!support.isAvailable) {
      Alert.alert(
        'Not Available',
        'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      return { success: false };
    }

    if (!support.isEnrolled) {
      Alert.alert(
        'Setup Required',
        `Please set up ${support.primaryType} in your device Settings first.`,
        [{ text: 'OK' }]
      );
      return { success: false };
    }

    // Show confirmation dialog
    return new Promise((resolve) => {
      Alert.alert(
        `Enable ${support.primaryType}?`,
        `Would you like to enable ${support.primaryType} for quick and secure login?`,
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve({ success: false })
          },
          {
            text: 'Enable',
            onPress: async () => {
              // Prefer storing token-based auth if provided via object payload.
              const result = await enableBiometricAuth(
                email && typeof email === 'object' ? email : { email, password }
              );
              if (result.success) {
                Alert.alert(
                  'Success!',
                  `${support.primaryType} has been enabled for your account.`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Error',
                  result.error || 'Failed to enable biometric authentication',
                  [{ text: 'OK' }]
                );
              }
              resolve(result);
            }
          }
        ]
      );
    });
  } catch (error) {
    log.error('Error in biometric setup', error?.message || error);
    return {
      success: false,
      error: 'Failed to setup biometric authentication'
    };
  }
};

export default {
  checkBiometricSupport,
  getBiometricTypeName,
  isBiometricEnabled,
  enableBiometricAuth,
  disableBiometricAuth,
  authenticateWithBiometrics,
  promptBiometricAuth,
  setupBiometricAuth,
  debugBiometricStatus,
  testBiometricAuth,
};