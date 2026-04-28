# TestFlight Startup Splash Black Screen Fix

Date: 2026-04-28

## Issue

In TestFlight, the app could open to a full black screen and stay there until the user touched the screen. After touch, the normal app screen appeared.

## Root Cause

The black screen matched the remote video launch overlay:

- `/api/mobile/splash-config` is enabled and returns `Splash.mp4`.
- `VideoLaunchScreen` rendered a full-screen black overlay while the remote/cached video source was mounted.
- Tap-to-skip dismissed the overlay, explaining why touching the screen recovered the app.
- The overlay depended too much on the video first frame and native animation callback path. If the video/player first frame stalled on a cold TestFlight launch, the user saw black instead of the app.

## Fix

Updated `components/VideoLaunchScreen.js`:

- Changed overlay background from black to white.
- Shows the GENOSYS branded fallback while the video is not `readyToPlay`.
- Hides `VideoView` until the player reports `readyToPlay`.
- Keeps tap-to-skip behavior.
- Adds a JS fallback removal timer so the overlay is removed even if the native animation completion callback stalls.
- Clears all timers on unmount.

This is JS-only and safe for OTA.

## Verification

- `ReadLints` on `components/VideoLaunchScreen.js`: no errors.
- `npm run verify:release`: passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-ios-startup-fix`: passed.
- Published OTA:
  - Branch: `production`
  - Runtime: `1.10.0`
  - Update group ID: `73f4b57b-4bc5-46f7-b26e-1d0d9d8017ba`
  - iOS update ID: `019dd2d9-255f-7761-b6fc-e60cdb7618bd`
  - Android update ID: `019dd2d9-255f-78a9-be5e-a9f77c2c38b3`
  - Message: `Fix TestFlight startup video splash black screen 1.10.0`

## TestFlight Notes

Expo updates apply after the app checks for updates and restarts/reloads. If the old black overlay appears once, tap to enter the app, fully close it, and reopen. The next launch should use the new update.
