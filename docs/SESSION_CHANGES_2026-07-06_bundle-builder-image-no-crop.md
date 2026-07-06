# Session Changes — 2026-07-06 — Bundle Builder: square photo tiles, no cropping

## Problem

On the **Build Your Set** screen (`app/bundle-builder.js`) product photos rendered in a short 130px-tall strip with `#FAFAFA` background and padding. Tall/square studio shots (e.g. CERABARRIER BIOME GEL CLEANSER, product 66, 1024×1024) appeared shrunken and inconsistent next to the square edge-to-edge tiles used everywhere else after the 2026-07-05 "product-image no-crop" pass.

Also, the component imports `Image` from `expo-image` but was passing the deprecated `resizeMode` prop (a react-native `Image` prop), which `expo-image` ignores — so the images were falling back to default fitting.

## Fix (same treatment as `ProductGridItem.js`)

`app/bundle-builder.js`:

1. **Product card tile** (`productImageWrap`): `height: 130 / #FAFAFA / padding: 8` → **square `height: CARD_WIDTH` on `#FFFFFF`, no padding**. Square 1024² studio photos now fill the tile edge-to-edge; wide photos letterbox invisibly on white.
2. **Product card image**: `resizeMode="contain"` → `contentFit="contain"` + `transition={200}` + `cachePolicy="memory-disk"` (correct `expo-image` props).
3. **Summary sheet thumbnails** (44×44): `resizeMode="contain"` → `contentFit="contain"` + `cachePolicy="memory-disk"`.

No layout changes elsewhere; the two-column `CARD_WIDTH` grid is unchanged.

## Verification / Ship

- `npx expo export --platform ios` — bundle compiles clean.
- OTA published to `production` branch, runtime **1.10.4**, iOS + Android:
  - Update group `11c68542-8cab-4a4c-bbf9-688a7936137b`
  - Message: "Bundle builder: square photo tiles + contain, no cropping"
- Kill + relaunch the app twice to pick up the OTA.
