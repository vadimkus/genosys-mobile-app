/**
 * Product Cache Service
 * Caches the product catalog in AsyncStorage for offline browsing.
 * - On successful API fetch: updates the cache
 * - On network failure: returns cached data so users can still browse
 * - Cache expires after 1 hour (configurable)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../utils/logger';

const log = createLogger('ProductCache');

const CACHE_KEY = '@product_catalog';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Save products to cache with timestamp
 */
export async function cacheProducts(products) {
  try {
    if (!Array.isArray(products) || products.length === 0) return;
    const payload = {
      products,
      cachedAt: Date.now(),
      count: products.length,
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    log.debug('Products cached', { count: products.length });
  } catch (error) {
    log.warn('Failed to cache products', error?.message);
  }
}

/**
 * Load cached products (returns null if cache is empty or expired)
 * @param {boolean} ignoreExpiry - If true, return cache even if expired (for offline fallback)
 */
export async function getCachedProducts(ignoreExpiry = false) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (!payload?.products || !Array.isArray(payload.products)) return null;

    const age = Date.now() - (payload.cachedAt || 0);
    if (!ignoreExpiry && age > CACHE_TTL_MS) {
      log.debug('Product cache expired', { ageMinutes: Math.round(age / 60000) });
      return null;
    }

    log.debug('Loaded cached products', {
      count: payload.count,
      ageMinutes: Math.round(age / 60000),
      expired: age > CACHE_TTL_MS,
    });
    return payload.products;
  } catch (error) {
    log.warn('Failed to read product cache', error?.message);
    return null;
  }
}

/**
 * Clear the product cache
 */
export async function clearProductCache() {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    log.debug('Product cache cleared');
  } catch (error) {
    log.warn('Failed to clear product cache', error?.message);
  }
}
