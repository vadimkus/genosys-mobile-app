/**
 * Genosys Authentication Service
 * Integrates with existing Prisma database and Google OAuth setup
 */

import AUTH_CONFIG from '../config/auth';

const { API_BASE_URL, API_KEY } = AUTH_CONFIG;

/**
 * Login with email and password using existing database
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication result
 */
export const loginWithEmail = async (email, password) => {
  try {
    console.log('🔐 Logging in with email:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ 
        email, 
        password
      }),
    });

    console.log('📡 Login response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Login successful');
      return { 
        success: true, 
        user: {
          ...result.user,
          authType: 'email',
          token: result.token,
        }
      };
    } else {
      const error = await response.json();
      console.log('❌ Login failed:', error);
      return { 
        success: false, 
        error: error.error || 'Invalid credentials' 
      };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};

/**
 * Register new user with existing database
 * @param {string} name - User full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Registration result
 */
export const registerUser = async (name, email, password) => {
  try {
    console.log('📝 Registering new user:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ 
        name,
        email, 
        password
      }),
    });

    console.log('📡 Registration response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration successful');
      return { 
        success: true, 
        user: {
          ...result.user,
          authType: 'email',
          token: result.token,
        }
      };
    } else {
      const error = await response.json();
      console.log('❌ Registration failed:', error);
      return { 
        success: false, 
        error: error.error || 'Registration failed' 
      };
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};

/**
 * Process Google OAuth token with existing database
 * @param {string} idToken - Google ID token from OAuth
 * @returns {Promise<Object>} Authentication result
 */
export const processGoogleAuth = async (idToken) => {
  try {
    console.log('🔐 Processing Google OAuth with ID token');
    
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ 
        idToken: idToken
      }),
    });

    console.log('📡 Google auth response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Google authentication successful');
      return { 
        success: true, 
        user: {
          ...result.user,
          authType: 'google',
          token: result.token,
        },
        isNewUser: result.isNewUser
      };
    } else {
      const error = await response.json();
      console.log('❌ Google auth failed:', error);
      return { 
        success: false, 
        error: error.error || 'Google authentication failed' 
      };
    }
  } catch (error) {
    console.error('❌ Google auth error:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};

/**
 * Validate user session with server
 * @param {string} token - User auth token
 * @returns {Promise<Object>} Validation result
 */
export const validateSession = async (token) => {
  try {
    console.log('🔍 Validating user session and fetching fresh user data from DB');
    
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.valid && result.user) {
        console.log('✅ Session validation successful - fresh user data from DB received');
        console.log('👤 User data from DB:', {
          email: result.user.email,
          name: result.user.name,
          discountType: result.user.discountType,
          discountPercentage: result.user.discountPercentage,
          phone: result.user.phone,
          address: result.user.address
        });
        return { success: true, user: result.user, valid: result.valid };
      } else {
        console.log('❌ Session validation failed:', result.error);
        return { success: false, error: result.error || 'Session expired' };
      }
    } else {
      console.log('❌ Session validation failed');
      return { success: false, error: 'Session expired' };
    }
  } catch (error) {
    console.error('❌ Session validation error:', error);
    return { success: false, error: 'Network error' };
  }
};

/**
 * Update user profile information
 * @param {string} token - User auth token
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Update result
 */
export const updateUserProfile = async (token, profileData) => {
  try {
    console.log('🔄 Updating user profile via API...');
    
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Profile update successful');
      return { success: true, user: result.user, message: 'Profile updated successfully' };
    } else {
      const error = await response.json();
      console.log('❌ Profile update failed:', error);
      return { success: false, error: error.error || 'Failed to update profile' };
    }
  } catch (error) {
    console.error('❌ Profile update error:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};

/**
 * Logout user and invalidate session
 * @param {string} token - User auth token
 * @returns {Promise<Object>} Logout result
 */
export const logoutUser = async (token) => {
  try {
    console.log('🚪 Logging out user');
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
    });

    if (response.ok) {
      console.log('✅ Logout successful');
      return { success: true };
    } else {
      console.log('⚠️ Logout failed on server, but continuing locally');
      return { success: true }; // Still allow local logout
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: true }; // Still allow local logout
  }
};

export default {
  loginWithEmail,
  registerUser,
  processGoogleAuth,
  validateSession,
  updateUserProfile,
  logoutUser,
};
