# Sentry crash reporting switched on (25 Sep 2026)

Trigger: App Store Connect weekly summary for 14-20 Sep showed 2 crashes with
no way to see them. Sentry had been installed but silent since release: no DSN
anywhere, and the project did not exist (see 2026-09-03 note).

- Sentry project `genosys-mobile-app` (React Native) created in org
  `genosys-middle-east-fz-llc`, region DE, team `genosys-middle-east-fz-llc`.
- EAS env: `EXPO_PUBLIC_SENTRY_DSN` (production + preview, plaintext),
  `SENTRY_AUTH_TOKEN` (production, secret; org auth token
  "genosys-mobile-app EAS source maps").
- `eas.json`: `SENTRY_DISABLE_AUTO_UPLOAD` removed from production profiles,
  so the next native builds upload source maps and dSYMs.
- Local `.env` (git-ignored) carries the DSN for dev builds.
- OTA published to runtime 1.13.0 only. Runtime 1.12.0 deliberately not
  updated: current source crashed that binary on 16 Sep (dependency mismatch).
  1.12 users get Sentry when they update from the store.

Likely cause of the 2 crashes in the weekly summary: the 16 Sep runtime-1.12
OTA regression on Google login (rolled back the same day).

## Release safety (same day)

### OTA guard

`npm run ota -- ios|android "Message" [--accept-patch-drift]` is now the only
supported way to publish. It runs `scripts/ota-guard.js` first, which:

1. finds the git commit EAS recorded for the newest finished production store
   build of that platform and runtime (override: `release/binaries.json`);
2. compares HEAD against it: versions of every installed package with native
   code, files under `modules/`, `ios/`, `android/` (version/build-number-only
   edits ignored), and `app.json` plugins;
3. blocks on any minor/major native package change or native file change;
   exits 2 on patch-only drift until `--accept-patch-drift` is passed.

Then `verify:release`, `eas update` for that one platform, and source-map
upload to Sentry when `SENTRY_AUTH_TOKEN` is set.

Replaying the 16 Sep incident (runtime 1.12, iOS binary 2ab786a1b) is
blocked: 44 native package changes plus the new `modules/genosys-wallet`.

Current state: Android 1.13 (binary 21f20ed60) matches HEAD exactly. iOS 1.13
(binary 48c52c7ba) has patch drift: expo 57.0.22->57.0.23, expo-image-picker,
expo-image-manipulator, expo-notifications. Updates since 15 Sep already run
on it without reported crashes; the next iOS store build clears the drift.

Do not call `eas update` directly.

### 1.12 retired

Website `app/api/mobile/app-version`: `minimumVersion` 1.13.0 with
`forceUpdate` on iOS and Android (Android was a soft gate at 1.9.0). The
response now clamps the minimum to the live store version, so the gate can
never lock users out even if a store lookup lags.

### Google Play submission automated

Service account `play-publisher@genosys-website.iam.gserviceaccount.com`
(GCP project `genosys-website`, Android Publisher API enabled, no Cloud
roles). Invited in Play Console for Genosys UAE only, 7 permissions: view app
info, release to production, release to testing tracks, manage testing tracks,
plus the three Play adds automatically. No admin, financial or store-listing
rights. Key: `~/Desktop/Drive/Genosys/Google/genosys-play-publisher.json`
(outside the repo). Verified: the API opens an edit and reads tracks
(production 92 = 1.13.0).

All Android submit profiles in `eas.json` point at the key:
`production` / `production:android` -> internal track,
`production:android-public` -> production, completed.
  npx eas-cli submit -p android --profile production:android-public --latest
