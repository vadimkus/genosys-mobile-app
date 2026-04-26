# Pricing Contract Cleanup Slice — 2026-04-26

## Context

This is the first cleanup pass after the pricing contract migration was deployed and manually verified on desktop and iOS. Android was not manually checked because no Android device was available, so the cleanup stays focused on display-only paths and bundle-retail helpers.

## Changes

- `components/HeroCard.js` now prefers `getPricingDisplay()` when a server pricing contract exists, with the old fixed-price override fallback preserved for stale payloads.
- `components/checkout/CheckoutOrderHeaderCard.js` now formats expanded order-summary line prices through `getPricingDisplay()`.
- `app/bundle-builder.js` now routes retail-price reads through `getPricingDisplay().basePrice` via a local `getBundleRetailPrice()` helper.
- Bundle builder still applies only the bundle discount. VIP/user discounts are intentionally not stacked there.

## Guardrails

- Stale carts still have legacy fallback behavior.
- Promo/free item logic remains unchanged.
- Cart totals and waterfall pricing remain on the already-tested contract-aware path from the previous slice.
- No native runtime/version change was made in this pass.

## Verification

- `npm run smoke:pricing-display`
- `npm run smoke:cart-pricing-contract`

Manual status:

- Desktop website: verified by Vadim.
- iOS app: verified by Vadim.
- Android app: not manually verified due to no available Android phone.

## Rollback

Revert this cleanup commit only. Earlier pricing display/cart contract slices remain independently deployable.
