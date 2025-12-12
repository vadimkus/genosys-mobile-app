import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { 
  loginWithEmail as apiLoginWithEmail, 
  registerUser as apiRegisterUser,
  processGoogleAuth as apiProcessGoogleAuth,
  validateSession as apiValidateSession,
  logoutUser as apiLogoutUser
} from '../services/authService';
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

  // Google Auth Configuration - Using your existing setup
  const [request, response, promptAsync] = Google.useAuthRequest(AUTH_CONFIG.GOOGLE_OAUTH);

  // Check for stored authentication on app launch
  useEffect(() => {
    checkStoredAuth();
  }, []);

  // Handle Google Auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleAuthSuccess(authentication);
    }
  }, [response]);

  const checkStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Validate session with server if we have a token
        if (userData.token) {
          const validation = await apiValidateSession(userData.token);
          if (validation.success) {
            setUser(validation.user);
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

  const handleGoogleAuthSuccess = async (authentication) => {
    try {
      // Process with your existing database using ID token
      const result = await apiProcessGoogleAuth(authentication.idToken);

      if (result.success) {
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(result.user));
        setUser(result.user);
        
        if (result.isNewUser) {
          console.log('✅ New Google user created successfully');
        } else {
          console.log('✅ Existing Google user logged in');
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        // The useEffect will handle the success response
        return { success: true };
      }
      return { success: false, error: 'Authentication cancelled' };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      
      const result = await apiLoginWithEmail(email, password);
      
      if (result.success) {
        await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, JSON.stringify(result.user));
        setUser(result.user);
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
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
