# Session Changes — Release Hardening 1.10.0

Date: 2026-04-27

## Scope

Release-hardening pass after guest pricing, production hygiene, conversion/navigation, and order/payment reliability work.

## Implemented

- Added a shared `services/httpClient.js` with API-key headers, optional authenticated refresh path, timeout handling, JSON parsing, and safe errors.
- Centralized order list/detail/badge behavior through `services/ordersRepository.js`, `services/useOrdersData.js`, and pure `utils/orderModel.js`.
- Updated orders list, order detail, payment status, and orders badge logic to share the same dedupe/filter/payment/deletion rules.
- Normalized profile/user fields with `utils/userProfile.js` and used it in checkout, profile edit, and order detail contact display.
- Hardened checkout submission by recalculating cart totals immediately before submit and sending a `clientPricingSnapshot`.
- Completed Sentry wiring: release/runtime/environment tags, ErrorBoundary capture, and PII-safe user context.
- Restored the mobile API-key fallback in `config/auth.js` after TestFlight auth regression; the mobile key is a public client identifier and OTA bundles must not be able to ship with an empty auth header.
- Migrated high-traffic product/blog/skin/bundle/FAQ/privacy fetch paths to the shared HTTP client.
- Migrated more high-traffic product imagery to `expo-image`.
- Added `smoke:orders-repository` and `verify:release` scripts.
- Post-audit hardening:
  - Moved remaining authenticated profile/session mutations in `services/authService.js` to the shared refresh-aware HTTP layer.
  - Moved shipping-rate fallback handling through the shared HTTP client while preserving the deployed-route 404 fallback.
  - Localized skin-analysis retry/error copy, Browse by Skin Concern CTAs, Cushion BB size copy, discount labels, payment statuses, and key accessibility labels.
  - Added RTL polish for drawer highlight cards and skin-analysis score rows.
  - Localized orders-list dates using the app locale instead of device default.
- TestFlight startup routing fix:
  - Restored the default app entry route to `/auth/login`, matching previous TestFlight behavior.
  - Converted cold-start product/order deep links into `/auth/login` instead of opening product/order screens before login.
  - Kept foreground/runtime deep-link handling unchanged so already-running app sessions can still open product links directly.
- TestFlight Google auth follow-up:
  - Republished the latest OTA with `--environment production` so `EXPO_PUBLIC_API_KEY` and Stripe public key are injected into the JavaScript bundle.
  - Root cause: publishing an OTA without the EAS production environment can produce a bundle with an empty mobile API key, causing `/api/mobile/auth/google` to reject the backend exchange after Google returns an identity token.
- TestFlight all-auth follow-up:
  - User reported both Google and email/password login failing.
  - Verified live backend behavior: missing mobile API key returns `401 Unauthorized - Invalid or missing API key`; known mobile key reaches normal credential validation.
  - Restored the mobile API key fallback in code to prevent email/password, Google, Apple, and profile auth flows from depending solely on EAS env injection.
- Expanded `scripts/sync-runtime-version.js` to sync:
  - `app.json` `runtimeVersion`
  - `package.json`
  - `package-lock.json`
  - iOS `Expo.plist` runtime
  - iOS `Info.plist` version/build
  - Android `build.gradle` version/code

## Version / Runtime

- App version: `1.10.0`
- Runtime version: `1.10.0`
- iOS build number: `81`
- Android version code: `82`
- EAS production channel remains `production`.

## EAS / OTA Notes

- `EXPO_PUBLIC_API_KEY` is now set as a production EAS environment variable.
- `EXPO_PUBLIC_SENTRY_DSN` still needs to be set in EAS production env for event upload; without it Sentry safely no-ops.
- OTA is runtime-bound. Updates for this release must target runtime `1.10.0`; existing `1.9.0` builds cannot receive `1.10.0` runtime updates.
- Published production OTA update for runtime `1.10.0`: group `9241c01b-94ba-4834-a812-c24c2c6c47ac`, platforms `android, ios`, message `"Release hardening 1.10.0 OTA verification"`.
- Published post-audit production OTA update for runtime `1.10.0`: group `08d72aa6-1ddf-4ff1-b7cd-d0fcce24430e`, platforms `android, ios`, message `"Post-audit HTTP i18n accessibility hardening 1.10.0"`.
- Published login startup production OTA update for runtime `1.10.0`: group `4094514b-21b6-4334-8f3e-80637247bbc8`, platforms `android, ios`, message `"Force login on cold start 1.10.0"`.
- Published production-env auth OTA update for runtime `1.10.0`: group `b0d501f5-54bd-4729-adcc-63e1668ebd77`, platforms `android, ios`, message `"Restore production env for auth 1.10.0"`.
- Published mobile auth fallback OTA update for runtime `1.10.0`: group `31c05876-a6b6-4c7d-a426-f15d7a685489`, platforms `android, ios`, message `"Restore mobile auth fallback 1.10.0"`.
- Created EAS iOS production build `1bdff6c7-9a0a-41a8-a69d-83e2a025fb1f` for TestFlight.
- Submitted build `1bdff6c7-9a0a-41a8-a69d-83e2a025fb1f` to Apple App Store Connect/TestFlight. Submission URL: `https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/submissions/e9f3cbbc-e0a5-4da2-b92b-f7008f261843`.

## Verification

- `ReadLints` on edited files: passed.
- Localization JSON parse check for `en`, `ar`, and `ru`: passed.
- `npm run verify:release`: passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-mobile-export-ios-1-10 --clear`: passed.
- `npx expo export --platform android --output-dir /tmp/genosys-mobile-export-android-1-10 --clear`: passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-mobile-export-ios-1-10-audit --clear`: passed.
- `npx expo export --platform android --output-dir /tmp/genosys-mobile-export-android-1-10-audit --clear`: passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-mobile-export-ios-login-start --clear`: passed.
- `npx expo export --platform android --output-dir /tmp/genosys-mobile-export-android-login-start --clear`: passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-mobile-export-ios-login-start-final --clear`: passed.
- `npx expo export --platform android --output-dir /tmp/genosys-mobile-export-android-login-start-final --clear`: passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-mobile-export-ios-auth-fallback --clear`: passed.
- `npx expo export --platform android --output-dir /tmp/genosys-mobile-export-android-auth-fallback --clear`: passed.
- `npx expo-doctor`: 16/17 passed. The remaining warning is the known non-CNG native config warning because `ios/` and `android/` folders exist while native config remains in `app.json`. Runtime/version/build values are now synced into native files by script.
