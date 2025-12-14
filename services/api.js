/**
 * Genosys Mobile API Service - Pure Data Fetcher
 * 
 * This is a PURE DISPLAY LAYER that trusts API data completely.
 * - No hardcoded prices or business logic
 * - No demo data fallbacks  
 * - No client-side calculations
 * - Server returns complete, calculated data
 * - Database is single source of truth
 */

const API_BASE_URL = 'https://genosys.ae/api/mobile';
const API_KEY = 'genosys_secure_mobile_2025_v1';

// Enhanced API configuration for database-driven architecture
const API_CONFIG = {
  MOBILE_ENDPOINTS: {
    PRODUCTS: '/products',
    PRODUCT_BY_ID: '/products',
    CATEGORIES: '/categories',
    SHIPPING_RATES: '/shipping-rates',
  },
  HEADERS: {
    API_KEY: 'x-api-key',
    USER_ID: 'x-user-id',
    CONTENT_TYPE: 'Content-Type'
  }
};

/**
 * Fetches shipping rates by emirate from server (DB-driven)
 * @returns {Promise<Object>} { currency, vatRate, freeShippingThreshold, emirates, lastUpdated }
 */
export const fetchShippingRates = async () => {
  try {
    console.log('🚚 Fetching shipping rates from API');
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.MOBILE_ENDPOINTS.SHIPPING_RATES}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      throw new Error(`Shipping rates request failed: ${response.status} ${txt}`.trim());
    }

    const body = await response.json();
    const data = body?.data || body;
    if (!data || !Array.isArray(data.emirates)) {
      throw new Error('Invalid shipping rates response format');
    }
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch shipping rates:', error.message);
    throw error;
  }
};

/**
 * Fetches products with complete calculated data from server
 * Server handles all pricing, discounts, badges, and business logic
 * @param {Object} user - Current user object with authentication token
 * @returns {Promise<Array>} Array of complete product objects from server
 */
export const fetchProducts = async (user = null) => {
  console.log('🚀 Fetching products from API (pure data layer)');
  console.log('📡 API URL:', `${API_BASE_URL}/products`);
  
  try {
    const headers = {
      [API_CONFIG.HEADERS.CONTENT_TYPE]: 'application/json',
      [API_CONFIG.HEADERS.API_KEY]: API_KEY,
    };
    
    // Add user ID for personalized pricing (enhanced API format)
    if (user?.id) {
      headers[API_CONFIG.HEADERS.USER_ID] = user.id;
      console.log('👤 Including user ID for personalized pricing:', user.id);
    } else if (user?.token) {
      // Fallback: use Authorization header if user ID not available
      headers['Authorization'] = `Bearer ${user.token}`;
      console.log('👤 Using token-based auth as fallback');
    }
    
    const response = await fetch(`${API_BASE_URL}${API_CONFIG.MOBILE_ENDPOINTS.PRODUCTS}`, {
      method: 'GET',
      headers,
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Invalid API key.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('📦 Raw API response received:', Array.isArray(data) ? `${data.length} products` : 'data object');
    
    // Server should return array of complete product objects
    let products = Array.isArray(data) ? data : data.data || data.products || [];
    
    if (!Array.isArray(products)) {
      console.error('❌ Invalid API response format. Expected array of products.');
      throw new Error('Invalid server response format');
    }
    
    console.log(`✅ Received ${products.length} complete products from database`);
    
    // Return products exactly as server provides them
    // No client-side enhancement or calculations
    return products;
    
  } catch (error) {
    console.error('❌ Failed to fetch products:', error.message);
    
    // Don't return fake data - let the UI handle the error gracefully
    throw error;
  }
};

/**
 * Fetches product categories from server
 * @returns {Promise<Array>} Array of categories from database
 */
export const fetchProductCategories = async () => {
  try {
    console.log('📂 Fetching categories from API');
    
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      console.warn('📂 Categories endpoint not available, will extract from products');
      // If categories endpoint doesn't exist, extract from products
      const products = await fetchProducts();
      const categories = [...new Set(products.map(product => product.category))].filter(Boolean);
      return categories;
    }

    const data = await response.json();
    // Support backend shapes:
    // - { success: true, data: string[] }
    // - { categories: string[] }
    // - string[]
    const categories =
      (Array.isArray(data?.data) ? data.data : null) ||
      (Array.isArray(data?.categories) ? data.categories : null) ||
      (Array.isArray(data) ? data : []);
    
    console.log(`✅ Received ${categories.length} categories from database`);
    return categories;
    
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error.message);
    throw error;
  }
};

