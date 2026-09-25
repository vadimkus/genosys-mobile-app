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
