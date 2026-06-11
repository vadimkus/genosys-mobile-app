# Session Changes — 2026-06-11 — iOS App Full Audit (read-only)

## Context

Full audit of the iOS app (`ae.genosys.app`, Expo SDK 54). Read-only — no code changes in this session. Live App Store version: **1.10.0 (build 82)**, released 2026-04-29. Local config: version 1.10.2 / buildNumber 83 / runtime 1.10.2 (bumped today for the Android v86 release).

## What's healthy

- ATS strict (`NSAllowsArbitraryLoads: false`), `ITSAppUsesNonExemptEncryption: false` set
- Apple Sign-In present alongside Google (App Review compliance), Face ID usage string present
- All permission usage descriptions present; Hermes enabled; deployment target 15.1
- expo-doctor 17/17; production iOS JS bundle exports cleanly
- Push (APNs) wired via expo-notifications; `aps-environment` set by distribution signing at build
- EAS `production` profile auto-increments buildNumber; runtime sync script keeps versions aligned

## Findings (by severity)

### CRITICAL

1. **iOS Universal Links are broken — AASA file missing on genosys.ae.**
   `https://genosys.ae/.well-known/apple-app-site-association` and `/apple-app-site-association` both return the site's 404 page. The Android equivalent (`assetlinks.json`) exists and works. Result: `genosys.ae` links never open the iOS app — they open Safari. The app declares `applinks:genosys.ae` in `associatedDomains`, so the entitlement is wasted until the website serves the AASA JSON (needs `appID: <TEAMID>.ae.genosys.app` + paths, `application/json` content type — Next.js needs an explicit route or headers config for the extensionless file).

### HIGH

2. **iOS binary is behind and will stop receiving OTA updates.**
   App Store iOS = 1.10.0 (runtime 1.10.0). Android Play = 1.10.1→1.10.2 (runtimes 1.10.1/1.10.2). OTA updates on the `production` channel are runtime-scoped; the most recent update ("device info headers" fix) targeted runtime 1.10.1 — iOS users on runtime 1.10.0 did not get it. All future publishes will target 1.10.2. **Action: ship iOS 1.10.2 (build 84) to App Store soon.**

3. **`applinks:www.genosys.ae` in `associatedDomains` can't verify.**
   `www.genosys.ae` now 308-redirects to apex, and Apple's AASA fetcher does not follow redirects. Same issue as the Android `www` App Links removed in the v85 fix. Remove on the next iOS binary.

### MEDIUM

4. **Unused dependency `react-native-sfsymbols`** (^1.2.2) — no JS usage found anywhere in `app/`, `components/`, etc. It's iOS-only, unmaintained (excluded from the RN directory doctor check), and requires an Android autolink exclusion in `react-native.config.js`. Removing it deletes a native dep, a doctor exclusion, and the config workaround.

5. **Camera/photo permission strings undersell actual usage.** `NSCameraUsageDescription` says "to take a profile photo", but the app also has the skin-analysis camera flow (`skin-analysis-camera.js`). App Review can flag mismatched purpose strings. Broaden to cover skin analysis.

6. **Apple Pay merchant entitlement declared but unused.** `com.apple.developer.in-app-payments: merchant.ae.genosys.app` is in `app.json`, yet payments run through Stripe hosted web checkout. Either implement Apple Pay (good UX win for UAE) or drop the entitlement.

### LOW

7. Stale `pbxproj` values (`MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 1`) — Info.plist values win; cosmetic.
8. No `PrivacyInfo.xcprivacy` tracked in `ios/` — Expo SDK 54 pods aggregate privacy manifests at build time; verify no ITMS warning on next submission.
9. 17 moderate npm vulns in Expo CLI tooling (build-time only) — clears with SDK 55.

## Recommended order of work

1. **Website:** serve AASA at `/.well-known/apple-app-site-association` (fixes Universal Links for the already-shipped app — no app release needed since the domain entitlement is already in build 82).
2. **App:** remove `www` from `associatedDomains`, broaden camera string, drop sfsymbols, then ship iOS 1.10.2 (build 84) so iOS rejoins the OTA runtime.
3. Decide Apple Pay: implement or remove entitlement.