/**
 * Fetches a single product by ID with complete calculated data
 * @param {string} productId - The product ID
 * @param {Object} user - Current user object with authentication token
 * @returns {Promise<Object|null>} Complete product object from server or null
 */
export const fetchProductById = async (productId, user = null) => {
  try {
    console.log('🔍 Fetching product by ID:', productId);
    const targetIdStr = String(productId);
    const targetIdNum = Number.isNaN(Number(productId)) ? null : Number(productId);
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    };
    
    // Add user context for personalized pricing (match fetchProducts behavior)
    if (user?.id) {
      headers[API_CONFIG.HEADERS.USER_ID] = user.id;
      console.log('👤 Including user ID for personalized pricing (detail):', user.id);
    }
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    // Try direct product endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const body = await response.json();
        const product = body?.data || body?.product || body;
        console.log('✅ Found product directly:', product?.name || product?.id);
        return product;
      } else {
        const text = await response.text();
        console.log('ℹ️ Direct product endpoint returned non-OK', response.status, text.slice(0, 200));
      }
    } catch (directError) {
      console.log('📝 Direct product endpoint not available, searching in all products');
    }
    
    // Fallback: Get all products and find the one (for APIs without individual product endpoints)
    const allProducts = await fetchProducts(user);
    const foundProduct = allProducts.find((p) => {
      const pidStr = String(p.id);
      const pnumStr = p.productNumber ? String(p.productNumber) : null;
      const pidNum = Number.isNaN(Number(p.id)) ? null : Number(p.id);
      return (
        pidStr === targetIdStr ||
        pnumStr === targetIdStr ||
        (pidNum !== null && targetIdNum !== null && pidNum === targetIdNum)
      );
    });
    
    if (foundProduct) {
      console.log('✅ Found product in collection:', foundProduct.name);
      return foundProduct;
    } else {
      console.log('❌ Product not found with ID:', productId);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch product:', error.message);
    return null;
  }
};

/**
 * Fetches current user's profile and discount information
 * @param {string} token - User authentication token
 * @returns {Promise<Object|null>} Complete user object from server or null
 */
export const fetchUserProfile = async (token) => {
  try {
    console.log('👤 Fetching user profile from API');
    
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ User profile received from database');
      return result.user;
    } else {
      console.log('❌ Failed to fetch user profile');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return null;
  }
};

/**
 * Fetch user's orders (order tracking)
 * @param {string} token - User authentication token
 * @returns {Promise<Array>} Array of orders
 */
export const fetchUserOrders = async (token, params = {}) => {
  try {
    const qs = new URLSearchParams();
    if (params.orderId) qs.set('orderId', String(params.orderId));
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', String(params.status));
    const url = `${API_BASE_URL}/orders${qs.toString() ? `?${qs.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      throw new Error(`Orders request failed: ${response.status} ${txt}`.trim());
    }

    const body = await response.json();
    const data = Array.isArray(body) ? body : (body.data || body.orders || []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Failed to fetch user orders:', error.message);
    throw error;
  }
};

/**
 * Fetch a single order by id
 * GET /api/mobile/orders/:id
 */
export const fetchUserOrderById = async (token, orderId) => {
  const id = String(orderId || '').trim();
  if (!id) throw new Error('Missing order id');

  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(`Order request failed: ${response.status} ${txt}`.trim());
  }

  const body = await response.json().catch(() => ({}));
  // Support common response shapes
  return body?.data || body?.order || body;
};

/**
 * Delete a user's order (client-side convenience).
 * Note: Backend must enforce authorization/ownership.
 */
