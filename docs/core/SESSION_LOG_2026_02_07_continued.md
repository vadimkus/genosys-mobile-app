# Session Log — 7–8 Feb 2026 (Continued)

## Summary

This continuation session covered: product detail video refactoring (website), product image and video additions, Bio Meso category support in native app, Request Quote functionality for `isPriceOnRequest` products, voice search implementation and graceful degradation, and gallery pagination dot fix.

---

## 7. Product 50 (EyeCell EYE ZONE CARE KIT) — Second Image Added

**Product:** EyeCell EYE ZONE CARE KIT  
**URL:** https://genosys.ae/products/50  
**Image:** `/images/Second/ekit_big.jpg`

### Files Changed
| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `lib/products.ts` | `images: null` → `JSON.stringify(['/images/EYEZ.jpg', '/images/Second/ekit_big.jpg'])` |
| cosmetics-website | `data/productConfig.ts` | Added `images` array to product 50 |
| cosmetics-website | `public/images/Second/ekit_big.jpg` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added product 50 entry with images |
| Database | `products` table | `images` field updated for id=50 |

---

## 8. Product 21 (MULTI VITA RADIANCE SERUM) — Second Image Added

**Product:** MULTI VITA RADIANCE SERUM  
**URL:** https://genosys.ae/products/21  
**Image:** `/images/Second/rd_big.jpg`

### Files Changed
| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `lib/products.ts` | `images: null` → `JSON.stringify(['/images/RADS.jpg', '/images/Second/rd_big.jpg'])` |
| cosmetics-website | `data/productConfig.ts` | Added `images` array to product 21 |
| cosmetics-website | `public/images/Second/rd_big.jpg` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added product 21 entry with images |
| Database | `products` table | `images` field updated for id=21 |

---

## 9. Website Video Rendering Refactor — Dynamic `videoUrl` Field

### Problem
Product 19 (ALL FOR SENSITIVE SERUM) had `videoUrl` set in the database but the video wasn't displaying on the website. The product detail component (`ProductPageClientRefactored.tsx`) had **hardcoded** video blocks that only rendered for product IDs 10 and 26.

### Fix
Replaced hardcoded video blocks with a single dynamic renderer:

```tsx
{product.videoUrl && (
  <div className="mt-4 lg:mt-6 lg:max-w-sm lg:mx-auto">
    <div className="rounded-xl overflow-hidden shadow-lg bg-black">
      <video controls playsInline preload="none" poster="/Logo/BlackG.png">
        <source src={product.videoUrl} type="video/mp4" />
      </video>
    </div>
  </div>
)}
```

Also ensured products 10 and 26 had their `videoUrl` explicitly set in the database to match the paths they previously used via hardcoded blocks.

### Files Changed
| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `app/products/[id]/ProductPageClientRefactored.tsx` | Replaced hardcoded video blocks with dynamic `product.videoUrl` renderer |
| Database | `products` table | `videoUrl` set for products 10, 19, 26 |

---

## 10. Voice Search — Native App

### Feature
Added speech-to-text voice search to the product catalog search bar using `expo-speech-recognition`.

### Implementation
- Microphone button added next to the search input
- Tapping it requests mic permissions, then starts listening
- A modal overlay shows a pulsing mic icon + real-time partial transcription
- When speech is finalized, it populates the search field
- Multi-language support: maps app locale to BCP-47 codes (`en-US`, `ar-AE`, `ru-RU`)

### Files Changed
| Repo | File | Change |
|------|------|--------|
| genosys-mobile-app | `package.json` | Added `expo-speech-recognition: ^3.1.0` |
| genosys-mobile-app | `app.json` | Added plugin + iOS `infoPlist` permissions |
| genosys-mobile-app | `app/(tabs)/shop.js` | Mic button, modal overlay, speech event handlers |
| genosys-mobile-app | `i18n/messages/en.json` | Added `voiceSearch.*` keys |
| genosys-mobile-app | `i18n/messages/ar.json` | Added `voiceSearch.*` keys (Arabic) |
| genosys-mobile-app | `i18n/messages/ru.json` | Added `voiceSearch.*` keys (Russian) |

### Graceful Degradation Fix
`expo-speech-recognition` requires a native build — crashes in Expo Go. Fixed by wrapping the import in a `try/catch require()`:

```js
let ExpoSpeechRecognitionModule = null;
let useSpeechRecognitionEvent = (_event, _cb) => {}; // no-op fallback
let _speechAvailable = false;
try {
  const sr = require('expo-speech-recognition');
  if (sr?.ExpoSpeechRecognitionModule) {
    ExpoSpeechRecognitionModule = sr.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = sr.useSpeechRecognitionEvent;
    _speechAvailable = true;
  }
} catch {}
```

