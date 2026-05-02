# Native Splash Video Restore

Date: 2026-04-28

## Context

During TestFlight validation, the remote video splash was no longer visibly playing even though the live splash config was still enabled:

```json
{
  "enabled": true,
  "type": "video",
  "videoUrl": "https://genosys.ae/videos/Splash.mp4",
  "posterUrl": null,
  "duration": 5000,
  "cacheTTL": 86400
}
```

## Root Cause

The earlier black-screen guard changed `VideoLaunchScreen` to keep `VideoView` hidden until `expo-video` emitted `readyToPlay`. On TestFlight this readiness status can be unreliable, so the app could show only the fallback briefly and dismiss without the actual branded video appearing.

After restoring immediate video rendering, a second TestFlight issue remained: the dismiss timeout was still starting at component mount. If the app spent 1-3 seconds resolving cached config/video source, that loading time consumed part of the 5-second splash window, so only the tail of the splash appeared.

Final observed issue: TestFlight could keep showing the white fallback because `videoSource` was still blocked behind an async FileSystem cache check. The live video asset itself was healthy (`curl -I https://genosys.ae/videos/Splash.mp4` returned `200`, `content-type: video/mp4`, `content-length: 4607512`).

After the cache gate was removed, the user still saw the white overlay. That meant the splash component was mounted and receiving config, but `expo-video` was not painting the remote MP4 in the TestFlight runtime.

After the WebView player restored playback, the user observed a double blink before the splash. The first pass covered WebView's native document startup briefly painting before the HTML video produced a frame. When the blink still persisted, the remaining root cause was one level higher: `app/_layout.js` initialized `splashVideo` as `null`, so TestFlight could render one app/root frame while cached/API splash config loaded asynchronously, then mount the splash overlay.

The remote server config was correct; the regressions were in native client render/timing/source-loading guards and, finally, the `expo-video` launch renderer.

## Change

Updated `components/VideoLaunchScreen.js` and `app/_layout.js` to restore the old working behavior:

- Render the splash player immediately once the cached/remote `videoSource` exists.
- Initialize `videoSource` directly from `videoUrl` on first render instead of waiting for the FileSystem cache check.
- Move cache lookup/download to background-only cache warming, so caching can never override/block playback.
- Replace the launch-splash `expo-video` renderer with a full-screen `react-native-webview` HTML `<video autoplay muted playsinline>` player for the remote MP4.
- Cover WebView with a native black layer until the HTML video posts `loadeddata` / `canplay` / `playing`, preventing WebView's initial blank paint from flashing.
- Initialize `app/_layout.js` with the known active remote splash config so the video overlay mounts on the first JS render, before the logged-in app/root frame can paint.
- Ignore cached/fresh splash config updates when the config values are unchanged, preventing the player from remounting during launch.
- Start the auto-dismiss timer only after the HTML video reports its first playable frame.
- Keep the white GENOSYS fallback only while the video source is still resolving.
- Start the auto-dismiss timer only after `videoSource` exists, so source-loading time does not shorten the visible splash.
- Add a separate source-loading fail-safe so the fallback overlay cannot stay forever if FileSystem/network hangs before playback.
- Keep tap-to-skip, playback-end dismissal, timeout dismissal, and the JS fade-completion fail-safe.
- Keep fail-safe dismissal paths so a stalled first frame no longer produces an indefinite launch overlay.

This restores the visible splash experience while preserving the protection against a stuck launch overlay.

## Verification

Ran:

```bash
npm run verify:release
```

Passed:

- `smoke:pricing-display`
- `smoke:cart-pricing-contract`
- `smoke:order-payload-pricing-contract`
- `smoke:orders-repository`

No IDE linter errors were reported for `components/VideoLaunchScreen.js`.

## OTA

Published via EAS Update.

## iOS Binary Build

After the OTA was committed (`115cb11`), a fresh iOS production binary was built so the splash fix is baked into the App Store build rather than relying only on OTA.

- App version: `1.10.0`
- iOS build number: `82`
- EAS build ID: `421465b3-1922-4b55-9f5b-10f1286f16d9`
- Commit: `115cb11b3d43d6551f6d472d57e48408674ec9c9`
- Build logs: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/builds/421465b3-1922-4b55-9f5b-10f1286f16d9
- IPA: https://expo.dev/artifacts/eas/9agyWourTPngj2LD2Z5u9a.ipa

