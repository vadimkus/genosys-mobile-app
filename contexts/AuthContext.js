import React, { createContext, useState, useContext, useEffect } from 'react';
// Using direct Google OAuth implementation instead of expo-auth-session
import { 
  loginWithEmail as apiLoginWithEmail, 
  registerUser as apiRegisterUser,
  processGoogleAuth as apiProcessGoogleAuth,
  processAppleAuth as apiProcessAppleAuth,
  validateSession as apiValidateSession,
  updateUserProfile as apiUpdateUserProfile,
  logoutUser as apiLogoutUser,
  deleteUserAccount as apiDeleteUserAccount
} from '../services/authService';
import {
  updateUserProfile as dbUpdateUserProfile,
  uploadProfilePicture,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../services/databaseService';
import {
  checkBiometricSupport,
  biometricTypeNameFromSupport,
  isBiometricEnabled,
  enableBiometricAuth,
  disableBiometricAuth,
  authenticateWithBiometrics,
  setupBiometricAuth,
  upgradeBiometricPayloadToToken,
  debugBiometricStatus,
  testBiometricAuth
} from '../services/biometricService';
import { loginWithGoogleDirect } from '../services/googleAuthService';
import { createLogger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnAuthExpired, refreshToken, persistRefreshedToken } from '../services/authFetch';
import { clearPushTokenOnBackend, registerForPushNotificationsAsync, savePushTokenToBackend, saveLiveActivityToken } from '../services/pushNotificationsService';
import { registerTokens as registerLiveActivityTokens } from '../utils/orderLiveActivity';
import { storeUserSession, getUserSession, clearUserSession, sanitizeUserSession } from '../services/secureTokenStorage';
import { setSentryUser } from '../config/sentry';

const AuthContext = createContext({});
const log = createLogger('Auth');

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric Authentication');

  // Using direct Google OAuth instead of expo-auth-session to avoid "Expo" branding

  // Register the auth-expired callback so authFetch can trigger logout on 401
  useEffect(() => {
    setOnAuthExpired(() => {
      log.warn('Auth expired callback triggered - logging out user');
      // Clear stored session and reset user state
      clearUserSession().catch(() => {});
      setUser(null);
    });
  }, []);

  // Check for stored authentication and biometric setup on app launch
  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    setSentryUser(user);
  }, [user]);

  // Push notifications are ON by default: once a session exists, register the
  // device token automatically unless the user explicitly opted out in Profile
  // ('@genosys_push_enabled' === '0'). Re-runs on each launch, which also keeps
  // the backend token fresh. The OS permission dialog still appears once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.token) return;
      try {
        const pref = await AsyncStorage.getItem('@genosys_push_enabled');
        if (pref === '0') return; // user opted out — respect it
        const reg = await registerForPushNotificationsAsync();
        if (cancelled || !reg?.success || !reg?.token) return;
        const saved = await savePushTokenToBackend(user.token, reg.token);
        if (!cancelled && saved?.success !== false) {
          await AsyncStorage.setItem('@genosys_push_enabled', '1');
          log.debug('Push notifications auto-enabled');
        }
      } catch (e) {
        log.warn('Push auto-enable failed', e?.message || e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.token]);

  // ActivityKit's push-to-start token, which is a different thing from the device token
  // above: it is the only one that can raise a Lock Screen order card while the app is
  // not running. iOS only, and a no-op on builds without the widget extension.
  useEffect(() => {
    if (!user?.token) return undefined;
    const authToken = user.token;
    return registerLiveActivityTokens((payload) =>
      saveLiveActivityToken(authToken, payload)
    );
  }, [user?.token]);

  const initializeAuth = async () => {
    await checkBiometricAvailability();
    await checkStoredAuth();
  };

  const checkBiometricAvailability = async () => {
    try {
      // Run the independent reads in parallel. getBiometricTypeName() derives
      // from the same hardware support, so compute the name from `support`
      // instead of calling checkBiometricSupport() a second time.
      const [support, enabled] = await Promise.all([
        checkBiometricSupport(),
        isBiometricEnabled(),
      ]);
      const typeName = biometricTypeNameFromSupport(support);
      
      setBiometricAvailable(support.isAvailable && support.isEnrolled);
      setBiometricEnabled(enabled);
      setBiometricType(typeName);
      
      log.debug('Biometric support', {
        available: support.isAvailable,
        enrolled: support.isEnrolled,
        enabled,
        type: typeName,
      });
    } catch (error) {
      log.error('Error checking biometric availability', error?.message || error);
    }
  };

  // Using direct Google OAuth implementation (no useEffect needed)

  const checkStoredAuth = async () => {
    try {
      // First, check if biometric auth is enabled and try auto-login
      const biometricEnabled = await isBiometricEnabled();
      if (biometricEnabled) {
        log.debug('Attempting biometric auto-login...');
        // Don't show biometric prompt on app start, just check for stored session
        // User can manually use biometric login from login screen
      }
      
      const userData = await getUserSession();
      if (userData) {
        
        // Validate session with server if we have a token
        if (userData.token) {
          const validation = await apiValidateSession(userData.token);
          if (validation.success && validation.valid) {
            // If the endpoint is unavailable (or network issue), keep the stored user/token.
            // If the server returned a fresh user, merge it but always preserve the token.
            const mergedUser = validation.user
              ? { ...validation.user, token: userData.token }
              : userData;
            const sanitizedUser = sanitizeUserSession(mergedUser);
            setUser(sanitizedUser);
            await storeUserSession(sanitizedUser);
            // Note: biometric availability was already resolved in
            // initializeAuth() → checkBiometricAvailability() before this ran.
            // Hardware capability can't change mid-session, so we don't re-run it.
          } else if (validation.success && validation.valid === false) {
            // Session expired, clear stored data
            await clearUserSession();
            setUser(null);
          } else {
            // Validation failed for other reasons: keep stored session to avoid forced logout loops.
            setUser(sanitizeUserSession(userData));
          }
        } else {
          setUser(sanitizeUserSession(userData));
        }
      }
    } catch (error) {
      log.error('Error checking stored auth', error?.message || error);
      await clearUserSession(); // Clear corrupted data
    } finally {
      setLoading(false);
    }
  };


  /**
   * Attempt to silently refresh the current JWT token.
   * Returns the new token on success, or null on failure (which also logs out).
   */
  const refreshSession = async () => {
    const currentToken = user?.token;
    if (!currentToken) {
      log.warn('refreshSession: no token to refresh');
      return null;
    }

    try {
      const result = await refreshToken(currentToken);
      if (result && result.token) {
        const updatedUser = await persistRefreshedToken(result);
        if (updatedUser) {
          setUser(sanitizeUserSession(updatedUser));
          log.info('Session refreshed successfully');
          return result.token;
        }
      }

      // Refresh failed - force logout
      log.warn('refreshSession: refresh failed, logging out');
      await clearUserSession();
      setUser(null);
      return null;
    } catch (error) {
      log.error('refreshSession error', error?.message || error);
      await clearUserSession();
      setUser(null);
      return null;
    }
  };

  const loginWithGoogle = async () => {
    try {
      log.debug('Starting direct Google OAuth...');
      
      // Use direct Google OAuth (bypasses Expo development proxy)
      // This will show "Genosys Middle East FZ-LLC" instead of "Expo"
      const result = await loginWithGoogleDirect();
      
      if (result.success) {
        log.debug('Got Google ID token; authenticating with backend...');
        
        // Process with your existing backend using ID token
        const authResult = await apiProcessGoogleAuth(result.idToken);
        
        if (authResult.success) {
          const sanitizedUser = sanitizeUserSession(authResult.user);
          await storeUserSession(sanitizedUser);
          setUser(sanitizedUser);
          
          if (authResult.isNewUser) {
            log.debug('New Google user created successfully');
          } else {
            log.debug('Existing Google user logged in');
          }
          
          return { success: true };
        } else {
          return { success: false, error: authResult.error };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      log.error('Google login error', error?.message || error);
      
      return { 
        success: false, 
        error: 'Google authentication failed. Please try email & password login.' 
      };
    }
  };

  const loginWithApple = async ({ identityToken, fullName } = {}) => {
    try {
      setLoading(true);
      const result = await apiProcessAppleAuth(identityToken, { fullName });
      if (result.success) {
        const sanitizedUser = sanitizeUserSession(result.user);
        await storeUserSession(sanitizedUser);
        setUser(sanitizedUser);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      log.error('Apple login error', error?.message || error);
      return { success: false, error: 'Apple authentication failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      
      const result = await apiLoginWithEmail(String(email || '').trim(), password);
      
      if (result.success) {
        const sanitizedUser = sanitizeUserSession(result.user);
        await storeUserSession(sanitizedUser);
        setUser(sanitizedUser);
        
        // Offer biometric setup after successful login (if available and not enabled)
        if (biometricAvailable && !biometricEnabled) {
          // Don't await this - let it run in background
          setTimeout(() => {
            setupBiometricAfterLogin(email, password, result.user?.token);
          }, 1000); // Wait 1 second after login
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      log.error('Email login error', error?.message || error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, extra = {}) => {
    try {
      setLoading(true);
      
      const result = await apiRegisterUser(name, String(email || '').trim(), password, extra);
      
      if (result.success) {
        const sanitizedUser = sanitizeUserSession(result.user);
        await storeUserSession(sanitizedUser);
        setUser(sanitizedUser);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      log.error('Registration error', error?.message || error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithBiometrics = async () => {
    try {
      setLoading(true);
      
      const result = await authenticateWithBiometrics();
      
      if (result.success) {
        const creds = result.credentials || {};

        // Preferred: token-based biometric unlock (survives password changes)
        if (creds.token) {
          const token = String(creds.token);
          const validation = await apiValidateSession(token);
          if (validation.success && validation.valid) {
            const baseUser = validation.user && typeof validation.user === 'object' ? validation.user : {};
            const userWithToken = {
              ...baseUser,
              token,
              // ensure we keep an email if biometric v2 stored it
              email: baseUser.email || creds.email || baseUser.userEmail || '',
              authType: baseUser.authType || 'biometric',
            };
            const sanitizedUser = sanitizeUserSession(userWithToken);
            await storeUserSession(sanitizedUser);
            setUser(sanitizedUser);
            return { success: true };
          }

          // Token expired/invalid: require manual login + re-enroll biometrics
          await disableBiometricAuth();
          setBiometricEnabled(false);
          return {
            success: false,
            error: 'Session expired. Please sign in with password and enable Face ID again.',
          };
        }

        // Legacy: email/password stored (may fail if password changed)
        if (creds.email && creds.password) {
          const loginResult = await apiLoginWithEmail(creds.email, creds.password);
          if (loginResult.success) {
            const sanitizedUser = sanitizeUserSession(loginResult.user);
            await storeUserSession(sanitizedUser);
            setUser(sanitizedUser);
            // Upgrade v1 payload to v2 {email, token} and purge the stored
            // plaintext password (user just passed Face ID — no re-prompt).
            if (sanitizedUser?.token) {
              upgradeBiometricPayloadToToken(creds.email, sanitizedUser.token).catch(() => {});
            }
            return { success: true };
          }

          // Disable biometrics to avoid repeated failure loops
          await disableBiometricAuth();
          setBiometricEnabled(false);
          return {
            success: false,
            error: 'Face ID needs to be re-enabled. Please sign in with password and enable Face ID again.',
          };
        }

        await disableBiometricAuth();
        setBiometricEnabled(false);
        return { success: false, error: 'Biometric login is not configured. Please sign in and enable Face ID.' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      log.error('Biometric login error', error?.message || error);
      return { success: false, error: 'Biometric authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const enableBiometric = async (email, password) => {
    try {
      // Prefer the live session token so we never store a plaintext password.
      const sessionToken = user?.token || '';
      const payload = sessionToken
        ? { email: email || user?.email || '', token: sessionToken }
        : { email, password };
      const result = await enableBiometricAuth(payload);
      if (result.success) {
        setBiometricEnabled(true);
      }
      return result;
    } catch (error) {
      log.error('Enable biometric error', error?.message || error);
      return { success: false, error: 'Failed to enable biometric authentication' };
    }
  };

  const disableBiometric = async () => {
    try {
      const result = await disableBiometricAuth();
      if (result.success) {
        setBiometricEnabled(false);
      }
      return result;
    } catch (error) {
      log.error('Disable biometric error', error?.message || error);
      return { success: false, error: 'Failed to disable biometric authentication' };
    }
  };

  const setupBiometricAfterLogin = async (email, password, token) => {
    try {
      // Only offer setup if biometrics are available but not enabled
      if (biometricAvailable && !biometricEnabled) {
        // Token-based storage only — never persist a plaintext password.
        // (Every successful login returns a token; if it's somehow missing,
        // skip setup rather than fall back to storing the password.)
        if (!token) {
          log.warn('Biometric setup skipped: no auth token available');
          return { success: false, error: 'Biometric setup not available' };
        }
        const result = await setupBiometricAuth({ email, token });
        if (result.success) {
          setBiometricEnabled(true);
        }
        return result;
      }
      return { success: false, error: 'Biometric setup not available' };
    } catch (error) {
      log.error('Biometric setup error', error?.message || error);
      return { success: false, error: 'Failed to setup biometric authentication' };
    }
  };

  const logout = async () => {
    try {
      if (user?.token) {
        // Clear the push token server-side FIRST — otherwise the next user
        // on this device could receive the previous user's order pushes.
        await clearPushTokenOnBackend(user.token).catch((e) =>
          log.warn('Push token clear on logout failed', e?.message || e)
        );
        // Logout from server
        await apiLogoutUser(user.token);
      }
      
      await clearUserSession();
      setUser(null);
      return { success: true };
    } catch (error) {
      log.error('Logout error', error?.message || error);
      // Still complete logout locally even if server logout fails
      await clearUserSession();
      setUser(null);
      return { success: true };
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user?.token) return { success: false, error: 'Unauthorized' };
      setLoading(true);
      const result = await apiDeleteUserAccount(user.token);
      // Always log out locally after successful delete.
      if (result.success) {
        await clearUserSession();
        setUser(null);
      }
      return result;
    } catch (error) {
      log.error('Delete account error', error?.message || error);
      return { success: false, error: 'Could not delete account' };
    } finally {
      setLoading(false);
    }
  };

  const debugBiometric = async () => {
    const debug = await debugBiometricStatus();
    log.debug('Biometric debug info', debug);
    return debug;
  };

  const testBiometric = async () => {
    const test = await testBiometricAuth();
    log.debug('Biometric test result', test);
    return test;
  };

  const updateProfile = async (profileData) => {
    try {
      log.debug('updateProfile called', { hasUser: !!user, hasToken: !!user?.token });
      
      if (!user) {
        log.error('User is null/undefined - authentication required');
        return { success: false, error: 'Please log in to update your profile' };
      }
      
      // Resolve the auth token into a local variable — `setUser` does not update
      // the `user` value captured by this closure, so relying on `user.token`
      // after a storage-restore meant the API calls below fired with no token.
      let authToken = user.token || '';
      if (!authToken) {
        log.error('User token is missing - re-authentication required');
        // Try to get token from storage as fallback
        try {
          const storedData = await getUserSession();
          if (storedData?.token) {
            log.debug('Found token in storage, attempting to restore session...');
            authToken = storedData.token;
            setUser(sanitizeUserSession({ ...user, token: authToken }));
          } else {
            return { success: false, error: 'Authentication session expired. Please log in again.' };
          }
        } catch (error) {
          log.error('Failed to retrieve token from storage', error?.message || error);
          return { success: false, error: 'Authentication session expired. Please log in again.' };
        }
      }

      // Handle profile picture upload if present
      let imageUrl = profileData.profilePicture;
      if (profileData.profilePicture && profileData.profilePicture.startsWith('file://')) {
        log.debug('Uploading profile picture...');
        const uploadResult = await uploadProfilePicture(authToken, profileData.profilePicture);
        if (uploadResult.success) {
          imageUrl = uploadResult.imageUrl;
        } else {
          log.warn('Profile picture upload failed, proceeding without image');
          imageUrl = null;
        }
      }

      // Update profile data with uploaded image URL
      const updatedProfileData = {
        ...profileData,
        profilePicture: imageUrl
      };

      // Update profile in database
      const result = await dbUpdateUserProfile(authToken, updatedProfileData);
      
      if (result.success) {
        // dbUpdateUserProfile -> apiRequest() returns:
        // { success: true, data: <raw backend json> }
        // Backend returns: { success: true, data: { ...userProfile } }
        const serverUser =
          result?.user ||
          result?.data?.user ||
          result?.data?.data ||
          null;

        // Update user in context and storage, preserving the token
        const updatedUser = sanitizeUserSession({ 
          ...user, 
          ...(serverUser || {}),
          token: authToken  // Always preserve the token
        });
        setUser(updatedUser);
        await storeUserSession(updatedUser);
        log.debug('User profile updated (token preserved)');
      }
      
      // Normalize return shape for callers that expect `result.user`
      if (result?.success) {
        const normalizedUser =
          result?.user ||
          result?.data?.user ||
          result?.data?.data ||
          undefined;
        return { ...result, user: normalizedUser };
      }
      return result;
    } catch (error) {
      log.error('Profile update error', error?.message || error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Address management functions
  const getAddresses = async () => {
    try {
      if (!user?.token) {
        return { success: false, error: 'No authentication token found' };
      }
      return await getUserAddresses(user.token);
    } catch (error) {
      log.error('Get addresses error', error?.message || error);
      return { success: false, error: 'Failed to load addresses' };
    }
  };

  const addAddress = async (addressData) => {
    try {
      if (!user?.token) {
        return { success: false, error: 'No authentication token found' };
      }
      
      const result = await createAddress(user.token, addressData);
      log.debug('Address created');
      return result;
    } catch (error) {
      log.error('Add address error', error?.message || error);
      return { success: false, error: 'Failed to add address' };
    }
  };

  const editAddress = async (addressId, addressData) => {
    try {
      if (!user?.token) {
        return { success: false, error: 'No authentication token found' };
      }
      
      const result = await updateAddress(user.token, addressId, addressData);
      log.debug('Address updated');
      return result;
    } catch (error) {
      log.error('Edit address error', error?.message || error);
      return { success: false, error: 'Failed to update address' };
    }
  };

  const removeAddress = async (addressId) => {
    try {
      if (!user?.token) {
        return { success: false, error: 'No authentication token found' };
      }
      
      const result = await deleteAddress(user.token, addressId);
      log.debug('Address deleted');
      return result;
    } catch (error) {
      log.error('Remove address error', error?.message || error);
      return { success: false, error: 'Failed to delete address' };
    }
  };

  const setAddressAsDefault = async (addressId) => {
    try {
      if (!user?.token) {
        return { success: false, error: 'No authentication token found' };
      }
      
      const result = await setDefaultAddress(user.token, addressId);
      log.debug('Default address set');
      return result;
    } catch (error) {
      log.error('Set default address error', error?.message || error);
      return { success: false, error: 'Failed to set default address' };
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithApple,
    loginWithEmail,
    loginWithBiometrics,
    register,
    logout,
    deleteAccount,
    isAuthenticated: !!user,
    refreshSession,
    // Biometric authentication
    biometricAvailable,
    biometricEnabled,
    biometricType,
    enableBiometric,
    disableBiometric,
    setupBiometricAfterLogin,
    debugBiometric,
    testBiometric,
    updateProfile,
    // Address management
    getAddresses,
    addAddress,
    editAddress,
    removeAddress,
    setAddressAsDefault,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
