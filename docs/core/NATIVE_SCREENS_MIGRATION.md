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
| 3 | FAQ | ✅ Native | `app/faq.js` | 17 Q&As, expandable accordion |
| 4 | Partners | ✅ Native | `app/partners.js` | Partner list, CTA |
| 5 | Locations | ✅ Native | `app/locations.js` | 7 UAE emirates, office location |
| 6 | Training | ✅ Native | `app/training.js` | Auth-gated, docs + videos |
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
| Brand | `navigateWebView('/brand', ...)` | `navigateTo('/brand')` |
| Delivery | `navigateWebView('/delivery', ...)` | `navigateTo('/delivery')` |
| FAQ | `navigateWebView('/faq', ...)` | `navigateTo('/faq')` |
| Locations | `navigateWebView('/locations', ...)` | `navigateTo('/locations')` |
| Blog | `navigateWebView('/blog', ...)` | `navigateTo('/blog')` |
| Partners | `navigateWebView('/partners', ...)` | `navigateTo('/partners')` |
| Training | `navigateWebView('/training', ...)` | `navigateTo('/training')` |

**Bundle Builder** still uses `navigateWebView()` — pending Phase 3.

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

## Screen Details

### Brand (`app/brand.js`)
- Hero with logo and badges (Made in Korea, Certified UAE)
- About the Brand section
- Our Mission section
- Key Technologies cards (Stem Cell, Peptide, Bio Growth)
- Brand videos section (YouTube embeds via WebView)
- Footer with company info

### Delivery (`app/delivery.js`)
- Express (Dubai, 1-2 hours) and Standard (UAE, 24-36 hours) delivery cards
- Free shipping banner (orders above 1,000 AED)
- Shipping rates table for all 7 emirates
- Return policy section (10 days, unopened, 3-5 day refund)
- WhatsApp help button

### FAQ (`app/faq.js`)
- Hero section with icon
- 17 expandable Q&A items (reuses `help.faqItems` translation keys)
- Formatted answers (bullets, numbered lists, paragraphs)
- CTA section (WhatsApp + Email buttons)

### Partners (`app/partners.js`)
- Hero section
- 8 partner salons with icons, types, and locations
- "Become a Partner" CTA with email link

### Locations (`app/locations.js`)
- UAE flag hero
- Free shipping banner
- 7 emirate cards with delivery times and shipping costs
- Dubai highlighted as primary location
- Office location with Google Maps link

### Training (`app/training.js`)
- Auth-gated (shows login required for non-authenticated users)
- 7 training document cards with download links
- 5 training video cards
- Opens PDFs in native viewer, videos in YouTube

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

*Document created: February 10, 2026*