The mic button and listening modal are conditionally rendered with `{speechAvailable && (...)}`.

---

## 11. Bio Meso Category — Added to Native App

### Problem
The website had 16 product categories including "Bio Meso", but the native app only had 15 — Bio Meso was missing.

### Fix
Added Bio Meso to all category-related systems in the native app:

| File | Change |
|------|--------|
| `app/(tabs)/shop.js` | Added `'Bio Meso'` to `ALLOWED_CATEGORY_ORDER` |
| `utils/productLocalization.js` | Added `'bio meso'` and `'bio-meso'` to `CATEGORY_CANONICAL_BY_KEY` |
| `utils/productLocalization.js` | Added `case 'Bio Meso': return 'categories.bioMeso'` to `getCategoryTranslationKey` |
| `i18n/messages/en.json` | `"bioMeso": "Bio Meso"` |
| `i18n/messages/ar.json` | `"bioMeso": "بيو ميزو"` |
| `i18n/messages/ru.json` | `"bioMeso": "Био Мезо"` |

---

## 12. Request Quote — `isPriceOnRequest` Products

### Problem
Bio Meso (and potentially other professional products) have `isPriceOnRequest: true` and `price: 0` in the database. The website shows "Price on Request" with a green WhatsApp "Request Quote" button. The native app had no awareness of this field — it showed 0 AED price and an "Add to Bag" button.

### Solution — End to End

#### Backend (cosmetics-website)
Added `isPriceOnRequest` to mobile API responses:

| File | Change |
|------|--------|
| `app/api/mobile/products/route.ts` | Added `isPriceOnRequest: true` to DB select + response mapping |
| `app/api/mobile/products/[id]/route.ts` | Same for single-product endpoint |

#### Native App — Shop Grid (Product Cards)
| Condition | Display |
|-----------|---------|
| `isPriceOnRequest: true` | Red "Price on Request" text instead of price |
| `isPriceOnRequest: true` | Green WhatsApp "Request Quote" button instead of "Add to Bag" |

#### Native App — Product Detail Page
| Condition | Display |
|-----------|---------|
| `isPriceOnRequest: true` | "Price on Request" label instead of pricing block |
| `isPriceOnRequest: true` | Green WhatsApp bottom button instead of "Add to Bag" |

#### WhatsApp Integration
- Opens `https://wa.me/971585487665` (same number as website)
- Pre-filled message: "Hi, I'm interested in {Product Name}. Could you please provide pricing information?"
- Localized messages in all 3 languages

#### Translations Added
| Key | EN | AR | RU |
|-----|----|----|-----|
| `product.requestQuote` | Request Quote | طلب عرض سعر | Запросить цену |
| `product.priceOnRequest` | Price on Request | السعر عند الطلب | Цена по запросу |
| `shop.requestQuote` | Request Quote | طلب عرض سعر | Запросить цену |
| `shop.priceOnRequest` | Price on Request | السعر عند الطلب | Цена по запросу |

#### Styles Added
- `requestQuoteButton` — Green (`#25D366`) WhatsApp-branded button for shop grid
- `requestQuoteBottomButton` — Green bottom bar button for product detail
- `priceOnRequestText` — Red 14px text for shop grid
- `priceOnRequestLabel` — Red 18px text for product detail

### Files Changed
| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `app/api/mobile/products/route.ts` | `isPriceOnRequest` in select + DbProduct + response |
| cosmetics-website | `app/api/mobile/products/[id]/route.ts` | Same |
| genosys-mobile-app | `app/(tabs)/shop.js` | Price on Request display + Request Quote button |
| genosys-mobile-app | `app/product/[id].js` | Price on Request label + Request Quote bottom button |
| genosys-mobile-app | `i18n/messages/en.json` | Translation keys |
| genosys-mobile-app | `i18n/messages/ar.json` | Translation keys |
| genosys-mobile-app | `i18n/messages/ru.json` | Translation keys |

---

## 13. Product 39 (ULTRA SHIELD SUN CREAM) — Second Image Added

**URL:** https://genosys.ae/products/39  
**Image:** `/images/Second/50big.jpg`

| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `lib/products.ts` | `images` → `['/images/SPF50.jpg', '/images/Second/50big.jpg']` |
| cosmetics-website | `data/productConfig.ts` | Added `images` array |
| cosmetics-website | `public/images/Second/50big.jpg` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added product 39 entry |
| Database | `products` table | `images` updated |

---

