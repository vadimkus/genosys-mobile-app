# CI splash verification SDK 57 fix — 2026-07-31

## Failure

GitHub Actions run for commit `39df2ce` failed in
`npm run verify:release`. Typecheck and secret scan passed.

## Root causes

1. `scripts/verify-splash-sync.js` still required the legacy
   `expo.splash.image` and `expo.ios.splash.image` fields.
2. Since the SDK 57 upgrade, the supported configuration lives in the
   `expo-splash-screen` plugin.
3. The tracked iOS `SplashScreenLegacy.imageset` copies had also drifted back
   to the frozen build-82 splash while current builds use `assets/splash.png`.

## Fix

- The verification script now reads the SDK 57 `expo-splash-screen` plugin,
  with the old root/iOS fields retained as a legacy fallback.
- Synchronized `assets/splash.png` to:
  - `image.png`
  - `image@2x.png`
  - `image@3x.png`

## Verification

`npm run verify:release` passed:

- splash sync
- pricing display smoke
- cart pricing contract smoke
- order payload pricing contract smoke
- orders repository smoke