The binary upload to App Store Connect completed successfully through EAS Submit.

- ASC App ID: `6756648064`
- Submission ID: `92e3d6cf-0c3c-4a0e-bd94-e108a9d2d164`
- Build uploaded: `1.10.0 (82)`
- App Store Connect build page: https://appstoreconnect.apple.com/apps/6756648064/testflight/ios

Latest blink-reduction fix:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `08f58b58-67d1-42e3-a940-37f0b91f5bfe`
- Android update ID: `019dd347-a556-7af9-a4c6-f6a6e887d8db`
- iOS update ID: `019dd347-a556-70c7-ab83-3c4a1385b471`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/08f58b58-67d1-42e3-a940-37f0b91f5bfe

Earlier WebView-cover fix:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `b4673623-468a-4147-8da9-22a2d14dc9a2`
- Android update ID: `019dd336-f876-7468-a351-ff38e61b3d90`
- iOS update ID: `019dd336-f876-731e-babb-b201a28f114b`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/b4673623-468a-4147-8da9-22a2d14dc9a2

Earlier WebView-player fix:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `c7965392-0aa7-40ec-8529-347be529fb3d`
- Android update ID: `019dd319-3bc1-7e4c-9149-e5d0e5c20edb`
- iOS update ID: `019dd319-3bc1-783e-a34a-1ef0ff30bee4`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/c7965392-0aa7-40ec-8529-347be529fb3d

Earlier source-loading fix:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `e2e5a8bb-04a2-48d5-9100-4ea83b8cabd9`
- Android update ID: `019dd313-bcbd-7a75-aa67-6d7a287ff1d3`
- iOS update ID: `019dd313-bcbd-71ac-81b1-8e5aa31b7c42`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/e2e5a8bb-04a2-48d5-9100-4ea83b8cabd9

Earlier timing fix:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `e9c3839f-1327-4d07-b5ac-d25b09a567cd`
- Android update ID: `019dd307-e16a-7fa8-9444-19b6eb683d1d`
- iOS update ID: `019dd307-e16a-75b4-9973-62977c154f64`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/e9c3839f-1327-4d07-b5ac-d25b09a567cd

Earlier immediate-render OTA:

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `3656c379-5ac3-443e-bd52-7adb12ecbe5b`
- Android update ID: `019dd2f4-06a5-75b8-a1c3-d0b6ce0207c9`
- iOS update ID: `019dd2f4-06a5-7e75-9fc1-c35e4234bb52`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/3656c379-5ac3-443e-bd52-7adb12ecbe5b

## TestFlight Note

Expo updates are downloaded/applied on launch. If TestFlight opens once with the old bundle, fully close the app and reopen. The restored splash should show after the OTA is active.

---

## 2026-05-02 Update — Eliminate White → Black Hand-off Blink

### Symptom

After 1.10.0 (build 82) reached the App Store, real production users on iOS reported the splash blinking twice during cold start. TestFlight users on fast WiFi did not perceive it. Two-launch sanity check ruled out an OTA-not-applied issue.

### Root cause

The previously-shipped fix eliminated WebView's blank bootstrap paint but did not eliminate the structural color mismatch between the iOS native LaunchScreen (white `#ffffff` + GENOSYS logo) and the JS `VideoLaunchScreen` overlay (`#000` black). On a cold prod launch the sequence was:

