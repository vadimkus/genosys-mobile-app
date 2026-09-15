# iOS 1.13.0 release audit

**Date:** 15 September 2026
**Baseline:** iOS 1.12.0 build 106, commit `2ab786a`
**Candidate:** iOS 1.13.0 build 109

## Why this audit was required

The native Apple Wallet implementation needs a new binary. Before starting
that binary, every change after the last successful iOS store build was
checked so the release does not omit work already delivered by OTA or leave
documented native maintenance unresolved.

## Included since build 106

The release contains all 35 commits after the build-106 baseline:

- Rose primary actions, cream Live Activity styling, unified Bag wording,
  sentence-case interface copy, Cera design tokens, and removal of decorative
  green.
- Splash bridge-race protection, brand-screen crash repair, hook/lint
  correctness guards, runtime fault fixes, and the old-build update screen.
- Server-driven email suggestions, non-blocking registration email hints,
  product-review scrolling, and corrected image-lightbox pinch, pan, and
  bounds.
- App Store screenshot tooling and release documentation.
- Retail-only Apple Wallet and Google Wallet controls with secure signed
  installation URLs and EN/RU/AR support.
- Native Apple PassKit presentation with real Added, Already Added, and
  Cancelled completion states. Safari remains only as a fallback.

The pending Android developer-verification note is also committed so the
repository records that package `ae.genosys.app` and its Play signing key are
already registered.

## Native maintenance folded into this binary

The 2 September app audit left a native-only dependency batch for the next
store submission. It is included now:

- Expo `57.0.22`.
- React Native `0.86.3`.
- Hermes compiler `250829098.0.17`, which contains the memory-regression fix.
- SDK 57 package alignment across authentication, camera, media, routing,
  notifications, updates, secure storage, and browser modules.
- Deduplicated `react-native-screens` and `@expo/ui`.

`expo-doctor` passes 20 of 20 checks after alignment.

## Release gates

Completed:

1. Full `verify:release`.
2. Clean iOS and Android Expo exports.
3. Expo autolinking confirms the local `GenosysWallet` pod.
4. Remote Xcode archive succeeded:
   `e4e70220-ac8d-42ab-85b5-758cac423133`.
5. Build 109 uploaded to App Store Connect through submission
   `bf401c99-8035-4bdb-8f2a-f599dc9f8794`.

Still required:

1. Wait for Apple App Review.
2. Confirm the public App Store lookup reports 1.13.0 after approval.
3. Update the server fallback version from 1.12.0 to 1.13.0 only after the
   public listing changes.

## Physical acceptance and production submission

- Vadim physically accepted TestFlight build 109, including the native Apple
  Wallet behavior.
- Created App Store version 1.13.0 and attached build 109.
- Added localized release notes in English, Arabic, and Russian.
- Updated App Review notes with the retail Rewards test path and the intended
  Partner-account exclusion.
- Kept the current App Store rating.
- Configured immediate availability to all users and automatic release after
  approval.
- Submitted to production App Review on 15 September 2026.
- Current status: `Waiting for Review`. Apple states review can take up to
  48 hours.

## Older-version update notification verification

- Build 106 runs runtime 1.12.0 and received the production update-prompt OTA
  group `0394bcd4-ee91-4ee2-971c-75ca247fcebb`.
- Later runtime-1.12.0 OTAs contain that code as descendants.
- The live endpoint currently returns 1.12.0 from Apple's public lookup, which
  correctly avoids a premature prompt.
- Once Apple publishes 1.13.0, build 106 compares native runtime 1.12.0 with
  latest 1.13.0 and shows the daily alert, icon badge, home-avatar dot, and
  Profile update row linking to the App Store.
- `smoke:app-update` passes the 1.12.0 to 1.13.0 update case.
