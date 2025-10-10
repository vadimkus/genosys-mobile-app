import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, CartItem, Order, AppState } from '../types';
import { apiService } from '../services/api';

interface StoreState extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    role: 'customer' | 'distributor';
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCart: () => Promise<void>;
  
  // Wishlist actions
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  getWishlist: () => Promise<void>;
  
  // Product actions
  fetchProducts: (filters?: any) => Promise<void>;
  fetchProduct: (id: string) => Promise<Product | null>;
  searchProducts: (query: string) => Promise<void>;
  
  // Order actions
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<Order | null>;
  
  // Utility actions
  clearError: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      cart: [],
      cartCount: 0,
      wishlist: [],
      favorites: [],

      // Auth actions
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting login with:', { email, password: '***' });
          const response = await apiService.login({ email, password });
          console.log('Login response:', response);
          console.log('Response success:', response.success);
          console.log('Response data:', response.data);
          if (response.success && response.data) {
            const { user, token } = response.data;
            await AsyncStorage.setItem('authToken', token);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            console.log('Login successful, user:', user);
            return true;
          } else {
            console.log('Login failed:', response.error || 'Unknown error');
            set({ 
              isLoading: false, 
              error: response.error || 'Login failed' 
            });
            return false;
          }
        } catch (error: any) {
          console.error('Login error:', error);
          console.error('Error response:', error.response?.data);
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || error.message || 'Login failed' 
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.register(userData);
          if (response.success) {
            const { user, token } = response.data;
            await AsyncStorage.setItem('authToken', token);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false, 
              error: null 
            });
            return true;
          }
          return false;
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Registration failed' 
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          await AsyncStorage.removeItem('authToken');
          set({ 
            user: null, 
            isAuthenticated: false, 
            cart: [], 
            cartCount: 0,
            wishlist: [],
            favorites: []
          });
        }
      },

      // Cart actions
      addToCart: async (product, quantity = 1) => {
        try {
          await apiService.addToCart(product.id, quantity);
          await get().getCart();
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to add to cart' });
        }
      },

      removeFromCart: async (productId) => {
        try {
          const cart = get().cart;
          const item = cart.find(item => item.productId === productId);
          if (item) {
            await apiService.removeFromCart(item.id);
            await get().getCart();
          }
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to remove from cart' });
        }
      },

      updateCartItem: async (productId, quantity) => {
        try {
          const cart = get().cart;
          const item = cart.find(item => item.productId === productId);
          if (item) {
            await apiService.updateCartItem(item.id, quantity);
            await get().getCart();
          }
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to update cart' });
        }
      },

      clearCart: async () => {
        try {
          await apiService.clearCart();
          set({ cart: [], cartCount: 0 });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to clear cart' });
        }
      },

      getCart: async () => {
        try {
          const response = await apiService.getCart();
          if (response.success) {
            const cart = response.data;
            set({ 
              cart: cart.items || [], 
              cartCount: cart.items?.length || 0 
            });
          }
        } catch (error: any) {
          console.error('Failed to fetch cart:', error);
        }
      },

      // Wishlist actions
      addToWishlist: async (productId) => {
        try {
          await apiService.addToWishlist(productId);
          const { wishlist } = get();
          set({ wishlist: [...wishlist, productId] });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to add to wishlist' });
        }
      },

      removeFromWishlist: async (productId) => {
        try {
          await apiService.removeFromWishlist(productId);
          const { wishlist } = get();
          set({ wishlist: wishlist.filter(id => id !== productId) });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to remove from wishlist' });
        }
      },

      getWishlist: async () => {
        try {
          const response = await apiService.getWishlist();
          if (response.success) {
            set({ favorites: response.data });
          }
        } catch (error: any) {
          console.error('Failed to fetch wishlist:', error);
        }
      },

      // Product actions
      fetchProducts: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getProducts(filters);
          // You might want to store products in state here
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Failed to fetch products' 
          });
        }
      },

      fetchProduct: async (id) => {
        try {
          const response = await apiService.getProduct(id);
          if (response.success) {
            return response.data;
          }
          return null;
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Failed to fetch product' });
          return null;
        }
      },

      searchProducts: async (query) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.searchProducts({ query });
          // You might want to store search results in state here
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Search failed' 
          });
        }
      },

      // Order actions
      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.getOrders();
          // You might want to store orders in state here
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Failed to fetch orders' 
          });
        }
      },

      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.createOrder(orderData);
          if (response.success) {
            set({ isLoading: false });
            return response.data;
          }
          return null;
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || 'Failed to create order' 
          });
          return null;
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
    }),
    {
      name: 'genosys-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
        cartCount: state.cartCount,
        wishlist: state.wishlist,
        favorites: state.favorites,
      }),
    }
  )
);
