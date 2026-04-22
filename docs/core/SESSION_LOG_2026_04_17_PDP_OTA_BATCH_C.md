# PDP Batch C — Conversion Boosters (shipped 2026-04-17)

## Summary

Third and final batch of mobile PDP improvements, focused on **conversion boosters**
that reach parity with the web PDP without introducing any native module changes.
All items ship OTA; a new iOS binary (1.9.0 build 77) was also queued so installed
TestFlight users can finally receive updates (the existing prod binary predates
`EXUpdatesEnabled=true`).

## What shipped

| # | Feature | File(s) |
|---|---|---|
| 1 | Quantity stepper in the sticky bottom bar (− / count / +), passes qty to `addItem` | `app/product/[id].js` |
| 2 | Non-blocking **Toast** replaces the old `Alert.alert` after add-to-bag — product name + qty, auto-dismiss, "View Bag" action | `components/Toast.js`, `app/product/[id].js` |
| 3 | Full-screen **ImageLightbox** opens on hero tap — horizontal paging, counter, dots, close button | `components/product/ImageLightbox.js`, `app/product/[id].js` |
| 4 | **Read more / Show less** on long About descriptions (>500 characters), localized EN/AR/RU | `app/product/[id].js` |
| 5 | **VAT included** line under the main price (hidden for price-on-request + Beauty Box bundles) | `app/product/[id].js` |
| 6 | **Out-of-stock guard** — disables Add to Bag, hides stepper, greys button, surfaces the label in both CTA and toast. Conservative detection so missing stock data never blocks checkout | `app/product/[id].js` |

## Implementation notes

- **i18n via inline `PDP_COPY_MAP`**. New strings (`readMore`, `showLess`,
  `vatIncluded`, `outOfStock`, `addedToBag`, `viewBag`, `quantity`) are defined
  in a module-level map keyed by language. Mirrors the `TrustStrip` /
  `TrustBadges` pattern so translations ship with the JS bundle and aren't
  subject to runtime i18n cache misses — the same fix that unblocked the
  Arabic/Russian trust badge rendering on Apr 17.
- **OTA-safe**. Zero new native dependencies. Toast is pure RN `Animated`;
  Lightbox is a standard `Modal` + `FlatList` with `pagingEnabled`.
- **Shared image array**. The hero gallery's `galleryImages` was hoisted out
  of the render IIFE into a `useMemo` so both the inline gallery and the
  Lightbox render the exact same list.
- **Haptics everywhere**. `lightTap` on lightbox open, `selectionTick` on
  every quantity step, `success` on successful add.
- **OOS detection is conservative**. Only flags OOS when an explicit signal
  exists (`status === 'out_of_stock'`, `outOfStock === true`,
  `available === false`, `stock === 0`). Products with undefined stock data
  keep their existing behaviour.

## Shipped

### Git

```
e27dc49 feat(pdp): batch C mobile PDP conversion boosters
ec72508 chore(release): bump to 1.9.0 (iOS 76 / Android versionCode 76)
```

### OTA (runtime 1.0.0, channel `production`)

| Platform | Group ID | EAS Dashboard |
|---|---|---|
| iOS | `608e1d7c-b63c-48ab-8598-166fc94dd310` | https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/608e1d7c-b63c-48ab-8598-166fc94dd310 |
| Android | `0359d51f-23a9-45c5-9786-97f35f1ad013` | https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/0359d51f-23a9-45c5-9786-97f35f1ad013 |

### iOS TestFlight build

- **Build ID**: `f25ea839-e6ee-4a39-88a6-c898edc3f0d1`
- **Version**: 1.9.0 (77) — EAS autoIncrement bumped local 76 → 77
- **Significance**: First App Store binary with `EXUpdatesEnabled=true` in
  `Expo.plist` baked in. Once installed, it will pick up all published OTA
  updates (Batch A + B + C) on subsequent launches.
- **Status**: See `eas build:view f25ea839` or https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/builds/f25ea839-e6ee-4a39-88a6-c898edc3f0d1

## Verification steps (after TestFlight install)

1. Open any product → PDP hero → tap image → lightbox opens, swipe between images, close.
2. Scroll PDP → accordions expand (Batch A), mini-header appears on scroll (Batch B).
3. About section shows "Read more" on long descriptions → tap → expands → "Show less" → collapses.
4. Price block shows "VAT included" line on non-beauty-box, non-quote products.
5. Bottom bar shows qty stepper (− 1 +). Tap +, then Add to Bag → toast slides up with "View Bag" action → auto-dismisses.
6. Switch language to Arabic / Russian → trust strip + trust badges + all Batch C copy render in the correct language.

## Reference

- Batch A + B session log: `docs/core/SESSION_LOG_2026_04_17_PDP_OTA_BATCH_AB.md`
- Web PDP parity target: `/Users/vadimkus/cosmetics-website/app/products/[id]/page.tsx`
