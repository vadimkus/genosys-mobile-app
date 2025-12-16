import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  getBiometricTypeName,
  isBiometricEnabled,
  enableBiometricAuth,
  disableBiometricAuth,
  authenticateWithBiometrics,
  setupBiometricAuth,
  debugBiometricStatus,
  testBiometricAuth
} from '../services/biometricService';
import { loginWithGoogleDirect } from '../services/googleAuthService';
import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';

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

  // Check for stored authentication and biometric setup on app launch
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    await checkBiometricAvailability();
    await checkStoredAuth();
  };

  const checkBiometricAvailability = async () => {
    try {
      const support = await checkBiometricSupport();
      const enabled = await isBiometricEnabled();
      const typeName = await getBiometricTypeName();
      
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
      
      const storedUser = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Validate session with server if we have a token
        if (userData.token) {
          const validation = await apiValidateSession(userData.token);
          if (validation.success && validation.valid) {
            // If the endpoint is unavailable (or network issue), keep the stored user/token.
            // If the server returned a fresh user, merge it but always preserve the token.
            const mergedUser = validation.user
              ? { ...validation.user, token: userData.token }
              : userData;
            setUser(mergedUser);
            await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(mergedUser));
            await checkBiometricAvailability();
          } else if (validation.success && validation.valid === false) {
            // Session expired, clear stored data
            await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
            setUser(null);
          } else {
            // Validation failed for other reasons: keep stored session to avoid forced logout loops.
            setUser(userData);
          }
        } else {
          setUser(userData);
        }
      }
    } catch (error) {
      log.error('Error checking stored auth', error?.message || error);
      await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY); // Clear corrupted data
    } finally {
      setLoading(false);
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
          await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(authResult.user));
          setUser(authResult.user);
          
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
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(result.user));
        setUser(result.user);
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
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(result.user));
        setUser(result.user);
        
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

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      const result = await apiRegisterUser(name, String(email || '').trim(), password);
      
      if (result.success) {
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(result.user));
        setUser(result.user);
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
            await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(userWithToken));
            setUser(userWithToken);
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
            await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(loginResult.user));
            setUser(loginResult.user);
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
      const result = await enableBiometricAuth(email, password);
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
        // Prefer token-based storage; keep password only as a legacy fallback.
        const payload = token ? { email, token } : { email, password };
        const result = await setupBiometricAuth(payload, password);
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
      // Logout from server if we have a token
      if (user?.token) {
        await apiLogoutUser(user.token);
      }
      
      await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
      setUser(null);
      return { success: true };
    } catch (error) {
      log.error('Logout error', error?.message || error);
      // Still complete logout locally even if server logout fails
      await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
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
        await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
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
      
      if (!user.token) {
        log.error('User token is missing - re-authentication required');
        // Try to get token from storage as fallback
        try {
          const storedUser = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.token) {
              log.debug('Found token in storage, attempting to restore session...');
              // Update user with token and retry
              const userWithToken = { ...user, token: userData.token };
              setUser(userWithToken);
              // Continue with the profile update
            } else {
              return { success: false, error: 'Authentication session expired. Please log in again.' };
            }
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
        const uploadResult = await uploadProfilePicture(user.token, profileData.profilePicture);
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
      const result = await dbUpdateUserProfile(user.token, updatedProfileData);
      
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
        const updatedUser = { 
          ...user, 
          ...(serverUser || {}),
          token: user.token  // Always preserve the token
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(updatedUser));
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
