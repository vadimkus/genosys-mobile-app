# Pricing Contract Migration — Native Cart Totals Slice

Date: 2026-04-26

## Context

The native app already had a read-only display helper that prefers the server `product.pricing` contract. This slice moves one step deeper: cart totals now prefer contract unit prices where safe, while keeping legacy fallbacks for old cached carts.

## What Changed

- Updated `utils/cartUtils.js`.
  - `calculateCartTotals()` now uses `getPricingDisplay()` and prefers `pricing.unitPrice` when the cart item has a usable server contract.
  - Guest contracts inside carts still fall back to legacy user-discount math after login, so a saved anonymous cart does not lose VIP discount behavior.
  - Promo/free items remain zero-total lines.
  - Build Your Set bundle items still use explicit `bundleDiscountPercent` and do not stack VIP/user discount.
  - `computeWaterfallBreakdown()` now understands server contract original/display values for summary rows.
- Updated `utils/pricingDisplay.js` so selected variant display overrides also flow through `unitPrice`.
- Added `scripts/smoke-cart-pricing-contract.js`.
- Added `npm run smoke:cart-pricing-contract`.
- Added `tsx` as a dev dependency so smoke scripts can import native ESM modules directly.

## Follow-Up: Checkout Payload Pricing

- Added `utils/orderPayloadPricing.js`, a pure helper for mobile order item payload construction.
- `services/orderService.js` now routes both `submitCODOrder()` and `submitCardOrder()` item payload prices through that helper.
- The helper prefers `product.pricing` via `getPricingDisplay()`, preserves selected variant prices, keeps promo/free items at zero, and keeps Build Your Set bundle pricing as bundle-only without VIP stacking.
- Follow-up bundle-builder slice: `app/bundle-builder.js` now preserves `product.pricing` when adding bundle items to the cart, while still pre-calculating bundle-only item price and clearing variants because the builder does not expose variant selection.
- Added `scripts/smoke-order-payload-pricing-contract.js`.
- Added `npm run smoke:order-payload-pricing-contract`.

The backend remains authoritative for final checkout totals. This slice only removes legacy `displayPrice || price` payload math from the native app so submitted item hints match the contract-backed cart display more closely.

## Test Matrix

Smoke coverage checks:

- Server user-discount contract uses final unit price in subtotal.
- Promo/free item does not affect subtotal.
- Guest contract falls back to legacy discount after login.
- Build Your Set bundle keeps bundle discount only.
- Selected variant price overrides default contract price.
- Waterfall summary uses contract original price and explicit bundle discount.
- Order item payload uses server contract unit price.
- Order item payload preserves selected variant override.
- Order item payload keeps bundle-only pricing and bundle metadata.
- Order item payload keeps promo/free gift lines at zero.
- Order item payload preserves zero-price contracts.

## Guardrails

Still not changed:

- Mobile order API.
- Stripe checkout session.
- Server checkout recalculation.

Now changed in the follow-up slice:

- Native checkout item payload construction for COD and card submission.

The cart UI display is closer to server contract behavior, but checkout remains protected by existing server-side recalculation.

## Deployment

Published to EAS Update production after the runtime fix that pins bare-workflow runtime to `1.9.0`.

- Update group: `82647d72-944c-4b07-9796-fd60b0ff0356`
- Branch: `production`
- Runtime: `1.9.0`
- Commit: `a102dc880243fa71a33ccd01df491d32ddf59ae7`
- iOS update: `019dc8c2-a33e-7998-a5cb-26a995b39d45`
- Android update: `019dc8c2-a33e-75df-871b-f9e7d052e388`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/82647d72-944c-4b07-9796-fd60b0ff0356

Follow-up checkout payload pricing slice published to EAS Update production:

- Update group: `562e7fea-22b7-478d-abec-f3f871d7285d`
- Branch: `production`
- Runtime: `1.9.0`
- Commit: `db8bc986088bc443b62fe9614e19ded285b70b1a`
- iOS update: `019dc99d-7080-795e-a8a1-088a50209b46`
- Android update: `019dc99d-7080-75e3-9c85-087ab3e26767`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/562e7fea-22b7-478d-abec-f3f871d7285d

## Rollback

Revert:

- `utils/cartUtils.js`
- `utils/pricingDisplay.js` selected-variant unit-price tweak
- `scripts/smoke-cart-pricing-contract.js`
- the `smoke:cart-pricing-contract` script / `tsx` dev dependency

For the checkout payload follow-up, revert:

- `utils/orderPayloadPricing.js`
- the `services/orderService.js` import and `items.map(buildMobileOrderItemPayload)` calls
- `scripts/smoke-order-payload-pricing-contract.js`
- the `smoke:order-payload-pricing-contract` script

Legacy fields remain available in cart items, so rollback is low-risk.
