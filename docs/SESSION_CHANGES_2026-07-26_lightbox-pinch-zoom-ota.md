# PDP Image Lightbox Pinch Zoom OTA

Date: 2026-07-26

## Issue

Full-screen product image viewer (`ImageLightbox`) supported swipe between
images but had no pinch / pan / double-tap zoom.

## Fix

- Added pinch zoom (1×–4×), pan while zoomed, and double-tap to toggle ~2.5×.
- Horizontal gallery paging is disabled while zoomed so swipe does not fight
  the pan gesture; zoom resets when changing slides.
- Uses existing `react-native-gesture-handler` + `react-native-reanimated`
  (already in the store binary) — OTA-compatible, no native bump.
- Modal content wrapped in `GestureHandlerRootView` so gestures work inside
  the full-screen modal.

## File

- `components/product/ImageLightbox.js`

## Production OTA

- Branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `ee95574f-0103-4a5e-be0e-ecc26e665251`
- Source commit: `562fe47d6bf3878d9ef14fa7bfed2e8b383db3ce`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/ee95574f-0103-4a5e-be0e-ecc26e665251
