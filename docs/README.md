# Genosys Mobile App — Documentation

> **iOS and Android** app for GENOSYS Professional Korean Dermacosmetics (genosys.ae)
>
> Tech: React Native (Expo), TypeScript, expo-router, expo-image, expo-video, expo-audio

---

## Quick Start

| Doc | Description |
|-----|-------------|
| [Shop Product Option Sheet OTA (2026-08-08)](./SESSION_CHANGES_2026-08-08_shop-product-option-sheet-ota.md) | Native Shop cards require explicit size/shade selection in a localized bottom sheet; variant pricing, OOS, cart keys, checkout guard and runtime 1.11.0 OTA coverage. |
| [In-app Product Guide PDF OTA (2026-08-06)](./SESSION_CHANGES_2026-08-06_product-guide-pdf-ota.md) | Dedicated native PDF guide screen with secure WebView rendering, download/cache progress, share/external controls, EN/RU/AR, and preserved PDP state. |
| [CI Splash Verification SDK 57 Fix (2026-07-31)](./SESSION_CHANGES_2026-07-31_ci-splash-verification-sdk57.md) | Updates the release smoke for the SDK 57 splash plugin and re-syncs tracked iOS launch assets. |
| [Product Video Native Aspect Ratio (2026-07-31)](./SESSION_CHANGES_2026-07-31_product-video-native-aspect-ratio.md) | Removes dark letterbox corners by sizing the native PDP player from each video's actual track dimensions. |
| [AFS PC19 Intertek Pairing OTA (2026-07-30)](./SESSION_CHANGES_2026-07-30_afs-pc19-intertek-pairing-ota.md) | Removes MultiEx BSASM from AFS+barrier cream pairing; Centella/Allantoin + NMF. Runtime 1.11.0 (group `c8f6679c`). |
| [Bakuchiol AM/PM Pairing OTA (2026-07-28)](./SESSION_CHANGES_2026-07-28_bakuchiol-ampm-pairing-ota.md) | Serum/cream Perfect Combination copy is AM & PM layering, not day/night split. Runtime 1.11.0 (group `f7867606`). |
| [App Footer Partner Portal Colors OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_app-footer-partner-portal-colors-ota.md) | Footer `#0B0B0C` + bright white type to match Partner Portal card. Runtime 1.11.0 (group `6498a956`). |
| [App Footer Revert Pressable OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_app-footer-revert-pressable-ota.md) | Reverted whole-card pressable; original graphite card, links only. Runtime 1.11.0 (group `921c74ef`). |
| [App Footer Pressable Haptic OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_app-footer-pressable-haptic-ota.md) | Whole footer card opens genosys.ae with medium haptic (superseded). Runtime 1.11.0 (group `6cb45b04`). |
| [App Footer Restore Original OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_app-footer-restore-original-ota.md) | Reverted footer to original white wordmark / white links on graphite card. Runtime 1.11.0 (group `8448ee5f`). |
| [App Footer Gold Frame OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_app-footer-gold-frame-ota.md) | Certificate-style gold double frame (superseded by restore). Runtime 1.11.0 (group `f82c54dd`). |
| [App Footer Freeze Hotfix OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_app-footer-freeze-hotfix-ota.md) | Removed continuous gold shimmer that froze Account scroll. Static gold footer kept. Runtime 1.11.0 (group `0b3cfd0b`). |
| [App Footer Gold Shimmer OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_app-footer-gold-shimmer-ota.md) | Luxury gold shimmer + glow on the shared GENOSYS brand footer (web certificate pattern). Runtime 1.11.0 (group `3f146568`) — **superseded by freeze hotfix**. |
| [Lightbox Swipe After Zoom OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_lightbox-swipe-after-zoom-ota.md) | Restores left/right image paging after zoom-out in the product lightbox. Runtime 1.11.0 (group `d413042f`). |
| [PDP Lightbox Pinch Zoom OTA (2026-07-26)](./SESSION_CHANGES_2026-07-26_lightbox-pinch-zoom-ota.md) | Adds pinch / pan / double-tap zoom to the full-screen product image viewer. Runtime 1.11.0 (group `ee95574f`). |
| [Profile Partner Card Spacing OTA (2026-07-21)](./SESSION_CHANGES_2026-07-21_profile-partner-card-spacing-ota.md) | Prevents the Partner Portal card from visually overlapping the Orders/Bag row on partner account profiles. Republished to production runtime 1.11.0 (group `433a73c2`). |
| [Native Email Domain Validation (2026-07-21)](./SESSION_CHANGES_2026-07-21_email-domain-validation.md) | Prevents unreachable signup accounts with syntax checks, explicit “Did you mean?” provider corrections, and shared server-side MX/domain validation in EN/RU/AR. |
| [Native Checkout Progress OTA (2026-07-21)](./SESSION_CHANGES_2026-07-21_checkout-progress.md) | Adds a localized green `Cart → Details & payment → Confirmation` progress indicator across Bag, Checkout, and shared order-success screens. Published to iOS and Android on production runtime 1.11.0. |
| [Partner Portal Login Entry (2026-07-20)](./SESSION_CHANGES_2026-07-20_partner-portal-login-entry.md) | Adds a localized Partner Portal entry card to the native login screen and returns authenticated partner accounts directly to the protected portal. |
| [Native Clinic Homecare Scripts (2026-07-19)](./SESSION_CHANGES_2026-07-19_homecare-scripts.md) | Native partner workflow for versioned retail recommendations, private-link sharing, revocation, and Clinic Points. iOS and Android bundles verified locally; no OTA published. |
| [PDP and Bag Controls OTA (2026-07-18)](./SESSION_CHANGES_2026-07-18_pdp-bag-controls-ota.md) | Removes PDP chat overlap, makes native PDP quantity controls update the real bag, removes quantity-1 lines with minus, and opens the bag from the in-bag CTA. Runtime 1.11.0. |
| [Main README](../README.md) | Project overview, install, and run |
| [Skin Analysis — Logic Fixes (2026-07-06)](./SESSION_CHANGES_2026-07-06_skin-analysis-logic-fixes.md) | **Quiz scoring was dead** — display labels (Oily/Acne) never matched the server's canonical keys, so every user got the same fallback list. Server now normalizes aliases (fixes shipped binaries), quiz sends canonical + the previously-ignored usage answer (at-home hides PRO Solution), results show per-product match chips, retry keeps answers, on-device fallback engine's JSON parsing fixed. OTA runtime 1.10.4 (group `3992f6ec`). |
| [Build Your Set — Audit Fixes (2026-07-06)](./SESSION_CHANGES_2026-07-06_bundle-builder-audit-fixes.md) | **Bundle pricing aligned with server** — bag totals + waterfall now best-discount-wins (VIP vs bundle tier, per line); builder preview shows the winning discount with dynamic label; "Required" → "Recommended" (amber); `formatAed` everywhere. Bio Meso ampoules join the Serum step, SRS re-admitted to Peeling (server-side). OTA runtime 1.10.4. |
| [Bundle Builder — No Cropping (2026-07-06)](./SESSION_CHANGES_2026-07-06_bundle-builder-image-no-crop.md) | **Build Your Set cards get the same square photo tiles** — 130px strip → square `CARD_WIDTH` tile on white; deprecated `resizeMode` → `contentFit="contain"` (expo-image was ignoring the old prop). Summary thumbnails too. OTA runtime 1.10.4 (group `11c68542`). |
| [Product Images — No Cropping (2026-07-05)](./SESSION_CHANGES_2026-07-05_product-image-no-crop.md) | **Shop grid + concern grids get square photo tiles; every product thumbnail switched `cover` → `contain`** (bag, favorites, orders, chat, skin-analysis, Perfect Combination). Gray thumb backgrounds → white so letterboxing is invisible. Shipped via OTA runtime 1.10.4 (group `9c50d1b3`). |
| [Skin Concerns — Living-Diagnostic Face Map (2026-07-05)](./SESSION_CHANGES_2026-07-05_face-map-diagnostic-redesign.md) | **Face-map redesign** — scan-sweep intro, staggered dot reveal, breathing pulses with phase offsets, frosted-glass dots + active reticle, leader-line callout, "quick chips" cloud replacing the duplicated concern grid. OTA runtime 1.10.4. |
| [Apple-Native Redesign (2026-06-20)](./SESSION_CHANGES_2026-06-20_apple-native-redesign.md) | **App-wide Apple-native redesign** — surfaces, shadows, typography, tab bar, cards shipped via OTA runtime 1.10.4. |
| [iOS Full Audit](./SESSION_CHANGES_2026-06-11_ios-full-audit.md) | **iOS audit (read-only)** — CRITICAL: AASA missing on genosys.ae (Universal Links broken); iOS binary behind OTA runtime (ship 1.10.2/84); www applinks can't verify; unused sfsymbols dep; Apple Pay entitlement unused. |
| [Android Full Audit](./SESSION_CHANGES_2026-06-11_android-full-audit.md) | **Android audit & hygiene** — expo packages aligned to SDK 54 patches, critical/high npm vulns cleared, stale local `android/` regenerated (www App Links gone), tracked `.pid` junk removed, expo-doctor now 17/17. No runtime code changes. |
| [.env.backup Scrub](./SESSION_CHANGES_2026-06-10_env-backup-scrub.md) | **Security** — git-tracked `.env.backup` (live website DB credentials) untracked, `.gitignore` hardened, and all env files purged from full git history via `filter-repo` force-push. No app impact; credential rotation pending; other clones must re-clone. |
| [Android Play Release v85](./SESSION_CHANGES_2026-06-01_android-play-v85-release.md) | **Google Play v85 release record** — documents the Play Console deep-link warning, website `assetlinks.json` fix, Android `www` App Links removal, EAS build `aff0748a`, Desktop AAB path, upload confirmation, and release notes. |
| [Native Splash Video Restore](./SESSION_CHANGES_2026-04-28_native-splash-video-restore.md) | **TestFlight splash restore** — remote `Splash.mp4` now mounts on first JS render, avoids cached/fresh config remount flicker, and uses a WebView video fallback with launch fail-safes. Published OTA to runtime `1.10.0`. |
| [Android OS Version Alignment](./SESSION_CHANGES_2026-05-31_android-os-version-alignment.md) | **Android API 36 / OS behavior audit** — profile photo picker no longer requests blocked media permissions, splash build selection uses Android versionCode fallback, Android tab bar respects edge-to-edge safe-area insets, and Android App Links now verify only the non-redirecting `genosys.ae` host for Play. |
| [Native Bundle VIP Badges](./SESSION_CHANGES_2026-04-28_native-bundle-vip-badges.md) | **Bag display fix** — Build Your Set cart rows now show the effective `50% off` VIP badge when the user's personal discount beats the bundle tier. Published OTA to runtime `1.10.0`. |
| [TestFlight Startup Splash Black Screen Fix](./SESSION_CHANGES_2026-04-28_testflight-startup-splash-black-screen.md) | **Startup UX fix** — video splash overlay no longer shows/sticks as a black screen on TestFlight cold start; white branded fallback + ready-state guard + JS fail-safe. Published OTA to runtime `1.10.0`. |
| [Build Set Bundle Discount Recalc](./SESSION_CHANGES_2026-04-27_bundle-discount-recalc.md) | **Security/pricing fix** — native cart now recalculates Build Your Set discounts after removal/quantity changes, so a single leftover bundle item cannot keep stale 20% bundle pricing. Published OTA to runtime `1.10.0`. |
| [Release Hardening 1.10.0](./SESSION_CHANGES_2026-04-27_release-hardening-1.10.0.md) | **Release hardening** — shared HTTP client, centralized orders repository, profile normalization, checkout submit snapshot, Sentry release/runtime wiring, runtime/native version sync, release smoke suite, and EAS/OTA notes for `1.10.0`. |
| [Session Changes 26 Apr 2026](./SESSION_CHANGES_2026-04-26_runtime-and-api-media.md) | **Runtime alignment + API media priority** — Expo runtime now follows app version `1.9.0`, sync script added for package/iOS plist alignment, and PDP media/docs helpers now prefer API/DB fields before static fallback config. |
| [Pricing Contract Display Slice](./SESSION_CHANGES_2026-04-26_pricing-display-contract.md) | **Native read-only pricing contract migration** — display surfaces now prefer server `product.pricing` with legacy fallback; cart totals, checkout totals, bundle math, and order payload pricing remain untouched. |
| [Pricing Contract Cart Slice](./SESSION_CHANGES_2026-04-26_cart-pricing-contract.md) | **Native cart totals pricing contract migration** — cart subtotal/waterfall now prefer contract unit prices where safe, with guest-cart fallback, promo zero lines, and explicit bundle discount behavior preserved. |
| [Pricing Contract Cleanup Slice](./SESSION_CHANGES_2026-04-26_pricing-contract-cleanup.md) | **Native pricing cleanup** — hero and checkout summary line prices now use the pricing display helper; bundle builder retail-price reads are contract-ready while preserving bundle-only discount behavior. |
| [Build & Submit (iOS)](./build/BUILD_AND_SUBMIT_COMMANDS.md) | Build and submit to App Store |
| [Android Build Guide](./build/ANDROID_BUILD_GUIDE.md) | Build and run on Android (emulator/device) |
| [Build Status](./build/BUILD_STATUS.md) | Current build status |

