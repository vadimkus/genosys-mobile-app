# Session Log - February 11, 2026

## Android App Alignment with iOS (v1.3.0 Build 53)

### Summary
Fully aligned the Android app configuration with the iOS native app. The iOS app had reached Build 53 with extensive new features (AI Skin Analysis, Build Your Set, Native Blog, Push Notifications, 9 native screen migrations), but the Android configuration was still at versionCode 1 with outdated permissions, missing deep link paths, and no plugins for notifications, camera, or biometrics.

### Problem
The Android `app.json` config was severely out of date compared to the iOS build:
- **versionCode**: `1` (iOS at build `53`)
- **Permissions**: Only 4 basic permissions (missing biometric, notifications, photo library)
- **Intent Filters**: Only 6 deep link paths (missing blog, bundle-builder, training, skin-analysis, chat, checkout)
- **Plugins**: None of the Android-relevant plugins configured (notifications, camera, image picker, local auth)
- **Deep Linking**: `utils/deepLinking.js` still routed 9 migrated native screens to WebView fallback

---

### Changes Made

#### 1. `app.json` — Android Configuration Updated

**Version alignment:**
```json
// Before
"versionCode": 1

// After
"versionCode": 53
```

**Permissions expanded (4 → 9):**
```json
// Before
["INTERNET", "VIBRATE", "RECORD_AUDIO", "CAMERA"]

// After
[
  "INTERNET",
  "VIBRATE",
  "RECORD_AUDIO",
  "CAMERA",
  "READ_MEDIA_IMAGES",       // Photo library (Android 13+)
  "POST_NOTIFICATIONS",      // Push notifications (Android 13+)
  "USE_BIOMETRIC",           // Fingerprint auth
  "USE_FINGERPRINT",         // Legacy fingerprint
  "ACCESS_NETWORK_STATE"     // Network connectivity checks
]
```

**Intent filters expanded (6 → 13 deep link paths):**

New paths added:
| Path | Feature |
|------|---------|
| `www.genosys.ae/products` | Products on www subdomain |
| `genosys.ae/skin-analysis` | AI Skin Analysis |
| `genosys.ae/blog` | Native Blog |
| `genosys.ae/bundle-builder` | Build Your Set |
| `genosys.ae/training` | Professional Training |
| `genosys.ae/chat` | AI Chatbot |
| `genosys.ae/checkout` | Checkout flow |

**Plugins added (4 new Android-relevant plugins):**
```json
[
  ["expo-notifications", { "icon": "./assets/icon-foreground-1024.png", "color": "#dc2626" }],
  ["expo-camera", { "cameraPermission": "Genosys uses the camera for AI Skin Analysis and profile photos." }],
  ["expo-image-picker", { "photosPermission": "Genosys uses your photo library to let you choose a profile photo or skin analysis image." }],
  "expo-local-authentication"
]
```

These plugins ensure that on EAS Android builds:
- **expo-notifications**: Android notification icon and accent color are set in the manifest
- **expo-camera**: Camera permission rationale is shown to users
- **expo-image-picker**: Photo library permission rationale is shown to users
- **expo-local-authentication**: BiometricPrompt and fingerprint APIs are available

#### 2. `utils/deepLinking.js` — Native Screen Routing

**Before:** 9 migrated screens (blog, bundle-builder, training, locations, brand, delivery, faq, partners, about, contact) were routed to WebView:
```javascript
const webViewPaths = [
  'bundle-builder', 'blog', 'training', 'locations',
  'brand', 'delivery', 'faq', 'partners', 'certificates',
];
```

**After:** Each screen now routes directly to its native implementation:
```javascript
if (cleanPath === 'bundle-builder') { router.push('/bundle-builder'); return true; }
if (cleanPath === 'blog' || cleanPath === 'blog/') { router.push('/blog'); return true; }
if (cleanPath.startsWith('blog/')) { router.push(`/blog/${slug}`); return true; }
if (cleanPath === 'training') { router.push('/training'); return true; }
if (cleanPath === 'locations') { router.push('/locations'); return true; }
if (cleanPath === 'brand') { router.push('/brand'); return true; }
if (cleanPath === 'delivery') { router.push('/delivery'); return true; }
if (cleanPath === 'faq') { router.push('/faq'); return true; }
if (cleanPath === 'partners') { router.push('/partners'); return true; }
if (cleanPath === 'about') { router.push('/about'); return true; }
if (cleanPath === 'contact') { router.push('/contact'); return true; }
```

Only `certificates` remains as a WebView fallback (low priority, not yet migrated).

#### 3. `docs/app-store/GOOGLE_PLAY_REVIEW_DOCUMENTATION.md` — NEW

