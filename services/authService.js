/**
 * Genosys Authentication Service
 * Integrates with existing Prisma database and Google OAuth setup
 */

import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';

const log = createLogger('authService');

const { API_BASE_URL, API_KEY } = AUTH_CONFIG;

/**
 * Login with email and password using existing database
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication result
 */
export const loginWithEmail = async (email, password) => {
  try {
    const normalizedEmail = String(email || '').trim();
    log.debug('Logging in with email');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ 
        email: normalizedEmail, 
        password
      }),
    });

    log.debug('Login response status', { status: response.status });

    if (response.ok) {
      const result = await response.json();
      log.debug('Login successful');
      return { 
        success: true, 
        user: {
          ...result.user,
          authType: 'email',
          token: result.token,
        }
      };
    } else {
      const errorText = await response.text();
      let errorJson = null;
      try { errorJson = errorText ? JSON.parse(errorText) : null; } catch {}
      const message =
        (errorJson && (errorJson.error || errorJson.message)) ||
        (errorText && errorText.slice(0, 200)) ||
        'Login failed';
      log.warn('Login failed', { status: response.status, message });
      return { 
        success: false, 
        error: message
      };
    }
  } catch (error) {
    log.error('Login error', error?.message || error);
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
    log.debug('Registering new user');
    
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

    log.debug('Registration response status', { status: response.status });

    if (response.ok) {
      const result = await response.json();
      log.debug('Registration successful');
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
      log.warn('Registration failed', error);
      return { 
        success: false, 
        error: error.error || 'Registration failed' 
      };
    }
  } catch (error) {
    log.error('Registration error', error?.message || error);
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
    log.debug('Processing Google OAuth with ID token');
    
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

    log.debug('Google auth response status', { status: response.status });

    if (response.ok) {
      const result = await response.json();
      log.debug('Google authentication successful');
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
      log.warn('Google auth failed', error);
      return { 
        success: false, 
        error: error.error || 'Google authentication failed' 
      };
    }
  } catch (error) {
    log.error('Google auth error', error?.message || error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};

/**
 * Apple Sign-In (iOS)
 * POST /api/mobile/auth/apple
 * @param {string} identityToken - Apple identity token (JWT)
 * @param {{ fullName?: string }} meta
 */
export const processAppleAuth = async (identityToken, meta = {}) => {
  try {
    log.debug('Processing Apple Sign-In');

    const response = await fetch(`${API_BASE_URL}/auth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        identityToken,
        fullName: meta?.fullName || '',
      }),
    });

    log.debug('Apple auth response status', { status: response.status });

    if (response.ok) {
      const result = await response.json();
      log.debug('Apple authentication successful');
      return {
        success: true,
        user: {
          ...result.user,
          authType: 'apple',
          token: result.token,
        },
      };
    } else {
      const errorText = await response.text().catch(() => '');
      let errorJson = null;
      try { errorJson = errorText ? JSON.parse(errorText) : null; } catch {}
      const message =
        (errorJson && (errorJson.error || errorJson.message)) ||
        (errorText && errorText.slice(0, 200)) ||
        'Apple authentication failed';
      log.warn('Apple auth failed', { status: response.status, message });
      return { success: false, error: message };
    }
  } catch (error) {
    log.error('Apple auth error', error?.message || error);
    return { success: false, error: 'Network error. Please check your connection and try again.' };
  }
};

/**
 * Validate user session with server
 * @param {string} token - User auth token
 * @returns {Promise<Object>} Validation result
 */
export const validateSession = async (token) => {
  try {
    log.debug('Validating user session');
    
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
        log.debug('Session validation successful');
        return { success: true, user: result.user, valid: result.valid };
      } else {
        log.warn('Session validation failed', result?.error);
        return { success: false, error: result.error || 'Session expired' };
      }
    } else {
      // If the validate route isn't deployed yet, Next.js will return a 404 HTML page.
      // Do NOT treat this as session expiration; keep the stored session.
      if (response.status === 404) {
        const txt = await response.text().catch(() => '');
        log.warn('Session validation endpoint unavailable (404), skipping validation', {
          status: response.status,
          bodySnippet: String(txt || '').slice(0, 120),
        });
        return { success: true, valid: true, user: null, skipped: true };
      }

      log.warn('Session validation failed', { status: response.status });
      return { success: false, error: 'Session expired' };
    }
  } catch (error) {
    log.error('Session validation error', error?.message || error);
    // Network errors: keep stored session; the app can recover on next request.
    return { success: true, valid: true, user: null, skipped: true, error: 'Network error' };
  }
};

/**
 * Request a password reset email (mobile)
 * POST /api/mobile/auth/forgot-password
 * @param {string} email
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ email }),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: (json && (json.error || json.message)) || 'Could not request password reset',
      };
    }

    return {
      success: true,
      message: (json && (json.message || json.success)) || 'Reset email sent',
    };
  } catch (error) {
    log.error('Forgot password error', error?.message || error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

/**
 * Reset password using a token (mobile)
 * POST /api/mobile/auth/reset-password
 * @param {string} token
 * @param {string} newPassword
 */
export const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: (json && (json.error || json.message)) || 'Could not reset password',
      };
    }

    return {
      success: true,
      message: (json && (json.message || json.success)) || 'Password reset',
    };
  } catch (error) {
    log.error('Reset password error', error?.message || error);
    return { success: false, error: 'Network error. Please try again.' };
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
    log.debug('Updating user profile via API...');
    
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
      log.debug('Profile update successful');
      return { success: true, user: result.user, message: 'Profile updated successfully' };
    } else {
      const error = await response.json();
      log.warn('Profile update failed', error);
      return { success: false, error: error.error || 'Failed to update profile' };
    }
  } catch (error) {
    log.error('Profile update error', error?.message || error);
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
    log.debug('Logging out user');
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
    });

    if (response.ok) {
      log.debug('Logout successful');
      return { success: true };
    } else {
      log.warn('Logout failed on server, but continuing locally');
      return { success: true }; // Still allow local logout
    }
  } catch (error) {
    log.error('Logout error', error?.message || error);
    return { success: true }; // Still allow local logout
  }
};

/**
 * Delete / anonymize user account
 * DELETE /api/mobile/user/account
 * @param {string} token
 */
export const deleteUserAccount = async (token) => {
  try {
    log.debug('Deleting user account');

    const response = await fetch(`${API_BASE_URL}/user/account`, {
      method: 'DELETE',
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return { success: true };
    }

    const errorText = await response.text().catch(() => '');
    let errorJson = null;
    try { errorJson = errorText ? JSON.parse(errorText) : null; } catch {}
    const message =
      (errorJson && (errorJson.error || errorJson.message)) ||
      (errorText && errorText.slice(0, 200)) ||
      'Could not delete account';
    log.warn('Delete account failed', { status: response.status, message });
    return { success: false, error: message };
  } catch (error) {
    log.error('Delete account error', error?.message || error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export default {
  loginWithEmail,
  registerUser,
  processGoogleAuth,
  processAppleAuth,
  validateSession,
  updateUserProfile,
  logoutUser,
  deleteUserAccount,
};
