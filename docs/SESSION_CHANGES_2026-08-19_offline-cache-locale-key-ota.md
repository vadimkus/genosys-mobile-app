# Offline product cache keyed by language — OTA

**Date:** 2026-08-19  
**Runtime:** 1.11.0  
**Update group:** `692fa7a2-aa88-4003-8654-b93e642c42c0`  
**Scope:** JS only — `services/productCache.js`, `app/(tabs)/shop.js`

## Why a client update was required

The offline cache lived under one AsyncStorage key, `@product_catalog`, with no
language in it. The cached payload holds names, descriptions and — since the
translated studio slides shipped the same day — image paths, all of which differ
per language. So browsing in Arabic, going offline and switching to English
served the Arabic payload back, because whichever language was fetched last owned
the entry.

The key is client-side, so no server change could fix it.

## Implementation

- Cache key is now `@product_catalog:<locale>`, one entry per language.
- `cacheProducts(products, locale)` and `getCachedProducts(ignoreExpiry, locale)`
  take the locale; the three call sites in `app/(tabs)/shop.js` pass the active one.
- A read finds that language's cache or finds nothing. It never falls back to
  another language, so the app cannot answer in the wrong one.
- `ru-RU` and `ru` resolve to the same entry; an unrecognised locale falls back to
  `en` rather than creating a stray bucket.
- `clearProductCache()` clears every language plus the legacy key, so it stays a
  reliable way to force a refetch.
- The pre-upgrade `@product_catalog` key is deleted on the next cache write rather
  than read, because nothing recorded which language it held and that ambiguity is
  the bug. Cost is one offline session without a cache; it refills on the next
  successful fetch.

Online behaviour is unchanged — the cache is still only read when a fetch fails.

## Verification

- The real module was bundled against a stubbed AsyncStorage and exercised
  directly. 11/11 checks passed, including the original bug as a scenario: cache in
  Arabic, read as English, get `null`.
- Covered: per-language isolation, coexistence of two languages, key namespacing,
  `ru-RU` normalization, unknown-locale fallback, TTL enforcement, offline expiry
  bypass, clear-all, and legacy-key purge.
- `npm run sync:runtime` reported 1.11.0 already aligned; no runtime bump, since
  this is a pure JS change.

## Related

Ships alongside the website work that made the cache's language matter: translated
Cerabarrier slides for RU and AR, served to the app through the same
`localizeProductImage` mapping in the mobile product routes. That part needed no
app release — only this cache fix did.
