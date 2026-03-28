# Release Notes — Version 1.8.0 (Build 74)

## App Store "What's New" Text

> Copy the text below into App Store Connect → "What's New in This Version"

```
Choose Your Size & Color
You can now select product size (e.g. 50g / 210g) and color (e.g. Natural Beige / Light) directly in your bag before checkout. The price updates automatically when you change size.

Checkout Validation
Orders cannot be placed without selecting required variants. If a product needs a size or color choice, you'll be prompted before proceeding.

Over-the-Air Updates
The app now silently downloads improvements in the background. Many future fixes will apply automatically without visiting the App Store.

Streamlined Navigation
Removed redundant links from the side menu — Products, Orders, Favorites, and Profile are always accessible from the bottom tab bar.
```

## App Store Connect Metadata

| Field | Value |
|-------|-------|
| Version | 1.8.0 |
| Build | 74 |
| Copyright | © 2026 Genosys Middle East FZ-LLC |
| Category | Shopping |
| Content Rating | 4+ |
| Price | Free |

## Review Notes for Apple

```
This update adds in-bag variant selection (size and color) with live price updates, checkout validation that prevents orders without required selections, over-the-air update support, and a navigation cleanup.

Key areas to review:
1. Add any product with multiple sizes (e.g. Micro Needle Cream 50g/210g) to the bag
2. In the bag, tap the size dropdown → change size → price updates immediately
3. Add Multi Functional CC Cushion → color dropdown appears (Natural Beige / Light)
4. Try to check out without selecting a color → validation blocks submission with a prompt
5. After selecting all required variants → checkout proceeds normally
6. Side menu (hamburger) → "Products", "Orders", "Favorites", "Profile" links removed (accessible via bottom tabs)
7. OTA update mechanism runs silently on launch — no user-facing UI for this

No new permissions. No new third-party SDKs. No data collection changes.

Test account credentials are unchanged from previous submissions.
```

## Promotional Text (optional)

```
Now with in-bag size & color selection, smarter checkout validation, and silent background updates.
```

## Technical Changes

### Commits Since v1.7.0 (Build 71)

| Commit | Description |
|--------|-------------|
| `75261ba` | feat: add color & size variant validation at checkout and in-bag selectors |
| `d186956` | fix: remove duplicate entries in app.json blocking EAS Update |
| `9689cdd` | ui: remove Products/Orders/Favorites/Profile from hamburger menu |
| `c0b0d9c` | feat: wire OTA updates + bump to v1.8.0 (build 73) |
| `4cbd485` | chore: buildNumber auto-incremented to 74 by EAS |

### Also in this build (pre-1.7.0 bug fixes)

| Commit | Description |
|--------|-------------|
| `d6b2dfa` | fix: use per-item discountPct in bundle badge instead of order-level value |
| `74816ec` | fix: use per-item bundleDiscount from API for accurate order detail display |
| `b05bf54` | fix: use isUserDiscountExcludedProduct on product detail pricing |

### Modified Files

| File | Change |
|------|--------|
| `app/_layout.js` | Import `checkForUpdates` from `config/updates`, call on every cold start (production only) |
| `app.json` | Version 1.7.1 → 1.8.0, buildNumber 72 → 74, `updates.enabled: true`, `updates.checkAutomatically: "ON_LOAD"`, `updates.fallbackToCacheTimeout: 5000` |
| `eas.json` | Added `channel: "production"` to `production` and `production:android` build profiles |
| `contexts/CartContext.js` | Added `validateVariants()` function, `updateSize` and `updateColor` already update price |
| `app/(tabs)/bag.js` | Size and color selector dropdowns in `renderCartItem`, validation gate before checkout |
| `app/checkout.js` | `handleSubmit` calls `validateVariants()` — blocks if required variants missing |
| `components/NavigationDrawer.js` | Removed "Primary Navigation" section (Products, Orders, Favorites, Profile links) |

### Website API Changes (cosmetics-website)

| File | Change |
|------|--------|
| `app/api/mobile/app-version/route.ts` | `latestVersion` bumped to `1.8.0` |
| `app/api/mobile/products/route.ts` | Confirmed: includes `variants` in Prisma select |
| `app/api/mobile/products/[id]/route.ts` | Confirmed: includes `variants` in Prisma select |

### OTA Update Architecture

```
Cold Start Flow (v1.8.0+):
┌──────────────┐
│  App Launch   │
└──────┬───────┘
       │
       ├── 1. checkVersion() → /api/mobile/app-version
       ├── 2. checkSplash()  → /api/mobile/splash-config
       └── 3. checkForUpdates() → expo-updates (production only)
                │
                ├── checkForUpdateAsync()
                ├── if available → fetchUpdateAsync()
                └── applies on NEXT cold start (no reload)

Publishing an OTA update:
  $ eas update --branch production --message "description"
  → All v1.8.0+ installs pick it up on next launch
```

### EAS Update Channel Configuration

```
eas.json:
  production:        channel: "production"
  production:android: channel: "production"

app.json → updates:
  enabled: true
  checkAutomatically: "ON_LOAD"
  fallbackToCacheTimeout: 5000
  url: https://u.expo.dev/b874a5c1-c47e-4c4e-9286-42e431978d51

runtimeVersion: "1.0.0" (static — all builds share one runtime)
```

### Variant Validation Logic

```
Bag Screen (bag.js):
  - Size selector: shown when product has 2+ size variants
  - Color selector: shown when product has 2+ color variants
  - Source: item.product.variants (fetched from API)

CartContext.js:
  - updateSize(itemId, newSize): finds matching variant, updates price
  - updateColor(itemId, newColor): updates selectedColor
  - validateVariants(): returns { valid, missingItems[] }

Checkout (checkout.js):
  - handleSubmit → validateVariants()
  - If !valid → Alert with product names missing selections
  - If valid → proceed to payment
```
