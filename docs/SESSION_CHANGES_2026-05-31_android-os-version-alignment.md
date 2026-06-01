# Android OS Version Alignment

Date: 2026-05-31

## Context

Reviewed the Android side of the Expo mobile app for OS-version behavior, version/build alignment, and platform discrepancies.

## Findings

- App stack is Expo SDK 54 / React Native 0.81, which targets Android 16 / API 36 by default in managed builds.
- There is no checked-in `android/` folder, so Android SDK defaults come from Expo/RN unless a future `expo-build-properties` override is added.
- `app.json` keeps app version/runtime `1.10.1`, keeps iOS build `83`, and bumps Android `versionCode` to `85` for the next Play upload.
- Android broad media permissions are intentionally blocked, but the profile-photo picker still requested media-library permission before launching the Android system picker.
- The splash cover build selector fell back to iOS build metadata even on Android if `Constants.nativeBuildVersion` was unavailable.
- Android edge-to-edge behavior in API 36 requires bottom UI to respect safe-area insets.

## Changes

- `app/profile/edit.js`: Android now opens the system image picker without requesting blocked `READ_MEDIA_*` permissions. iOS still requests photo-library permission.
- `components/VideoLaunchScreen.js`: native build selection now falls back to platform-specific Expo config (`android.versionCode` or `ios.buildNumber`) instead of iOS metadata for every platform.
- `components/VideoLaunchScreen.js`: Android now uses a shorter WebView reveal delay than iOS so the launch video is not held behind the static cover longer than needed.
- `app/(tabs)/_layout.js`: Android tab bar now adds the bottom safe-area inset to height/padding so it does not collide with gesture navigation on edge-to-edge Android builds.
- `app/skin-analysis-camera.js`: camera header now uses safe-area top inset instead of a hardcoded Android `top: 10`.
- `services/biometricService.js`: Android biometric copy now says fingerprint/biometric authentication instead of Face ID / Touch ID.
- `eas.json`: Android production builds now set `SENTRY_DISABLE_AUTO_UPLOAD=true` so missing Sentry upload credentials cannot fail a Google Play bundle build.
- `app.json`: Android verified app links now target only `genosys.ae`; `www.genosys.ae` was removed because Vercel redirects it to the apex domain and Google Digital Asset Links rejects redirects for `/.well-known/assetlinks.json`.
- `docs/build/ANDROID_BUILD_GUIDE.md`: updated Android version, OAuth, media permission, and API 36 notes.
- `README.md`: updated displayed app version to `1.10.1`.

## Validation

- `npm run verify:release` passed:
  - `verify:splash`
  - `smoke:pricing-display`
  - `smoke:cart-pricing-contract`
  - `smoke:order-payload-pricing-contract`
  - `smoke:orders-repository`
- `node --check` passed for:
  - `app/profile/edit.js`
  - `components/VideoLaunchScreen.js`
  - `app/(tabs)/_layout.js`
- `npx expo config --json` confirms:
  - SDK `54.0.0`
  - version/runtime `1.10.1`
  - Android package `ae.genosys.app`
  - Android `versionCode` `85`
  - Android App Links include `20` `genosys.ae` entries and `0` `www.genosys.ae` entries
  - Android broad media permissions blocked
  - iOS build `83`

## Google Play AAB Build

- Source pushed to `main`.
- Commit used for the successful EAS build: `c1762e97b5cfbd9d4fa3a6839f61a92b6e3e7f44`.
- EAS Android build ID: `242bf2ad-1983-4c97-a256-c0520b769961`.
- Build profile: `production:android`.
- Version: `1.10.1`.
- Android versionCode: `84`.
- Runtime: `1.10.1`.
- Artifact downloaded to: `/Users/vadimkus/Desktop/genosys-uae-1.10.1-84.aab`.
- Downloaded artifact size: ~83 MB.

## Google Play Deep Links Follow-up

After the first AAB was prepared, Google Play Console showed `Failed domain checks` for every Android App Link path on the selected existing build (`versionCode 81`). Root cause:

- `genosys.ae/.well-known/assetlinks.json` was missing on the website and returned `404`.
- `www.genosys.ae/.well-known/assetlinks.json` redirects to the apex domain; Google Digital Asset Links does not follow redirects for security.

Website fix shipped in `cosmetics-website` commit `9b0252ca`, adding `public/.well-known/assetlinks.json`. Google Digital Asset Links now resolves the apex domain statement for package `ae.genosys.app`.

Native follow-up:

- Android App Links in `app.json` now exclude `www.genosys.ae`.
- Android `versionCode` is now `85`.
- A fresh AAB is required because verified app links are native manifest data.

### v85 Build

- Source commit used for the successful EAS build: `38df70366114e3bb014a34e5a673c268d280ac40`.
- EAS Android build ID: `aff0748a-2c07-49ab-954c-e3c0342dcb1c`.
- Build profile: `production:android`.
- Version: `1.10.1`.
- Android versionCode: `85`.
- Runtime: `1.10.1`.
- Artifact downloaded to: `/Users/vadimkus/Desktop/genosys-uae-1.10.1-85.aab`.
- Downloaded artifact size: ~83 MB.

### Build Notes

- First local build failed because `ANDROID_HOME` / Android SDK was not configured in the shell.
- First EAS cloud build failed because Sentry source-map upload required `SENTRY_AUTH_TOKEN`.
- Added `SENTRY_DISABLE_AUTO_UPLOAD=true` to `production:android` in `eas.json`; rerun EAS cloud build succeeded.

