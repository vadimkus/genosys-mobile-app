# Session Changes: Android Google Auth Build

Date: 2026-04-26

## Context

Android Google Sign-In JavaScript was fixed and published by OTA, but the latest visible Android store build was still `1.7.0` / versionCode `75`. The OTA updates were published for runtime `1.9.0`, so current Play-installed Android binaries are unlikely to receive the Google-auth fix until a `1.9.0` Android binary is installed.

## Findings

- Google auth JS is in `main` and uses Android client ID + Authorization Code with PKCE.
- Website backend accepts the Android Google OAuth audience.
- Production OTA update exists for runtime `1.9.0`:
  - Update group: `352c5c56-81ff-4294-a3d0-577281002817`
- Android production build was required because existing Android store builds were older runtime.

## Android Build Work

- First Android build attempt:
  - Build ID: `3caa8c36-65b5-416b-833c-4acdbee74def`
  - Version: `1.9.0`
  - Version code: `79`
  - Status: failed
  - Cause: `production:android.prebuildCommand` used `npx expo prebuild --no-install`; EAS SDK 54 handling rejected it during prebuild.

- Fix:
  - Removed custom `production:android.prebuildCommand` from `eas.json`.
  - The local build script already runs `sync-runtime-version.js` before `eas build`, so standard EAS prebuild is sufficient.

- Successful Android build:
  - Build ID: `387dbf05-709c-4c7b-a01c-c3f5e8870044`
  - Version: `1.9.0`
  - Version code: `80`
  - Runtime: `1.9.0`
  - Channel: `production`
  - AAB: https://expo.dev/artifacts/eas/7YAvanpY1DGwwf3x6AWhDS.aab
  - Build logs: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/builds/387dbf05-709c-4c7b-a01c-c3f5e8870044

- Play rejected versionCode `80` because it had already been used. A new build was produced:
  - Build ID: `84fb15af-6492-4875-b87f-a8a0a21a57cd`
  - Version: `1.9.0`
  - Version code: `81`
  - Runtime: `1.9.0`
  - Channel: `production`
  - AAB: https://expo.dev/artifacts/eas/hqqnbY8MeZWr1Am8fPZLMk.aab
  - Build logs: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/builds/84fb15af-6492-4875-b87f-a8a0a21a57cd
  - Play Console status: uploaded manually and now "Changes in review".

## Remaining

1. Wait for Google Play review to complete.
2. Confirm Google Cloud Android OAuth client has:
   - Package name: `ae.genosys.app`
   - SHA-1 from Google Play Console > App integrity > App signing key certificate
   - If testing sideload/internal builds, also add the upload certificate SHA-1 used by EAS/Play.
3. After the Android build is installed, retest Google Sign-In on Android.

## Follow-Up: Native Apple Order List

User reported Apple native app Orders tab showed a badge count of `3` but the Orders screen rendered "No orders yet".

Root cause: `OrdersContext` correctly counted active orders by excluding only deleted/cancelled order statuses, but `app/profile/orders.js` additionally hid orders with `paymentStatus` of `cancelled` / `canceled`. Older Stripe orders can have a cancelled payment session while still being active order records, so the badge and list diverged.

Fix: Orders screen now matches the badge behavior and only excludes deleted payment status plus deleted/cancelled order status. This lets historical/pending orders remain visible.

Verification:
- `node --check app/profile/orders.js contexts/OrdersContext.js services/api.js`
- Cursor lints for `app/profile/orders.js`: no errors

OTA:
- Branch: `production`
- Runtime: `1.9.0`
- Update group: `9436e08c-9bc9-4f53-afb4-409dd4e550fe`
- iOS update ID: `019dcac0-42bc-72e8-909f-ad4e686caa1d`
- Android update ID: `019dcac0-42bc-7fb3-a7a3-12ef36596d08`

