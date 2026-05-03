# Release Notes — Version 1.10.1 (Build 83)

## App Store "What's New" Text

```
This update improves professional pricing clarity and checkout reliability.

Build Your Set discounts now show clearly in the bag and checkout, including per-line savings and the bundle discount percentage. We also fixed stale account discounts so removed customer discounts no longer continue to appear after restart.

Includes checkout pricing display refinements and stability improvements delivered via recent iOS updates.
```

## App Store Connect Metadata

| Field | Value |
|-------|-------|
| Version | 1.10.1 |
| iOS Build | 83 |
| Android Version Code | 83 |
| Runtime Version | 1.10.1 |
| Category | Shopping |
| Content Rating | 4+ |
| Price | Free |

## Review Notes for Apple

```
This release includes JavaScript checkout and pricing fixes that were validated through EAS Update on the production iOS runtime and are now bundled into the next binary.

Key areas to review:
1. Sign in with a normal user account that has no user discount.
2. Open Build Your Set, select 5+ products, and add them to the bag.
3. Confirm bag lines show discounted bundle prices and the total includes the 20% bundle discount.
4. Proceed to checkout and expand the order summary.
5. Confirm each Build Your Set line shows retail price, -20%, and final discounted price.
6. Confirm the checkout order header and totals show Bundle Discount (20%).
7. Confirm free promotional masks remain free and do not affect paid subtotal.

No new permissions. No new native SDKs. No data collection changes.
```

## Technical Summary

### Discount State Fix

- Sanitizes user session discount fields so `discountPercentage` is only active when `discountType` exists.
- Clears cached product catalog when the user's discount signature changes.
- Requires active `discountType` before native product, bag, checkout, profile, order-history, and cart fallbacks display/apply user discounts.
- Aligns native behavior with the website backend fix in `cosmetics-website` commit `58a7dbf2`.

### Build Your Set Fix

- Adds Build Your Set products to cart as one atomic batch via `addBundleItems()`.
- Prevents temporary one-item reconciliation from stripping bundle metadata.
- Preserves `fromBundle` and `bundleDiscountPercent` so line-level and order-level discount displays work.
- Existing carts created before the fix should be cleared and rebuilt because they already lost metadata.

### Checkout Display Fix

- Checkout order summary now renders bundle lines with retail price, `-20%`, and final discounted price.
- Collapsed checkout order header now indicates `Bundle Discount (20%)` when active.
- Existing waterfall totals remain unchanged; this is a display clarity improvement over already-correct math.

## Verification

- `npm run smoke:cart-pricing-contract` passed.
- `npm run smoke:order-payload-pricing-contract` passed.
- `npm run smoke:pricing-display` passed.
- `ReadLints` reported no errors on changed native files.

## EAS Updates Included Before Binary

| Purpose | Platform | Runtime | Update Group |
|---------|----------|---------|--------------|
| Fix stale user discount after admin removal | iOS | 1.10.0 | `39296562-2748-4a55-95b4-b6a66ed95406` |
| Fix Build Your Set bundle discounts in bag | iOS | 1.10.0 | `8102a436-5380-47a6-b2e1-bbf712a35b8e` |
| Show bundle discount per checkout line | iOS | 1.10.0 | `68863a35-ce2d-4887-8d2e-43eb1db079fe` |

## Modified Areas

| Area | Files |
|------|-------|
| Auth/session discount state | `services/secureTokenStorage.js`, `contexts/AuthContext.js`, `utils/userProfile.js` |
| Product and cart display | `components/ProductGridItem.js`, `app/(tabs)/bag.js`, `app/product/[id].js`, `utils/cartUtils.js`, `contexts/CartContext.js` |
| Build Your Set | `app/bundle-builder.js`, `contexts/CartContext.js` |
| Checkout summary | `app/checkout.js`, `components/checkout/CheckoutOrderHeaderCard.js` |
| Profile/order fallback display | `app/profile.js`, `app/profile/orders.js`, `app/profile/orders/[id].js` |
| Release metadata | `app.json`, `package.json`, `package-lock.json`, `ios/GenosysUAE/Info.plist`, `ios/GenosysUAE/Supporting/Expo.plist` |

## Build Notes

- Version bumped from `1.10.0` to `1.10.1`.
- iOS build number bumped from `82` to `83`.
- Android version code bumped from `82` to `83`.
- Runtime version synced to `1.10.1` using `npm run sync:runtime`.