export const deleteUserOrder = async (token, orderId) => {
  const id = String(orderId || '').trim();
  if (!id) throw new Error('Missing order id');

  const candidates = [
    // If hosting blocks DELETE/PATCH/PUT, prefer POST fallback first.
    { url: `${API_BASE_URL}/orders/${id}/delete`, method: 'POST', body: { id } },

    // Alternate "action" style (some backends implement delete-as-POST on the same resource)
    { url: `${API_BASE_URL}/orders/${id}`, method: 'POST', body: { id, action: 'delete' } },

    // Canonical (per backend doc)
    { url: `${API_BASE_URL}/orders/${id}`, method: 'DELETE' },

    // Common alternates / fallbacks (in case production route differs)
    { url: `${API_BASE_URL}/user/orders/${id}`, method: 'DELETE' },
    { url: `${API_BASE_URL}/orders/${id}`, method: 'PATCH', body: { status: 'DELETED' } },
    { url: `${API_BASE_URL}/orders/${id}`, method: 'PUT', body: { status: 'DELETED' } },
  ];

  let lastErr = null;
  const attempts = [];
  for (const c of candidates) {
    try {
      console.log(`🗑️ Delete order attempt: ${c.method} ${c.url}`);
      const res = await fetch(c.url, {
        method: c.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': API_KEY,
        },
        ...(c.body ? { body: JSON.stringify(c.body) } : {}),
      });
      if (!res.ok) {
        const allow = res.headers.get('allow') || '';
        const txt = await res.text().catch(() => '');
        console.warn(
          `🗑️ Delete order failed: ${c.method} ${c.url} -> ${res.status}${allow ? ` (Allow: ${allow})` : ''} | ${(txt || '').slice(0, 200)}`
        );
        attempts.push({
          method: c.method,
          url: c.url,
          status: res.status,
          allow,
          body: (txt || '').slice(0, 300),
        });
        lastErr = new Error(`Delete failed: ${res.status} ${(txt || '').slice(0, 120)}`.trim());
        continue;
      }
      // Some backends return empty body on DELETE
      const body = await res.json().catch(() => ({}));
      return body;
    } catch (e) {
      lastErr = e;
      console.warn(`🗑️ Delete order network/error: ${c.method} ${c.url} -> ${String(e?.message || e)}`);
      attempts.push({ method: c.method, url: c.url, status: 'NETWORK_ERROR', body: String(e?.message || e) });
    }
  }
  const details = attempts
    .map((a) => {
      const allow = a.allow ? ` allow=${a.allow}` : '';
      return `${a.method} ${a.url} -> ${a.status}${allow}${a.body ? ` | ${a.body}` : ''}`;
    })
    .join('\n');
  throw new Error((lastErr?.message || 'Delete failed') + (details ? `\n\nDebug:\n${details}` : ''));
};

/**
 * Search products with server-side filtering
 * @param {string} query - Search query
 * @param {string} category - Category filter
 * @param {Object} user - Current user object
 * @returns {Promise<Array>} Filtered products from server
 */
export const searchProducts = async (query, category = '', user = null) => {
  try {
    console.log('🔍 Searching products:', { query, category });
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    };
    
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    
    const response = await fetch(`${API_BASE_URL}/products/search?${params.toString()}`, {
      method: 'GET',
      headers,
    });
    
    if (response.ok) {
      const data = await response.json();
      const products = Array.isArray(data) ? data : data.products || [];
      console.log(`✅ Search returned ${products.length} products`);
      return products;
    } else {
      // Fallback to client-side filtering if search endpoint not available
      console.log('📝 Search endpoint not available, using client-side filter');
      const allProducts = await fetchProducts(user);
      
      return allProducts.filter(product => {
        const matchesQuery = !query || 
          product.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase());
        
        const matchesCategory = !category || product.category === category;
        
        return matchesQuery && matchesCategory;
      });
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    throw error;
  }
};

// Legacy compatibility exports
export const fetchUserDiscountInfo = fetchUserProfile;

export default {
  fetchProducts,
  fetchProductCategories,
  fetchProductById,
  fetchShippingRates,
  fetchUserProfile,
  fetchUserOrders,
  searchProducts
};