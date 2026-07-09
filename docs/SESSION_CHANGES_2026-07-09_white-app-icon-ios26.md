# Session Changes — 2026-07-09 — White App Icon (iOS 26 sharp rendering)

## Goal

Ship the white app icon (white background, red GENOSYS logo — matching the PWA icon) without the blur that killed every previous attempt.

## Root cause of the old blur

1. **iOS 26 Liquid Glass** re-renders legacy flat PNG icons into the glass style. On a red background the effect is invisible; on white it reads as blur. This is why every white *PNG* attempt failed.
2. Some early white assets were also upscaled from the 512px PWA raster (blur baked into the file).

## The fix

The correct solution already existed in the repo since Feb 8: `assets/AppIcon.icon` — an Apple Icon Composer layered bundle:

- White solid background fill
- 1024px logo mask (`Assets/Logo.png`, perfect 1px edges)
- Red `display-p3 #B72525` via fill-specializations (+ dark & tinted variants)
- `"glass": false` on the logo layer → glyph stays sharp

It was reverted 36 minutes after being wired in Feb ("blur cannot be disabled") — before a build could ever be verified. The Feb blocker (manual Xcode 26 image + hand-patched pbxproj) no longer exists: **SDK 57 prebuild wires `.icon` bundles natively** and EAS uses Xcode 26 by default.

## Changes

- `app.json`:
  - `ios.icon` → `./assets/AppIcon.icon` (was the red flat PNG)
  - root `icon` → `./assets/app-icon-1024-pwa-flat-no-alpha.png` (flat white/red fallback)
- Ran `npx expo prebuild -p ios --no-install`:
  - Prebuild added `AppIcon.icon` to Xcode resources itself (no manual pbxproj patch needed anymore)
  - Emptied the legacy `AppIcon.appiconset` PNG (Xcode generates fallbacks from the bundle)
- Android untouched — adaptive icon is already white bg + red logo since Feb (shipped in versionCode 90).

## Release

- iOS build **103** (v1.11.0), EAS production profile, auto-submitted to TestFlight
- Build ID: `d46ca311-996d-4ddc-83ac-44eb96d1ec86`
- Commits: `f1e2e86` (icon wiring), `64c9fb5` (build number sync)

## Verify on device (before App Store submission)

- Install build 103 from TestFlight on an iOS 26 device
- Expect: white icon, sharp red logo, subtle system glass sheen (same as Apple Music's white icon — that sheen is normal and cannot be removed)
- Check dark mode (slightly brighter red variant) and tinted mode (white glyph)

## Possible follow-ups

- Regenerate PWA icons from the clean 1024 master (current 512px PWA icon has rough edges/halo)
- Shrink Android adaptive foreground slightly into the safe zone (logo spans ~72%; circular masks may clip arm tips)
