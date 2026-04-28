# Native Bundle VIP Discount Badges

Date: 2026-04-28

## Context

In TestFlight, user `f.this.that@gmail.com` has a 50% account discount. When products were added normally, the bag row showed the per-product `50% off` badge. When the same products were added through Build Your Set, the cart total used the correct 50% effective pricing, but individual bundle rows did not show the `50% off` text.

## Root Cause

`app/(tabs)/bag.js` short-circuited bundle rows before the normal VIP discount display branch. The bundle branch only knew how to render the bundle-tier label, so rows where the VIP/user discount beat the bundle discount skipped the visible VIP badge.

## Change

- Updated the Build Your Set row display branch in `app/(tabs)/bag.js`.
- Bundle rows now compare:
  - the Build Your Set bundle unit price, and
  - the user's personal discount unit price.
- If the user discount wins, the row renders the same `50% off` badge style used by normally added products.
- If the bundle tier wins, the row continues to show the bundle discount label.
- Pricing totals were not changed by this patch; this is a display fix.

## Verification

Ran native release smoke checks:

```bash
npm run verify:release
```

Passed:

- `smoke:pricing-display`
- `smoke:cart-pricing-contract`
- `smoke:order-payload-pricing-contract`
- `smoke:orders-repository`

No IDE linter errors were reported for `app/(tabs)/bag.js`.

## OTA

Published via EAS Update:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `36bf1f59-662d-4ca3-bac1-76c8f7cb6423`
- Android update ID: `019dd2e6-2933-7928-91c4-ebd92a72cd2a`
- iOS update ID: `019dd2e6-2933-72e4-89ad-0732a36e0e3d`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/36bf1f59-662d-4ca3-bac1-76c8f7cb6423