1. iOS native LaunchScreen — white + logo (~300–700ms)
2. expo-splash-screen view — white + logo (~50–300ms)
3. JS root mounts → `VideoLaunchScreen` container — **black** (blink #1: white → black)
4. WebView loads HTML video, black cover hides blank paint
5. Cover removes when `playbackStarted` → first video frame visible (blink #2: black → video)

In TestFlight on fast WiFi the WebView load was fast enough that the eye fused both transitions into one visual beat. On cellular / cold cache the gap between #1 and #2 stretched to 600–1500ms and they were clearly perceived as two separate blinks.

A second contributing factor: the iOS LaunchScreen image at `ios/GenosysUAE/Images.xcassets/SplashScreenLegacy.imageset/image{,@2x,@3x}.png` was a stale prebuild artefact (`md5 8344b5ff…`) that did not match the source-of-truth `assets/splash.png` (`md5 63204fba…`) declared in `app.json`. Even after fixing the JS overlay color, the JS-rendered logo wouldn't have been pixel-identical to what the native splash drew.

### Change — OTA (option B)

Rewrote `components/VideoLaunchScreen.js`:

- Container, WebView surface, and HTML body backgrounds all flipped from `#000` → `#ffffff` to match `ios/GenosysUAE/Images.xcassets/SplashScreenBackground.colorset` (white).
- Added a persistent splash-image cover (white background + bundled `assets/splash.png`) layered on top of the WebView from the first JS render. Mirrors the iOS native LaunchScreen so the JS hand-off is pixel-matched.
- Cover stays at full opacity until the WebView posts `loadeddata` / `canplay` / `playing`, then cross-fades out over 280ms revealing the video underneath. Cross-fade (rather than hard cut) softens the hand-off if the splash image and video first frame are not pixel-identical.
- API-provided `posterUrl` (when supplied by `/api/mobile/splash-config`) overrides the bundled image as the cover. Backend currently returns `null`, so we fall back to the bundled asset.
- `splashHtml` wrapped in `useMemo` keyed on `sourceUri` so the WebView's `source` prop is stable across parent re-renders and doesn't reload mid-playback.
- Dropped the now-unused `View` import and the orphaned `webLoadingCover` / `fallback` / `logo` styles.

Net cold-start sequence after the change:

1. iOS LaunchScreen — white + logo
2. expo-splash-screen — white + logo (same pixels)
3. JS root → `VideoLaunchScreen` cover — white + logo (same pixels) ← no blink
4. WebView buffers behind the cover (invisible)
5. First video frame ready → cross-fade cover out → video plays
6. Splash fade-out → app revealed

### Change — next binary (option C)

Synced `ios/GenosysUAE/Images.xcassets/SplashScreenLegacy.imageset/image{,@2x,@3x}.png` to the current `assets/splash.png`. All three scale slots now hash to `63204fba8ff5d1f979eef57d35f3d73d`, identical to `assets/splash.png` and to what the JS cover renders.

This change does not affect the binary already in the App Store (build 82, which still ships the stale image). It will be picked up by the next `eas build --profile production`. With `autoIncrement: true` in `eas.json`, that build will be 83.

Once build 83 ships, even users on the first launch (before OTA applies) will see a pixel-matched native → JS hand-off because both layers will render the same image bytes.

### Files

- `components/VideoLaunchScreen.js`
- `ios/GenosysUAE/Images.xcassets/SplashScreenLegacy.imageset/image.png`
- `ios/GenosysUAE/Images.xcassets/SplashScreenLegacy.imageset/image@2x.png`
- `ios/GenosysUAE/Images.xcassets/SplashScreenLegacy.imageset/image@3x.png`

Commit: `53a1df0`

### OTA

Published via `eas update --branch production --platform all`.

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `1092630b-f956-45eb-bd9b-6fc4cd16c5b6`
- Android update ID: `019de7d4-40b8-7913-8efd-8395aa469df1`
- iOS update ID: `019de7d4-40b8-71f5-a66e-3072b59d0aee`
- Commit: `53a1df09521077c8f1b3ad4c20987c2072cf2962`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/1092630b-f956-45eb-bd9b-6fc4cd16c5b6

### Verification checklist

For the user testing the OTA in production:

1. Open the app on iOS production build (App Store 1.10.0 / 82). First launch will still run the bundled (old) JS — kill the app from the App Switcher.
2. Reopen. The OTA will be applied on this cold start. Expect: white background continuously from icon tap → video plays → app shell. No black flash.
3. If the splash video itself starts on a non-white frame, the cross-fade will reveal that frame over 280ms — that is intentional and should look like a single smooth transition, not a snap.

### Pending follow-ups

- Bump `app.json buildNumber` and `Info.plist CFBundleVersion` for the next binary (autoIncrement will set them to 83 at build time; current uncommitted working-tree values reflect the already-shipped 82 binary).
- Optional: have the cosmetics-website backend start returning a real `posterUrl` for `/api/mobile/splash-config` so future splash variants don't need a binary rebuild to swap the cover image.

---

## 2026-05-02 Update #2 — Pin JS cover to the actual native LaunchScreen image per binary

### Symptom (post-OTA `1092630b-f956-45eb-bd9b-6fc4cd16c5b6`)

User on production iOS reported the OTA fixed the *background* mismatch but the splash now shows two **logo** flicks instead of two color flashes:

> "white logo screen before the splash, then comes splash and logo quickly flicks again and then splash continues."

### Root cause

The OTA bundled `assets/splash.png` (md5 `63204fba8ff5d1f979eef57d35f3d73d`, RGB) as the JS cover. But shipped binary 82's iOS LaunchScreen storyboard rasterizes a *different* version of the brand asset — committed pre-`53a1df0` — with md5 `8344b5ff5bbc0f05fe68b18e3bdc4896` (RGBA). Both 2400×2400 but different bytes (different brand asset version, different background/alpha treatment). Option C synced the iOS imageset to the current asset for *next* binary (83), but binary 82 in the App Store still holds the legacy bytes.

So on cold start of binary 82 with the previous OTA:

1. Native LaunchScreen paints **legacy** logo (md5 `8344b5ff…`)
2. JS root mounts → cover paints **current** logo (md5 `63204fba…`) — visible image swap (flick #1)
3. Cover cross-fades 280ms → video first frame visible — visible blend (flick #2)
4. Video plays

### Change — OTA #2

Pixel-match the JS cover to whatever the native LaunchScreen on the *running* binary actually paints, not the source-of-truth asset:

- Bundle the legacy asset as `assets/splash-launchscreen-binary82.png`, extracted from `git show 53a1df0~1:ios/GenosysUAE/Images.xcassets/SplashScreenLegacy.imageset/image.png`. Its md5 is frozen by `verify-splash-sync.js` so future commits can't silently replace the snapshot.
- `components/VideoLaunchScreen.js` now picks the cover image at runtime by `Constants.nativeBuildVersion`:
  - build < 83 → **legacy** asset (matches binary 82 native LaunchScreen byte-for-byte)
  - build ≥ 83 → `assets/splash.png` (will match binary 83+ native LaunchScreen after option C is in the binary)
- Cross-fade duration tightened from 280ms → 90ms. Long fades visibly blend two near-identical-but-not-identical images and read as flicker; 90ms is short enough to look near-instantaneous on matched pixels and still soften any micro-mismatch with the video first frame.
- The WebView's `playbackStarted` flag now only flips on the `playing` event — no longer on `loadeddata` or `canplay`. Those earlier events fire when the first frame is decoded into memory but may *precede* the actual paint to screen, leaving a brief logo-less white gap between cover hide and video paint. `playing` fires when frames are actually being painted. (`canplay` still calls `video.play()` to ensure playback starts on autoplay-restricted WebViews.)
- `verify-splash-sync.js` now (a) requires the legacy asset to be `require()`d in `VideoLaunchScreen.js` and (b) freezes its md5 so future commits can't silently replace the frozen reference with an arbitrary asset.

### Expected sequence on binary 82 cold start (after OTA #2 applies)

1. iOS LaunchScreen — white + **legacy** logo, ~700ms
2. expo-splash-screen — white + **legacy** logo (same pixels)
3. JS root → cover renders **legacy** asset on white — byte-identical to step 1/2 ← no flick #1
4. WebView buffers behind the cover (invisible)
5. WebView fires `playing` → 90ms cover fade → video frame painted
6. Video plays → final fade-out → app revealed

### Expected sequence on binary 83+ cold start (when next build ships)

1. iOS LaunchScreen — white + **current** logo (option C asset, md5 `63204fba…`)
2. expo-splash-screen — white + **current** logo
3. JS root → cover renders **current** asset (build ≥ 83 branch) — byte-identical
4. WebView buffers
5. `playing` → 90ms fade → video plays
6. Final fade-out → app revealed

### Files

- `assets/splash-launchscreen-binary82.png` (new, frozen)
- `components/VideoLaunchScreen.js`
- `scripts/verify-splash-sync.js`

Commit: `a8d868c`

### OTA

Published via `npx eas-cli@latest update --branch production` against the same runtime version as the prior OTA. Replaces (latest-wins) the previous bundle for users on runtime `1.10.0`.

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `afe4b237-b680-4ec5-be42-2b332479c65f`
- Android update ID: `019de812-5ade-75a3-90bc-353ff07283c5`
- iOS update ID: `019de812-5ade-76b9-8b17-e2e73a1c588a`
- Commit: `a8d868ca929a154c67485ac8694f3c1f162daa0c`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/afe4b237-b680-4ec5-be42-2b332479c65f

### Verification checklist (for the user)

The OTA is downloaded *during* a cold start and applied on the *next* one. So:

1. Open the app on the production build (1.10.0 / build 82). First open after this OTA published may still run the prior bundle.
2. Kill the app from the App Switcher.
3. Reopen. This launch should run the new bundle.
4. Expected: continuous logo on white from icon tap through to the splash video starting. No image swap, no logo flicker, no white-without-logo gap. The video then plays normally and fades out into the app shell.

If you still see flicker after reopening twice from the App Switcher: report what stage the flicker happens at (icon tap → first paint, OR somewhere mid-video) and I'll iterate.

### Cleanup once binary 83 is fully rolled out

- Drop `assets/splash-launchscreen-binary82.png` and the legacy `require()` from `VideoLaunchScreen.js`.
- Remove the `Constants.nativeBuildVersion` branch (always use `SPLASH_IMAGE_CURRENT`).
- Remove the legacy-asset checks from `verify-splash-sync.js`.
- The verify-splash-sync md5-parity test on `assets/splash.png` ↔ `SplashScreenLegacy.imageset/*.png` continues to enforce the option-C invariant indefinitely.

---

## 2026-05-02 Update #3 — Prevent WebView restart and hide unstable first frames

### Symptom (post-OTA #2)

User still saw multiple startup artifacts:

> "white logo flicks two times, then a bit of splash, then flicks again and then splash starts."

OTA #2 fixed the native-vs-JS image mismatch, but the observed "bit of splash → flick → splash starts" pointed to WebView/video instability rather than only an asset mismatch.

### Root cause

Two remaining races were still possible in `VideoLaunchScreen`:

1. `app/_layout.js` runs startup checks (`/app-version`, cached `/splash-config`, fresh `/splash-config`, OTA check). These can re-render the root while `VideoLaunchScreen` is mounted. The component memoized the HTML string, but still passed a new `{ html, baseUrl }` object to `react-native-webview` on each render. On iOS this can be treated as a source change and restart/repaint the embedded video.
2. WKWebView can emit `playing` before the first visually stable frame. Revealing the WebView immediately after `playing` can expose WebKit's own white/poster/bootstrap frames before the actual video motion is stable.

### Change — OTA #3

`components/VideoLaunchScreen.js` now makes each cold-start splash deterministic:

- Freezes the initial `localSource`, `videoUrl`, `posterUrl`, `duration`, and `cacheTTL` in a ref for the lifetime of the launch overlay. Fresh config can be saved for the next launch, but cannot replace the running overlay's media mid-playback.
- Removes the prop-driven `setVideoSource` effect so the video source is chosen once and never swapped while visible.
- Memoizes the full WebView `source` object, not just the HTML string, to prevent WebView reloads on unrelated root re-renders.
- Replaces `expo-image` for the static local cover with React Native's native `Image` and disables image fade (`fadeDuration={0}`) to avoid an extra image-pipeline transition while the native splash is handing off to JS.
- Keeps the static cover visible for `650ms` after WKWebView reports `playing`, then hard-cuts to the already-playing video (`duration: 0`). This hides WebView's unstable first frames instead of showing them as a logo flicker / video restart.
- Clears the reveal timer on dismiss/unmount.

### Files

- `components/VideoLaunchScreen.js`

Commit: `9b01967`

### OTA

Published via `npx eas-cli@latest update --branch production` against runtime `1.10.0`.

- Branch: `production`
- Runtime: `1.10.0`
- Platforms: iOS, Android
- Update group ID: `a80139c1-ece2-41f0-9b28-268e17771d0c`
- Android update ID: `019de840-6e81-7be6-922a-baf8dcd4af5b`
- iOS update ID: `019de840-6e81-7f71-bd49-52b1e54ad19b`
- Commit: `9b01967785bf40317ca0baa85edec5426ecc51f3`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/a80139c1-ece2-41f0-9b28-268e17771d0c

### Verification

- `npm run verify:splash` passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-splash-stability-ota` passed and included `assets/splash-launchscreen-binary82.png`.

### Expected sequence after OTA #3 applies

1. Native iOS LaunchScreen shows white + baked-in binary-82 logo.
2. JS overlay shows the matching static cover.
3. WebView starts and plays behind the static cover.
4. After `playing` + 650ms, cover hard-cuts to already-moving video.
5. Video completes / timeout fires, then app shell is revealed.

No visible WebView restart should occur between steps 3 and 4.