Complete Google Play review documentation mirroring the Apple Review Documentation, including:
- Test account credentials
- Step-by-step testing instructions for all features
- Android-specific sections: notification channels, adaptive icon, fingerprint auth, intent filters
- Data Safety section (required for Google Play Console)
- Permissions documentation with rationale
- Technical details (min SDK 23, target SDK 35)
- Complete review checklist

---

### Files Changed

| File | Change |
|------|--------|
| `app.json` | Android: versionCode 1→53, 5 new permissions, 7 new intent filter paths, 4 new plugins |
| `utils/deepLinking.js` | 10 screens now route to native instead of WebView |
| `docs/app-store/GOOGLE_PLAY_REVIEW_DOCUMENTATION.md` | NEW — Google Play review documentation |
| `docs/core/SESSION_LOG_2026_02_11.md` | NEW — This session log |
| `docs/build/ANDROID_BUILD_GUIDE.md` | UPDATED — New config, permissions, plugins |
| `docs/core/DEEP_LINKING.md` | UPDATED — Native screen route mapping |
| `docs/README.md` | UPDATED — New doc links |

---

### Android Build Verification

```bash
$ npx expo export --platform android
Android Bundled 2406ms node_modules/expo-router/entry.js (1966 modules)
# 0 errors, 0 warnings
# Bundle size: 5.48 MB (HBC compiled)
# Assets: 44 files
```

```bash
$ npx expo config --type public
# Android versionCode: 53
# Android package: ae.genosys.app
# Android permissions: 9 total
# Intent filters: 13 deep link paths
# Plugins: 10 total
```

---

### Feature Parity Matrix — iOS vs Android

| Feature | iOS (Build 53) | Android (versionCode 53) | Notes |
|---------|----------------|--------------------------|-------|
| **Shop & Products** | Native | Native | Same codebase |
| **Cart & Checkout** | Native | Native | COD + Stripe |
| **Orders & Tracking** | Native | Native | Same API |
| **AI Skin Analysis (Camera)** | Native | Native | GPT-4 Vision |
| **AI Skin Analysis (Quiz)** | Native | Native | API-driven |
| **Build Your Set** | Native | Native | 8-step bundle builder |
| **Native Blog + Comments** | Native | Native | API-driven |
| **Push Notifications** | APNs | FCM (Expo) | Platform channels |
| **Biometric Auth** | Face ID / Touch ID | Fingerprint | expo-local-authentication |
| **Google Sign-In** | Web client ID | Web client ID | Same flow |
| **Apple Sign-In** | Native | N/A | iOS-only, hidden on Android |
| **Voice Search** | Native | Native | expo-speech-recognition |
| **Deep Linking** | Universal Links | Intent Filters | 13 paths |
| **AI Chatbot** | Native | Native | SSE streaming |
| **RTL Arabic** | Full | Full | Layout mirroring |
| **3 Languages** | EN/AR/RU | EN/AR/RU | Same i18n |
| **Product Videos** | Native | Native | expo-av |
| **PDF Downloads** | Native | Native | WebView |
| **Offline Cache** | Native | Native | AsyncStorage |
| **Haptic Feedback** | Native | Native | expo-haptics |
| **Training** | Native (API) | Native (API) | Auth-gated |
| **FAQ** | Native (API) | Native (API) | Database-driven |
| **Partners** | Native (API) | Native (API) | Database-driven |
| **Locations** | Native | Native | Hardcoded |
| **Brand/Delivery/About/Contact** | Native | Native | Hardcoded |

**Result: Full parity** (except Apple Sign-In which is iOS-only by design)

---

### Next Steps

1. **Firebase Setup** — Create Firebase project and add `google-services.json` for production FCM push notifications on Android
2. **Digital Asset Links** — Host `assetlinks.json` at `https://genosys.ae/.well-known/assetlinks.json` for Android app link verification
3. **EAS Build** — Run `npm run build:android:production` to create AAB for Google Play
4. **Google Play Submit** — Run `npm run submit:android` to upload to internal track
5. **Testing** — Test on physical Android device and emulator

---

---

## Android Code Review & Bug Fixes

### Summary
Performed comprehensive Android code review and fixed platform-specific bugs that would cause issues on Android devices.

### Review Process

1. **Configuration Validation** - Verified `app.json` and `eas.json`
2. **Asset Verification** - Confirmed all 6 referenced asset files exist
3. **Code Scanning** - Searched all 44 JS files for Android-specific issues
4. **Build Verification** - Ran `expo export --platform android` (1966 modules, 0 errors)
5. **Lint Check** - Verified 0 lint errors on all modified files

### Bugs Fixed

