/**
 * Test Utilities
 * Common utilities and helpers for testing
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import { CartProvider } from '../contexts/CartContext';

// Mock theme for testing
const mockTheme = {
  colors: {
    primary: '#dc2626',
    secondary: '#6b7280',
    background: '#ffffff',
    surface: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

// Mock theme context
const mockThemeContext = {
  theme: mockTheme,
  isDark: false,
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
};

// Mock cart context
const mockCartContext = {
  items: [],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  getTotalItems: jest.fn(() => 0),
  getTotalPrice: jest.fn(() => 0),
};

// Custom render function with providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  getId: jest.fn(),
};

// Mock route
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
  path: undefined,
};

// Mock product data
export const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 100,
  image: 'https://example.com/image.jpg',
  imageUrl: 'https://example.com/image.jpg',
  description: 'Test product description',
  category: 'Test Category',
  brand: 'Test Brand',
  sku: 'TEST-001',
  isOnSale: false,
  isNew: false,
  isFeatured: false,
  inStock: true,
  averageRating: 4.5,
  reviewCount: 10,
  originalPrice: null,
};

// Mock user data
export const mockUser = {
  id: '1',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'user',
  emailVerified: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

// Test helpers
export const createMockProps = (overrides = {}) => ({
  navigation: mockNavigation,
  route: mockRoute,
  ...overrides,
});

export const waitForAsync = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

// Mock API responses
export const mockApiResponse = {
  success: true,
  data: {},
  message: 'Success',
};

export const mockApiError = {
  success: false,
  error: 'Test error',
  message: 'Test error message',
};

// Mock functions
export const mockFunctions = {
  onPress: jest.fn(),
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  onFocus: jest.fn(),
  onBlur: jest.fn(),
  onLoad: jest.fn(),
  onError: jest.fn(),
};

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };
export { mockTheme, mockThemeContext, mockCartContext };
