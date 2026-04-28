# Session Changes — April 27, 2026 — Build Set Bundle Discount Recalculation

## Context

Vadim reported a native app cart exploit: a customer could use `Build Your Set`, add enough items to receive the `20%` bundle discount, remove items from the bag, and keep only one item with the original bundle discount.

Example from the screenshot:

- `SNOW O2 CLEANSER 180ml`
- Bag had `1 item`
- Still showed `20% OFF (Bundle)`
- Retail `412.50 AED` / discounted `330.00 AED`
- Net subtotal `264.00 AED`

This was wrong because bundle discounts require an active set:

- 2 items: `5%`
- 3 items: `10%`
- 4 items: `15%`
- 5+ items: `20%`
- 1 item: no bundle discount

## Root Cause

Bundle discount metadata was stored per cart line:

- `fromBundle`
- `bundleDiscountPercent`
- `product.fromBundle`
- `product.bundleDiscountPercent`

Removing bundle items did not recalculate the remaining bundle lines. A single leftover item could retain stale `20%` metadata and discounted `price/displayPrice`.

## Fix

Updated `utils/cartUtils.js` with a cart-level reconciliation helper:

- `getBuildSetDiscountForCount(count)`
- `isBuildSetBundleItem(item)`
- `getCartBuildSetBundleDiscountPercent(items)`
- `reconcileBuildSetBundleDiscounts(items)`

Behavior:

- Recomputes the active bundle tier from the current number of bundle lines.
- Updates every remaining bundle item to the correct tier.
- If fewer than 2 bundle items remain, removes bundle metadata and restores the item to retail pricing.
- Removes stale `pricing` contracts from bundle cart lines so the bag uses the reconciled cart price rather than an old server/display contract.

Updated `contexts/CartContext.js` to call reconciliation after:

- loading saved cart from storage
- adding an item
- removing an item
- decrementing an item
- updating quantity

Also prevented regular cart additions from merging into existing bundle lines by requiring the existing line's bundle status to match the incoming add operation.

## Regression Coverage

Extended `scripts/smoke-cart-pricing-contract.js`:

- 5 build-set items keep `20%`
- 4 build-set items downgrade to `15%`
- 1 leftover build-set item loses bundle metadata
- 1 leftover item returns to retail subtotal
- 1 leftover item has no bundle waterfall discount

## Verification

Passed:

- `npm run smoke:cart-pricing-contract`
- `npm run verify:release`
- `npx expo export --platform ios --output-dir /tmp/genosys-mobile-export-ios-bundle-recalc --clear`
- `npx expo export --platform android --output-dir /tmp/genosys-mobile-export-android-bundle-recalc --clear`

## OTA

Published to EAS Update production with production environment variables loaded:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: `android`, `ios`
- Update group ID: `b4d2153b-58e3-4aba-adb7-7cf23db35e57`
- Android update ID: `019dce92-1d80-707f-bde8-b292971ef76d`
- iOS update ID: `019dce92-1d80-77c2-a376-57000b281daa`
- Message: `Fix build set bundle discount recalculation 1.10.0`
