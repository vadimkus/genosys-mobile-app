# Session Log — February 26, 2026

## Changes Made

### 1. "New" Badge for Revita Glow Product

**Problem:** The "New" blue pill badge was not appearing on the Revita Glow Blemish Balm Cream (product ID 63) in the shop page and favorites page. The detection logic (`isRevitaGlow`) existed only in `ProductGridItem.js` but was missing from the inline badge rendering in `shop.js` and `favorites.js`.

**Files Changed:**
- `app/(tabs)/shop.js` — Added `isRevitaGlow` detection, included it in the "New" badge whitelist filter, and added it to client-side badge injection
- `app/favorites.js` — Same fix
- `components/ProductGridItem.js` — Broadened match to also check product ID 63 as fallback

**Fix Details:**
```javascript
const isRevitaGlow = nameLower.includes('revita glow')
  || (nameLower.includes('revita') && nameLower.includes('blemish'))
  || String(product?.id) === '63';
```

The "New" badge now shows consistently across shop, favorites, and concern detail pages.

---

### 2. Centralized Typography System

**Problem:** Users reported inconsistent fonts across the app. Audit revealed:
- No centralized typography — every screen defined its own inline `fontSize`, `fontWeight`, `letterSpacing`
- Same UI element types (hero titles, section titles, body text, prices) had different values on different screens
- Hero titles ranged 20–28px, section titles 17–22px, body text 14–16px, letterSpacing varied from -0.5 to +0.5

**Solution:** Created `utils/typography.js` with 30+ named type constants, then applied them across all 54 files in the app.

**New File:**
- `utils/typography.js` — Centralized type scale with tokens for headings, body, labels, captions, prices, buttons, badges, summaries, FAQ, inputs, monospace, and links

**Files Updated (54 total):**

| Category | Files |
|----------|-------|
| Tab screens | `shop.js`, `bag.js` |
| Product screens | `product/[id].js`, `concern-detail.js`, `skin-concerns.js`, `favorites.js`, `bundle-builder.js` |
| Profile screens | `profile.js`, `edit.js`, `addresses.js`, `add-address.js`, `billing.js`, `payment.js`, `orders.js`, `orders/[id].js`, `promo.js`, `privacy.js`, `terms.js`, `help.js`, `contact.js` (profile), `about.js` (profile), `language.js` |
| Content pages | `about.js`, `brand.js`, `blog/index.js`, `blog/[slug].js`, `delivery.js`, `faq.js`, `contact.js`, `locations.js`, `partners.js`, `training.js` |
| Auth & checkout | `login.js`, `forgot-password.js`, `reset-password.js`, `checkout.js`, `stripe.js` |
| Other screens | `chat.js`, `webview.js`, `skin-analysis.js`, `skin-analysis-camera.js` |
| Components | `ProductGridItem.js`, `NavigationDrawer.js`, `ChatButton.js`, `HeroCard.js`, `ErrorBoundary.js`, `SkinAnalysisResults.js`, `BrandedLaunchScreen.js`, `PrivacyPolicyContent.js`, `PrivacyPolicyModal.js`, `ProgressCard.js`, `ProductVariantSelector.js`, `ProductReviews.js`, `TrustBadges.js` |

**Key Standardizations:**
- Page/hero titles: 24px, bold, -0.4 letterSpacing (was 20–28px varying)
- Section titles: 20px, bold, -0.3 letterSpacing (was 17–22px varying)
- Nav headers: 17px, semibold (was 17–18px varying)
- Body text: 16px, regular, 24 lineHeight (was 14–16px varying)
- Product card names: 14px, semibold (now identical across shop, favorites, concerns)
- Prices: 16px bold standard, 24px bold large, 16px bold red for discounts
- Buttons: 16px semibold standard, 18px large, 14px small, 12px tiny

**Documentation:** See `docs/ui/TYPOGRAPHY_SYSTEM.md` for full type scale reference, usage guide, and list of all updated files.

---

## Build Verification

- `npx expo export --platform ios` — **Success** (exit code 0)
- No linter errors across all 54 updated files
- Bundle: `entry-95136ba4f6276bdcd4e1aac877a47e45.hbc` (5.62 MB)

---

## Technical Notes

- The typography system uses object spread (`...T.xxx`) as the first entry in each style, with screen-specific overrides (colors, margins, etc.) after
- No custom font files were loaded — the system standardizes values for the platform defaults (San Francisco on iOS, Roboto on Android)
- The `T.mono` token uses `Platform.select()` for cross-platform monospace (`Menlo` on iOS, `monospace` on Android)
- Decorative/emoji font sizes were intentionally left untouched

---

## Session 2: Concern-Detail Pricing Fix + Sticky Bar UX

### Bug Fix: Double-Inflated Prices for Discount Users

**Problem**: Users with a personal discount (e.g. 50%) saw doubled prices when adding products from Skin Concern pages. SNOW O₂ CLEANSER (retail 330 AED) showed ~~660~~ 330 instead of ~~330~~ 165.

**Root cause**: Two-part failure:
1. The concern-detail API returned guest pricing (`user = null`), so `displayPrice = retail` and `originalPrice = undefined`.
2. `CartContext.addItem()` auto-picked the default variant (180ml, 330 AED) and `inferOriginalFromUserDiscount()` wrongly reverse-calculated `330 / 0.5 = 660` as the "original," assuming the price was already discounted.

**Fix** (4 files):

| File | Change |
|------|--------|
| `services/api.js` | `fetchConcernDetail` now accepts `user` in options and sends `x-user-id` header |
| `app/concern-detail.js` | Pass `user` to `fetchConcernDetail`; `user?.id` added to dependency arrays |
| `contexts/CartContext.js` | `inferOriginalFromUserDiscount` now gated by `serverConfirmedDiscount` — only infers when `originalPrice` or `variant.originalPrice` exists (both `addItem` and `loadCartFromStorage` paths) |
| `utils/cartUtils.js` | Added `product.price` (retail) fallback for user discount in `calculateCartTotals` |
| `app/(tabs)/bag.js` | Removed dangerous `base / (1 - pct)` reverse-calculation; uses only server `originalPrice` or `product.price` |

Server-side fix (cosmetics-website):
- `app/api/mobile/concerns/[slug]/route.ts` — Added `x-user-id` header support, user lookup, pass to pricing engine

### UX: Sticky Bar Improvements

| Feature | Detail |
|---------|--------|
| **Discount color** | Changed from red (`#dc2626`) to green (`#16a34a`) |
| **Per-item remove** | Gray `×` circle icon on each item row (haptic + toast on tap) |
| **Clear all** | "Clear all" link + trash icon below item list when 2+ items (haptic + toast) |

All changes in `app/concern-detail.js` — new styles: `stickyClearAll`, `stickyClearAllText`, `stickyRemoveBtn`.

### Build Verification (Session 2)

- `npx expo export --platform ios` — **Success**
- `npx next build` (cosmetics-website) — **Success**
- No linter errors
