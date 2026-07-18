# PDP and Bag Controls OTA

**Date:** 2026-07-18
**Runtime:** 1.11.0
**Channel:** production

## Fixes

- Removed the floating Genie chat button from native product detail screens.
- Product detail quantity controls now operate on the actual selected bag line once it has been added.
- Pressing minus at quantity 1 removes that line from the bag.
- Pressing minus in the bag at quantity 1 also removes the line instead of remaining disabled.
- The green **In Bag** button on a product page now opens the bag.
- Bundle-originated lines are supported and bundle discounts are reconciled after quantity changes.

## Verification

- TypeScript: passed (`npx tsc --noEmit`)
- Expo iOS and Android export: passed
- OTA published to the production channel after verification.