---

## Core Features

| Doc | Description |
|-----|-------------|
| [Shop Page](./core/SHOP_PAGE_FEATURES.md) | Product catalog, categories, search, banners |
| [Product Detail Updates](./core/PRODUCT_DETAIL_UPDATES.md) | Image gallery, video player, trust badges (Feb 2026) |
| [Dynamic Content](./core/DYNAMIC_CONTENT.md) | Backend-driven images & videos (no app rebuild needed) |
| [Session Log 7 Feb 2026](./core/SESSION_LOG_2026_02_07.md) | Menu redesign, multi-category, images, videos |
| [Session Log 7–8 Feb (cont.)](./core/SESSION_LOG_2026_02_07_continued.md) | Request Quote, Bio Meso, voice search, more images/videos, dot fix |
| [Session Log 8 Feb 2026](./core/SESSION_LOG_2026_02_08.md) | WebView auth bridge, translation fixes, isPriceOnRequest on all pages |
| [Session Log 9 Feb 2026](./core/SESSION_LOG_2026_02_09.md) | Android app setup, SDK tools, emulator, code fixes |
| [Session Log 10 Feb 2026](./core/SESSION_LOG_2026_02_10.md) | Native blog, AI skin analysis upgrade, crash fix (Builds 49-53) |
| [Session Log 11 Feb 2026](./core/SESSION_LOG_2026_02_11.md) | Android alignment, v58, full audit (checkout/orders/success), haptics fix, badge fix, beauty box |
| [Session Log 12 Feb 2026](./core/SESSION_LOG_2026_02_12.md) | v1.4.0 TestFlight, Apple Review doc update, App Store release notes |
| [Session Log 13 Feb 2026](./core/SESSION_LOG_2026_02_13.md) | Product video sound fix, product documentation API-first fix |
| [Bug Audit 29 Mar 2026](./core/BUG_AUDIT_2026_03_29.md) | **NEW** Comprehensive audit: 50 issues fixed across 14 files (pricing, RTL, performance, security, error handling) |
| [Bug Audit 28 Mar 2026](./core/BUG_AUDIT_2026_03_28.md) | Full code audit: 13 bugs + 1 regression fix (perf, race conditions, pricing, size variant discount) |
| [Bug Audit 23 Mar 2026](./core/BUG_AUDIT_2026_03_23.md) | Full code audit: 11 bugs fixed (crash, security, race conditions, checkout) |
| [Session Log 18 Apr 2026](./core/SESSION_LOG_2026_04_18.md) | **NEW** `expo-av` → `expo-video` + `expo-audio` migration (SDK 55 ready). `VideoLaunchScreen.js` and `ProductVideo` both moved to the new imperative `useVideoPlayer` API; iOS silent-mode override now uses `setAudioModeAsync({ playsInSilentMode: true })`. TypeScript clean, bundle exports cleanly, `expo-av` fully removed. Requires a native rebuild (EAS) to ship. |
| [Session Log 19–20 Mar 2026](./core/SESSION_LOG_2026_03_19.md) | Remote splash screen, soft update banner, v1.7.0 live, first OTA splash swap |
| [Remote Splash Screen](./core/REMOTE_SPLASH_SCREEN.md) | How to update/disable splash video without app rebuild (with change history) |
| [Session Log 26 Feb 2026](./core/SESSION_LOG_2026_02_26.md) | Centralized typography system (54 files), Revita Glow "New" badge fix |
| [Session Log 20 Feb 2026](./core/SESSION_LOG_2026_02_20.md) | Fix routine chip cart state for products with size variants (9 products across 7 concern pages) |
| [Session Log 19 Feb 2026 (Part 2)](./core/SESSION_LOG_2026_02_19_part2.md) | Native concern-detail screen, training nativization, routine add-to-cart (tap toggle + long-press navigate), CUID vs productNumber fix, toast messages, TestFlight build 64 |
| [Session Log 19 Feb 2026](./core/SESSION_LOG_2026_02_19.md) | Native Skin Concerns screen, Browse by Concern CTAs, PDRN video, Skin Concern category |
| [Session Log 18 Feb 2026](./core/SESSION_LOG_2026_02_18.md) | Sun-protection enhancements, haptics standardization |
| [Session Log 14 Feb 2026](./core/SESSION_LOG_2026_02_14.md) | Android app review, Google Play prep, 13 code fixes, full documentation |
| [Native Screens Migration](./core/NATIVE_SCREENS_MIGRATION.md) | WebView → Native: 8 screens migrated, API-driven FAQ & Partners |
| [Checkout Flow](./core/CHECKOUT_FLOW.md) | Delivery details, payment, order submission |
| [Orders](./core/ORDERS_PAGES.md) | Orders list, order detail, reorder |
| [Waterfall Pricing](./core/WATERFALL_PRICING.md) | Transparent discount breakdown (VIP, bundle) |
| [Chatbot (Genie)](./core/CHATBOT.md) | AI chatbot: greetings, quick actions, SSE API |
| [Deep Linking](./core/DEEP_LINKING.md) | Universal links and custom URL scheme |
| [Offline Cache](./core/OFFLINE_PRODUCT_CACHE.md) | Browse products without internet |
| [Empty States](./core/EMPTY_STATES.md) | Unicorn mascot on empty favorites/orders |
| [Skeleton Loaders](./core/SKELETON_LOADING_SCREENS.md) | Shimmer placeholders for loading states |
| [Haptic Feedback](./core/HAPTIC_FEEDBACK.md) | Tactile feedback on key actions |
| [Animations](./core/ANIMATIONS.md) | Animation policy: what's kept vs removed |