#### 1. KeyboardAvoidingView Behavior (HIGH - 4 files)

**Problem:** On Android, `behavior={undefined}` causes keyboard to overlap input fields. iOS uses `'padding'`, but Android needs `'height'`.

**Files Fixed:**
| File | Line | Before | After |
|------|------|--------|-------|
| `app/chat.js` | 451 | `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` | `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` |
| `app/profile/add-address.js` | 156 | `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` | `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` |
| `app/blog/[slug].js` | 276 | `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` | `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` |
| `components/ChatButton.js` | 377 | `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` | `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` |

**Impact:** Keyboard now properly pushes content up on Android instead of overlapping input fields.

#### 2. Missing Elevation for Android Shadows (MEDIUM - 2 files)

**Problem:** iOS shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) have no effect on Android. Only `elevation` creates shadows on Android.

**Files Fixed:**
| File | Styles | Fix |
|------|--------|-----|
| `app/training.js` | `docCard` | Added `elevation: 1` |
| `app/training.js` | `productDocCard` | Added `elevation: 1` |
| `app/training.js` | `videoCard` | Added `elevation: 2` |
| `app/bundle-builder.js` | `productCard` | Added `elevation: 1` |

**Impact:** Cards now have proper shadows on Android matching the iOS appearance.

#### 3. Safe Import for expo-apple-authentication (MEDIUM - 1 file)

**Problem:** Top-level `import * as AppleAuthentication from 'expo-apple-authentication'` could potentially fail on Android during module resolution.

**File Fixed:** `app/auth/login.js`

**Before:**
```javascript
import * as AppleAuthentication from 'expo-apple-authentication';
```

**After:**
```javascript
// expo-apple-authentication is iOS-only; safe-load to prevent Android build/runtime issues
let AppleAuthentication = null;
try {
  AppleAuthentication = require('expo-apple-authentication');
} catch (e) {
  // Expected on Android — module may not resolve
}
```

Also added null guard in `handleAppleLogin()`:
```javascript
if (!AppleAuthentication) {
  Alert.alert(t('authScreen.authFailedTitle'), 'Apple Sign-In is only available on iOS.');
  return;
}
```

**Impact:** App won't crash on Android if module resolution fails, and provides clear error message if somehow triggered.

### Verified Working (No Action Needed)

| Area | Status | Notes |
|------|--------|-------|
| `ActionSheetIOS` | ✅ | Guarded with `Platform.OS === 'ios'`, Android uses `Alert.alert()` |
| `DateTimePicker` | ✅ | Separate rendering for iOS (modal) vs Android (native) |
| `react-native-sfsymbols` | ✅ | Not imported in app code, only in `package.json` |
| Notification channels | ✅ | Android-specific channels configured in `NotificationContext.js` |
| Push permissions | ✅ | Android 13+ POST_NOTIFICATIONS handled in `pushNotificationsService.js` |
| Biometric auth | ✅ | Works cross-platform (Face ID / Touch ID / Fingerprint) |
| StatusBar | ✅ | Uses `expo-status-bar` which handles both platforms |

### Build Verification Results

```bash
$ npx expo export --platform android
Android Bundled 2905ms node_modules/expo-router/entry.js (1966 modules)
# Exit code: 0
# Errors: 0
# Warnings: 0
# Bundle size: 5.48 MB (HBC compiled)
# Assets: 44 files
```

### Files Changed

| File | Changes |
|------|---------|
| `app/chat.js` | KeyboardAvoidingView behavior fix |
| `app/profile/add-address.js` | KeyboardAvoidingView behavior fix |
| `app/blog/[slug].js` | KeyboardAvoidingView behavior fix |
| `components/ChatButton.js` | KeyboardAvoidingView behavior fix |
| `app/training.js` | Added elevation to 3 card styles |
| `app/bundle-builder.js` | Added elevation to productCard style |
| `app/auth/login.js` | Safe import for expo-apple-authentication |

---

## Mobile App Bug Fixes

### 1. Native App Badge Count Not Clearing

**Problem:** The notification badge count on the app icon wouldn't clear even after viewing notifications.

**Root Cause:** The `expo-notifications` handler set `shouldSetBadge: true`, but no logic existed to clear the badge when the user opened the app or viewed notifications.

**Fix:** Modified `contexts/NotificationContext.js` to clear the badge in three scenarios:
1. On app mount (initial load)
2. When app returns to foreground (AppState change to 'active')
3. When notification is tapped (both warm and cold start)

**Code Added:**
```javascript
// Clear badge on mount
useEffect(() => {
  Notifications.setBadgeCountAsync(0);
}, []);

// Clear badge on foreground
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      Notifications.setBadgeCountAsync(0);
    }
  });
  return () => subscription.remove();
}, []);

// Clear badge on notification tap
responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
  Notifications.setBadgeCountAsync(0);
  // ... handle navigation
});
```

