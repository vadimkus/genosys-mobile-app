# Session Changes: Android Google OAuth Fix

Date: 2026-04-26

## Context

Android users saw Google `Error 400: invalid_request` with "Access blocked: Authorization Error". The app was launching Google OAuth on Android with the web client ID and implicit `id_token` flow. Google blocks that pattern for native Android apps.

## Changes

- `services/googleAuthService.js` now treats standalone Android as a native OAuth client.
- Android uses Authorization Code + PKCE, matching the secure native flow already used for iOS.
- `config/auth.js` now includes the stored Android OAuth client ID:
  - `590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com`
- `docs/UPGRADE_AUDIT_REPORT.md` updated with the OTA follow-up requirement.

## Backend Note

The website backend must accept the Android OAuth client ID as a valid ID-token audience, otherwise Google login can succeed but backend verification can reject the token.

## Verification

- Mobile syntax check: `node --check services/googleAuthService.js && node --check config/auth.js`
- IDE diagnostics: clean

Mobile repo has no ESLint config, so direct `npx eslint` is not available there.

## OTA

Published to EAS Update production:

- Commit: `e020edd045580fac9fcf421fa3a4e65412d5a0e6`
- Runtime: `1.9.0`
- Branch: `production`
- Update group: `352c5c56-81ff-4294-a3d0-577281002817`
- iOS update: `019dc9ea-6a8a-74fe-a121-908b6e88375f`
- Android update: `019dc9ea-6a8a-79e7-be43-9deaad22c026`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/352c5c56-81ff-4294-a3d0-577281002817
