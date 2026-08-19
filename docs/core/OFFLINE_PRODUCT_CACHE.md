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
| Offline, cache available for this language | Displays cached products (even if expired) |
| Offline, cache exists but only in another language | Shows empty state / error — never the wrong language |
| Offline, no cache | Shows empty state / error |
| Cache TTL expired, online | Fetches from API (ignores expired cache) |

### Cache Configuration

| Setting | Value | Notes |
|---|---|---|
| Storage key | `@product_catalog:<locale>` | One entry per language — `:en`, `:ar`, `:ru` |
| TTL | 1 hour (3,600,000 ms) | Configurable in `CACHE_TTL_MS` |
| Expiry behavior | Ignored when offline | Always returns cached data for offline fallback |
| Cache contents | Full product array + timestamp + count + locale | JSON serialized |

### Why the key includes the locale

The payload holds names, descriptions and — since the translated studio slides shipped —
image paths, all of which differ per language. Under the single `@product_catalog` key used
before, browsing in Arabic, going offline and switching to English served the Arabic payload
back, because whichever language was fetched last owned the entry.

Each language now has its own entry, so an offline switch either finds that language's cache
or finds nothing. It never answers in the wrong one.

`ru-RU` and `ru` resolve to the same entry; an unrecognised locale falls back to `en` rather
than creating a stray bucket.

**Upgrading:** the old `@product_catalog` key is deleted on the next cache write rather than
read, because nothing recorded which language it held — and that ambiguity is the bug. The
cost is one offline session without a cache, and it refills on the next successful fetch.

---

## Implementation Files

| File | Purpose |
|---|---|
| `services/productCache.js` | Cache read/write/clear functions |
| `app/(tabs)/shop.js` | Integration point: caches on success, falls back on failure |

---

## API

### `cacheProducts(products: Array, locale: string)`
Saves the product array to AsyncStorage with a timestamp, under the locale it was fetched in. Silently fails if storage is unavailable. Also clears the pre-locale `@product_catalog` key.

### `getCachedProducts(ignoreExpiry?: boolean, locale?: string): Array | null`
Returns cached products **for that locale only**. When `ignoreExpiry` is `true`, returns data regardless of TTL (used for offline fallback). Returns `null` if that language has no cache — it will not fall back to another language. Defaults to `en`.

### `clearProductCache()`
Removes the cached product data for **every** language, plus the legacy key. Useful for logout or manual refresh scenarios.

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
