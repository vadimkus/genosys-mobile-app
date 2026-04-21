# Mobile PDP OTA Batches A + B — 2026-04-17

Two back-to-back OTA updates shipped to production to bring the mobile
product detail page (PDP) to parity with the newly overhauled web PDP and
add native mobile polish.

All changes are JavaScript-only — no native dependencies touched — so
they ride the existing `runtimeVersion: "1.0.0"` build.

---

## Batch A — Web parity: accordions, trust strip, review summary

Commit: `76d2fc0`
Branch: `production`
Runtime: `1.0.0`

### What shipped

1. **`CollapsibleSection` component** (`components/product/CollapsibleSection.js`)
   - Reusable accordion block: icon + title + chevron header, tapping toggles
     the body. `LayoutAnimation.easeInEaseOut` for a smooth transition (opt-in
     on Android via `UIManager.setLayoutAnimationEnabledExperimental`).
   - RTL-aware, accessible (`accessibilityRole="button"` +
     `accessibilityState={{ expanded }}`).

2. **PDP content sections are now accordions** (`app/product/[id].js`)
   - `renderInfoSection`, `renderListSection`, `renderStepsSection`,
     `renderIngredientsSection` each take an `options = { collapsible,
     defaultOpen, icon, iconColor }` and switch between the legacy flat
     layout and the new `CollapsibleSection` wrapper depending on the flag.
   - Call-site config:
     - `Benefits`: collapsible, **open by default** (icon: sparkles).
     - `Directions`: collapsible, collapsed (icon: list).
     - `Key Ingredients`: collapsible, collapsed (icon: leaf).
     - `Note`: collapsible, collapsed (icon: info-circle).
   - `About this product` stays inline (primary read above the fold).

3. **Trust strip rebuilt** (`components/product/TrustBadges.js`)
   - Old content replaced: "UAE Certified / Secure Payment / Fast Delivery /
     Professional Grade" → the three specific, honest signals used on the
     web PDP:
     - Free shipping over AED 1,000
     - Authentic Korean dermacosmetics
     - All prices VAT inclusive
   - Copy inlined per locale (EN / AR / RU) — same defensive pattern we
     adopted on the web to avoid i18n chunk timing issues.
   - Stacked vertical layout with `#F8F9FA` rounded card and colored icon
     chips, so all three lines always fit the mobile canvas without
     clipping or horizontal scroll.
   - Re-enabled on the PDP between the content sections and
     `ProductReviews` (mirrors web placement).

4. **Review summary near the product title**
   - Lightweight client-side fetch of `GET /api/products/:id/reviews`
     populates `reviewAggregate = { averageRating, reviewCount }`.
   - If `reviewCount > 0`: renders 5 star icons (filled / outline based on
     the rounded average) + `4.7 (12)` as a tappable row.
   - If no reviews yet: shows `Be the first to review ›` in Genosys red,
     tappable.
   - Tapping either variant scrolls to the `ProductReviews` section using
     `measureLayout` against the ScrollView's inner node — reliable across
     platforms, no hard-coded offsets.

5. **i18n**
   - Added `product.beTheFirstToReview` to `en.json`, `ar.json`, `ru.json`.
   - Web trust strip copy lives inline in the component (see above).

### OTA dashboards

- iOS: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/f2f57df3-368c-4b45-80ca-223df8e8a65d
- Android: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/60e94f3b-b08e-43c2-9cd2-0e9fd8d9f8e8

---

## Batch B — Native polish: sticky mini header + haptics

Commit: `cb4709b`
Branch: `production`
Runtime: `1.0.0`

### What shipped

1. **Sticky mini header**
   - Lives inside the existing `headerBar` as an `Animated.View` overlay
     (`...StyleSheet.absoluteFillObject`).
   - Fades in + translates down as `scrollY` crosses 200–280 px (i.e. once
     the hero image is roughly out of view).
   - Shows:
     - Back button (with `lightTap` haptic)
     - Product name + selected-unit price (both `numberOfLines={1}`,
       truncated with ellipsis)
     - Compact 36×36 black bag / checkmark pill that calls `handleAddToBag`
   - `pointerEvents` is gated by a `condensedHeader` boolean state, updated
     from the `onScroll` `listener` callback (the native-driven opacity
     animation still runs, we just also flip a JS flag). This keeps the
     default header (share + heart) fully tappable when not scrolled, and
     the mini header fully tappable when scrolled.
   - RTL-aware (row direction flips).

2. **Haptics parity**
   - `haptics.selectionTick()` on size picker + color picker.
   - `haptics.lightTap()` on share, back (both variants), and
     `scrollToReviews`.
   - `haptics.success()` on Add to Bag and `haptics.lightTap()` on
     wishlist toggle remain unchanged.

3. **Image gallery pagination dots**
   - Already present and well-styled in the PDP (`paginationDots` /
     `dot` / `activeDot`). No change needed — confirmed during audit.

### OTA dashboards

- iOS: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/dc360a0b-289e-47ef-a177-72a91682b048
- Android: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/53e90ae0-2f68-48a8-81a2-00b7947be364

---

## Why OTA (and not a new build)

Both batches are pure JavaScript — new JS components, new styles,
scroll-driven Animated values, i18n string additions. No native deps
changed, no `app.json` keys that trigger prebuild, no touch to `ios/` or
Android native shells. The existing `runtimeVersion: "1.0.0"` binary in
production picks this up automatically on the next cold start (after the
5 s launch wait window — otherwise on the launch after).

## Publishing mechanics learned

- `eas update --platform all` currently fails because `platforms` in
  `app.json` defaults to include `web`, and `react-native-web` isn't in
  `package.json`. We ship as two parallel commands —
  `--platform ios` and `--platform android` — which matches the pattern
  already used in prior session logs (see 2026-02-26, 2026-02-11).
- `--non-interactive` is deprecated; use `CI=1` env var instead.

## Verification checklist

- ✅ `node -e "require('@babel/parser').parse(...)"` — both files parse
  cleanly.
- ✅ `ReadLints` on all touched files — 0 errors.
- ✅ All three i18n files parse as valid JSON.
- ✅ `eas update` completed end-to-end on both platforms, each with a
  signed manifest URL on the Expo dashboard.
- ⚠️ Live device verification still pending — recommended to cold-start
  the production build twice on a real iOS device (first launch downloads
  the new bundle in the background, second launch activates it) and
  confirm:
  - Accordion open/close animates smoothly, Benefits defaults open.
  - Trust strip shows shipping / authentic / VAT.
  - Review summary appears below product name (expect "Be the first to
    review ›" for products with no reviews yet).
  - Scrolling past the hero image fades in the mini bar; tapping the
    bag icon in the mini bar adds to bag.
  - Size / color pickers and share buttons have distinct haptic feedback.
  - RTL (Arabic) layout mirrors correctly.

## Follow-ups (not shipped)

- Trust strip copy lives inline per locale in `TrustBadges.js`. If we
  later move to a centralized i18n bundle on mobile, we can remove the
  inline `COPY` map and swap for `t('product.trust…')`. Low priority.
- The mini header's Add-to-Bag button re-uses `handleAddToBag` as-is,
  meaning the existing Alert ("Added to Bag… Continue Shopping / View
  Bag") still fires even when tapped from the condensed header. That's
  intentional for now to keep behaviour consistent across entry points,
  but we could consider a silent + toast variant for the mini header if
  user feedback suggests the modal is too heavy when scrolled.
