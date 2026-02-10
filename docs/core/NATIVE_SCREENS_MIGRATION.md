# Native Screens Migration - Removing WebView Wrappers

> **Date:** February 10, 2026
> **Goal:** Replace all WebView screens with native React Native implementations

## Overview

The Genosys UAE iOS app previously used WebView wrappers to display 9 website pages inside the app. This resulted in:
- Slow loading (website had to render + inject CSS to hide chrome)
- Inconsistent UX (web styles vs native feel)
- Layout issues (overlapping headers, missing functionality)

We systematically replaced 8 of 9 WebView screens with fully native React Native implementations.

## Migration Status

| # | Screen | Status | File | Notes |
|---|--------|--------|------|-------|
| 1 | Brand | ✅ Native | `app/brand.js` | Tech cards, brand info, videos |
| 2 | Delivery | ✅ Native | `app/delivery.js` | Shipping rates, return policy |
| 3 | FAQ | ✅ Native + API | `app/faq.js` | DB-driven via `/api/mobile/faq`, 18 Q&As |
| 4 | Partners | ✅ Native + API | `app/partners.js` | DB-driven via `/api/mobile/partners` |
| 5 | Locations | ✅ Native | `app/locations.js` | 7 UAE emirates, office location |
| 6 | Training | ✅ Native + API | `app/training.js` | Auth-gated, 7 guides + 23 product docs + 11 videos |
| 7 | Blog | ✅ Native | `app/blog.js` | API-driven, image cards |
| 8 | Certificates | 🔵 Skipped | — | Low priority, rarely used |
| 9 | Bundle Builder | 🟡 Pending | Still WebView | Complex feature, needs API |

## Architecture Changes

### Before (WebView approach)
```
User taps "Brand" → NavigationDrawer.navigateWebView('/brand')
  → buildAuthenticatedWebViewUrl()
  → Opens /webview screen with URL
  → Loads genosys.ae/brand in WebView
  → Injects CSS to hide headers/footers/chat
  → User sees website content (slowly)
```

### After (Native approach)
```
User taps "Brand" → NavigationDrawer.navigateTo('/brand')
  → Opens native app/brand.js screen
  → Instant render with React Native components
  → Full native UX (smooth scrolling, haptics, etc.)
```

### NavigationDrawer Changes

All secondary links changed from `navigateWebView()` to `navigateTo()`:

| Link | Before | After |
|------|--------|-------|
| About | `navigateTo('/profile/about')` | `navigateTo('/about')` |
| Brand | `navigateWebView('/brand', ...)` | `navigateTo('/brand')` |
| Delivery | `navigateWebView('/delivery', ...)` | `navigateTo('/delivery')` |
| Contact | `navigateTo('/profile/contact')` | `navigateTo('/contact')` |
| FAQ | `navigateWebView('/faq', ...)` | `navigateTo('/faq')` |
| Locations | `navigateWebView('/locations', ...)` | `navigateTo('/locations')` |
| Blog | `navigateWebView('/blog', ...)` | `navigateTo('/blog')` |
| Partners | `navigateWebView('/partners', ...)` | `navigateTo('/partners')` |
| Training | `navigateWebView('/training', ...)` | `navigateTo('/training')` |

**Bundle Builder** still uses `navigateWebView()` — pending Phase 3.

### Standalone vs Profile Screens

Some screens have two versions — one for the hamburger menu (standalone with back arrow) and one for the profile section (with "< Account" navigation):

| Screen | Hamburger Menu Route | Profile Route | Difference |
|--------|---------------------|---------------|------------|
| About | `/about` (`app/about.js`) | `/profile/about` | Back arrow vs "< Account" |
| Contact | `/contact` (`app/contact.js`) | `/profile/contact` | Back arrow vs "< Account" |

## New API Endpoints

### Blog API (Website → Mobile App)

**Endpoint:** `GET /api/mobile/blog`

