/**
 * Pricing Service
 * Centralized pricing logic and size management for products
 */

import { Product } from '../types';

export interface PricingRule {
  productNamePattern: string;
  sizes?: Record<string, number>;
  defaultPrice?: number;
}

export const PRICING_RULES: PricingRule[] = [
  {
    productNamePattern: 'intensive hydro soothing cream',
    sizes: {
      '50g': 290.0,
      '250g': 420.0,
    },
  },
  {
    productNamePattern: 'intensive problem control cream',
    sizes: {
      '50g': 290.0,
      '250g': 420.0,
    },
  },
  {
    productNamePattern: 'intensive problem control toner',
    sizes: {
      '200ml': 180.0,
      '500ml': 320.0,
    },
  },
  {
    productNamePattern: 'ultra shield sun cream',
    sizes: {
      '50ml': 320.0,
      '100ml': 450.0,
    },
  },
  {
    productNamePattern: 'eye cell eye peptide gel patch',
    sizes: {
      '30 patches': 380.0,
      '60 patches': 680.0,
    },
  },
  {
    productNamePattern: 'nd cell anti-wrinkle cream',
    sizes: {
      '30ml': 520.0,
      '50ml': 720.0,
    },
  },
  {
    productNamePattern: 'genosys kit',
    sizes: {
      Basic: 1200.0,
      Premium: 1800.0,
      Professional: 2500.0,
    },
  },
];

export class PricingService {
  /**
   * Get available sizes for a product
   */
  static getAvailableSizes(product: Product): string[] {
    const rule = this.findPricingRule(product);
    if (rule?.sizes) {
      return Object.keys(rule.sizes);
    }
    return [];
  }

  /**
   * Get price for a specific size
   */
  static getPriceForSize(product: Product, size: string): number {
    const rule = this.findPricingRule(product);
    if (rule?.sizes?.[size]) {
      return rule.sizes[size];
    }
    return product.price;
  }

  /**
   * Get all available sizes with their prices
   */
  static getSizeOptions(
    product: Product
  ): Array<{ size: string; price: number }> {
    const rule = this.findPricingRule(product);
    if (rule?.sizes) {
      return Object.entries(rule.sizes).map(([size, price]) => ({
        size,
        price,
      }));
    }
    return [];
  }

  /**
   * Check if product has size variants
   */
  static hasSizeVariants(product: Product): boolean {
    const rule = this.findPricingRule(product);
    return !!(rule?.sizes && Object.keys(rule.sizes).length > 0);
  }

  /**
   * Get the default size for a product
   */
  static getDefaultSize(product: Product): string | null {
    const sizes = this.getAvailableSizes(product);
    return sizes.length > 0 ? sizes[0] : null;
  }

  /**
   * Find pricing rule for a product
   */
  private static findPricingRule(product: Product): PricingRule | undefined {
    const productName = product.name.toLowerCase();
    return PRICING_RULES.find(rule =>
      productName.includes(rule.productNamePattern.toLowerCase())
    );
  }

  /**
   * Calculate discount percentage
   */
  static calculateDiscountPercentage(
    originalPrice: number,
    salePrice: number
  ): number {
    if (originalPrice <= 0 || salePrice >= originalPrice) {
      return 0;
    }
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'AED'): string {
    return `${currency} ${price.toFixed(2)}`;
  }

  /**
   * Get price range for a product with multiple sizes
   */
  static getPriceRange(product: Product): { min: number; max: number } | null {
    const rule = this.findPricingRule(product);
    if (rule?.sizes) {
      const prices = Object.values(rule.sizes);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };
    }
    return null;
  }
}

export default PricingService;
