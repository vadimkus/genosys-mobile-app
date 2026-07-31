# Product video native aspect ratio — 2026-07-31

## Problem

The native PDP forced every product video into a landscape 16:9 container with
a black background. Portrait 9:16 clips therefore showed black side bars and
dark rounded corners.

## Fix

- Listen for `expo-video`'s `sourceLoad` and `readyToPlay` events.
- Read the loaded `VideoTrack.size.width` / `height`.
- Set the player container's `aspectRatio` to the source's real ratio.
- Use 9:16 as the initial fallback because most current product clips are
  portrait.
- Keep `contentFit="contain"` so no video content is cropped.
- Use a white fallback background instead of black.

This works for both portrait and landscape videos without maintaining a
filename allowlist.

## File

- `app/product/[id].js`

## Verification

- Website video inventory contains both portrait and landscape clips, so a
  hard-coded portrait-only fix would regress older products.
- `npx tsc --noEmit`
- iOS Expo export
- Android Expo export