---

## Skin Concerns & Routine Add-to-Cart

| Feature | Details |
|---------|---------|
| **Skin Concerns List** | `app/skin-concerns.js` — Native 2-column card grid, 8 concerns, EN/AR/RU, RTL |
| **Concern Detail** | `app/concern-detail.js` — Full native screen (hero, why, routine, products, FAQ, PDF, related) |
| **Routine Tap-to-Cart** | Single tap = toggle add/remove from bag (toast + haptic); Long press = navigate to product page |
| **API Endpoint** | `GET /api/mobile/concerns/:slug` — Returns localized concern data with all routine products |
| **Product Lookup** | Dual-indexed by `id` (CUID) and `productNumber`; cart ops use real CUID |
| **Training Materials** | `app/training.js` — Fully native (last WebView screen removed) |

**App is now 100% native — zero WebView content screens.**

---

## API & Backend

| Doc | Description |
|-----|-------------|
| [API Endpoints](./api/API_ENDPOINTS_NEEDED.md) | Required API endpoints list |
| [API Connection](./api/API_CONNECTION_SUCCESS.md) | API integration verification |
| [Mobile API](./api/MOBILE_API_IMPLEMENTATION.md) | Mobile API details |
| [Database Integration](./api/DATABASE_INTEGRATION.md) | Database setup and integration |
| [DB-Driven Features](./api/DATABASE_DRIVEN_INTEGRATION_COMPLETE.md) | Database-driven features |
| [Existing DB Integration](./api/EXISTING_DATABASE_INTEGRATION.md) | Integration with existing DB |

