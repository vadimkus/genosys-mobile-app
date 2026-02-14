# Session Log — February 12, 2026

## Summary

Documentation updates for v1.4.0 (Build 58) Apple App Store submission and TestFlight deployment.

---

## 1. Version Bump & TestFlight Deployment

### Version Update

| Platform | Version | Build |
|----------|---------|-------|
| iOS | 1.4.0 | 58 |
| Android | 1.4.0 | 58 |

**File:** `app.json`

- `expo.version`: 1.3.1 → 1.4.0
- `expo.ios.buildNumber`: 56 → 57 (EAS auto-bumped to 58 during build)

### Build & Submit

- **EAS Build:** `eas build --platform ios --profile production`
- **TestFlight Submit:** `eas submit --platform ios --latest --non-interactive`
- **Status:** Successfully uploaded to App Store Connect
- **Build ID:** `9c4c5b17-0549-4aef-a876-41e644ff1a3e`

---

## 2. Apple Review Documentation Update

### File Updated

`docs/app-store/APPLE_REVIEW_DOCUMENTATION.md`

### Changes

- **Version:** 1.3.0 → 1.4.0
- **Build:** 53 → 58

### New "What's New in Version 1.4.0" Section

| Area | Summary |
|------|---------|
| **Pricing & Discount Logic** | Mutually exclusive discounts (bundle OR VIP), consistent cross-platform pricing, corrected order history display |
| **Checkout** | Auto-populate delivery address, checkout footer with total summary and shipping info |
| **Localization** | 26+ hardcoded strings translated (AI Skin Analysis camera, WebView), new keys for checkout/shipping |
| **Bug Fixes** | Bundle item pricing in cart, product price refresh on login, keyboard/shadows on Android |
| **Stability** | Safe Apple Sign-In import, notification badge clearing |

### Updated Sections

- Test account note (50% VIP discount behavior)
- Testing instructions with v1.4.0 verification steps
- New "VIP Discounts" section in Important Notes
- Version History table
- Expanded Review Checklist (9 new v1.4.0 items)

---

## 3. App Store "What's New" Copy

Concise release notes for App Store listing:

> - Improved pricing accuracy — bundle and VIP discounts now apply correctly without stacking
> - Checkout now auto-fills your saved delivery address
> - Total summary with shipping info added to checkout
> - Full Arabic and Russian translation coverage across all screens
> - Bug fixes and stability improvements

---

## 4. Android Version Verification

**Status:** No changes needed. Android `versionCode` (58) and `version` (1.4.0) already aligned with iOS. All recent code changes (shared React Native codebase) are included in Android builds.

---

## 5. Commits

| Commit | Description |
|--------|-------------|
| `0c2baf5` | chore: bump version to 1.4.0 (build 57) for TestFlight |
| `24e4f56` | docs: update Apple Review documentation for v1.4.0 (build 58) |

---

*Session: February 12, 2026*
