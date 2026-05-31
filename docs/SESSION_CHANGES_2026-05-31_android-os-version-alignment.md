# Android OS Version Alignment

Date: 2026-05-31

## Context

Reviewed the Android side of the Expo mobile app for OS-version behavior, version/build alignment, and platform discrepancies.

## Findings

- App stack is Expo SDK 54 / React Native 0.81, which targets Android 16 / API 36 by default in managed builds.
- There is no checked-in `android/` folder, so Android SDK defaults come from Expo/RN unless a future `expo-build-properties` override is added.
- `app.json` keeps app version/runtime `1.10.1`, keeps iOS build `83`, and bumps Android `versionCode` to `84` for the next Play upload.
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
  - Android `versionCode` `84`
  - Android broad media permissions blocked
  - iOS build `83`

