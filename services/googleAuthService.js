/**
 * Direct Google OAuth Service
 * Bypasses Expo's development OAuth proxy to use production Google OAuth setup
 */

import { Alert, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Your production Google OAuth configuration (same as website)
const GOOGLE_CLIENT_ID = '590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com';
const REDIRECT_URI = 'genosys://oauth/google';

/**
 * Direct Google OAuth login (bypasses Expo development proxy)
 * This will show your production "Genosys Middle East FZ-LLC" OAuth consent
 */
export const loginWithGoogleDirect = async () => {
  try {
    console.log('🔐 Starting direct Google OAuth (production setup)...');
    
    // Create Google OAuth URL directly
    const authUrl = createGoogleAuthUrl();
    console.log('🔗 Auth URL:', authUrl);
    
    // Open Google OAuth in browser
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      REDIRECT_URI,
      {
        showInRecents: false,
        createTask: false,
      }
    );
    
    console.log('📡 OAuth result:', result.type);
    
    if (result.type === 'success' && result.url) {
      // Extract authorization code from redirect URL
      const authCode = extractAuthCodeFromUrl(result.url);
      
      if (authCode) {
        // Exchange authorization code for ID token
        const idToken = await exchangeCodeForToken(authCode);
        
        if (idToken) {
          return {
            success: true,
            idToken: idToken,
          };
        } else {
          return {
            success: false,
            error: 'Failed to get ID token from Google'
          };
        }
      } else {
        return {
          success: false,
          error: 'No authorization code received from Google'
        };
      }
    } else if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Authentication cancelled by user'
      };
    } else {
      return {
        success: false,
        error: 'Google authentication failed'
      };
    }
  } catch (error) {
    console.error('❌ Direct Google OAuth error:', error);
    return {
      success: false,
      error: 'Google authentication failed. Please try again.'
    };
  }
};

/**
 * Create Google OAuth URL with production configuration
 */
const createGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'select_account',
    // This ensures it shows your production OAuth consent screen
    state: Math.random().toString(36).substring(2, 15),
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Extract authorization code from redirect URL
 */
const extractAuthCodeFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('code');
  } catch (error) {
    console.error('Error extracting auth code:', error);
    return null;
  }
};

/**
 * Exchange authorization code for ID token
 */
const exchangeCodeForToken = async (authCode) => {
  try {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (response.ok) {
      const tokenData = await response.json();
      return tokenData.id_token;
    } else {
      console.error('Token exchange failed:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
};

export default {
  loginWithGoogleDirect,
};