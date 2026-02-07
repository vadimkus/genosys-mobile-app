# Dynamic Content — Images & Videos from Backend

## Overview

Product images and videos can be managed from the backend **without submitting a new app build**. The app checks the API/database first, then falls back to hardcoded config.

## How It Works

### Image Priority

The `getProductImages()` function in `data/productConfig.js` checks in this order:

1. **Database `images` field** (JSON array from API) — dynamic, no app update needed
2. **Hardcoded `PRODUCT_CONFIG`** in `data/productConfig.js` — static fallback
3. **Single `image` field** from API — last resort

### Video Priority

The `getProductVideoUrl()` function checks in this order:

1. **`product.videoUrl`** from API response — dynamic, no app update needed
2. **Hardcoded `PRODUCT_CONFIG.videoUrl`** in `data/productConfig.js` — static fallback

## Adding a New Image to a Product

### Option A: Via Database (No App Rebuild)

1. Upload the image file to `cosmetics-website/public/images/` (or `public/images/Second/`)
2. Push to git — Vercel deploys the image automatically
3. Update the product's `images` field in the database:
   ```json
   ["/images/MAIN.jpg", "/images/Second/detail.jpg"]
   ```
4. The app picks it up on next product load

### Option B: Via Hardcoded Config (Requires App Rebuild)

1. Upload the image to `cosmetics-website/public/images/`
2. Add the image paths to `PRODUCT_CONFIG` in:
   - `cosmetics-website/data/productConfig.ts` (website)
   - `genosys-mobile-app/data/productConfig.js` (app fallback)
3. Push website changes — website shows new images immediately
4. Rebuild the app for native changes to take effect

## Adding a Video to a Product

### Option A: Via Database (No App Rebuild)

1. Upload the video file to `cosmetics-website/public/videos/` (e.g., `product_name.mp4`)
2. Push to git — Vercel deploys the video
3. Update the product's `videoUrl` field in the database:
   ```
   /videos/product_name.mp4
   ```
4. The app shows the video with a thumbnail + play button on next load

### Option B: Via Hardcoded Config (Requires App Rebuild)

1. Upload video to `cosmetics-website/public/videos/`
2. Add `videoUrl` to `PRODUCT_CONFIG` in `genosys-mobile-app/data/productConfig.js`:
   ```js
   '99': {
     videoUrl: '/videos/product_name.mp4',
   },
   ```
3. Rebuild the app

## Backend Changes (Cosmetics Website)

These changes were made to support dynamic content:

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `videoUrl String?` field to Product model |
| `types/index.ts` | Added `videoUrl?: string \| null` to Product interface |
| `lib/pricingEngine.ts` | Added `videoUrl` to `EnhancedProductData` interface and return object |

**Database migration:** `npx prisma db push` was run to add the `videoUrl` column.

## Image Guidelines

- **Format:** JPEG preferred, PNG for transparency
- **Size:** 2000x2000px recommended (square) for product images
- **File size:** Under 500KB for fast loading
- **Naming:** Place second/detail images in `/images/Second/` folder
- **Main images:** Place in `/images/` root with short uppercase names (e.g., `HYDR.jpg`)

## Video Guidelines

- **Format:** MP4 (H.264 codec)
- **Size:** Under 5MB recommended
- **Aspect ratio:** 16:9 or square
- **Location:** `/videos/` folder in the website public directory
- **Controls:** Native controls are shown automatically. Video plays inline (not fullscreen) by default.

## Key Files

| File | Purpose |
|------|---------|
| `genosys-mobile-app/data/productConfig.js` | Hardcoded image/video fallback config for the app |
| `cosmetics-website/data/productConfig.ts` | Website product config (images, videos, pricing) |
| `app/product/[id].js` | Product detail screen (gallery + video player) |
| `cosmetics-website/lib/pricingEngine.ts` | API response builder (includes `videoUrl` and `images`) |