---

## Setup & Auth

| Doc | Description |
|-----|-------------|
| [Authentication Setup](./setup/SETUP_AUTHENTICATION.md) | Auth setup guide |
| [Google OAuth](./setup/GOOGLE_OAUTH_SETUP.md) | Google sign-in configuration |

---

## UI Components

| Doc | Description |
|-----|-------------|
| [Typography System](./ui/TYPOGRAPHY_SYSTEM.md) | **NEW** Centralized type scale (`utils/typography.js`) — 30+ tokens, 54 files |
| [Size Variants](./ui/SIZE_VARIANTS_IMPLEMENTATION.md) | Product size variant selector |
| [Footer Icons](./ui/FOOTER_ICON_ENHANCEMENTS.md) | Tab bar improvements |
| [Bag Icon](./ui/BAG_ICON_COLOR_CHANGE.md) | Cart icon styling |
| [Orders Icon](./ui/ORDERS_ICON_COLOR_CHANGE.md) | Orders icon styling |
| [expo-image Migration](./ui/EXPO_IMAGE_MIGRATION.md) | Image caching and performance |

---

## RTL & Localization

| Doc | Description |
|-----|-------------|
| [RTL Summary](./rtl/COMPLETE_RTL_SUMMARY.md) | Full RTL implementation overview |
| [RTL Status](./rtl/RTL_IMPLEMENTATION_STATUS.md) | RTL progress tracking |
| [Shop RTL](./rtl/SHOP_SCREEN_RTL_SUPPORT.md) | Shop page RTL layout |
| [Bag RTL](./rtl/BAG_PAGE_RTL_SUPPORT.md) | Cart page RTL layout |
| [Login RTL](./rtl/LOGIN_RTL_ARABIC_SUPPORT.md) | Login page RTL layout |
| [Login Buttons RTL](./rtl/LOGIN_BUTTONS_RTL_FIX.md) | Auth buttons RTL fix |
| [Login Localization](./rtl/LOGIN_LOCALIZATION_FIX.md) | Login translations fix |
| [Profile RTL](./rtl/PROFILE_SUBPAGES_RTL_GUIDE.md) | Profile subpages RTL guide |