## 14. Product 40 (MULTI SUN CREAM) — Second Image Added

**URL:** https://genosys.ae/products/40  
**Image:** `/images/Second/40big.jpg`

| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `lib/products.ts` | `images` → `['/images/SSUN.jpg', '/images/Second/40big.jpg']` |
| cosmetics-website | `data/productConfig.ts` | Added `images` array |
| cosmetics-website | `public/images/Second/40big.jpg` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added product 40 entry |
| Database | `products` table | `images` updated |

---

## 15. Product 51 (BIO-FERMENT AGE DEFYING POWDER MASK) — Video Added

**URL:** https://genosys.ae/products/51  
**Video:** `/videos/ferment.mp4` (1.4MB)

| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `public/videos/ferment.mp4` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added `videoUrl` to product 51 |
| Database | `products` table | `videoUrl` set for id=51 |

---

## 16. Product 42 (INTENSIVE BLEMISH BALM CREAM) — Second Image Added

**URL:** https://genosys.ae/products/42  
**Image:** `/images/Second/bbbig.jpg`

| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `lib/products.ts` | `images` → `['/images/BLEM.jpg', '/images/Second/bbbig.jpg']` |
| cosmetics-website | `data/productConfig.ts` | Added `images` array |
| cosmetics-website | `public/images/Second/bbbig.jpg` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added product 42 entry |
| Database | `products` table | `images` updated |

---

## 17. Product 21 (MULTI VITA RADIANCE SERUM) — Video Added

**URL:** https://genosys.ae/products/21  
**Video:** `/videos/rserum.mp4` (2.2MB)

| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `public/videos/rserum.mp4` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added `videoUrl` to product 21 |
| Database | `products` table | `videoUrl` set for id=21 |

---

## 18. Product 11 (SKIN DEFENDER LIP & EYE MAKEUP REMOVER) — Second Image Added

**URL:** https://genosys.ae/products/11  
**Image:** `/images/Second/def_big.jpg`

| Repo | File | Change |
|------|------|--------|
| cosmetics-website | `lib/products.ts` | `images` → `['/images/DEF.jpg', '/images/Second/def_big.jpg']` |
| cosmetics-website | `data/productConfig.ts` | Added `images` array |
| cosmetics-website | `public/images/Second/def_big.jpg` | Added to git |
| genosys-mobile-app | `data/productConfig.js` | Added product 11 entry |
| Database | `products` table | `images` updated |

---

## 19. Gallery Pagination Dots — Overlap Fix

### Problem
On the product detail page, the image gallery pagination dots (the small circles indicating which image is active) were absolutely positioned inside the fixed-height image container, causing them to overlap with the product image.

### Fix
- Moved dots **outside** the `imageContainer` View so they render as a normal flow element between the image and product info
- Removed `position: 'absolute'`, replaced with `paddingVertical: 10` and `backgroundColor: '#ffffff'`
- Dots only render when there are 2+ gallery images
- Slightly refined dot sizes (7px inactive → 8px active) for a cleaner look

### Files Changed
| File | Change |
|------|--------|
| `app/product/[id].js` | Moved pagination dots outside image container, updated styles |

---

## Products with Multiple Images (Current State)

| # | Product Name | Images |
|---|-------------|--------|
| 6 | POWER SOLUTION CTS | CTS.jpg, cts_big.jpg, cts_big2.jpg |
| 9 | ALL WONDERS SERUM | AWS.jpg, aws1.jpg, aws2.jpg |
| 10 | SNOW O₂ DEEP CLEAN WASH | SNOW.jpg, cleanser_big.jpg |
| 11 | SKIN DEFENDER LIP & EYE MAKEUP REMOVER | DEF.jpg, def_big.jpg |
| 12 | EPI TURNOVER BOOSTING PEELING GEL | EPI.jpg, eppi_big.jpg |
| 13 | SKIN RENEWAL PEELING SYSTEM | SRS.jpg, sss1.jpg, sss2.jpg |
| 19 | ALL FOR SENSITIVE SERUM | ASE.jpg, allserum_big.jpg |
| 21 | MULTI VITA RADIANCE SERUM | RADS.jpg, rd_big.jpg |
| 26 | EGF CELL REPAIR SERUM | EGF.jpg, egf_big.jpg |
| 35 | HYDRO COOL GEL MASK | HYDR.jpg, hmask_big.jpg |
| 38 | EZ CO₂ MASK KIT | EZE.jpg, ez.jpg, ez1.jpg |
| 39 | ULTRA SHIELD SUN CREAM | SPF50.jpg, 50big.jpg |
| 40 | MULTI SUN CREAM | SSUN.jpg, 40big.jpg |
| 42 | INTENSIVE BLEMISH BALM CREAM | BLEM.jpg, bbbig.jpg |
| 50 | EyeCell EYE ZONE CARE KIT | EYEZ.jpg, ekit_big.jpg |
| 51 | BIO-FERMENT AGE DEFYING POWDER MASK | BFAD.png, ferment_big.jpg |
| 52 | SKIN REBOOT PDRN MASK PACK | PDRN.png, pdrnnn.jpg |

