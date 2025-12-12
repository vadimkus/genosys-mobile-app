/**
 * Authentication Configuration
 * Update these values to match your backend settings
 */

export const AUTH_CONFIG = {
  // Backend API Configuration
  API_BASE_URL: 'https://genosys.ae/api/mobile',
  
  // Mobile App API Key - matches backend authentication
  API_KEY: 'genosys_secure_mobile_2025_v1',
  
  // Google OAuth Configuration (production setup for Genosys Middle East FZ-LLC)
  GOOGLE_OAUTH: {
    // Use iOS client ID as the main client ID for mobile app
    clientId: '590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com',
    iosClientId: '590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com',
    androidClientId: '590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com',
    webClientId: '590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com',
    // Custom scheme for deep linking
    redirectUri: 'genosys://oauth/google',
  },
  
  // App Settings
  TOKEN_STORAGE_KEY: '@user',
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days (matches backend JWT expiration)
};

export default AUTH_CONFIG;