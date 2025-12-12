/**
 * Genosys Mobile API Service
 * Connects to live Vercel API with secure authentication
 */

const API_BASE_URL = 'https://genosys.ae/api/mobile';
const API_KEY = 'genosys_secure_mobile_2025_v1';

/**
 * Fetches enhanced products with badges, status, and user-specific pricing
 * @param {Object} user - Current user object with discount information
 * @returns {Promise<Array>} Array of enhanced products or empty array on error
 */
export const fetchProducts = async (user = null) => {
  console.log('🚀 Starting API call to:', `${API_BASE_URL}/products`);
  console.log('🔑 Using API key:', API_KEY);
  if (user) {
    console.log('👤 User discount:', user.discountType, user.discountPercentage + '%');
  }
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    };
    
    // Add user token for personalized pricing if available
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers,
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    if (!response.ok) {
      console.error('❌ API Error - Status:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Raw API response:', data);
    
    // Ensure we return an array even if API returns different structure
    let products = Array.isArray(data) ? data : data.data || data.products || [];
    console.log('✅ Processed products:', products.length, 'items');
    
    // If no products from API, return demo data for testing
    if (products.length === 0) {
      console.log('🔄 No products from API, returning demo data');
      return getDemoProducts();
    }
    
    // Enhance products with badges, status, and user-specific pricing
    products = products.map(product => enhanceProductData(product, user));
    
    return products;
    
  } catch (error) {
    console.error('❌ Failed to fetch products:', error.message);
    console.error('🔄 Falling back to demo data');
    // Return enhanced demo data on error so you can test the UI
    const demoProducts = getDemoProducts();
    return demoProducts.map(product => enhanceProductData(product, user));
  }
};

/**
 * Demo products for testing when API is unavailable
 */
const getDemoProducts = () => {
  const demoProducts = [
    {
      id: 'demo-1',
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      price: 299.99,
      rating: 4.8,
      stock: true,
      description: 'High-quality wireless headphones with noise cancellation and premium sound.',
      image_url: 'https://via.placeholder.com/400x400/E74C3C/FFFFFF?text=Demo+Product+1'
    },
    {
      id: 'demo-2', 
      name: 'Smart Fitness Watch',
      category: 'Wearables',
      price: 199.99,
      rating: 5.0,
      stock: true,
      description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
      image_url: 'https://via.placeholder.com/400x400/3498DB/FFFFFF?text=Demo+Product+2'
    },
    {
      id: 'demo-3',
      name: 'Portable Bluetooth Speaker',
      category: 'Audio',
      price: 79.99,
      rating: 4.5,
      stock: false, // Out of stock for testing
      description: 'Compact speaker with powerful sound and long battery life.',
      image_url: 'https://via.placeholder.com/400x400/2ECC71/FFFFFF?text=Demo+Product+3'
    },
    {
      id: 'demo-4',
      name: 'Professional Beauty Kit',
      category: 'Beauty Boxes',
      price: 450.00,
      rating: 4.9,
      stock: true,
      description: 'Complete professional beauty kit with premium products.',
      image_url: 'https://via.placeholder.com/400x400/9B59B6/FFFFFF?text=Beauty+Kit'
    }
  ];
  
  // Note: Demo products will be enhanced with badges/discounts by enhanceProductData
  return demoProducts;
};

/**
 * Fetches product categories from the database
 * @returns {Promise<Array>} Array of unique categories
 */
export const fetchProductCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      console.log('Categories endpoint not available, extracting from products');
      // If categories endpoint doesn't exist, extract from products
      return extractCategoriesFromProducts();
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.categories || [];
    
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Fallback to extracting categories from products
    return extractCategoriesFromProducts();
  }
};

/**
 * Extracts unique categories from products as fallback
 * @returns {Promise<Array>} Array of unique categories
 */
const extractCategoriesFromProducts = async () => {
  try {
    console.log('🔄 Extracting categories from products...');
    const products = await fetchProducts();
    console.log('📦 Products for category extraction:', products.length);
    
    const categories = [...new Set(products.map(product => product.category))];
    
    const validCategories = categories.filter(category => category && category.trim() !== '');
    console.log('✅ Valid categories extracted:', validCategories);
    
    return validCategories.length > 0 ? validCategories : [
      'Professional Skincare',
      'Cleansers', 
      'Moisturizers',
      'Serums',
      'Treatments',
      'Sun Protection'
    ];
  } catch (error) {
    console.error('Failed to extract categories from products:', error);
    // Return demo categories as last fallback
    return [
      'Professional Skincare',
      'Cleansers',
      'Moisturizers', 
      'Serums',
      'Treatments',
      'Sun Protection'
    ];
  }
};

