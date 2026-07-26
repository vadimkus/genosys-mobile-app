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
- Update group: _(filled after publish)_
- Dashboard: _(filled after publish)_
