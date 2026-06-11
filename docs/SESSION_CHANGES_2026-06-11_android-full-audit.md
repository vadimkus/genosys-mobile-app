# Session Changes — 2026-06-11 — Android App Full Audit & Fixes

## Context

Full audit of the Android app (Expo SDK 54 / React Native 0.81, `ae.genosys.app`, v1.10.1 / versionCode 85) with the goal of keeping it working and running smoothly. No runtime code changes were required — the app passed all functional checks. Fixes were limited to dependency hygiene, repo cleanup, and regenerating the stale local Android project.

## Audit Results (before fixes)

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean (app is JS; 2 TS files in `types/`) |
| `npm run verify:release` (4 smoke suites: splash sync, pricing display, cart pricing contract, order payload pricing, orders repository) | All passed |
| `npx expo-doctor` | 16/18 — 2 failures (see below) |
| `npm audit --omit=dev` | 28 vulns: **1 critical** (shell-quote), **7 high** (tar, node-forge, undici, minimatch, xmldom, picomatch, brace-expansion) — all transitive, build-tooling only |
| AndroidManifest (local `android/`, gitignored) | **Stale** — still contained `www.genosys.ae` App Links removed from `app.json` in the v85 fix |
| App Links / assetlinks.json | `https://genosys.ae/.well-known/assetlinks.json` live, correct package + SHA-256 fingerprint |
| Mobile API | `GET /api/mobile/products` with app API key → 200 |
| Stripe | Hosted Checkout via browser (`app/payment/stripe.js`) — no publishable key embedded, server-driven session, webhook-delay fallback present. Sound. |
| Sentry | DSN via `EXPO_PUBLIC_SENTRY_DSN` env, no-ops safely when absent. Sound. |
| Repo hygiene | `expo-8085.pid` (junk) tracked in git; empty `cosmetics-website/scripts/` dir in repo root |

### expo-doctor failures explained

1. **11 expo packages behind SDK 54 expected patch versions** (expo 54.0.33 → 54.0.35, expo-router, expo-updates, expo-notifications, expo-auth-session, etc.)
2. **"app config fields may not be synced in a non-CNG project"** — informational: `android/` + `ios/` folders exist alongside `app.json` native config. Not a real issue here because every EAS build profile runs `prebuildCommand: npx expo prebuild`, so `app.json` is always re-synced at build time.

## Fixes Applied

1. **`npx expo install --fix`** — aligned all 11 packages to SDK 54 expected patch versions (expo 54.0.35, expo-router 6.0.24, expo-updates 29.0.18, …). Patch-level only, same SDK, no API changes.
2. **`npm audit fix`** — non-breaking; cleared the critical and all 7 high vulns. Remaining: 17 moderate, all inside Expo CLI build tooling (`@expo/cli` → xcode/uuid/postcss chains), pinned by expo itself — will clear with the next SDK upgrade; not shipped in the app binary.
3. **Removed tracked junk** — `git rm --cached expo-8085.pid`, deleted the file, added `*.pid` to `.gitignore`. Removed empty `cosmetics-website/` dir.
4. **Regenerated local `android/` project** (`npx expo prebuild --platform android --no-install`) — local manifest now matches `app.json`: `www.genosys.ae` App Links gone (only `genosys.ae` remains, matching the Play v85 fix), `versionCode 85` / `versionName 1.10.1` preserved. Matters for local `android:assemble:release` / `android:bundle:release` scripts which build from this folder.
5. **Silenced the informational CNG doctor check** via `package.json` → `expo.doctor.appConfigFieldsNotSyncedCheck.enabled: false` (justified: EAS profiles regenerate native folders via `prebuildCommand`).

## Verification (after fixes)

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm run verify:release` | All 4 suites passed |
| `npx expo-doctor` | **17/17 passed** |
| `npm audit --omit=dev` | 0 critical / 0 high (17 moderate, expo-CLI-internal only) |
| `npx expo export --platform android` | Production Hermes bundle built cleanly (7.18 MB `.hbc`) |
| Regenerated manifest | 0 `www.genosys.ae` references; versionCode/Name intact |

## No Impact On

- Payments (Stripe hosted checkout untouched), Google/Apple login, orders, push notifications, OTA updates (runtime version still `1.10.1`).
- Published Play build v85 — these changes only affect the next build.

## Follow-ups

- Next Play release: bump `versionCode` to 86 (and version as appropriate) before `build:android:production`.
- The 17 moderate dev-tooling vulns will clear with the next Expo SDK upgrade (SDK 55+); no action needed now.
