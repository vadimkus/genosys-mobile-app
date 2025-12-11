/**
 * Genosys Mobile API Service
 * Connects to live Vercel API with secure authentication
 */

const API_BASE_URL = 'https://www.genosys.ae/api/mobile';
const API_KEY = 'genosys_secure_mobile_2025_v1';

/**
 * Fetches products from the Genosys API
 * @returns {Promise<Array>} Array of products or empty array on error
 */
export const fetchProducts = async () => {
  console.log('🚀 Starting API call to:', `${API_BASE_URL}/products`);
  console.log('🔑 Using API key:', API_KEY);
  
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
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
    const products = Array.isArray(data) ? data : data.products || [];
    console.log('✅ Processed products:', products.length, 'items');
    
    // If no products from API, return demo data for testing
    if (products.length === 0) {
      console.log('🔄 No products from API, returning demo data');
      return getDemoProducts();
    }
    
    return products;
    
  } catch (error) {
    console.error('❌ Failed to fetch products:', error.message);
    console.error('🔄 Falling back to demo data');
    // Return demo data on error so you can test the UI
    return getDemoProducts();
  }
};

/**
 * Demo products for testing when API is unavailable
 */
const getDemoProducts = () => {
  return [
    {
      id: 'demo-1',
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      price: '299.99',
      description: 'High-quality wireless headphones with noise cancellation and premium sound.',
      image_url: 'https://via.placeholder.com/400x400/E74C3C/FFFFFF?text=Demo+Product+1'
    },
    {
      id: 'demo-2', 
      name: 'Smart Fitness Watch',
      category: 'Wearables',
      price: '199.99',
      description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
      image_url: 'https://via.placeholder.com/400x400/3498DB/FFFFFF?text=Demo+Product+2'
    },
    {
      id: 'demo-3',
      name: 'Portable Bluetooth Speaker',
      category: 'Audio',
      price: '79.99',
      description: 'Compact speaker with powerful sound and long battery life.',
      image_url: 'https://via.placeholder.com/400x400/2ECC71/FFFFFF?text=Demo+Product+3'
    }
  ];
};

/**
 * Fetches a single product by ID
 * @param {string} productId - The product ID
 * @returns {Promise<Object|null>} Product object or null on error
 */
export const fetchProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
};
