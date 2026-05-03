# Native Discount Removal OTA

Date: 2026-05-03

## Context

After removing the 50% user discount for `f.this.that@gmail.com` in website admin, the native iOS app still showed the discount after restart. Website backend fixes were committed and pushed separately in `cosmetics-website` commit `58a7dbf2`.

## Native App Changes Published

- User session storage now sanitizes discounts so `discountPercentage` only remains active when `discountType` is present.
- Product catalog cache is cleared when the user's discount signature changes.
- Product card, product detail, bag, checkout, profile, order history, and cart fallback logic require an active `discountType` before applying or displaying user discount percentages.
- The cart pricing smoke fixture was updated so active test discounts include `discountType: 'VIP'`.

## Verification

- `npm run smoke:cart-pricing-contract` passed.
- `npm run smoke:order-payload-pricing-contract` passed.
- `npm run smoke:pricing-display` passed.

## EAS Update

- Branch: `production`
- Platform: `ios`
- Runtime: `1.10.0`
- Message: `Fix stale user discount after admin removal`
- Update group ID: `39296562-2748-4a55-95b4-b6a66ed95406`
- iOS update ID: `019decb4-efda-7cd1-b287-de766491ccdc`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/39296562-2748-4a55-95b4-b6a66ed95406

## Notes

The OTA was published from the local working tree before the native app changes were committed to git. Commit hash shown by EAS: `2f162cd4160ca6f39d67d76d010252672bc7a1bd*`.

## Build Your Set Follow-up

After testing the iOS bag with six Build Your Set items, bundle discounts were not visible per line or in the waterfall summary. Root cause: the native bundle builder called `addItem()` once per selected product. `CartContext.addItem()` immediately ran `reconcileBuildSetBundleDiscounts()` after each item; while there was temporarily only one bundle item, the reconciler correctly stripped the bundle flag because a single item does not qualify for a bundle. Later items were added after earlier ones had already lost `fromBundle`, so the final cart had retail prices and no bundle metadata.

Fix:

- Added `addBundleItems()` in `contexts/CartContext.js` to add all selected bundle products atomically.
- Updated `app/bundle-builder.js` to build cart-compatible bundle products and call `addBundleItems()` once.
- Existing bag rendering and waterfall logic then correctly see `fromBundle` + `bundleDiscountPercent`.

Verification:

- `npm run smoke:cart-pricing-contract` passed.
- `npm run smoke:order-payload-pricing-contract` passed.
- `npm run smoke:pricing-display` passed.
- `ReadLints` reported no errors for `app/bundle-builder.js` or `contexts/CartContext.js`.

EAS Update:

- Branch: `production`
- Platform: `ios`
- Runtime: `1.10.0`
- Message: `Fix Build Your Set bundle discounts in bag`
- Update group ID: `8102a436-5380-47a6-b2e1-bbf712a35b8e`
- iOS update ID: `019decc9-3935-79e4-8ce9-3e93408f7eae`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/8102a436-5380-47a6-b2e1-bbf712a35b8e

Testing note: carts created before this OTA already lost bundle metadata, so clear the bag and add the Build Your Set again after the app receives the update.

## Checkout Line Discount Follow-up

After confirming the bundle discount worked in checkout totals, the checkout order summary still displayed each paid line as a final discounted price only, without showing the retail price or percentage on the line. The collapsed order header also only showed the final order total and item count.

Fix:

- `components/checkout/CheckoutOrderHeaderCard.js` now renders Build Your Set lines with retail line price struck through, a `-20%` badge, and the final discounted line price.
- The checkout order header now shows `Bundle Discount (20%)` when a bundle discount is active.
- `app/checkout.js` adds the corresponding summary-line and order-header badge styles.

Verification:

- `npm run smoke:cart-pricing-contract` passed.
- `npm run smoke:order-payload-pricing-contract` passed.
- `npm run smoke:pricing-display` passed.
- `ReadLints` reported no errors for `components/checkout/CheckoutOrderHeaderCard.js` or `app/checkout.js`.

EAS Update:

- Branch: `production`
- Platform: `ios`
- Runtime: `1.10.0`
- Message: `Show bundle discount per checkout line`
- Update group ID: `68863a35-ce2d-4887-8d2e-43eb1db079fe`
- iOS update ID: `019decd8-32c9-74ac-9757-751984527fea`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/68863a35-ce2d-4887-8d2e-43eb1db079fe

## Next Binary Inclusion

All native app changes from the three iOS OTAs above have been folded into the next binary release metadata:

- Next version: `1.10.1`
- iOS build number: `83`
- Android version code: `83`
- Runtime version: `1.10.1`
- App Store release notes: `docs/app-store/RELEASE_NOTES_1.10.1.md`

`npm run sync:runtime` was run after bumping `app.json`, syncing:

- `package.json`
- `package-lock.json`
- `ios/GenosysUAE/Info.plist`
- `ios/GenosysUAE/Supporting/Expo.plist`
- `android/app/build.gradle`

Important OTA note: runtime `1.10.1` is a new runtime for the next binary. Existing App Store users on runtime `1.10.0` continue receiving the already-published iOS OTA fixes listed above.
