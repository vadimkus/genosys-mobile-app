# iOS 1.13.0 release audit

**Date:** 15 September 2026
**Baseline:** iOS 1.12.0 build 106, commit `2ab786a`
**Candidate:** iOS 1.13.0, next available EAS build number

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

Before creating the final binary:

1. Full `verify:release`.
2. Clean iOS and Android Expo exports.
3. Expo autolinking confirms the local `GenosysWallet` pod.
4. Remote Xcode archive succeeds.
5. Upload to TestFlight only.
6. Physically verify Apple Wallet Add, Cancel, and Already Added behavior.
7. Do not release publicly until that physical test passes.
