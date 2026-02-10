# Session Log — February 10, 2026

## Summary

Completed the WebView-to-native migration for ALL 9 screens. The final screen — Bundle Builder ("Build Your Set") — is now fully native with API-driven product data, 8-step routine selection, tiered discounts, and cart integration. Also moved FAQ data from hardcoded translation files to a database-driven API. Added standalone About and Contact pages for hamburger menu navigation. Updated delivery pricing across all screens.

---

## Changes

### 1. FAQ Screen → API-Driven (`app/faq.js`)

**Before:** FAQ content was hardcoded in the app's translation files (`i18n/messages/*.json`).  
**After:** FAQ content is fetched from `GET /api/mobile/faq` on the website backend, which reads from the `faq_items` database table.

- Loading spinner while fetching
- Error state with retry button
- Pull-to-refresh to reload data
- Haptic feedback on accordion toggle (Light) and CTA buttons (Medium)
- Question mark icon removed from hero section
- Formatted answers support: bullet lists, numbered lists, paragraphs

### 2. Standalone About Page (`app/about.js`)

Created a new standalone About page for the hamburger menu with a generic back arrow instead of "< Account" text.

- Same content as `app/profile/about.js`
- Footer: GENOSYS Middle East FZ-LLC, tappable `www.genosys.ae`, copyright, app version
- `app/profile/about.js` unchanged — still shows "< Account" for profile navigation

### 3. Standalone Contact Page (`app/contact.js`)

Created earlier in the session — standalone Contact page for hamburger menu with generic back arrow.

- Same content as `app/profile/contact.js`
- `app/profile/contact.js` unchanged — still shows "< Account"

### 4. NavigationDrawer Updates (`components/NavigationDrawer.js`)

- "About" link → `/about` (standalone, was `/profile/about`)
- "Contact" link → `/contact` (standalone, was `/profile/contact`)

### 5. Brand Page Improvements (`app/brand.js`)

- YouTube WebView embeds → thumbnail images that open externally
- Replaced placeholder YouTube IDs with actual video IDs
- Added "Product Showcase" section with product image
- Added footer: company info, tappable `www.genosys.ae`, copyright

### 6. Delivery Pricing Updates (`app/delivery.js`, `app/locations.js`)

| Emirate | Old Price | New Price |
|---------|-----------|-----------|
| Dubai | 25 AED | 45 AED |
| All others | 30-35 AED | 70 AED |

### 7. Locations Page UX (`app/locations.js`)

- Emirate cards are now selectable with visual highlighting
- Haptic feedback on card selection

### 8. Partners Page → API-Driven (`app/partners.js`)

- Fetches partner data from `/api/mobile/partners` API
- Dynamic theming based on partner data
- Expandable cards with Call, Directions, Website actions
- Pull-to-refresh support

---

## Website Backend Changes (cosmetics-website)

### New Database Model: `FaqItem`

```prisma
model FaqItem {
  id, sortOrder, isActive
  questionEn, answerEn (required)
  questionAr, answerAr (optional)
  questionRu, answerRu (optional)
  createdAt, updatedAt
}
```

18 items seeded from existing translation files.

### New API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/mobile/faq` | GET | FAQ data for mobile app |
| `/api/admin/faq-items` | GET, POST | Admin list + create FAQ |
| `/api/admin/faq-items/[id]` | PUT, DELETE | Admin update + delete FAQ |

### Admin Panel: FAQ Tab

New FAQ management tab in the admin dashboard with full CRUD, reordering, multilingual support, and active/inactive toggling.

### Website FAQ Pages

All 3 locale pages (`/faq`, `/ar/faq`, `/ru/faq`) now fetch FAQ data from the database server-side instead of translation files.

---

## Migration Status

| # | Screen | Status | Data Source |
|---|--------|--------|-------------|
| 1 | Brand | ✅ Native | Hardcoded |
| 2 | Delivery | ✅ Native | Hardcoded |
| 3 | FAQ | ✅ Native + API | **Database** (faq_items) |
| 4 | Partners | ✅ Native + API | **API** (partners endpoint) |
| 5 | Locations | ✅ Native | Hardcoded |
| 6 | Training | ✅ Native | Hardcoded |
| 7 | Blog | ✅ Native + API | **Database** (blog_posts) |
| 8 | About | ✅ Native (standalone + profile) | Translations |
| 9 | Contact | ✅ Native (standalone + profile) | Translations |
| 10 | Bundle Builder | ✅ Native + API | **API** (bundle-builder endpoint) |

**All 9 WebView screens are now fully native.**

---

## Bundle Builder - Native Implementation

### 9. Bundle Builder Screen (`app/bundle-builder.js`)

**Complete native implementation** of the "Build Your Set" feature, replacing the last remaining WebView.

#### Features

- **8-Step Skincare Routine:**
  1. 🧴 Cleanser (required)
  2. ✨ Peeling
  3. 💧 Toner / Mist
  4. 💎 Serum (required)
  5. 🤍 Cream (required)
  6. 👁️ Eye Care
  7. 🧖 Mask
  8. ☀️ Sun Protection

- **Discount Tiers:**
  - 2 products → 5% off
  - 3 products → 10% off
  - 4 products → 15% off
  - 5+ products → 20% off

- **UI Components:**
  - Horizontal step indicator with emoji icons and active highlighting
  - Required steps marked with red dot
  - Product grid (2 columns) with images, names, sizes, pricing
  - Toggle selection with checkmark badges and haptic feedback
  - Progress bar showing current tier and milestones
  - Next-tier hint ("Add 1 more for 10% off!")
  - Active discount badge when discount applies
  - Bottom navigation with Previous/Next/Add to Cart
  - Summary overlay (bottom sheet) with selected items and pricing breakdown
  - User-specific pricing (strikethrough original + green discounted)
  - Login-required message for guests
  - Loading, error, and retry states
  - Full RTL support for Arabic

- **Cart Integration:**
  - Adds all selected products to cart via CartContext
  - Each item tagged with `fromBundle: true` and `bundleDiscountPercent`
  - Navigates to bag after adding

#### API Endpoint

**Endpoint:** `GET /api/mobile/bundle-builder`  
**File:** `cosmetics-website/app/api/mobile/bundle-builder/route.ts`

| Header | Required | Description |
|--------|----------|-------------|
| `x-api-key` | Yes | Mobile app API key |
| `x-locale` | No | `en` / `ar` / `ru` (default: `en`) |
| `x-user-id` | No | User ID for personalized pricing |

**Response:**
```json
{
  "steps": [
    {
      "id": "cleanser",
      "name": "Cleanser",
      "description": "Start with a clean slate",
      "required": true,
      "icon": "🧴",
      "products": [...],
      "productCount": 8
    }
  ],
  "discountTiers": [
    { "minItems": 2, "discount": 5 },
    { "minItems": 3, "discount": 10 },
    { "minItems": 4, "discount": 15 },
    { "minItems": 5, "discount": 20 }
  ],
  "stats": {
    "totalProducts": 45,
    "totalSteps": 8,
    "requiredSteps": 3,
    "maxDiscount": 20
  },
  "locale": "en"
}
```

**Product filtering (same as website):**
- Excludes: Beauty Boxes, PRO Solution, hidden, out of stock, price-on-request
- Excludes: "SKIN RENEWAL PEELING SYSTEM"
- Applies user-specific discount when userId provided

#### Navigation Updates

| File | Change |
|------|--------|
| `components/NavigationDrawer.js` | Bundle Builder → `/bundle-builder` (native) |
| `app/(tabs)/shop.js` | "Build Your Set" banner → `/bundle-builder` (native) |

---

*Session completed: February 10, 2026*