---

## Build & Deploy

| Doc | Description |
|-----|-------------|
| [Build Commands](./build/BUILD_AND_SUBMIT_COMMANDS.md) | Build and submit to App Store |
| [Android Build Guide](./build/ANDROID_BUILD_GUIDE.md) | Build and run on Android (Feb 2026) |
| [Build Status](./build/BUILD_STATUS.md) | Current build status |
| [Network Errors](./build/NETWORK_ERROR_RESOLUTION.md) | Network debugging |

---

## App Store & Google Play

| Doc | Description |
|-----|-------------|
| [App Store Assets](./app-store/APP_STORE_ASSETS.md) | Assets for App Store listing |
| [Release Notes 1.8.0](./app-store/RELEASE_NOTES_1.8.0.md) | **NEW** v1.8.0: variant selectors, checkout validation, OTA updates, nav cleanup |
| [Release Notes 1.7.0](./app-store/RELEASE_NOTES_1.7.0.md) | v1.7.0 release notes, review notes, technical changes |
| [Apple Review](./app-store/APPLE_REVIEW_DOCUMENTATION.md) | Apple App Store review preparation |
| [Google Play Review](./app-store/GOOGLE_PLAY_REVIEW_DOCUMENTATION.md) | Google Play Store review documentation |
| [Google Play Console Setup](./app-store/GOOGLE_PLAY_CONSOLE_SETUP.md) | **NEW** Developer account setup, build, submit, release details (Feb 2026) |
| [Shotlist](./app-store/SHOTLIST.md) | Screenshot planning |

