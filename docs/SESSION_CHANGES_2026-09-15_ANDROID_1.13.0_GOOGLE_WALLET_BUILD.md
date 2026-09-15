# Android 1.13.0 Google Wallet build

**Date:** 15 September 2026
**Version:** 1.13.0
**Runtime:** 1.13.0
**versionCode:** 92
**Package:** `ae.genosys.app`

## Google Wallet production activation

- Google approved Genosys Middle East FZ-LLC for Google Wallet API publishing.
- The Pay & Wallet Console no longer shows demo mode.
- Issuer ID: `3388000000023204165`.
- The GENOSYS Rewards loyalty class is Active.
- Enabled `GOOGLE_WALLET_ENABLED=true` in the Vercel production environment.
- Redeployed the Git-backed website deployment with the production flag.
- Authenticated live issuance returned 200 and the installation endpoint
  returned a valid Google Save URL on `pay.google.com`.
- Retail Rewards accounts now receive `wallet.google=true`; Professional
  Partner accounts remain excluded.

## Android release preparation

- Increased Android `versionCode` from 91 to 92.
- Kept app/runtime version aligned at 1.13.0.
- Folded in the latest SDK 57 patches before building:
  Expo 57.0.23, expo-image-manipulator 57.0.18,
  expo-image-picker 57.0.18, and expo-notifications 57.0.19.

## Verification

- Full `verify:release` passed.
- `expo-doctor` passed 20 of 20 checks.
- Production Android export passed.
- AAB metadata confirms version 1.13.0, runtime 1.13.0,
  versionCode 92, and package `ae.genosys.app`.

## Build

- EAS build: `f36288cc-cd85-4824-8649-d438b78d164f`.
- Build profile: `production:android`.
- AAB:
  `https://expo.dev/artifacts/eas/i2tSGeAw0KY90ew25DvqclYEEK3CjHj0B7R6zSuGK5U.aab`
- Local copy:
  `~/Desktop/Genosys-UAE-1.13.0-92.aab`

The AAB is built but has not been uploaded to a Google Play track.
