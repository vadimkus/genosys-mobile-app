/**
 * Shared API Type Definitions
 * 
 * Type definitions for API responses, request payloads, and data models.
 * Used across services, contexts, and components.
 */

// ============= API Response Types =============

export interface ApiResult<T = unknown> {
  ok: boolean;
  data: T | null;
  error: string | null;
  status?: number;
}

export interface LegacyApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============= User Types =============

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  phone?: string;
  address?: string;
  profilePicture?: string | null;
  birthday?: string | null;
  gender?: string | null;
  contactEmail?: string | null;
  authType?: 'email' | 'google' | 'apple' | 'biometric';
  isAdmin?: boolean;
  canSeePrices?: boolean;
  discount?: number;
  createdAt?: string;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  emirate: string;
  country: string;
  isDefault: boolean;
}

// ============= Product Types =============

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameRu?: string;
  description: string;
  descriptionAr?: string;
  descriptionRu?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: string;
  categoryId?: string;
  inStock: boolean;
  variants?: ProductVariant[];
  rating?: number;
  reviewCount?: number;
  slug?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  sku?: string;
}

// ============= Cart Types =============

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  selectedSize?: string;
  selectedColor?: string;
}

// ============= Order Types =============

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'stripe' | 'apple_pay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  variant?: string;
  size?: string;
  color?: string;
}

// ============= Shipping Types =============

export interface ShippingRate {
  emirate: string;
  rate: number;
  freeShippingThreshold?: number;
  estimatedDays?: string;
}

// ============= Auth Types =============

export interface AuthConfig {
  API_BASE_URL: string;
  API_KEY: string;
  WEB_ORIGIN: string;
  ASSET_ORIGIN: string;
  LOGO_URL: string;
  TOKEN_STORAGE_KEY: string;
  SESSION_TIMEOUT: number;
  GOOGLE_OAUTH: {
    clientId: string;
    iosClientId: string;
    androidClientId: string;
    webClientId: string;
    redirectUri: string;
    iosUrlScheme: string;
  };
}

// ============= Blog Types =============

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  titleRu?: string;
  content: string;
  contentAr?: string;
  contentRu?: string;
  excerpt?: string;
  image?: string;
  author?: string;
  publishedAt: string;
  tags?: string[];
}

// ============= Promo Types =============

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive: boolean;
}

// ============= Localization =============

export type Locale = 'en' | 'ar' | 'ru';
export type Direction = 'ltr' | 'rtl';