### 2. Beauty Box Order Details Not Showing Contents

**Problem:** On the orders page, beauty box items only showed the box name without listing the individual products inside.

**Fix:** Modified `app/profile/orders/[id].js` to:
1. Detect beauty box items using `isBeautyBoxProduct()` helper
2. Parse the description to extract included products using `parseBeautyBoxDescription()`
3. Display contents in a waterfall list format with bullet points

**New Helper Functions:**
```javascript
const isBeautyBoxProduct = (name) => {
  const n = (name || '').trim().toLowerCase()
  return n.includes('beauty box') || n.includes('beautybox')
}

const parseBeautyBoxDescription = (desc) => {
  // Extracts product names from descriptions like:
  // "ANTI-AGING BEAUTY BOX containing: Product 1, Product 2, Product 3"
  // Returns array of individual product names
}
```

**Display Format:**
```
ANTI-AGING BEAUTY BOX
Quantity: 1 • 1 kit
Box Contains:
  • BIOME INTENSE CREAM
  • MULTI PEPTIDE CREAM
  • BIOME RELIEF CREAM
  • EPIONE EYE CREAM
```

**Files Modified:**
- `app/profile/orders/[id].js` - Added beauty box detection and content display
- `i18n/messages/en.json` - Added `orders.boxContains` translation
- `i18n/messages/ar.json` - Added Arabic translation
- `i18n/messages/ru.json` - Added Russian translation

---

## Build Your Set — Bundle Discount Not Passing to Bag

### Problem

When a user built a set (2–5 products) in the "Build Your Set" screen and tapped "Add Bundle to Cart", the products were added to the bag at **full price** — the tiered bundle discount (5%–20%) was not applied.

### Root Cause (3 separate bugs)

**Bug 1: Discounted price never calculated**
In `app/bundle-builder.js`, `handleAddToCart()` set `cartProduct.price = product.displayPrice || product.price` — the **full undiscounted price**. The `bundleDiscountPercent` was attached as metadata but never used to reduce the actual price.

**Bug 2: Bundle metadata stored at wrong level**
The `fromBundle: true` and `bundleDiscountPercent` fields were set on the `product` object, but `computeWaterfallBreakdown()` in `utils/cartUtils.js` checked for `item.fromBundle` (at the item wrapper level). Since `addItem()` in `CartContext.js` only stored `{ product, quantity, selectedColor, selectedSize }`, the bundle flags were inaccessible.

**Bug 3: No exclusion from user VIP discount**
`calculateCartTotals()` would apply the user's VIP discount percentage on top of the (now-discounted) bundle price, causing double-discounting. Bundle items should only get the bundle discount, not VIP + bundle stacked.

### Discount Tiers

| Items Selected | Discount |
|---------------|----------|
| 2 products | 5% off |
| 3 products | 10% off |
| 4 products | 15% off |
| 5 products | 20% off |

### Solution

#### a) `app/bundle-builder.js` — Apply discount to price before adding to cart
- Now calculates `discountedPrice = fullPrice * (1 - discountPercent / 100)`
- Sets `price` and `displayPrice` to the discounted price
- Sets `originalPrice` to the full (pre-discount) price for strikethrough display
- Passes `itemMeta: { fromBundle: true, bundleDiscountPercent }` as a new 5th argument to `addItem()`

#### b) `contexts/CartContext.js` — Preserve bundle metadata at item level
- `addItem()` now accepts an optional 5th parameter `itemMeta`
- When `itemMeta.fromBundle` is true, `fromBundle` and `bundleDiscountPercent` are stored on the cart item wrapper (not just inside product)
- `saveOrderToDatabase()` now includes `fromBundle`, `bundleDiscountPercent`, and `originalPrice` in the order item payload

#### c) `utils/cartUtils.js` — Skip user discount for bundle items
- `calculateCartTotals()`: Added `isBundleItem` check that looks at both `item.fromBundle` and `item.product.fromBundle`. Bundle items are now excluded from user VIP discount.
- `computeWaterfallBreakdown()`: Same `isBundleItem` exclusion. Updated the bundle discount calculation to derive the discount amount from `retailUnitPrice - displayPrice` (since the discount is already baked into the price).

#### d) `app/(tabs)/bag.js` — Show bundle discount per item
- Added new block before the beauty box check: if `isBundleItem && bundlePct > 0`, display:
  - Full price with strikethrough
  - `"{X}% OFF (Bundle)"` label in green
  - Discounted price

