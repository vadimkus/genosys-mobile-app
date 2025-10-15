import axios from 'axios';

// API Configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://genosys.ae/api';

// Create axios instance for database API calls
const dbApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test database connection via API
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing database connection via API...');
    const response = await dbApi.get('/health');
    console.log('✅ Database API connected successfully:', response.data);
    return true;
  } catch (error) {
    console.log('⚠️ Database API not available, using fallback data');
    return false;
  }
};

// Get all products via API
export const getProducts = async () => {
  try {
    console.log('📦 Fetching products from API...');
    const response = await dbApi.get('/products');
    return response.data.data || response.data || [];
  } catch (error) {
    console.log('⚠️ Products API not available, will use fallback data');
    throw error;
  }
};

// Get featured products via API
export const getFeaturedProducts = async () => {
  try {
    console.log('⭐ Fetching featured products from API...');
    // Try the featured endpoint first
    const response = await dbApi.get('/products/featured');
    return response.data.data || response.data || [];
  } catch (error) {
    console.log(
      '⚠️ Featured products API not available, will use fallback data'
    );
    throw error;
  }
};

// Get new products via API
export const getNewProducts = async () => {
  try {
    console.log('🆕 Fetching new products from API...');
    // Try the new products endpoint first
    const response = await dbApi.get('/products/new');
    return response.data.data || response.data || [];
  } catch (error) {
    console.log('⚠️ New products API not available, will use fallback data');
    throw error;
  }
};

// Get categories via API
export const getCategories = async () => {
  try {
    console.log('🏷️ Fetching categories from API...');
    // Try the categories endpoint first
    const response = await dbApi.get('/categories');
    return response.data.data || response.data || [];
  } catch (error) {
    console.log('⚠️ Categories API not available, will use fallback data');
    throw error;
  }
};

export default dbApi;
