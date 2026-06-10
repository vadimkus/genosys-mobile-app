# Android Play Release v85

Date: 2026-06-01

## Context

Prepared and uploaded the GENOSYS UAE Android build for Google Play after a Play Console deep-link warning appeared before upload. The console was showing failed domain checks for the existing selected build (`versionCode 81`), but the issue was still relevant because Android App Links are verified against the website's Digital Asset Links file.

## Root Cause

Google Play Console showed `Failed domain checks` for the Android deep links because:

- `https://genosys.ae/.well-known/assetlinks.json` was missing and returned `404`.
- `https://www.genosys.ae/.well-known/assetlinks.json` redirects to `https://genosys.ae/.well-known/assetlinks.json`.
- Google Digital Asset Links rejects redirects for security, so `www.genosys.ae` cannot be used as an Android verified App Links host unless it serves its own assetlinks file directly.

## Website Fix

Repository: `cosmetics-website`

- Commit: `9b0252ca`
- Added `public/.well-known/assetlinks.json`.
- Package: `ae.genosys.app`.
- SHA-256 fingerprint from EAS Android keystore:

```text
06:3F:90:51:55:25:6D:36:D7:DB:41:62:1D:D8:E3:82:59:4B:AF:62:9D:C7:3B:8C:8F:37:F2:F2:61:B8:5D:FC
```

Validation:

- `https://genosys.ae/.well-known/assetlinks.json` returns HTTP `200`.
- Google Digital Asset Links API returns a valid statement for `https://genosys.ae` and package `ae.genosys.app`.
- `www.genosys.ae` still redirects to apex; this is acceptable because the Android app no longer declares `www.genosys.ae` as a verified App Links host.

## Mobile App Fix

Repository: `genosys-mobile-app`

- Commit: `38df703`
- Android `versionCode`: `84` -> `85`.
- Removed all `www.genosys.ae` entries from `android.intentFilters`.
- Kept `genosys.ae` verified App Links for 20 paths:
  - `/products`
  - `/cart`
  - `/orders`
  - `/profile`
  - `/favorites`
  - `/skin-recommendation`
  - `/skin-analysis`
  - `/blog`
  - `/bundle-builder`
  - `/training`
  - `/chat`
  - `/checkout`
  - `/track`
  - `/locations`
  - `/brand`
  - `/delivery`
  - `/faq`
  - `/partners`
  - `/about`
  - `/contact`

Why a new AAB was required:

- Android App Links live in the compiled native Android manifest.
- OTA cannot change `intentFilters`.
- Play needed a new bundle with the corrected host list.

## Build

- Source commit used by EAS: `38df70366114e3bb014a34e5a673c268d280ac40`
- EAS build ID: `aff0748a-2c07-49ab-954c-e3c0342dcb1c`
- Build profile: `production:android`
- App version: `1.10.1`
- Runtime version: `1.10.1`
- Android `versionCode`: `85`
- Artifact: `/Users/vadimkus/Desktop/genosys-uae-1.10.1-85.aab`
- Artifact size: ~83 MB
- Documentation commit after build: `fadcf24`

## Validation

- `npm run verify:release` passed:
  - `verify:splash`
  - `smoke:pricing-display`
  - `smoke:cart-pricing-contract`
  - `smoke:order-payload-pricing-contract`
  - `smoke:orders-repository`
- `npx expo config --json` confirmed:
  - Android package `ae.genosys.app`
  - Android `versionCode` `85`
  - `20` `genosys.ae` App Links entries
  - `0` `www.genosys.ae` App Links entries
- EAS build completed successfully.
- The AAB was downloaded to Desktop for Google Play upload.

## Google Play Upload

Vadim confirmed the v85 AAB was pushed/uploaded in Google Play Console on 2026-06-01.

Important note:

- Old Play Console deep-link pages may still show failures for older selected builds such as `versionCode 81`.
- The v85 bundle should not ask Play to verify `www.genosys.ae`.
- If Play still displays warnings, re-check that the selected app version is `85`, not an older version.

## Release Notes Used

```text
Improved Android experience for the latest OS versions.

• Better layout support for Android gesture navigation and edge-to-edge screens
• Fixed profile photo picker behavior on Android
• Improved launch splash screen stability
• Updated biometric messages for Android users
• Fixed verified app links / deep link domain handling
• General stability and checkout readiness improvements
```

## Follow-up

- After Google Play processing, review the deep-link report for `versionCode 85`.
- If `genosys.ae` is green and `www.genosys.ae` no longer appears, the App Links issue is resolved.
- If Google flags anything else, investigate the exact Play Console issue before producing another build.
