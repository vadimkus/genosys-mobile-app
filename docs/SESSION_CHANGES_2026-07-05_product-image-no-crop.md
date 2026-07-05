# Session Changes — 2026-07-05 — Product images: no cropping anywhere

## Problem

User screenshot of the Shop grid showed product photos cropped inside the
card tiles (Bio-Ferment jar and PDRN box circled). Root causes:

1. The Shop grid image tile was a wide rectangle (`GRID_CARD_WIDTH × 140`)
   while the new studio photos are square (1024×1024) — same frame/photo
   aspect mismatch we fixed on the website (see
   `cosmetics-website/docs/SESSION_CHANGES_2026-07-05_PRODUCT_CARD_FULL_IMAGE_PREVIEWS.md`).
2. Several product thumbnails across the app still used `cover`
   (crops) instead of `contain` (fits).

## Fix — mirror the website's square-frame solution

### Square photo tiles

- `app/(tabs)/shop.js` — `gridImageContainer` height `140` → `GRID_CARD_WIDTH`
  (square tile). Removed `contentPosition="top"` so contained photos center
  vertically. Square studio photos now fill the tile edge-to-edge; wide
  photos (e.g. `HYDR.jpg` 956×662) letterbox invisibly on white.
- `components/ProductGridItem.js` (concern-detail grids) — image container
  height `CARD_WIDTH * 0.8` → `CARD_WIDTH` (square); swapped deprecated
  `resizeMode="contain"` for `contentFit="contain"` + transition + disk cache.
- `components/SkeletonLoader.js` — shop skeleton image block now square to
  match the real card.

### `cover` → `contain` on product thumbnails

| File | Spot |
|---|---|
| `app/(tabs)/bag.js` | cart item image (promo banners left as cover) |
| `app/favorites.js` | 72×72 row thumb |
| `app/profile/orders.js` | 52×52 order thumb |
| `app/chat.js` | 60×60 product card in chat |
| `components/ChatButton.js` | 48×48 product card in chat sheet |
| `components/product/PerfectCombinationCard.js` | 140-tall recommendation image |
| `components/SkinAnalysisResults.js` | 72×72 recommendation thumb |
| `app/skin-analysis.js` | 72×72 recommendation thumb |
| `app/skin-analysis-camera.js` | 72×72 AI recommendation thumb |

Gray thumb backgrounds (`#F3F4F6`) changed to white on the image styles so
letterboxing is invisible; placeholders keep the gray background.

## Ship

- OTA published to `production` branch, runtime **1.10.4**, iOS + Android.
  Update group `9c50d1b3-ff9c-4ee9-88c0-288ddec8d19c`.
- Users get it on the second app launch after the update propagates.

## Notes

- Product detail hero already used `contentFit="contain"` — untouched.
- Website equivalent (square `aspect-square` frames + `object-contain`) was
  shipped earlier the same day on genosys.ae.
