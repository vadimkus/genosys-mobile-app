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