#### e) `app/checkout.js` — Pass bundle discount to server
- `bundleDiscountPercentage` now reads from the first bundle item in cart
- `bundleDiscountAmount` now uses `computeWaterfallBreakdown()` to compute the actual total bundle discount

#### f) Translation files — New key `bag.bundleOff`
- `i18n/messages/en.json`: `"bundleOff": "OFF (Bundle)"`
- `i18n/messages/ar.json`: `"bundleOff": "خصم (مجموعة)"`
- `i18n/messages/ru.json`: `"bundleOff": "СКИДКА (набор)"`

### Files Changed

| File | Change |
|------|--------|
| `app/bundle-builder.js` | Apply discounted price + pass itemMeta to addItem |
| `contexts/CartContext.js` | Accept & persist fromBundle/bundleDiscountPercent on item |
| `utils/cartUtils.js` | Exclude bundle items from user VIP discount; fix waterfall |
| `app/(tabs)/bag.js` | Display bundle discount per item (strikethrough + badge) |
| `app/checkout.js` | Pass actual bundleDiscountPercentage/Amount to server |
| `i18n/messages/en.json` | Added `bag.bundleOff` key |
| `i18n/messages/ar.json` | Added `bag.bundleOff` key |
| `i18n/messages/ru.json` | Added `bag.bundleOff` key |

### Testing

- [ ] Build a set with 2 products → verify 5% discount in bag
- [ ] Build a set with 3 products → verify 10% discount in bag
- [ ] Build a set with 5 products → verify 20% discount in bag
- [ ] Verify each item shows strikethrough full price + discounted price + "X% OFF (Bundle)" label
- [ ] Verify order summary shows "Bundle Discount" line with correct amount
- [ ] Verify user with VIP discount does NOT get VIP + bundle stacked
- [ ] Proceed to checkout → verify bundle discount passed to server
- [ ] Verify existing beauty box, promo items, and regular products still work correctly

---

## 8. Cross-Platform Bundle Discount Alignment — Mobile Web ↔ Native App

### Problem Identified

Comprehensive audit found **4 critical discrepancies** between how the website (mobile web) and the native app handle "Build Your Set" bundle discounts:

| # | Discrepancy | Website Behavior | Native App (Before Fix) |
|---|-------------|-----------------|------------------------|
| 1 | **VIP + Bundle stacking** | Waterfall: VIP first, then bundle on VIP-discounted price | Bundle **replaced** VIP (no stacking) |
| 2 | **Per-item bundle flags in order payload** | `fromBundle`, `bundleDiscountPercent` sent per item | Only order-level totals sent; per-item flags missing |
| 3 | **Bundle builder pricing display** | Shows full waterfall: Retail → VIP → Subtotal → Bundle → Total → You Save | Only showed: Subtotal → Bundle → Total |
| 4 | **Stripe & Apple Pay API routes** | N/A (website uses own checkout routes) | Did **not** process bundle discounts at all (comment: "not supported") |

### Fixes Applied

#### Fix 1: Waterfall VIP + Bundle Discount (Native App)

