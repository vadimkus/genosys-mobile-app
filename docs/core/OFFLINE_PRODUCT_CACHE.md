# Offline Product Browsing

## Overview

The product catalog is cached locally using AsyncStorage so users can browse products without an internet connection. When the network is unavailable, the app seamlessly falls back to cached data.

---

## How It Works

### Cache Flow

```
API Request Success:
  fetchProducts() → API → products displayed → cacheProducts() → AsyncStorage

API Request Failure (offline):
  fetchProducts() → network error → getCachedProducts(ignoreExpiry=true) → AsyncStorage → products displayed
```

### Cache Behavior

| Scenario | Behavior |
|---|---|
| Online, fresh load | Fetches from API, displays products, caches in background |
| Online, pull-to-refresh | Fetches fresh data from API, updates cache |
| Offline, cache available | Displays cached products (even if expired) |
| Offline, no cache | Shows empty state / error |
| Cache TTL expired, online | Fetches from API (ignores expired cache) |

### Cache Configuration

| Setting | Value | Notes |
|---|---|---|
| Storage key | `@product_catalog` | AsyncStorage key |
| TTL | 1 hour (3,600,000 ms) | Configurable in `CACHE_TTL_MS` |
| Expiry behavior | Ignored when offline | Always returns cached data for offline fallback |
| Cache contents | Full product array + timestamp + count | JSON serialized |

---

## Implementation Files

| File | Purpose |
|---|---|
| `services/productCache.js` | Cache read/write/clear functions |
| `app/(tabs)/shop.js` | Integration point: caches on success, falls back on failure |

---

## API

### `cacheProducts(products: Array)`
Saves the product array to AsyncStorage with a timestamp. Silently fails if storage is unavailable.

### `getCachedProducts(ignoreExpiry?: boolean): Array | null`
Returns cached products if available. When `ignoreExpiry` is `true`, returns data regardless of TTL (used for offline fallback). Returns `null` if no cache exists.

### `clearProductCache()`
Removes the cached product data. Useful for logout or manual refresh scenarios.

---

## What Is Cached

The full product catalog as returned by the API, including:
- Product names, descriptions, images
- Pricing and discount information
- Categories and tags
- Stock status
- Badge data

**Note**: Personalized pricing (user-specific discounts) is cached as-is. If the user logs in as a different account while offline, they may see the previous user's pricing. This is acceptable for browse-only offline use.

---

## Cart Persistence

The shopping cart is separately persisted via `CartContext` using AsyncStorage (key: `@cart_items`). This was already implemented before this feature. Together with the product cache, users can:
1. Browse the full catalog offline
2. View their cart offline
3. Resume shopping when connectivity returns