---

## Screenshots

| Doc | Description |
|-----|-------------|
| [Overview](./screenshots/SCREENSHOTS.md) | Screenshot documentation |
| [Guide](./screenshots/SCREENSHOT_GUIDE.md) | How to capture screenshots |
| [Resizing for App Store](./screenshots/SCREENSHOT_RESIZING_FOR_APP_STORE.md) | Resizing screenshots to Apple requirements (Feb 2026) |
| [Capture Scripts](./screenshots/SCREENSHOT_CAPTURE_README.md) | Automated capture scripts |
| [Capture Complete](./screenshots/SCREENSHOT_CAPTURE_COMPLETE.md) | Completion status |
| [Quick Checklist](./screenshots/QUICK_CHECKLIST.md) | Quick reference |
| [Upload Ready](./screenshots/UPLOAD_READY.md) | Ready for upload |
| [Russian Guide](./screenshots/RUSSIAN_SCREENSHOTS_GUIDE.md) | Russian localization screenshots |
| [Russian Quick Start](./screenshots/RUSSIAN_QUICK_START.md) | Russian quick start |
| [Russian Complete](./screenshots/RUSSIAN_IMPLEMENTATION_COMPLETE.md) | Russian completion |

---

## Archive

Older docs kept for reference. These cover completed tasks or debugging sessions.

