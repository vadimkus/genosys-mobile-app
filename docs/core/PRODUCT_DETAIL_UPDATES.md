# Product Detail Page Updates (Feb 2026)

## Summary

Major improvements to the product detail screen (`app/product/[id].js`) covering image gallery, video playback, and trust badges.

## Changes

### 1. Image Gallery — Fit to Screen

**Problem:** Second images (e.g., `egf_big.jpg`) were too large and overflowed/cropped on the product page.

**Fix:**
- Changed `contentFit` from `cover` to `contain` for **all** products (not just Beauty Boxes)
- Increased `HEADER_HEIGHT` from 280 to 320 for a better viewing area
- Set image container and gallery item backgrounds to white so `contain` mode looks clean
- Gallery FlatList items now use a consistent height for all products

**Files changed:** `app/product/[id].js`

### 2. Trust Badges Removed

**Problem:** "UAE Certified", "Secure Payment", "Fast Delivery", "Professional Grade" pills took up valuable space and were unnecessary.

**Fix:**
- Removed `<TrustBadges />` component from the product detail page
- Removed the import (component file `components/product/TrustBadges.js` still exists but is unused)

**Files changed:** `app/product/[id].js`

### 3. Video Player — Thumbnail + Play Button

**Problem:** The original `expo-av` Video component showed a black screen on load with no visible controls. Videos played when tapped but the UX was confusing.

**Fix:**
- Created a dedicated `ProductVideo` component inside `app/product/[id].js`
- Shows the product image as a thumbnail with a red play button overlay
- On tap, replaces the thumbnail with the actual `expo-av` Video player with `shouldPlay={true}` and `useNativeControls`
- Error handling: if video fails, the section is hidden gracefully
- Uses 16:9 aspect ratio calculated from screen width
- Added `product.video` translation key to EN, AR, RU (later removed the title text since "Video" label was unnecessary)

**Files changed:**
- `app/product/[id].js` (ProductVideo component + videoStyles)
- `i18n/messages/en.json`, `ar.json`, `ru.json`

### 4. Second Image for Hydro Cool Mask (Product 35)

Added `hmask_big.jpg` as a second gallery image for the Hydro Cool Modeling Mask.

**Files changed:**
- `data/productConfig.js` — added product 35 entry
- Website: `data/productConfig.ts`, `public/images/Second/hmask_big.jpg`

### 5. Video Sound Fix — iOS Silent Mode (Feb 13, 2026)

**Problem:** Product videos played without sound in the native app, while web/mobile web had audio. Users reported no sound when playing product videos on product cards.

**Root cause:** On iOS, `expo-av`'s `<Video>` component defaults to `playsInSilentModeIOS: false` — it respects the device's physical mute switch. When the iPhone silent switch is on (which is very common), videos play muted. The web `<video>` element does not have this limitation.

**Fix:** Call `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` before playing the video in `ProductVideo`'s `handlePlay`. This enables audio playback even when the iOS silent switch is on.

**Files changed:** `app/product/[id].js`

**Rebuild required:** Yes — this is a client-side change. Rebuild and submit to TestFlight for the fix to take effect.

**Technical details:**
- Import `Audio` from `expo-av` alongside `Video` and `ResizeMode`
- In `handlePlay`, call `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` before `setIsPlaying(true)`
- Wrapped in try/catch with logging; failure does not block video playback

## Products with Video

| Product # | Product Name | Video File |
|-----------|-------------|------------|
| 10 | Snow O₂ Cleanser | `/videos/Cleanser_02.mp4` |
| 19 | All For Sensitive Serum | `/videos/allserum.mp4` |
| 26 | EGF Repair Oxymask Cream | `/videos/egf.mp4` |

## Products with Multiple Images

| Product # | Product Name | Images |
|-----------|-------------|--------|
| 6 | POWER SOLUTION CTS | CTS.jpg, cts_big.jpg, cts_big2.jpg |
| 9 | POWER SOLUTION AWS | AWS.jpg, aws1.jpg, aws2.jpg |
| 10 | Snow O₂ Cleanser | SNOW.jpg, cleanser_big.jpg |
| 12 | EPI TURNOVER BOOSTING PEELING GEL | EPI.jpg, eppi_big.jpg |
| 13 | SKIN RENEWAL PEELING SYSTEM (SRS) | SRS.jpg, sss1.jpg, sss2.jpg |
| 19 | All For Sensitive Serum | ASE.jpg, allserum_big.jpg |
| 26 | EGF Repair Oxymask Cream | EGF.jpg, egf_big.jpg |
| 35 | Hydro Cool Modeling Mask | HYDR.jpg, hmask_big.jpg |
| 38 | EZ CO₂ Mask Kit | EZE.jpg, ez.jpg, ez1.jpg |
| 51 | Bio-Ferment Age Defying Powder Mask | BFAD.png, ferment_big.jpg |
| 52 | Skin Reboot PDRN Mask Pack | PDRN.png, pdrnnn.jpg |
