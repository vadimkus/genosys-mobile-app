import { Product } from '../types';

export interface ImageMapping {
  productName: string;
  imageUrl: string;
}

export const PRODUCT_IMAGE_MAPPINGS: ImageMapping[] = [
  {
    productName: 'POWER SOLUTION PCS',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FPCS.jpg&w=1200&q=75',
  },
  {
    productName: 'POWER SOLUTION SWS',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FSWS.jpg&w=1200&q=75',
  },
  {
    productName: 'PROBLEM CONTROL SERUM',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FPRSS.jpg&w=1200&q=75',
  },
  {
    productName: 'SOOTHING REPAIR POSTCREAM',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FSRC.jpg&w=1200&q=75',
  },
  {
    productName: 'SKIN DEFENDER LIP & EYE MAKEUP REMOVER',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FDEF.jpg&w=1200&q=75',
  },
  {
    productName: 'SNOW O₂ CLEANSER',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FSNOW.jpg&w=1200&q=75',
  },
  {
    productName: 'SNOW BOOSTER',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FBOOS.jpg&w=1200&q=75',
  },
  {
    productName: 'SKIN RENEWAL PEELING SYSTEM (SRS)',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FSRS.jpg&w=1200&q=75',
  },
  {
    productName: 'SOOTHING BOMB SEA ALGAE MASK',
    imageUrl:
      'https://genosys.ae/_next/image?url=%2Fimages%2FSEA.jpg&w=1200&q=75',
  },
];

export class ImageService {
  static getProductImageUrl(product: Product): string {
    // Check for specific image mapping first
    const mapping = PRODUCT_IMAGE_MAPPINGS.find(
      mapping => mapping.productName === product.name
    );

    if (mapping) {
      return mapping.imageUrl;
    }

    // Fallback to product's default image URL
    return product.imageUrl || '';
  }

  static getOptimizedImageUrl(
    originalUrl: string,
    width: number = 1200,
    quality: number = 75
  ): string {
    if (!originalUrl) return '';

    // If it's already a genosys.ae optimized URL, return as is
    if (originalUrl.includes('genosys.ae/_next/image')) {
      return originalUrl;
    }

    // For other URLs, you might want to implement your own image optimization
    // or use a service like Cloudinary, ImageKit, etc.
    return originalUrl;
  }

  static getPlaceholderImageUrl(): string {
    // Return a placeholder image URL for products without images
    return 'https://via.placeholder.com/400x400?text=No+Image';
  }

  static isValidImageUrl(url: string): boolean {
    if (!url) return false;

    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
