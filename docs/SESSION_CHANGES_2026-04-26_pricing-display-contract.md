# Pricing Contract Display Migration — Native Read-Only Slice

Date: 2026-04-26

## Context

The website mobile API now returns a server-side `pricing` contract beside the legacy `price`, `displayPrice`, and `originalPrice` fields. This native-app slice starts consuming that contract for display only.

No cart totals, checkout totals, order payload pricing, bundle math, or promotion/free-item math were changed.

## What Changed

- Added `utils/pricingDisplay.js`.
  - Prefers `product.pricing` when `source === 'server'`.
  - Falls back to legacy `displayPrice`, `originalPrice`, and `price`.
  - Supports selected size/color display prices from `product.variants`.
  - Preserves zero-price contracts for price-on-request products.
- Updated display-only surfaces to use the helper:
  - `app/(tabs)/shop.js`
  - `components/ProductGridItem.js`
  - `app/product/[id].js`
  - `components/product/PerfectCombinationCard.js`
  - `app/favorites.js`
  - `app/(tabs)/bag.js` line-item display only
  - `app/chat.js`
  - `components/SkinAnalysisResults.js`
- Added `scripts/smoke-pricing-display.js`.
- Added `npm run smoke:pricing-display`.

## Test Matrix

The smoke script covers:

- Legacy retail fallback
- Server user-discount contract
- Guest contract preserving the display value
- Beauty Box contract with original/final price
- Price-on-request contract
- Selected variant display override

## Important Guardrails

This slice is display-only:

- `utils/cartUtils.js` was not changed.
- `contexts/CartContext.js` pricing/totals logic was not changed.
- `app/checkout.js` was not changed.
- `services/orderService.js` was not changed.
- Existing stored carts still use legacy fields and native cart fallback logic.

## Rollback

Rollback is straightforward:

1. Revert `utils/pricingDisplay.js`.
2. Revert the display-surface imports/usages.
3. Keep the server API `pricing` field in place; old display fields still work.

## Next Step

After manual review in the app, the next safe slice is native cart totals migration:

- Let `calculateCartTotals()` prefer `item.product.pricing.unitPrice`.
- Keep promo items as explicit zero-price lines.
- Keep bundle discount data explicit.
- Keep legacy fallback for old AsyncStorage carts.
