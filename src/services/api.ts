import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Product,
  Cart,
  Order,
  Category,
  Review,
  Wishlist,
  Coupon,
  ApiResponse,
  PaginatedResponse,
  ProductFilters,
  SearchParams,
  LoginForm,
  RegisterForm,
  CheckoutForm,
} from '../types';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://genosys.ae/api';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Global rate limiter to work across all instances
class GlobalRateLimiter {
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 10000; // 10 seconds between requests
  private static requestQueue: Array<() => Promise<any>> = [];
  private static isProcessingQueue = false;
  private static retryCount = 0;
  private static readonly MAX_RETRIES = 3;

  static async delayIfNeeded() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Global Rate Limiter: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  static async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Global Rate Limiter: Queue processing error:', error);
        }
      }
      
      // Wait between requests
      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL));
      }
    }
    
    this.isProcessingQueue = false;
  }

  static addToQueue(request: () => Promise<any>) {
    this.requestQueue.push(request);
    this.processQueue();
  }

  static resetRetryCount() {
    this.retryCount = 0;
  }

  static getRetryCount() {
    return this.retryCount;
  }
}

// API Service Class
class ApiService {

  // Authentication
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    console.log('API: Attempting login to:', `${API_BASE_URL}/auth/login`);
    console.log('API: Credentials:', { email: credentials.email, password: '***' });
    
    // Reset retry count for new login attempt
    GlobalRateLimiter.retryCount = 0;
    
    return new Promise((resolve) => {
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('API: Login timeout after 2 minutes');
        resolve({
          success: false,
          data: null,
          error: 'Login timeout. Please try again.'
        });
      }, 120000); // 2 minutes timeout
      
      const attemptLogin = async (retryCount: number = 0) => {
        try {
          // Add delay before each attempt
          if (retryCount > 0) {
            const delay = 5000 + (retryCount * 10000); // 5s, 15s, 25s
            console.log(`API: Waiting ${delay/1000} seconds before retry ${retryCount}...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Initial delay
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          console.log(`API: Login attempt ${retryCount + 1}/4`);
          const response = await api.post('/auth/login', credentials);
          console.log('API: Login response status:', response.status);
          console.log('API: Login response data:', response.data);
          
          clearTimeout(timeout);
          
          // Handle the actual API response format
          if (response.data && response.data.user && response.data.token) {
            console.log('API: Login successful, returning user data');
            resolve({
              success: true,
              data: {
                user: response.data.user,
                token: response.data.token
              },
              message: response.data.message
            });
            return;
          }
          
          console.log('API: Invalid response format:', response.data);
          resolve({
            success: false,
            data: null,
            error: 'Invalid response format'
          });
        } catch (error: any) {
          console.error('API: Login error:', error);
          console.error('API: Error response:', error.response?.data);
          
          if (error.response?.status === 429) {
            if (retryCount >= 3) {
              console.log('API: Max retries reached, giving up');
              clearTimeout(timeout);
              resolve({
                success: false,
                data: null,
                error: 'Too many requests. Please wait a few minutes and try again.'
              });
              return;
            }
            
            console.log(`API: Rate limited, will retry in ${(5000 + ((retryCount + 1) * 10000))/1000} seconds...`);
            attemptLogin(retryCount + 1);
            return;
          }
          
          if (error.response?.status === 401) {
            clearTimeout(timeout);
            resolve({
              success: false,
              data: null,
              error: 'Invalid email or password'
            });
            return;
          }
          
          clearTimeout(timeout);
          resolve({
            success: false,
            data: null,
            error: error.response?.data?.message || error.message || 'Login failed'
          });
        }
      };
      
      attemptLogin();
    });
  }

  async register(userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await api.post('/auth/refresh');
    return response.data;
  }

  // User Profile
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/user/profile');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put('/user/profile', userData);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await api.put('/user/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Products
  async getProducts(filters?: ProductFilters, page = 1, limit = 20): Promise<PaginatedResponse<Product>> {
    const params = {
      page,
      limit,
      ...filters,
    };
    const response = await api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async searchProducts(params: SearchParams): Promise<PaginatedResponse<Product>> {
    const response = await api.get('/products/search', { params });
    return response.data;
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/products/featured');
    return response.data;
  }

  async getNewProducts(): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/products/new');
    return response.data;
  }

  async getRelatedProducts(productId: string): Promise<ApiResponse<Product[]>> {
    const response = await api.get(`/products/${productId}/related`);
    return response.data;
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories');
    return response.data;
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  // Cart
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await api.get('/cart');
    return response.data;
  }

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  }

  async clearCart(): Promise<ApiResponse<Cart>> {
    const response = await api.delete('/cart');
    return response.data;
  }

  // Wishlist
  async getWishlist(): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/wishlist');
    return response.data;
  }

  async addToWishlist(productId: string): Promise<ApiResponse<null>> {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  }

  // Orders
  async getOrders(page = 1, limit = 20): Promise<PaginatedResponse<Order>> {
    const response = await api.get('/orders', { params: { page, limit } });
    return response.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: CheckoutForm): Promise<ApiResponse<Order>> {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  }

  // Reviews
  async getProductReviews(productId: string, page = 1, limit = 20): Promise<PaginatedResponse<Review>> {
    const response = await api.get(`/products/${productId}/reviews`, { params: { page, limit } });
    return response.data;
  }

  async createReview(productId: string, reviewData: {
    rating: number;
    title: string;
    comment: string;
  }): Promise<ApiResponse<Review>> {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  }

  // Coupons
  async validateCoupon(code: string): Promise<ApiResponse<Coupon>> {
    const response = await api.post('/coupons/validate', { code });
    return response.data;
  }

  // Addresses
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    const response = await api.get('/addresses');
    return response.data;
  }

  async createAddress(addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Address>> {
    const response = await api.post('/addresses', addressData);
    return response.data;
  }

  async updateAddress(id: string, addressData: Partial<Address>): Promise<ApiResponse<Address>> {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  }

  async deleteAddress(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  }
}

// Export singleton instance
// Create singleton API service instance
let apiServiceInstance: ApiService | null = null;

export const apiService = (() => {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService();
  }
  return apiServiceInstance;
})();
export default apiService;
