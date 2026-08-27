/**
 * Product Cache Service
 * Caches the product catalog in AsyncStorage for offline browsing.
 * - On successful API fetch: updates the cache
 * - On network failure: returns cached data so users can still browse
 * - Cache expires after 1 hour (configurable)
 *
 * THE CACHE IS KEYED BY LOCALE. The payload holds names, descriptions and - since the
 * translated studio slides shipped - image paths, all of which differ per language. A
 * single key meant that browsing in Arabic, going offline and switching to English served
 * the Arabic payload back, because the entry that happened to be written last won.
 *
 * Each language now gets its own entry, so an offline switch either finds that language's
 * cache or finds nothing, and never silently answers in the wrong one.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../utils/logger';

const log = createLogger('ProductCache');

const CACHE_PREFIX = '@product_catalog';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const SUPPORTED_LOCALES = ['en', 'ar', 'ru'];

/**
 * The bare key written by every build before this change, with no record of which language
 * it holds. That ambiguity is the bug, so it is deleted rather than read: the cost is one
 * offline session with no cache, and it refills on the next successful fetch.
 *
 * Spelled out rather than derived from CACHE_PREFIX on purpose - if the prefix is ever
 * renamed, this still has to clean up what old installs actually wrote.
 */
const LEGACY_CACHE_KEY = '@product_catalog';

/** Accepts 'ru', 'ru-RU' or undefined and always returns a supported locale. */
function normalizeLocale(locale) {
  const base = String(locale || 'en').toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.includes(base) ? base : 'en';
}

function cacheKey(locale) {
  return `${CACHE_PREFIX}:${normalizeLocale(locale)}`;
}

/**
 * Dropped on every write rather than once per session: removing a key that is not there
 * costs nothing, and a flag would make the behaviour depend on which function ran first.
 * The read path never looks at the legacy key, so it has nothing to clean up.
 */
async function purgeLegacyCache() {
  try {
    await AsyncStorage.removeItem(LEGACY_CACHE_KEY);
  } catch (error) {
    log.warn('Failed to remove legacy product cache', error?.message);
  }
}

/**
 * Save products to cache with timestamp, under the locale they were fetched in.
 * @param {Array} products
 * @param {string} locale - the locale the payload was fetched with
 */
export async function cacheProducts(products, locale) {
  try {
    if (!Array.isArray(products) || products.length === 0) return;
    await purgeLegacyCache();
    const payload = {
      products,
      cachedAt: Date.now(),
      count: products.length,
      locale: normalizeLocale(locale),
    };
    await AsyncStorage.setItem(cacheKey(locale), JSON.stringify(payload));
    log.debug('Products cached', { count: products.length, locale: normalizeLocale(locale) });
  } catch (error) {
    log.warn('Failed to cache products', error?.message);
  }
}

/**
 * Load cached products for a locale (returns null if empty or expired).
 * @param {boolean} ignoreExpiry - If true, return cache even if expired (for offline fallback)
 * @param {string} locale - the locale to read; entries are never shared between languages
 */
export async function getCachedProducts(ignoreExpiry = false, locale = 'en') {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(locale));
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
      locale: normalizeLocale(locale),
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
 * Clear the product cache. Clears every language, not just the active one, so this stays
 * a reliable way to force a refetch.
 */
export async function clearProductCache() {
  try {
    await AsyncStorage.multiRemove([
      LEGACY_CACHE_KEY,
      ...SUPPORTED_LOCALES.map(l => `${CACHE_PREFIX}:${l}`),
    ]);
    log.debug('Product cache cleared');
  } catch (error) {
    log.warn('Failed to clear product cache', error?.message);
  }
}