## Products with Video (Current State)

| # | Product Name | Video File |
|---|-------------|-----------|
| 10 | SNOW O₂ DEEP CLEAN WASH | Cleanser_02.mp4 |
| 19 | ALL FOR SENSITIVE SERUM | allserum.mp4 |
| 21 | MULTI VITA RADIANCE SERUM | rserum.mp4 |
| 26 | EGF CELL REPAIR SERUM | egf.mp4 |
| 51 | BIO-FERMENT AGE DEFYING POWDER MASK | ferment.mp4 |

---

## Git Commits (This Extended Session)

### cosmetics-website
```
8df51b03 feat: add second image for product 11 (SKIN DEFENDER)
87ed199b chore: add raw source images for products 39, 40, 42, 21
be0d8851 feat: add video for product 21 (MULTI VITA RADIANCE SERUM)
90e15fe4 feat: add second image for product 42 (INTENSIVE BLEMISH BALM CREAM)
5ac121c1 feat: add video for product 51 (BIO-FERMENT AGE DEFYING POWDER MASK)
383540ca feat: add second images for products 39 (SPF50) and 40 (SPF40)
654a7062 feat(api): include isPriceOnRequest in mobile product API responses
6ead1004 Add second image for product 21 (MULTI VITA RADIANCE SERUM)
d51a4c73 Make product video dynamic using DB videoUrl field
d550d26c Trigger Vercel redeploy
b38a5b4f Add second image for product 50 (EyeCell EYE ZONE CARE KIT)
8b91da58 Add video for product 19 (ALL FOR SENSITIVE SERUM)
81479022 Add second and third images for product 6 (POWER SOLUTION CTS)
58c959c5 Add missing cts_big.jpg second image
e0d37d7f Add missing eppi_big.jpg image for product 12
0b8ff8e0 Add second image for product 12 (EPI TURNOVER BOOSTING PEELING GEL)
00cd76b2 Add product 13 (SRS) to PRO Solution category
```

### genosys-mobile-app
```
e18c58f feat: add second image for product 11 in native app config
c085430 docs: add app store screenshots documentation
0d70d5f fix: move gallery pagination dots below image to prevent overlap
ad23cf6 feat: add video for product 21 in native app config
c8d7218 feat: add second image for product 42 in native app config
6dbd1ef feat: add video for product 51 in native app config
4c27c9f feat: add second images for products 39 and 40 in native app config
6dc0e8b feat: add Request Quote for isPriceOnRequest products + Bio Meso category + voice search fix
678a71e feat: add voice search to product catalog
2673dd4 Add second image for product 21 (MULTI VITA RADIANCE SERUM)
aaf66f1 Add second image for product 50 (EyeCell EYE ZONE CARE KIT)
9c17558 docs: add session log for 7 Feb 2026 changes
c09a6f1 Add video URL for product 19 (ALL FOR SENSITIVE SERUM)
63048c0 Add second and third images for product 6 (POWER SOLUTION CTS)
8d4cc92 Add second image for product 12 (EPI TURNOVER BOOSTING PEELING GEL)
```

---

## Architecture Notes

### Image Addition Workflow (3-layer update)
Every product image addition touches 3 layers:
1. **Database** — `images` JSON string updated via direct SQL
2. **Website seed data** — `lib/products.ts` and `data/productConfig.ts` updated
3. **Native app config** — `data/productConfig.js` updated (fallback for when API data isn't loaded yet)

### Video Addition Workflow (2-layer update)
1. **Database** — `videoUrl` string set via direct SQL
2. **Native app config** — `data/productConfig.js` `videoUrl` field (fallback)
3. **Website** — reads `product.videoUrl` dynamically, no config change needed

### `isPriceOnRequest` Flow
- **Database field:** `isPriceOnRequest Boolean @default(false)` in Prisma schema
- **API:** Passed through in both `/api/mobile/products` and `/api/mobile/products/[id]`
- **Website:** Shows "Price on Request" + WhatsApp link
- **Native app:** Shows "Price on Request" + WhatsApp `Linking.openURL()` with same phone number