**Headers:**
- `x-api-key: <MOBILE_APP_KEY>` (required)
- `x-locale: en|ar|ru` (optional, default: en)

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Post Title",
      "slug": "post-slug",
      "excerpt": "Short description...",
      "featuredImage": "/blog/image.png",
      "authorName": "Author",
      "publishedAt": "2026-02-09T...",
      "views": 42
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
```

**File:** `cosmetics-website/app/api/mobile/blog/route.ts`

### FAQ API (Website DB → Mobile App)

**Endpoint:** `GET /api/mobile/faq`

**Headers:**
- `x-api-key: <MOBILE_APP_KEY>` (required)
- `x-locale: en|ar|ru` (optional, default: en)

**Response:**
```json
{
  "title": "FAQ",
  "subtitle": "Frequently Asked Questions",
  "description": "Find answers to common questions...",
  "items": [
    { "id": 1, "question": "What is GENOSYS?", "answer": "GENOSYS is..." }
  ],
  "total": 18,
  "locale": "en"
}
```

**File:** `cosmetics-website/app/api/mobile/faq/route.ts`  
**Source:** `faq_items` database table (managed via admin panel)

### Partners API (Website → Mobile App)

**Endpoint:** `GET /api/mobile/partners`

**Headers:**
- `x-api-key: <MOBILE_APP_KEY>` (required)

**Response:**
```json
{
  "partners": [
    {
      "id": "salon-name",
      "name": "Salon Name",
      "type": "Beauty Salon",
      "description": "Description...",
      "location": "Dubai, UAE",
      "phone": "+971...",
      "website": "https://...",
      "directions": "https://maps...",
      "theme": "emerald"
    }
  ],
  "total": 33
}
```

**File:** `cosmetics-website/app/api/mobile/partners/route.ts`

### Training API (Website → Mobile App)

**Endpoint:** `GET /api/mobile/training`

**Headers:**
- `x-api-key: <MOBILE_APP_KEY>` (required)
- `x-locale: en|ar|ru` (optional, default: en)

**Response:**
```json
{
  "trainingDocuments": [
    {
      "id": "product-catalogue",
      "title": "Product Catalogue 2026",
      "description": "Complete product catalog...",
      "downloadUrl": "https://...",
      "fileSize": "235.5 MB",
      "icon": "book",
      "category": "training"
    }
  ],
  "productDocuments": [
    {
      "id": "radiance-cream",
      "title": "MULTI VITA RADIANCE CREAM",
      "downloadUrl": "https://genosys.ae/documents/ppt/...",
      "fileSize": "2.1 MB",
      "image": "https://genosys.ae/images/RAA.jpg",
      "productId": "31",
      "category": "product"
    }
  ],
  "videos": [
    {
      "id": "bodycell-stretch-mark",
      "title": "Genosys Bodycell Stretch Mark Treatment",
      "youtubeId": "SvjziVjhb8s",
      "thumbnail": "https://img.youtube.com/vi/SvjziVjhb8s/mqdefault.jpg",
      "duration": "15-20 min",
      "level": "Professional",
      "category": "Body Treatments"
    }
  ],
  "stats": { "totalDocuments": 7, "totalProductDocs": 23, "totalVideos": 11 },
  "locale": "en"
}
```

**File:** `cosmetics-website/app/api/mobile/training/route.ts`

## Screen Details

### Brand (`app/brand.js`)
- Hero with logo and badges (Made in Korea, Certified UAE)
- About the Brand section
- Our Mission section
- Key Technologies cards (Stem Cell, Peptide, Bio Growth)
- Brand videos section (YouTube thumbnails, opens externally with haptic)
- Product Showcase section with localized caption
- Footer with company info, tappable `www.genosys.ae` link, and copyright

### Delivery (`app/delivery.js`)
- Express (Dubai, 1-2 hours, 45 AED) and Standard (UAE, 24-36 hours, 70 AED) delivery cards
- Free shipping banner (orders above 1,000 AED)
- Shipping rates table for all 7 emirates (Dubai: 45 AED, others: 70 AED)
- Return policy section (10 days, unopened, 3-5 day refund)
- WhatsApp help button

### FAQ (`app/faq.js`)
- **Database-driven** — fetches from `/api/mobile/faq` (website DB)
- 18 expandable Q&A items with haptic feedback
- Formatted answers (bullets, numbered lists, paragraphs)
- Loading, error, and pull-to-refresh states
- CTA section (WhatsApp + Email buttons with haptics)
- FAQ content managed via admin panel — no code changes needed

### Partners (`app/partners.js`)
- **Database-driven** — fetches from `/api/mobile/partners` (website DB)
- 33 partner locations with dynamic theming
- Expandable cards with Call, Directions, Website actions
- Loading, error, and pull-to-refresh states
- Partners managed via website `lib/partners.ts` — add there, appears in app

### About (`app/about.js`) — Standalone
- Same content as `app/profile/about.js` but with generic back arrow
- Accessed from hamburger menu (route: `/about`)
- Footer with tappable `www.genosys.ae` link + copyright + app version
- The profile version (`app/profile/about.js`) retains "< Account" navigation

### Locations (`app/locations.js`)
- UAE flag hero
- Free shipping banner
- 7 selectable emirate cards with haptic feedback (Dubai: 45 AED, others: 70 AED)
- Dubai highlighted as primary location
- Office location with Google Maps link

### Training (`app/training.js`)
- **API-driven** — fetches from `/api/mobile/training` (website backend)
- Auth-gated (shows login required for non-authenticated users)
- 7 training guides with real download URLs and Ionicons per doc type
- 23 product documentation PDFs with product thumbnail images from website
- 11 video lessons with YouTube thumbnails, duration badges, and level indicators
- Opens videos in YouTube app or browser, PDFs in device native viewer
- Loading, error, and pull-to-refresh states
- Stats badges in hero (guides count, products count, videos count)
- Haptic feedback on document and video taps

### Blog (`app/blog.js`)
- Fetches posts from `/api/mobile/blog`
- Pull-to-refresh
- Image card layout with title, excerpt, date, views
- Opens full post in browser
- Loading and error states

## All Screens Follow These Patterns

1. **Header:** Back arrow + centered title + placeholder spacer
2. **RTL Support:** `isRTL` conditional styling throughout
3. **3 Languages:** EN/AR/RU using `l()` helper or `t()` localization
4. **Safe Area:** `SafeAreaView` wrapper
5. **iOS-native feel:** Card-based layout, system colors, smooth scrolling

## Remaining Work

### Bundle Builder (Phase 3)
The only remaining WebView screen. Requires:
1. New API: `GET /api/mobile/bundle-builder/products` (eligible products by step)
2. New API: `POST /api/mobile/bundle-builder/calculate` (pricing with tiers)
3. Native 8-step stepper UI
4. Product selection grid
5. Running total + discount progress bar
6. Cart integration with bundle metadata

---

## Data Sources Summary

| Screen | Data Source | Update Method |
|--------|-----------|---------------|
| Brand | Hardcoded in `app/brand.js` | Code change |
| Delivery | Hardcoded in `app/delivery.js` | Code change |
| FAQ | **Database** (`faq_items` table) | Admin panel |
| Partners | **API** (`lib/partners.ts` on website) | Edit partners file |
| Locations | Hardcoded in `app/locations.js` | Code change |
| Training | **API** (`/api/mobile/training`) | Update API route on website |
| Blog | **Database** (`blog_posts` table) | Admin panel |
| About | Hardcoded + translations | Code change |
| Contact | Hardcoded + translations | Code change |

---

*Document created: February 10, 2026*  
*Last updated: February 10, 2026*
