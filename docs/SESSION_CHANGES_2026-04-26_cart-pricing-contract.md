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

## Test Matrix

Smoke coverage checks:

- Server user-discount contract uses final unit price in subtotal.
- Promo/free item does not affect subtotal.
- Guest contract falls back to legacy discount after login.
- Build Your Set bundle keeps bundle discount only.
- Selected variant price overrides default contract price.
- Waterfall summary uses contract original price and explicit bundle discount.

## Guardrails

Still not changed:

- Checkout screen payload construction.
- Mobile order API.
- Stripe checkout session.
- Server checkout recalculation.

The cart UI display is closer to server contract behavior, but checkout remains protected by existing server-side recalculation.

## Rollback

Revert:

- `utils/cartUtils.js`
- `utils/pricingDisplay.js` selected-variant unit-price tweak
- `scripts/smoke-cart-pricing-contract.js`
- the `smoke:cart-pricing-contract` script / `tsx` dev dependency

Legacy fields remain available in cart items, so rollback is low-risk.
