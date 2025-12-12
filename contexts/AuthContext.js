import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Using direct Google OAuth implementation instead of expo-auth-session
import { 
  loginWithEmail as apiLoginWithEmail, 
  registerUser as apiRegisterUser,
  processGoogleAuth as apiProcessGoogleAuth,
  validateSession as apiValidateSession,
  logoutUser as apiLogoutUser
} from '../services/authService';
import {
  checkBiometricSupport,
  getBiometricTypeName,
  isBiometricEnabled,
  enableBiometricAuth,
  disableBiometricAuth,
  authenticateWithBiometrics,
  setupBiometricAuth
} from '../services/biometricService';
import { loginWithGoogleDirect } from '../services/googleAuthService';
import AUTH_CONFIG from '../config/auth';

const AuthContext = createContext({});

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
      
      console.log('🔐 Biometric Support:', {
        available: support.isAvailable,
        enrolled: support.isEnrolled,
        enabled: enabled,
        type: typeName
      });
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  // Using direct Google OAuth implementation (no useEffect needed)

  const checkStoredAuth = async () => {
    try {
      // First, check if biometric auth is enabled and try auto-login
      const biometricEnabled = await isBiometricEnabled();
      if (biometricEnabled) {
        console.log('🔐 Attempting biometric auto-login...');
        // Don't show biometric prompt on app start, just check for stored session
        // User can manually use biometric login from login screen
      }
      
      const storedUser = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Validate session with server if we have a token
        if (userData.token) {
          const validation = await apiValidateSession(userData.token);
          if (validation.success) {
            setUser(validation.user);
            // Update biometric availability in case user logged in successfully
            await checkBiometricAvailability();
          } else {
            // Session expired, clear stored data
            await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
            setUser(null);
          }
        } else {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY); // Clear corrupted data
    } finally {
      setLoading(false);
    }
  };


  const loginWithGoogle = async () => {
    try {
      console.log('🔐 Starting direct Google OAuth (production setup)...');
      
      // Use direct Google OAuth (bypasses Expo development proxy)
      // This will show "Genosys Middle East FZ-LLC" instead of "Expo"
      const result = await loginWithGoogleDirect();
      
      if (result.success) {
        console.log('✅ Got Google ID token, authenticating with backend...');
        
        // Process with your existing backend using ID token
        const authResult = await apiProcessGoogleAuth(result.idToken);
        
        if (authResult.success) {
          await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(authResult.user));
          setUser(authResult.user);
          
          if (authResult.isNewUser) {
            console.log('✅ New Google user created successfully');
          } else {
            console.log('✅ Existing Google user logged in');
          }
          
          return { success: true };
        } else {
          return { success: false, error: authResult.error };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      
      return { 
        success: false, 
        error: 'Google authentication failed. Please try email & password login.' 
      };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      
      const result = await apiLoginWithEmail(email, password);
      
      if (result.success) {
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(result.user));
        setUser(result.user);
        
        // Offer biometric setup after successful login (if available and not enabled)
        if (biometricAvailable && !biometricEnabled) {
          // Don't await this - let it run in background
          setTimeout(() => {
            setupBiometricAfterLogin(email, password);
          }, 1000); // Wait 1 second after login
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Email login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      const result = await apiRegisterUser(name, email, password);
      
      if (result.success) {
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(result.user));
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
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
        // Use stored credentials to login with backend
        const loginResult = await apiLoginWithEmail(result.credentials.email, result.credentials.password);
        
        if (loginResult.success) {
          await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(loginResult.user));
          setUser(loginResult.user);
          return { success: true };
        } else {
          return { success: false, error: loginResult.error };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Biometric login error:', error);
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
      console.error('Enable biometric error:', error);
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
      console.error('Disable biometric error:', error);
      return { success: false, error: 'Failed to disable biometric authentication' };
    }
  };

  const setupBiometricAfterLogin = async (email, password) => {
    try {
      // Only offer setup if biometrics are available but not enabled
      if (biometricAvailable && !biometricEnabled) {
        const result = await setupBiometricAuth(email, password);
        if (result.success) {
          setBiometricEnabled(true);
        }
        return result;
      }
      return { success: false, error: 'Biometric setup not available' };
    } catch (error) {
      console.error('Biometric setup error:', error);
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
      console.error('Logout error:', error);
      // Still complete logout locally even if server logout fails
      await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
      setUser(null);
      return { success: true };
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    loginWithBiometrics,
    register,
    logout,
    isAuthenticated: !!user,
    // Biometric authentication
    biometricAvailable,
    biometricEnabled,
    biometricType,
    enableBiometric,
    disableBiometric,
    setupBiometricAfterLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
