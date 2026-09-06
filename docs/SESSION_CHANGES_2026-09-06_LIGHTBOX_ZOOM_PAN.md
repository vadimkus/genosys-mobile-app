# 2026-09-06: Lightbox zoom could not be panned

## Report
iOS: open a product image full screen, pinch in, and the picture is stuck on the region you zoomed into. No drag left/right.

## Cause (`components/product/ImageLightbox.js`)
- Pan used `manualActivation` behind `Gesture.Exclusive(doubleTap, pan)`, inside the horizontal FlatList. On iOS the pan never got to activate once zoomed.
- Pinch had no focal point (always zoomed to the centre) and there was no bounds clamping.

## Fix
- Pan is `.enabled(zoomed)` with a JS flag set on pinch start / double-tap, cleared on zoom-out. Parent still disables the FlatList scroll via `onZoomChange`.
- Composition: `Race(doubleTap, Simultaneous(pinch, pan))`.
- Pinch keeps the point under the fingers fixed; double-tap zooms into the tapped spot.
- Both clamp to the drawn image size (from expo-image `onLoad`), so the picture cannot be pushed off screen.

## Shipped
- Commit `2a36600` on main.
- OTA: `eas update --channel production --environment production`, group `f1e07ce9-d0b1-413f-96ed-c85e8357a2f0`, runtime 1.12.0, iOS + Android.