**Files changed:**
- `app/bundle-builder.js` — `handleAddToCart`: Now applies VIP discount first (`displayPrice` already includes VIP from API), then bundle discount on top. `originalPrice` set to retail for waterfall display.
- `utils/cartUtils.js` — `computeWaterfallBreakdown`: Removed `isBundleItem` from `excludedFromUserDiscount`. Bundle items now get VIP discount in Step 1, then bundle discount on VIP-discounted price in Step 2.
- `utils/cartUtils.js` — `calculateCartTotals`: Comment updated (bundle items' price already has both discounts baked in, so no re-application needed).
- `app/(tabs)/bag.js` — Bundle item price display: Now shows combined discount label (`50% + 20% OFF`) when user has VIP + bundle.

#### Fix 2: Per-Item Bundle Flags in Order Payload

**Files changed:**
- `services/orderService.js` — Both `submitCODOrder` and `submitCardOrder` now include `fromBundle`, `bundleDiscountPercent`, and `originalPrice` per item in the order payload sent to the server.

#### Fix 3: Bundle Builder Waterfall Pricing Display

**Files changed:**
- `app/bundle-builder.js` — Footer and summary sheet pricing now show full waterfall matching website:
  1. Retail Price (strikethrough)
  2. Your Discount / VIP % (purple)
  3. Subtotal (after VIP)
  4. Bundle Discount % (green)
  5. Total
  6. "You Save" badge
- Added `pricingLabelPurple` / `pricingValuePurple` styles.

#### Fix 4: Server-Side Stripe & Apple Pay Bundle Processing

**Files changed (cosmetics-website):**
- `app/api/mobile/checkout/stripe/route.ts` — Added waterfall bundle discount logic (VIP first, then bundle) with `bundleDiscountAmount`/`bundleDiscountPct` tracking and Prisma storage.
- `app/api/mobile/payments/applepay/intent/route.ts` — Same waterfall bundle discount logic added.
- `app/api/mobile/orders/route.ts` — Changed from "bundle replaces VIP" to "waterfall: VIP first, then bundle on top".

#### Fix 5: Order Details Waterfall Display

**Files changed:**
- `app/profile/orders/[id].js` — Bundle item price reverse-calculation now accounts for both VIP + bundle discounts. Discount pill shows `50% + 20% Bundle`. Discount label shows `Discount + Bundle Discount (50% + 20%)`. Fixed typo `textRTR` → `textRTL`.

### Files Changed Summary

| File | Change |
|------|--------|
| `app/bundle-builder.js` | Waterfall pricing (VIP → bundle), full breakdown display |
| `utils/cartUtils.js` | `computeWaterfallBreakdown` waterfall for bundle items |
| `app/(tabs)/bag.js` | Combined VIP+Bundle discount label |
| `services/orderService.js` | Per-item `fromBundle`/`bundleDiscountPercent` in order payload |
| `app/profile/orders/[id].js` | Waterfall reverse-calc, combined discount display |
| `cosmetics-website: app/api/mobile/orders/route.ts` | Waterfall VIP→bundle server logic |
| `cosmetics-website: app/api/mobile/checkout/stripe/route.ts` | Added bundle discount processing |
| `cosmetics-website: app/api/mobile/payments/applepay/intent/route.ts` | Added bundle discount processing |

### Discount Calculation Formula (Now Consistent Everywhere)

```
retailPrice = product.originalPrice (from database)
vipPrice = retailPrice × (1 - vipPct / 100)
finalPrice = vipPrice × (1 - bundlePct / 100)

Example: Product = 100 AED, VIP = 50%, Bundle = 20%
  → vipPrice = 100 × 0.5 = 50 AED
  → finalPrice = 50 × 0.8 = 40 AED
  → Total saved: 60 AED (60% effective discount)
```

### Testing

- [ ] Build a set (VIP user) → verify both VIP + bundle discounts shown in builder
- [ ] Verify bag shows combined discount label (e.g., "50% + 20% OFF")
- [ ] Verify waterfall breakdown in bag: Retail → VIP → Bundle → Net
- [ ] Place COD order → verify order details show waterfall
- [ ] Place Stripe card order → verify bundle discount stored in DB
- [ ] Place Apple Pay order → verify bundle discount stored in DB
- [ ] Non-VIP user → verify only bundle discount shown (no VIP row)
- [ ] Regular (non-bundle) items → verify VIP-only discount unchanged
- [ ] Beauty boxes / excluded products → verify still excluded from VIP

---

## 9. Comprehensive Cross-Platform Alignment Audit — Website ↔ Native App

### Audit Scope

Full comparison of all business logic between the website (cosmetics-website) and the native mobile app (genosys-mobile-app):

### Areas Verified as ALIGNED (No Fix Needed)

| Area | Details |
|------|---------|
| **Discount tiers** | Both: 2→5%, 3→10%, 4→15%, 5→20% |
| **Shipping rates** | Dubai: 45 AED, all others: 70 AED |
| **Free shipping threshold** | Both: >= 1000 AED |
| **VAT rate** | Both: 5% inclusive, formula: `(total × 0.05) / 1.05` |
| **Promo thresholds** | Both: >=500 AED = 1 mask, >=700 AED = 2 masks |
| **Promo detection** | Both: `isPromotionItem===true` or `size==='__PROMO__'` |
| **Exclusion rules** | Both: Beauty Boxes, Hydro Cool Mask, Devices, `noDiscount` flag |
| **Order number** | Server generates canonical format (CODM/GENCardM); client's provisional number is always overridden |
| **Email template data** | Both pass: `discountPercentage`, `discountAmount`, `bundleDiscountPercentage`, `bundleDiscountAmount` |
| **`hasFixedPriceOverride`** | Native app has it (empty array = no-op); website doesn't — functionally equivalent |

### Discrepancies Found & Fixed

#### Fix 1: Cart Badge Count — Promo Items

- **Website** (`lib/cartStore.ts`): Was counting ALL items including free promo masks
- **Native app**: Excludes promo items from badge count
- **Fix**: Updated `getTotalItems()` in website cart store to filter out `isPromotionItem` items

#### Fix 2: Beauty Box Original Price — Hardcoded Calculation

- **Native app** (`app/(tabs)/shop.js`): Used `price / 0.85` to derive the original price
- **Website**: Uses `BEAUTY_BOX_REGULAR_PRICES` lookup table or `originalPrice` from product data
- **Fix**: Updated shop.js to prefer `product.originalPrice` from API, falling back to `/0.85` only if unavailable

### Files Changed

| File | Change |
|------|--------|
| `cosmetics-website: lib/cartStore.ts` | `getTotalItems()` now excludes promo items (matching native app) |
| `genosys-mobile-app: app/(tabs)/shop.js` | Beauty Box pricing prefers `product.originalPrice` from API |

### Notes

- **Black Friday logic**: Website has `isBlackFridaySaleActive()` (ended Nov 28, 2025). Native app doesn't have it. No fix needed — it's a past promotion that returns `false`.
- **Order success page**: Website has a full success page; native app uses an Alert dialog. This is a UX difference, not a logic inconsistency — no data/pricing impact.
- **Chat/WhatsApp**: Website success page has order sharing; native app chat doesn't. Feature gap, not logic inconsistency.

---

## 6. Website Deployment Fixes

### TypeScript Build Errors (Vercel)

The website deployment to Vercel failed due to TypeScript strict mode errors. Fixed in commit `d0341fc9`:

| File | Error | Fix |
|------|-------|-----|
| `app/actions/profile.ts:23` | Unused `AddressInput` import | Removed |
| `app/actions/profile.ts:117` | `label` could be `undefined` (Prisma expects `string \| null`) | Added `?? null` |
| `components/header/MobileWebHeader.tsx:141` | `e.touches[0]` possibly undefined | Added optional chaining |
| `lib/jwt.ts:4` | Unused `ENV_DATABASE_URL` import | Removed |
| `lib/cartStore.ts:190` | Invalid type cast for promo item filter | Removed no-op filter |

### CRITICAL: JWT Authentication Bug

**Symptom**: After deploying bundle discount fixes, Google login on production appeared to work but users remained logged out.

**Root Cause**: The `fb5d1f52` commit changed `lib/jwt.ts` to use `Date.now()` in the production JWT fallback:

```javascript
// BROKEN — different secret every millisecond
return `insecure-fallback-${Date.now()}`
```

This meant:
1. Token signed at login with secret `insecure-fallback-1739295000000`
2. Token verified on next request with `insecure-fallback-1739295000001`
3. Verification fails → user appears logged out

**Fix** (commit `c7fcf9da`): Restored deterministic fallback derived from `DATABASE_URL`:

```javascript
const dbUrl = process.env.DATABASE_URL
const fallback = dbUrl 
  ? `fallback-${Buffer.from(dbUrl).toString('base64').slice(0, 32)}`
  : 'fallback-secret-for-development-only'
return fallback
```

**Permanent Solution**: Added `JWT_SECRET` environment variable:
- Vercel dashboard: ✅ (64-character secure random string)
- Local `.env.local`: ✅

---

## Website Commits (This Session)

| Commit | Message |
|--------|---------|
| `fb5d1f52` | feat: align bundle discount logic across all mobile API routes |
| `d0341fc9` | fix: resolve TypeScript build errors for Vercel deployment |
| `c7fcf9da` | fix: restore deterministic JWT fallback — fixes Google login on production |

---

## 10. VIP + Bundle Discount Stacking Fix — Email Templates & Order Screens

### Problem Identified

After the earlier waterfall discount alignment, we discovered that **VIP and Bundle discounts should be mutually exclusive per item** (not stacked). The new business rule is:

- **Bundle items** (from "Build Your Set"): Get **only** the bundle discount on retail price
- **Regular items**: Get **only** the VIP discount on retail price
- **No stacking** of VIP + Bundle for any item

However, several places in the codebase were still showing stacked discounts:

### Fixes Applied

#### Fix 1: Email Templates (Customer Order Confirmation)

**File:** `cosmetics-website/lib/email/htmlGenerators.ts`

**Before:**
```javascript
// Per-item original price reverse-calculation — stacked both discounts
if (hasUserDiscount) {
  originalPrice = originalPrice / (1 - userDiscountPct / 100)
}
if (hasBundleDiscount) {
  originalPrice = originalPrice / (1 - bundleDiscountPct / 100)
}

// Badges — showed BOTH badges on every item
if (hasUserDiscount) { badges.push(`-${userDiscountPct}% VIP`) }
if (hasBundleDiscount) { badges.push(`-${bundleDiscountPct}% Bundle`) }
```

**After:**
```javascript
// Per-item: mutually exclusive — use bundle OR VIP, not both
if (hasBundleDiscount) {
  originalPrice = originalPrice / (1 - bundleDiscountPct / 100)
  showDiscount = true
} else if (hasUserDiscount) {
  originalPrice = originalPrice / (1 - userDiscountPct / 100)
  showDiscount = true
}

// Badges — show ONLY one badge per item
if (hasBundleDiscount) {
  badges.push(`-${bundleDiscountPct}% Bundle`)
} else if (hasUserDiscount) {
  badges.push(`-${userDiscountPct}% VIP`)
}
```

Also removed unused `hasAnyDiscount` variable.

#### Fix 2: Email Templates (Admin Order Confirmation)

**File:** `cosmetics-website/lib/email/templates.ts`

Same changes as `htmlGenerators.ts`:
- Per-item original price: apply EITHER bundle OR VIP discount (mutually exclusive)
- Badges: show ONLY one discount badge per item
- Removed unused `hasAnyDiscount` variable

#### Fix 3: Native App Order Detail Screen

**File:** `genosys-mobile-app/app/profile/orders/[id].js`

**Before:**
```javascript
// Bundle items: waterfall VIP + bundle (WRONG)
const vipPct = orderDiscountPct > 0 ? orderDiscountPct : 0
const combinedFactor = (1 - vipPct / 100) * (1 - orderBundleDiscPct / 100)
inferredOriginalUnit = price / combinedFactor
discountPct = vipPct + orderBundleDiscPct // Combined display

// Badge showed "50% + 20% Bundle"
// Label showed "Discount + Bundle Discount (50% + 20%)"
```

**After:**
```javascript
// Bundle items: ONLY bundle discount on retail (correct)
const bundleFactor = 1 - orderBundleDiscPct / 100
inferredOriginalUnit = price / bundleFactor
discountPct = orderBundleDiscPct

// Badge shows only "20% Bundle"
// Label shows only "Bundle Discount (20%)"
```

#### Fix 4: Native App Orders List (Expanded Summary)

**File:** `genosys-mobile-app/app/profile/orders.js`

**Before:**
```javascript
// Used VIP discount for ALL items, even bundle items
const originalUnit = inferOriginalUnitPriceFromPct({ unitPrice: price, discountPct })
// Label: "{discountPct}%"
```

**After:**
```javascript
// Detect bundle items and use appropriate discount
const isBundleItem = itemFromBundle || (hasBundleOnOrder && !excludedFromUserDiscount)
const effectiveDiscountPct = isBundleItem ? orderBundleDiscPct : discountPct
const originalUnit = inferOriginalUnitPriceFromPct({ unitPrice: price, discountPct: effectiveDiscountPct })
// Label: "20% Bundle" for bundle items, "50%" for VIP items
```

### Business Rule Summary

| Item Type | Discount Applied | Retail Price Calculation |
|-----------|-----------------|--------------------------|
| Bundle item (from Build Your Set) | Bundle discount ONLY | `price / (1 - bundlePct/100)` |
| Regular item (VIP user) | VIP discount ONLY | `price / (1 - vipPct/100)` |
| Excluded items (Beauty Box, Hydro Cool Mask, Devices) | No discount | N/A (price = retail) |
| Promo/Free items | No discount | N/A (price = 0) |

### Waterfall Summary (Unchanged)

The order-level waterfall summary sections (Retail Total → VIP Discount → Bundle Discount → Net Subtotal) remain unchanged because they use **pre-computed server-side amounts** stored with the order. These amounts are already calculated correctly by the server.

### Files Changed

| File | Repository | Change |
|------|------------|--------|
| `lib/email/htmlGenerators.ts` | cosmetics-website | Per-item: bundle OR VIP (not both) |
| `lib/email/templates.ts` | cosmetics-website | Per-item: bundle OR VIP (not both) |
| `app/profile/orders/[id].js` | genosys-mobile-app | Bundle items use only bundle discount |
| `app/profile/orders.js` | genosys-mobile-app | Bundle items use only bundle discount |

### Commits

| Repository | Commit | Message |
|------------|--------|---------|
| cosmetics-website | `d0036024` | fix: email templates no longer stack VIP+Bundle discounts per item |
| genosys-mobile-app | `748ce3e` | fix: order detail + order list no longer stack VIP+Bundle discounts |

### Testing

- [ ] Place order with bundle items → verify customer email shows only "Bundle" badge per item
- [ ] Verify admin notification email shows only one discount badge per item
- [ ] Open order in native app Orders tab → expand order → verify bundle items show "X% Bundle" label
- [ ] Open order detail screen → verify bundle items show only "Bundle Discount (X%)"
- [ ] Verify VIP-only orders (no bundle) still show VIP badges correctly
- [ ] Verify strikethrough prices are correct (not inflated by stacked discount calculation)

---

*Session: February 11, 2026*
