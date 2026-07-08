# Session: Expo SDK 57 upgrade — v1.11.0 (2026-07-08)

Companion to `cosmetics-website/docs/SESSION_CHANGES_2026-07-08_DEPENDENCY_UPGRADES.md`.

## What changed

- **Expo SDK 54 → 57** (React Native 0.81.5 → 0.86.0, React 19.1 → 19.2.3)
- New Architecture was already enabled, so the SDK 55+ mandatory New Arch requirement was a no-op
- All expo-* packages moved to SDK 57 pins via `expo install --fix`
- Third-party: Sentry RN ~7.2 → ~7.11, Stripe RN 0.50.3 → 0.64.0, gesture-handler 2.28 → 2.32, screens 4.16 → 4.25, safe-area-context 5.6 → 5.7, svg 15.12 → 15.15, webview 13.15 → 13.16, expo-speech-recognition 3.1 → 56.x (versioning now tracks SDK)
- `@react-native-community/datetimepicker` intentionally stays at 8.4.4 (`expo.install.exclude` in package.json)
- npm audit: 23 → ~19 vulnerabilities; both HIGH ones (ws, undici — dev tooling) fixed

## Gotchas hit (and fixed)

1. **`expo.sdkVersion: "54.0.0"` was pinned in app.json** — this silently made `expo install --fix` resolve against SDK 54 and claim "dependencies are up to date". Removed (SDK is determined by the installed expo package).
2. **Splash schema**: SDK 57 rejects top-level `splash` and `ios/android.splash` — migrated to the `expo-splash-screen` config plugin.
3. **`useFocusEffect` from `@react-navigation/native`** no longer resolves (not hoisted by expo-router 57's dependency tree) — switched imports to `expo-router` in `app/checkout.js`, `app/profile/payment.js`, `app/profile/addresses.js`.
4. **expo-file-system classic API** (`cacheDirectory`, `getInfoAsync`, `downloadAsync`, …) moved to `expo-file-system/legacy` — updated `components/VideoLaunchScreen.js` and added expo-file-system as a direct dependency.
5. **Bare iOS project regeneration**: `ios/` is tracked in git (bare workflow for iOS; Android is CNG). Ran `npx expo prebuild -p ios --clean`, then restored the custom **Icon Composer layered icon** (`AppIcon.icon`, for iOS 26 Liquid Glass) and manually re-added its pbxproj references — prebuild does not manage them. Entitlements/URL schemes/usage descriptions carried over from app.json.

## Verification

- `expo-doctor`: 19/19 checks pass
- iOS + Android JS bundle exports succeed
- No usages found of removed APIs (router history, expo-av, expo-permissions, expo-keep-awake)

## Release (store binaries required — NOT OTA-able)

- Version **1.11.0**, iOS buildNumber 98 (EAS auto-increments), Android versionCode **90**, runtimeVersion **1.11.0**
- iOS: EAS production build + auto-submit to TestFlight (ascAppId 6756648064)
- Android: EAS production:android build (app-bundle). Auto-submit unavailable (no Google Service Account key on EAS) — download the AAB from the EAS build page and upload to Play Console internal track manually, same as v85
- Existing installs stay on runtime 1.10.5 and continue receiving OTA updates on that runtime until users update from the stores
- **Before public release: smoke-test the TestFlight/internal build on device** — checkout (card + COD + points redemption), push notifications, biometrics, Apple/Google sign-in, camera/skin analysis, voice search, Arabic RTL, deep links
