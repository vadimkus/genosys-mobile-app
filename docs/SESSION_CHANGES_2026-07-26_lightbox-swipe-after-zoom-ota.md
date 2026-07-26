# Lightbox Swipe After Zoom OTA

Date: 2026-07-26

## Bug

After pinch / double-tap zoom-out in the product image lightbox, horizontal
swipe between images stayed blocked. Only close worked.

## Cause

`Gesture.Pan()` stayed eligible at scale 1×. Even with a no-op `onUpdate`,
it captured the touch and starved the paging `FlatList`. Combined with
`scrollEnabled={!zoomed}`, paging felt fully frozen after zoom cycles.

## Fix

`components/product/ImageLightbox.js`: pan uses `manualActivation` and
`state.fail()` when `scale <= 1.05`, so FlatList receives horizontal swipes
again after zoom-out. Pinch-out clears translate offsets at 1×.

## Production OTA

- Branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `d413042f-8bd5-4310-b30d-d3fd0d36e543`
- Source commit: `e87e31c`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/d413042f-8bd5-4310-b30d-d3fd0d36e543
