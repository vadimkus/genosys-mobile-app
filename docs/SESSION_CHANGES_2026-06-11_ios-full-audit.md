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

   **UPDATE (same day, follow-up fix):** AASA deployed to genosys.ae (Team ID `2842PLB7CS` from EAS credentials) and verified live on Apple's CDN — see website repo doc `SESSION_CHANGES_2026-06-11_IOS_UNIVERSAL_LINKS_AASA.md`.

   **ESCALATION discovered while fixing:** the shipped iOS binary has **no associated-domains entitlement at all**. `ios/` is a tracked bare project (since Dec 2025; no `.easignore`; the production EAS profile never runs `expo prebuild`), and `ios/GenosysUAE/GenosysUAE.entitlements` never contained `com.apple.developer.associated-domains` — `app.json`'s `ios.associatedDomains` is ignored for bare iOS builds. So AASA alone does not light up Universal Links for current users; **a new iOS binary is required**. Entitlement added to the tracked entitlements file in this session. Note the same applies to the Apple Pay entitlement (`in-app-payments` was dropped from the entitlements file at some point) and any future `app.json`-only iOS config change.

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

1. **Website:** serve AASA at `/.well-known/apple-app-site-association`. ✅ DONE (live + on Apple CDN)
2. **App:** add associated-domains entitlement to the tracked `ios/` project (required — see escalation above), remove `www` from `app.json` `associatedDomains`, broaden camera string, drop sfsymbols. ✅ DONE this session
3. **Ship iOS 1.10.2 (build 84)** — now required both for Universal Links (entitlement) and to rejoin the OTA runtime. ⏳ PENDING
4. Decide Apple Pay: implement or drop. ✅ DECIDED — Apple Pay already works for users via Stripe hosted Checkout (wallets enabled in Stripe Dashboard; confirmed working by owner). The never-shipped native entitlement and the entirely unused `@stripe/stripe-react-native` package (zero JS usage; checkout opens Stripe in the browser) were removed from `app.json` and dependencies. Native PaymentSheet can be revisited only if checkout ever moves in-app.

## Fixes applied in this session (follow-up to the read-only audit)

- `ios/GenosysUAE/GenosysUAE.entitlements`: added `com.apple.developer.associated-domains` = `applinks:genosys.ae`
- `ios/GenosysUAE/Info.plist`: camera usage string now covers skin-analysis capture
- `app.json`: removed unverifiable `applinks:www.genosys.ae`; camera string updated (kept in sync even though bare builds use the plist)
- Removed unused `react-native-sfsymbols` dependency, its `react-native.config.js` Android autolink exclusion (file deleted — that was its only content), and its expo-doctor exclusion
- Verified after changes: tsc clean, all release smokes pass, expo-doctor 17/17, iOS production bundle exports cleanly, plists lint OK
