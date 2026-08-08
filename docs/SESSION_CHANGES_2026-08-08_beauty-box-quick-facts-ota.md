# Beauty Box Quick Facts native OTA

**Date:** 2026-08-08  
**Runtime:** 1.11.0  
**Scope:** native iOS and Android product details

## Why a client update was required

The website already had a Quick Facts disclosure, but the native app had no component that could render a `quickFacts` API field. A one-time native presentation layer was therefore required. Fact content and localization remain server-owned, so later Quick Facts edits do not require another app release.

## Implementation

- Added `components/product/ProductQuickFactsCard.js`.
- Added the card directly below the product summary on `app/product/[id].js`.
- The card consumes `product.quickFacts` from `GET /api/mobile/products/{id}`.
- It contains no Beauty Box IDs, contents, savings or claim copy.
- EN/RU/AR section chrome is localized.
- Arabic uses reversed rows, right-aligned text and RTL writing direction.
- Titles and supporting text wrap naturally with no fixed height or line clamp.
- Empty or missing API facts hide the card safely.

The server catalog owns all six facts for Beauty Boxes 55, 56, 57, 58, 59 and 62.

## Verification

- TypeScript: passed.
- Expo iOS bundle export: passed.
- Expo Android bundle export: passed.
- Full release smoke suite: passed.
- Production mobile API: 18/18 box-locale payloads returned six localized facts.
- Website production audit also confirmed the same facts on all six PDPs in EN/RU/AR.

## Source and deployment

- Website catalog/API commit: `5ea7d17e`.
- Mobile renderer commit: `1f55b3facab4626b03f9a8772ef42daefb6fbc4f`.
- Branch: `production`.
- Runtime: `1.11.0`.
- Update group: `4180b771-011d-4b01-bfd9-a4746fffe9d4`.
- Android update: `019fe274-1046-7c6e-a8cd-39feddb8e53b`.
- iOS update: `019fe274-1046-788e-8d29-041fb8999383`.
- Dashboard: `https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/4180b771-011d-4b01-bfd9-a4746fffe9d4`.

The unrelated Android developer-verification session document already present in the worktree was not committed.
