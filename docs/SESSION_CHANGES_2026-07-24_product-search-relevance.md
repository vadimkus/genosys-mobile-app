# Native Product Search Relevance — 2026-07-24

## Problem

The iOS and Android shop search filtered the catalog correctly but preserved API
order. Beauty boxes and unrelated products that only mentioned `hyaluron` in
their descriptions could appear above the actual HYALURON products.

## Fix

- Added shared search matching and relevance scoring in
  `utils/productSearch.js`.
- Product-name matches outrank category, variant and description matches.
- Exact and multi-token intent is prioritized while retaining EN/RU/AR,
  diacritic-insensitive and variant matching.
- The shop grid now uses ranked search results on both iOS and Android.

## Verification

- `hyaluron` ranks product 29 HYALURON CREAM first and product 18 HYALURON
  SERUM second.
- Added `npm run smoke:product-search`.
- iOS Expo export passes.
- Android Expo export passes.

## Production OTA

- Branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `3c3491c7-421d-4a58-b577-ec683df1234c`
- Source commit: `136d1358bfb8dfc69c1d9018d91e6756f11d2e6c`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/3c3491c7-421d-4a58-b577-ec683df1234c