| Doc | Description |
|-----|-------------|
| [Implementation Summary](./archive/IMPLEMENTATION_SUMMARY.md) | Original DB integration summary |
| [Orders Count Debug](./archive/ORDERS_COUNT_DEBUG.md) | Orders badge debugging |
| [Bag Best Practices](./archive/BAG_PAGE_BEST_PRACTICES_FIX.md) | Cart best practices fix |
| [Screenshot Mission](./archive/SCREENSHOT_MISSION_COMPLETE.md) | Screenshot mission summary |
| [Russian Capture Session](./archive/RUSSIAN_CAPTURE_SESSION.md) | Russian capture notes |

---

## Folder Structure

```
docs/
├── README.md                  # This file — documentation index
├── core/                      # Core feature documentation
│   ├── PRODUCT_DETAIL_UPDATES.md   # Image gallery, video, badges (Feb 2026)
│   ├── DYNAMIC_CONTENT.md          # Backend-driven images & videos
│   ├── SESSION_LOG_2026_02_07.md   # Menu redesign, categories, images, videos
│   ├── SESSION_LOG_2026_02_07_continued.md  # Request Quote, voice search, more images
│   ├── SESSION_LOG_2026_02_08.md          # WebView auth bridge, translations, isPriceOnRequest
│   ├── SHOP_PAGE_FEATURES.md       # Shop page features
│   ├── CHECKOUT_FLOW.md            # Checkout flow
│   ├── ORDERS_PAGES.md             # Orders pages
│   ├── WATERFALL_PRICING.md        # Pricing breakdown
│   ├── CHATBOT.md                  # AI chatbot
│   ├── DEEP_LINKING.md             # Universal links
│   ├── OFFLINE_PRODUCT_CACHE.md    # Offline browsing
│   ├── EMPTY_STATES.md             # Empty state screens
│   ├── SKELETON_LOADING_SCREENS.md # Loading placeholders
│   ├── HAPTIC_FEEDBACK.md          # Tactile feedback
│   └── ANIMATIONS.md               # Animation policy
├── api/                       # API and backend integration
├── setup/                     # Auth and setup guides
├── ui/                        # UI component documentation
├── rtl/                       # RTL and localization
├── build/                     # Build, deploy, and debugging
├── app-store/                 # App Store submission
├── screenshots/               # Screenshot capture guides
└── archive/                   # Completed/legacy docs
```