/**
 * Enhance product data with badges, status, and user-specific pricing
 * @param {Object} product - Raw product data
 * @param {Object} user - User object with discount information
 * @returns {Object} Enhanced product object
 */
const enhanceProductData = (product, user) => {
  const enhanced = { ...product };
  
  // Add badges based on product properties
  enhanced.badges = [];
  
  console.log(`🏷️ Enhancing product: ${product.name} for user:`, user ? `${user.email} (${user.discountPercentage}% ${user.discountType})` : 'Guest');
  
  // Stock status badge
  if (!product.stock || product.stock === false) {
    enhanced.badges.push({ 
      text: 'Out of Stock', 
      type: 'error', 
      color: '#FF3B30' 
    });
    enhanced.status = 'out_of_stock';
  } else {
    enhanced.status = 'in_stock';
  }
  
  // Rating badge for high-rated products
  if (product.rating >= 5) {
    enhanced.badges.push({ 
      text: '⭐ Top Rated', 
      type: 'success', 
      color: '#FF9500' 
    });
  }
  
  // New product badge (products added in last 30 days)
  // For now, we'll mark Beauty Boxes as new
  if (product.category === 'Beauty Boxes') {
    enhanced.badges.push({ 
      text: 'New', 
      type: 'info', 
      color: '#007AFF' 
    });
  }
  
  // Kit/Bundle badge
  if (product.name.toLowerCase().includes('kit') || product.name.toLowerCase().includes('box')) {
    enhanced.badges.push({ 
      text: 'Bundle', 
      type: 'bundle', 
      color: '#34C759' 
    });
  }
  
  // Professional/PRO badge
  if (product.category === 'PRO Solution' || product.category === 'Device') {
    enhanced.badges.push({ 
      text: 'PRO', 
      type: 'professional', 
      color: '#E74C3C' 
    });
  }
  
  // Add pricing information with user-specific discounts
  // Ensure price is a number
  const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  
  enhanced.originalPrice = basePrice;
  enhanced.displayPrice = basePrice;
  enhanced.hasDiscount = false;
  enhanced.discountAmount = 0;
  enhanced.discountPercentage = 0;
  
  // Apply user-specific discount if user is logged in and has discount
  if (user && user.discountPercentage && user.discountPercentage > 0) {
    const discountAmount = (basePrice * user.discountPercentage) / 100;
    enhanced.displayPrice = basePrice - discountAmount;
    enhanced.hasDiscount = true;
    enhanced.discountAmount = discountAmount;
    enhanced.discountPercentage = user.discountPercentage;
    enhanced.discountType = user.discountType || 'Discount';
    
    console.log(`💰 Applied ${user.discountPercentage}% discount to ${product.name}: ${basePrice} -> ${enhanced.displayPrice}`);
    
    // Add discount badge
    enhanced.badges.push({ 
      text: `-${user.discountPercentage}% ${enhanced.discountType}`, 
      type: 'discount', 
      color: '#E74C3C' 
    });
  }
  
  console.log(`✨ Enhanced product ${product.name} with ${enhanced.badges.length} badges:`, enhanced.badges.map(b => b.text));
  
  return enhanced;
};

/**
 * Fetches current user's profile and discount information
 * @param {string} token - User authentication token
 * @returns {Promise<Object|null>} User discount info or null
 */
export const fetchUserDiscountInfo = async (token) => {
  try {
    console.log('👤 Fetching user discount information...');
    
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
      console.log('✅ User discount info:', {
        discountType: result.user.discountType,
        discountPercentage: result.user.discountPercentage,
        canSeePrices: result.user.canSeePrices
      });
      return result.user;
    } else {
      console.log('❌ Failed to fetch user discount info');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user discount info:', error);
    return null;
  }
};

/**
 * Fetches a single product by ID with enhanced data
 * @param {string} productId - The product ID
 * @param {Object} user - Current user object
 * @returns {Promise<Object|null>} Enhanced product object or null on error
 */
export const fetchProductById = async (productId, user = null) => {
  try {
    console.log('🔍 Fetching product by ID:', productId);
    
    // Since individual product endpoint might not exist, get all products and find the one
    const allProducts = await fetchProducts(user);
    const foundProduct = allProducts.find(p => p.id === productId);
    
    if (foundProduct) {
      console.log('✅ Found product:', foundProduct.name);
      return foundProduct;
    } else {
      console.log('❌ Product not found with ID:', productId);
      return null;
    }
    
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
};
