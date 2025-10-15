/**
 * Image Caching Service
 * Manages image caching and optimization strategies
 */

import FastImage from 'react-native-fast-image';
import { ENV } from '../config/environment';

interface CacheConfig {
  maxCacheSize: number;
  maxCacheAge: number;
  preloadImages: boolean;
}

class ImageCacheService {
  private config: CacheConfig = {
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    maxCacheAge: ENV.IMAGE_CACHE_DURATION, // 24 hours
    preloadImages: true,
  };

  /**
   * Preload critical images
   */
  async preloadCriticalImages(imageUrls: string[]): Promise<void> {
    if (!this.config.preloadImages) return;

    try {
      console.log('🖼️ Preloading critical images...');

      const preloadPromises = imageUrls.map(url =>
        FastImage.preload([{ uri: url, priority: FastImage.priority.high }])
      );

      await Promise.all(preloadPromises);
      console.log(`✅ Preloaded ${imageUrls.length} critical images`);
    } catch (error) {
      console.error('❌ Error preloading images:', error);
    }
  }

  /**
   * Preload product images
   */
  async preloadProductImages(products: any[]): Promise<void> {
    const imageUrls = products
      .slice(0, 10) // Preload first 10 products
      .map(product => product.image)
      .filter(Boolean);

    await this.preloadCriticalImages(imageUrls);
  }

  /**
   * Clear image cache
   */
  async clearCache(): Promise<void> {
    try {
      await FastImage.clearMemoryCache();
      await FastImage.clearDiskCache();
      console.log('✅ Image cache cleared');
    } catch (error) {
      console.error('❌ Error clearing image cache:', error);
    }
  }

  /**
   * Get cache size (approximate)
   */
  async getCacheSize(): Promise<number> {
    try {
      // This would require native implementation in a real app
      console.log('📊 Cache size monitoring would be implemented here');
      return 0;
    } catch (error) {
      console.error('❌ Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Optimize image URL for different screen densities
   */
  optimizeImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return url;

    // Add query parameters for optimization
    const urlObj = new URL(url);

    if (width) {
      urlObj.searchParams.set('w', width.toString());
    }

    if (height) {
      urlObj.searchParams.set('h', height.toString());
    }

    // Add quality parameter
    urlObj.searchParams.set('q', '80');

    return urlObj.toString();
  }

  /**
   * Get optimized image source for different use cases
   */
  getOptimizedImageSource(
    url: string,
    useCase: 'thumbnail' | 'card' | 'detail' | 'fullscreen'
  ) {
    const dimensions = {
      thumbnail: { width: 80, height: 80 },
      card: { width: 200, height: 200 },
      detail: { width: 300, height: 300 },
      fullscreen: { width: 400, height: 400 },
    };

    const { width, height } = dimensions[useCase];
    const optimizedUrl = this.optimizeImageUrl(url, width, height);

    return {
      uri: optimizedUrl,
      priority:
        useCase === 'thumbnail'
          ? FastImage.priority.low
          : FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    };
  }

  /**
   * Batch preload images with progress tracking
   */
  async batchPreloadImages(
    imageUrls: string[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    const batchSize = 5;
    let loaded = 0;

    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);

      try {
        await Promise.all(
          batch.map(url =>
            FastImage.preload([
              { uri: url, priority: FastImage.priority.normal },
            ])
          )
        );

        loaded += batch.length;
        onProgress?.(loaded, imageUrls.length);

        // Small delay between batches to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('❌ Error in batch preload:', error);
      }
    }
  }

  /**
   * Configure cache settings
   */
  configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('🔧 Image cache configured:', this.config);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { config: CacheConfig; status: string } {
    return {
      config: this.config,
      status: this.config.preloadImages ? 'enabled' : 'disabled',
    };
  }
}

// Singleton instance
export const imageCacheService = new ImageCacheService();

// Convenience functions
export const preloadImages = (urls: string[]) =>
  imageCacheService.preloadCriticalImages(urls);
export const preloadProductImages = (products: any[]) =>
  imageCacheService.preloadProductImages(products);
export const clearImageCache = () => imageCacheService.clearCache();
export const getOptimizedImageSource = (
  url: string,
  useCase: 'thumbnail' | 'card' | 'detail' | 'fullscreen'
) => imageCacheService.getOptimizedImageSource(url, useCase);

export default imageCacheService;
