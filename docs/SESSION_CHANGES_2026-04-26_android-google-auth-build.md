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

### Runtime Mismatch Follow-Up

User force-closed the iPhone app repeatedly but still saw no history. Investigation showed the current iOS store build (`1.9.0`, build `79`) was built with EAS runtime `1.0.0`, while the first order-history OTA was published to runtime `1.9.0`. That made the installed Apple app ineligible for the update.

Published a second iOS-only OTA to the runtime used by the installed Apple binary:
- Branch: `production`
- Runtime: `1.0.0`
- Platform: `ios`
- Update group: `d12bb4ed-7a52-4a54-9813-8b09ba881dbe`
- iOS update ID: `019dcb53-cb6f-78c1-8fb0-c59b282a63f2`

Current source config remains runtime `1.9.0`; `ios/GenosysUAE/Supporting/Expo.plist` also shows `EXUpdatesRuntimeVersion` as `1.9.0`, so the next iOS build should be checked after completion to ensure EAS reports runtime `1.9.0`.

### Shared Orders Source Follow-Up

The runtime backfill still did not surface the historical orders on the user's iPhone, which means the empty screen could still diverge from the badge/count fetch path.

Fix:
- `OrdersContext` now stores and exposes the active order records it already fetches for the tab badge.
- `app/profile/orders.js` falls back to those context order records when its local screen fetch returns an empty array.
- This removes the "badge shows 3, screen says no orders" split.

Verification:
- `node --check app/profile/orders.js contexts/OrdersContext.js services/api.js`
- Cursor lints for `app/profile/orders.js` and `contexts/OrdersContext.js`: no errors

Published:
- Runtime `1.0.0`, iOS-only: update group `8ad38b91-8c8b-4d0e-abe6-b761ad10a67e`, iOS update ID `019dcb5a-f4af-7f52-bdcb-5d4f976859f7`
- Runtime `1.9.0`, Android + iOS: update group `8a8662de-7601-4fe5-8368-20369cad1987`, iOS update ID `019dcb5b-abbc-712d-bb76-984d01c684e1`, Android update ID `019dcb5b-abbc-7b15-a0be-227ca24e36ee`

### Empty-State Diagnostics Follow-Up

User still saw no order history after the shared-source OTA. Added a temporary visible diagnostic JSON block on the empty Orders screen. This proves whether the installed iPhone received the latest bundle and exposes:
- diagnostic build marker
- runtime/app build
- local order count
- shared/context order count
- token presence
- masked login/contact emails
- last pending/recent fetch counts and fetch errors
- first returned status/paymentStatus pairs

Published:
- Runtime `1.0.0`, iOS-only: update group `99128a74-5e5c-4c63-902a-27bf167c921f`, iOS update ID `019dcb61-2f71-7c2b-933e-7f9a550cf739`
- Runtime `1.9.0`, Android + iOS: update group `a1cc42c9-57fb-4848-99b3-e800dd7fa79b`, iOS update ID `019dcb61-e674-76cf-bd56-a05c54340912`, Android update ID `019dcb61-e674-7373-8264-884f90f22654`

### Deleted-Order Merge Fix

Diagnostic screenshot showed:
- `local: 30`
- `shared: 3`
- first returned local statuses: `DELETED/pending`

Root cause: the Orders screen preferred the local API list whenever it was non-empty, even if that list consisted of deleted orders. It therefore filtered all local records out and never fell back to the shared active orders that powered the badge.

Fix: merge local orders and shared active orders first, de-dupe, then apply deleted/cancelled filtering. This preserves the 3 active shared records even when the recent API page is full of deleted records.

Published:
- Runtime `1.0.0`, iOS-only: update group `79803a6b-05a1-4afb-9d48-d2d949659985`, iOS update ID `019dcb64-5cf3-748b-9b7d-802df51a7bcc`
- Runtime `1.9.0`, Android + iOS: update group `3d0373fa-6b3f-45f0-aa74-2872d09b8ff3`, iOS update ID `019dcb65-2692-795d-98b9-1e27582b0579`, Android update ID `019dcb65-2692-7e50-a53e-4ba805213a7b`

