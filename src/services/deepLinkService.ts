/**
 * Deep Linking Service
 * Handles deep links, universal links, and app navigation from external sources
 */

import * as Linking from 'expo-linking';
import { analyticsService } from './analyticsService';

interface DeepLinkRoute {
  path: string;
  handler: (params: Record<string, string>) => void;
  description: string;
}

interface ParsedUrl {
  scheme: string;
  hostname: string | null;
  path: string | null;
  queryParams: Record<string, any>;
}

class DeepLinkService {
  private routes: Map<string, DeepLinkRoute> = new Map();
  private isInitialized: boolean = false;
  private pendingUrl: string | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize deep link service
   */
  async initialize(): Promise<void> {
    try {
      // Set up default routes
      this.setupDefaultRoutes();

      // Handle initial URL if app was opened via deep link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        this.pendingUrl = initialUrl;
        console.log('🔗 Initial deep link:', initialUrl);
      }

      // Listen for incoming deep links
      this.setupDeepLinkListener();

      this.isInitialized = true;
      console.log('🔗 Deep link service initialized');
    } catch (error) {
      console.error('❌ Deep link initialization error:', error);
      analyticsService.trackError(error as Error, { service: 'deep_links' });
    }
  }

  /**
   * Set up default routes
   */
  private setupDefaultRoutes(): void {
    // Product routes
    this.addRoute(
      'product/:id',
      params => {
        this.navigateToProduct(params.id);
      },
      'Navigate to product detail'
    );

    this.addRoute(
      'products',
      () => {
        this.navigateToProducts();
      },
      'Navigate to products list'
    );

    this.addRoute(
      'products/category/:category',
      params => {
        this.navigateToProductsByCategory(params.category);
      },
      'Navigate to products by category'
    );

    // Cart routes
    this.addRoute(
      'cart',
      () => {
        this.navigateToCart();
      },
      'Navigate to cart'
    );

    // Order routes
    this.addRoute(
      'order/:id',
      params => {
        this.navigateToOrder(params.id);
      },
      'Navigate to order detail'
    );

    this.addRoute(
      'orders',
      () => {
        this.navigateToOrders();
      },
      'Navigate to orders list'
    );

    // Profile routes
    this.addRoute(
      'profile',
      () => {
        this.navigateToProfile();
      },
      'Navigate to profile'
    );

    this.addRoute(
      'profile/edit',
      () => {
        this.navigateToEditProfile();
      },
      'Navigate to edit profile'
    );

    // Training routes
    this.addRoute(
      'training',
      () => {
        this.navigateToTraining();
      },
      'Navigate to training'
    );

    this.addRoute(
      'training/:materialId',
      params => {
        this.navigateToTrainingMaterial(params.materialId);
      },
      'Navigate to training material'
    );

    // Settings routes
    this.addRoute(
      'settings',
      () => {
        this.navigateToSettings();
      },
      'Navigate to settings'
    );

    // Search routes
    this.addRoute(
      'search',
      params => {
        this.navigateToSearch(params.q);
      },
      'Navigate to search with query'
    );

    // Promotion routes
    this.addRoute(
      'promo/:promoId',
      params => {
        this.navigateToPromotion(params.promoId);
      },
      'Navigate to promotion'
    );

    // Share routes
    this.addRoute(
      'share/product/:id',
      params => {
        this.shareProduct(params.id);
      },
      'Share product'
    );
  }

  /**
   * Add custom route
   */
  addRoute(
    path: string,
    handler: (params: Record<string, string>) => void,
    description: string
  ): void {
    this.routes.set(path, { path, handler, description });
    console.log('🔗 Route added:', path, description);
  }

  /**
   * Remove route
   */
  removeRoute(path: string): void {
    this.routes.delete(path);
    console.log('🔗 Route removed:', path);
  }

  /**
   * Set up deep link listener
   */
  private setupDeepLinkListener(): void {
    Linking.addEventListener('url', event => {
      this.handleDeepLink(event.url);
    });
  }

  /**
   * Handle deep link
   */
  async handleDeepLink(url: string): Promise<void> {
    try {
      console.log('🔗 Handling deep link:', url);

      // Parse URL
      const parsedUrl = this.parseUrl(url);

      // Track deep link usage
      analyticsService.track('deep_link_opened', {
        url,
        scheme: parsedUrl.scheme,
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        queryParams: parsedUrl.queryParams,
      });

      // Find matching route
      const route = this.findMatchingRoute(parsedUrl.path || '');

      if (route) {
        // Extract parameters from path
        const params = this.extractPathParams(route.path, parsedUrl.path || '');

        // Merge with query parameters
        const allParams: Record<string, string> = { ...params };
        Object.entries(parsedUrl.queryParams as Record<string, any>).forEach(
          ([key, value]) => {
            if (typeof value === 'string') {
              allParams[key] = value;
            } else if (Array.isArray(value) && value.length > 0) {
              allParams[key] = value[0] as string;
            }
          }
        );

        // Execute route handler
        route.handler(allParams);

        console.log('✅ Deep link handled:', route.path, allParams);
      } else {
        console.log('❌ No route found for:', parsedUrl.path);
        this.handleUnknownRoute(parsedUrl);
      }
    } catch (error) {
      console.error('❌ Deep link handling error:', error);
      analyticsService.trackError(error as Error, {
        service: 'deep_link_handling',
      });
    }
  }

  /**
   * Parse URL
   */
  private parseUrl(url: string): ParsedUrl {
    try {
      const parsed = Linking.parse(url);
      return {
        scheme: parsed.scheme || '',
        hostname: parsed.hostname || null,
        path: parsed.path || null,
        queryParams: parsed.queryParams || {},
      };
    } catch (error) {
      console.error('❌ URL parsing error:', error);
      return {
        scheme: '',
        hostname: null,
        path: null,
        queryParams: {},
      };
    }
  }

  /**
   * Find matching route
   */
  private findMatchingRoute(path: string): DeepLinkRoute | null {
    for (const [routePath, route] of this.routes) {
      if (this.isPathMatch(routePath, path)) {
        return route;
      }
    }
    return null;
  }

  /**
   * Check if path matches route pattern
   */
  private isPathMatch(routePath: string, actualPath: string): boolean {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');

    if (routeParts.length !== actualParts.length) {
      return false;
    }

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const actualPart = actualParts[i];

      // Skip parameter parts (starting with :)
      if (routePart.startsWith(':')) {
        continue;
      }

      // Exact match required for non-parameter parts
      if (routePart !== actualPart) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract path parameters
   */
  private extractPathParams(
    routePath: string,
    actualPath: string
  ): Record<string, string> {
    const params: Record<string, string> = {};
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const actualPart = actualParts[i];

      if (routePart.startsWith(':')) {
        const paramName = routePart.substring(1);
        params[paramName] = actualPart;
      }
    }

    return params;
  }

  /**
   * Handle unknown route
   */
  private handleUnknownRoute(parsedUrl: ParsedUrl): void {
    // Default behavior for unknown routes
    console.log('🔗 Unknown route, navigating to home');
    this.navigateToHome();
  }

  /**
   * Process pending URL
   */
  async processPendingUrl(): Promise<void> {
    if (this.pendingUrl) {
      await this.handleDeepLink(this.pendingUrl);
      this.pendingUrl = null;
    }
  }

  /**
   * Generate deep link URL
   */
  generateDeepLink(path: string, params?: Record<string, string>): string {
    const baseUrl = Linking.createURL(path);

    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join('&');
      return `${baseUrl}?${queryString}`;
    }

    return baseUrl;
  }

  /**
   * Share deep link
   */
  async shareDeepLink(
    path: string,
    params?: Record<string, string>
  ): Promise<string> {
    const deepLink = this.generateDeepLink(path, params);

    analyticsService.track('deep_link_shared', {
      path,
      params,
      deepLink,
    });

    return deepLink;
  }

  /**
   * Navigation handlers (to be implemented by the app)
   */
  private navigateToProduct(productId: string): void {
    console.log('🧭 Navigate to product:', productId);
    // Implementation would use navigation service
  }

  private navigateToProducts(): void {
    console.log('🧭 Navigate to products');
    // Implementation would use navigation service
  }

  private navigateToProductsByCategory(category: string): void {
    console.log('🧭 Navigate to products by category:', category);
    // Implementation would use navigation service
  }

  private navigateToCart(): void {
    console.log('🧭 Navigate to cart');
    // Implementation would use navigation service
  }

  private navigateToOrder(orderId: string): void {
    console.log('🧭 Navigate to order:', orderId);
    // Implementation would use navigation service
  }

  private navigateToOrders(): void {
    console.log('🧭 Navigate to orders');
    // Implementation would use navigation service
  }

  private navigateToProfile(): void {
    console.log('🧭 Navigate to profile');
    // Implementation would use navigation service
  }

  private navigateToEditProfile(): void {
    console.log('🧭 Navigate to edit profile');
    // Implementation would use navigation service
  }

  private navigateToTraining(): void {
    console.log('🧭 Navigate to training');
    // Implementation would use navigation service
  }

  private navigateToTrainingMaterial(materialId: string): void {
    console.log('🧭 Navigate to training material:', materialId);
    // Implementation would use navigation service
  }

  private navigateToSettings(): void {
    console.log('🧭 Navigate to settings');
    // Implementation would use navigation service
  }

  private navigateToSearch(query?: string): void {
    console.log('🧭 Navigate to search:', query);
    // Implementation would use navigation service
  }

  private navigateToPromotion(promoId: string): void {
    console.log('🧭 Navigate to promotion:', promoId);
    // Implementation would use navigation service
  }

  private shareProduct(productId: string): void {
    console.log('📤 Share product:', productId);
    // Implementation would use sharing service
  }

  private navigateToHome(): void {
    console.log('🧭 Navigate to home');
    // Implementation would use navigation service
  }

  /**
   * Get all registered routes
   */
  getRoutes(): DeepLinkRoute[] {
    return Array.from(this.routes.values());
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    // Remove event listeners
    // Note: In newer versions of expo-linking, you might need to store the subscription
    console.log('🧹 Deep link service cleaned up');
  }
}

// Singleton instance
export const deepLinkService = new DeepLinkService();

// Convenience functions
export const addDeepLinkRoute = (
  path: string,
  handler: (params: Record<string, string>) => void,
  description: string
) => deepLinkService.addRoute(path, handler, description);

export const generateDeepLink = (
  path: string,
  params?: Record<string, string>
) => deepLinkService.generateDeepLink(path, params);

export const shareDeepLink = (path: string, params?: Record<string, string>) =>
  deepLinkService.shareDeepLink(path, params);

export const processPendingDeepLink = () => deepLinkService.processPendingUrl();

export default deepLinkService;
