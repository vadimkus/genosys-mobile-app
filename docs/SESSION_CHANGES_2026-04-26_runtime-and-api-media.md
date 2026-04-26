# Session Changes — Runtime Alignment & API Media Priority

Date: 2026-04-26

## Scope

Follow-up cleanup from the GPT-5.5 platform audit for the native iOS/Android app only.

## Changes

- Aligned package metadata to the app release: `package.json` and `package-lock.json` now use version `1.9.0`.
- Replaced hardcoded Expo `runtimeVersion: "1.0.0"` with Expo's app-version runtime policy in `app.json`.
- Updated iOS `Expo.plist` resolved runtime to `1.9.0`.
- Added `scripts/sync-runtime-version.js`, which reads `app.json` `expo.version`, sets the runtime policy, syncs package versions, and writes iOS `EXUpdatesRuntimeVersion`.
- Added `npm run sync:runtime` and wired it into production iOS/Android build scripts.
- Added EAS `prebuildCommand` hooks so production builds sync runtime before building.
- Updated `docs/OTA_UPDATES.md` to document the new app-version runtime strategy.
- Reworked `data/productConfig.js` so API/DB product fields win over static fallback config:
  - gallery fields: `images`, `galleryImages`, `additionalImages`
  - main API image before hardcoded gallery fallback
  - video fields: `videoUrl`, `videoURL`, `video`
  - docs fields: `documentation`, `documents`, `productDocuments`, `documentationLinks`

## Verification

- `npm run sync:runtime` passes and reports `Synced Expo runtime to app version 1.9.0`.
- `node --check scripts/sync-runtime-version.js` passes.
- `npx expo config --json` resolves `version: "1.9.0"` and `runtimeVersion: { "policy": "appVersion" }`.
- `ReadLints` reported no diagnostics on `data/productConfig.js` or the sync script.

## Notes

Historical docs still mention old runtime `1.0.0` where they describe previous OTA batches. The active release runbook is `docs/OTA_UPDATES.md`.
