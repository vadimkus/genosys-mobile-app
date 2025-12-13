/**
 * Database Service for Mobile App
 * Handles all database operations via API calls to backend server
 */

import AUTH_CONFIG from '../config/auth';

const { API_BASE_URL, API_KEY } = AUTH_CONFIG;

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    console.log(`🌐 API Request: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options.headers,
      },
      ...options,
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data;
    if (isJson) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error(`❌ JSON Parse Error for ${endpoint}:`, parseError);
        return { success: false, error: 'Invalid JSON response from server' };
      }
    } else {
      // Handle non-JSON responses (like HTML error pages)
      const textResponse = await response.text();
      console.warn(`⚠️ Non-JSON response from ${endpoint}:`, textResponse.substring(0, 200));
      
      if (response.status === 404) {
        return { success: false, error: 'API endpoint not found (404)' };
      } else if (response.status >= 500) {
        return { success: false, error: 'Server error' };
      } else {
        return { success: false, error: 'Unexpected response format' };
      }
    }
    
    if (response.ok) {
      console.log(`✅ API Success: ${endpoint}`);
      return { success: true, data };
    } else {
      console.warn(`⚠️ API Error: ${endpoint} - ${data.error || 'Request failed'}`);
      return { success: false, error: data.error || `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error(`❌ Network Error (${endpoint}):`, error.message);
    return { success: false, error: 'Network error - please check your connection' };
  }
};

// ============= USER PROFILE =============

/**
 * Update user profile with all new fields
 * @param {string} token - User auth token
 * @param {Object} profileData - Complete profile data
 * @returns {Promise<Object>} Update result
 */
export const updateUserProfile = async (token, profileData) => {
  console.log('💾 Updating user profile via API:', profileData);
  
  return await apiRequest('/user/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: profileData.name,
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth,
      gender: profileData.gender,
      address: profileData.address,
      profilePicture: profileData.profilePicture,
      emailNotifications: profileData.emailNotifications,
      smsNotifications: profileData.smsNotifications,
    }),
  });
};

/**
 * Upload profile picture
 * @param {string} token - User auth token
 * @param {string} imageUri - Local image URI
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadProfilePicture = async (token, imageUri) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (response.ok) {
      return { 
        success: true, 
        imageUrl: result.imageUrl,
        message: 'Profile picture uploaded successfully'
      };
    } else {
      return { success: false, error: result.error || 'Upload failed' };
    }
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
};

// ============= ADDRESSES =============

/**
 * Get user addresses
 * @param {string} token - User auth token
 * @returns {Promise<Object>} Addresses list
 */
export const getUserAddresses = async (token) => {
  return await apiRequest('/user/addresses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Create new address
 * @param {string} token - User auth token
 * @param {Object} addressData - Address information
 * @returns {Promise<Object>} Creation result
 */
export const createAddress = async (token, addressData) => {
  console.log('📍 Creating new address via API:', addressData);
  
  return await apiRequest('/user/addresses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
};

/**
 * Update existing address
 * @param {string} token - User auth token
 * @param {string} addressId - Address ID
 * @param {Object} addressData - Updated address data
 * @returns {Promise<Object>} Update result
 */
export const updateAddress = async (token, addressId, addressData) => {
  console.log('📝 Updating address in database:', { addressId, addressData });
  
  return await apiRequest(`/user/addresses/${addressId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
};

/**
 * Delete address
 * @param {string} token - User auth token
 * @param {string} addressId - Address ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteAddress = async (token, addressId) => {
  console.log('🗑️ Deleting address via API:', addressId);
  
  return await apiRequest(`/user/addresses/${addressId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Set default address
 * @param {string} token - User auth token
 * @param {string} addressId - Address ID to set as default
 * @returns {Promise<Object>} Update result
 */
export const setDefaultAddress = async (token, addressId) => {
  console.log('🏠 Setting default address via API:', addressId);
  
  return await apiRequest(`/user/addresses/${addressId}/set-default`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// ============= WISHLIST =============

/**
 * Get user wishlist
 * @param {string} token - User auth token
 * @returns {Promise<Object>} Wishlist items
 */
export const getUserWishlist = async (token) => {
  return await apiRequest('/user/wishlist', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Add item to wishlist
 * @param {string} token - User auth token
 * @param {Object} productData - Product information
 * @returns {Promise<Object>} Add result
 */
export const addToWishlist = async (token, productData) => {
  console.log('💖 Adding to wishlist via API:', productData);
  
  return await apiRequest('/user/wishlist', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: productData.productId,
      productName: productData.productName,
      productImage: productData.productImage,
      productPrice: productData.productPrice,
    }),
  });
};

/**
 * Remove item from wishlist
 * @param {string} token - User auth token
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Remove result
 */
export const removeFromWishlist = async (token, productId) => {
  console.log('💔 Removing from wishlist via API:', productId);
  
  return await apiRequest(`/user/wishlist/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// ============= ORDERS =============

/**
 * Save order to database
 * @param {string} token - User auth token  
 * @param {Object} orderData - Complete order information
 * @returns {Promise<Object>} Save result
 */
export const saveOrder = async (token, orderData) => {
  console.log('🛒 Saving order via API:', orderData);
  
  return await apiRequest('/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
};

/**
 * Get user order history
 * @param {string} token - User auth token
 * @returns {Promise<Object>} Orders list
 */
export const getUserOrders = async (token) => {
  return await apiRequest('/user/orders', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

/**
 * Get specific order details
 * @param {string} token - User auth token
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderDetails = async (token, orderId) => {
  return await apiRequest(`/user/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// ============= USER SETTINGS =============

/**
 * Update user app settings
 * @param {string} token - User auth token
 * @param {Object} settings - App settings
 * @returns {Promise<Object>} Update result
 */
export const updateUserSettings = async (token, settings) => {
  console.log('⚙️ Saving user settings via API:', settings);
  
  return await apiRequest('/user/settings', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
};

/**
 * Get user app settings
 * @param {string} token - User auth token
 * @returns {Promise<Object>} User settings
 */
export const getUserSettings = async (token) => {
  return await apiRequest('/user/settings', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// ============= ANALYTICS =============

/**
 * Track app usage and user behavior
 * @param {string} token - User auth token (optional)
 * @param {Object} eventData - Analytics event data
 * @returns {Promise<Object>} Track result
 */
export const trackAppEvent = async (token, eventData) => {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  return await apiRequest('/analytics/track', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      event: eventData.event,
      properties: eventData.properties,
      timestamp: new Date().toISOString(),
    }),
  });
};

export default {
  // Profile
  updateUserProfile,
  uploadProfilePicture,
  
  // Addresses
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  
  // Wishlist
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  
  // Orders
  saveOrder,
  getUserOrders,
  getOrderDetails,
  
  // Settings
  updateUserSettings,
  getUserSettings,
  
  // Analytics
  trackAppEvent,
};

