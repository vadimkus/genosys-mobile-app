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
