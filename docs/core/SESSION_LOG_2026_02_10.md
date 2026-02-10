# Session Log - February 10, 2026

## Native Blog Reading & Commenting

### Summary
Converted the blog feature from "open in Safari" to a fully native in-app experience. Users can now read full blog articles and submit comments directly within the app.

### Changes Made

#### 1. Website Backend - New API Endpoints

**`GET /api/mobile/blog/[slug]`** — Blog Post Detail
- Returns full HTML content with localization (EN/AR/RU)
- Sanitizes HTML to prevent XSS
- Removes duplicate featured image from content body
- Parses tags from JSON
- Auto-increments view count (non-blocking)
- Returns approved comments

**`GET/POST /api/mobile/blog/comments`** — Comments API
- GET: Fetch approved comments for a post
- POST: Submit a comment (requires JWT authentication)
- Auto-approves comments from registered users
- Input sanitization via `sanitizeText()`

Files created:
- `cosmetics-website/app/api/mobile/blog/[slug]/route.ts`
- `cosmetics-website/app/api/mobile/blog/comments/route.ts`

#### 2. Mobile App - File Restructure

Moved blog list to directory format for Expo Router compatibility:
- `app/blog.js` → `app/blog/index.js`
- Fixed relative imports: `../contexts/` → `../../contexts/`

#### 3. Mobile App - Blog Post Detail Screen

**New file:** `app/blog/[slug].js`

Features:
- **HTML rendering** via `react-native-render-html`:
  - Custom tag styles (h2, h3, h4, p, lists, blockquotes, links)
  - Inline images with auto URL resolution
  - Selectable text
- Featured image hero
- Article metadata (author, date, views, tags)
- **Comments section:**
  - Avatar initials with user name
  - "Time ago" formatting (e.g., "5m ago", "2h ago", "3d ago")
  - Comment input for logged-in users
  - Login prompt for guests
  - Haptic feedback on submit
- Pull-to-refresh
- Full RTL support (Arabic)
- Tri-language UI (EN/AR/RU)
- Loading, error, retry states

#### 4. URL Resolution Fix

Blog content from the API contains relative URLs like `src="/blog/post_app/app.png"`. These were causing errors in React Native (`about:///blog/...`).

**Fix:** In `fetchPost()`, convert all relative URLs to absolute before setting state:

```javascript
const origin = AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae';
data.post.content = data.post.content
  .replace(/src="\/(?!\/)/g, `src="${origin}/`)
  .replace(/src='\/(?!\/)/g, `src='${origin}/`)
  .replace(/href="\/(?!\/)/g, `href="${origin}/`)
  .replace(/href='\/(?!\/)/g, `href='${origin}/`);
```

#### 5. Navigation Update

Changed blog list to navigate to native detail instead of opening Safari:

```javascript
// Before
const openPost = (slug) => {
  Linking.openURL(`https://genosys.ae/blog/${slug}`);
};

// After
const openPost = (slug) => {
  router.push(`/blog/${slug}`);
};
```

Removed unused `Linking` import from `app/blog/index.js`.

### API Authentication

| Endpoint | Auth Required |
|----------|---------------|
| `GET /api/mobile/blog` | API key only |
| `GET /api/mobile/blog/[slug]` | API key only |
| `GET /api/mobile/blog/comments` | API key only |
| `POST /api/mobile/blog/comments` | API key + JWT token |

### Testing Notes

1. Blog list should still work as before
2. Tapping a blog post opens native detail screen
3. Full article content renders with images
4. Comments display below article
5. Logged-in users can submit comments
6. Guests see "Log in to leave a comment" prompt
7. Pull-to-refresh works on detail screen

### Files Changed

**Website (cosmetics-website):**
- `app/api/mobile/blog/[slug]/route.ts` — NEW
- `app/api/mobile/blog/comments/route.ts` — NEW

**Mobile App (genosys-mobile-app):**
- `app/blog.js` → `app/blog/index.js` — MOVED + MODIFIED
- `app/blog/[slug].js` — NEW
- `docs/core/NATIVE_SCREENS_MIGRATION.md` — UPDATED
- `docs/core/SESSION_LOG_2026_02_10.md` — NEW

---

## Skin Recommendation — Upgraded to API + AI Expert Analysis

### Summary
Upgraded the native Skin Recommendation feature from local-only processing to use the website's backend APIs. The 4-step questionnaire now calls `/api/skin-recommendations` for database-driven product recommendations. The camera analysis now sends photos to `/api/skin-analysis/ai` (GPT-4o-mini vision) for professional AI skin assessment with product recommendations, routines, and tips.

### Changes Made

#### 1. Quiz → Website API (`app/skin-analysis.js`)
- Removed `fetchProducts()` + local `getRecommendations()` matching
- Now calls `GET /api/skin-recommendations?skinType=X&ageGroup=Y&targetConcerns=A,B,C`
- Added haptic feedback to all quiz interactions
- Added error handling with retry UI
- Fixed image URL handling for products (handles both relative and absolute URLs)
- Cleaned up unused imports

#### 2. Camera → AI Expert Analysis (`app/skin-analysis-camera.js`)
- Complete rewrite of the camera results flow
- Captures selfie and resizes to 512px, converts to base64
- Sends to `POST /api/skin-analysis/ai` with locale for localized results
- Displays rich AI results:
  - Health score circle (1-10) with color coding
  - Skin type badge
  - Professional analysis text
  - Key concerns as chips
  - Product recommendations with personalized reasons + "Add to Bag" / "View" buttons
  - AM/PM skincare routine with numbered steps
  - Personalized tips
- Falls back to on-device heuristic analysis if AI endpoint fails
- Haptic feedback throughout

#### 3. Chat Button Hidden (`app/AuthWrapper.js`)
- Added `/skin-analysis` to `CHAT_HIDDEN_ROUTES`

### Files Modified
- `app/skin-analysis.js` — Quiz now calls website API
- `app/skin-analysis-camera.js` — Camera now uses AI Expert Analysis
- `app/AuthWrapper.js` — Hide chat on skin analysis page
- `docs/core/NATIVE_SCREENS_MIGRATION.md` — Added documentation
- `docs/core/SESSION_LOG_2026_02_10.md` — Updated

### APIs Used
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/skin-recommendations` | GET | Quiz-based product recommendations |
| `/api/skin-analysis/ai` | POST | AI vision analysis (GPT-4o-mini) |
| `/api/products/{id}` | GET | Fetch product for cart integration |

#### 4. AI Recommendations — Product Images, Sizes & Prices (`app/skin-analysis-camera.js`)
- After AI analysis completes, fetches full product details from `/api/products/{id}` for each recommended product
- Recommendation cards now display:
  - Product image (72x72 thumbnail)
  - Size below the image (e.g. "30ml")
  - Price in red (e.g. "AED 330") or "Price on Request" in green
  - Product name, AI reason, and Add to Bag / View buttons
- State renamed from `productImages` → `productDetails` to store `{ image, size, price, isPriceOnRequest }`

### Testing
- iOS export: ✅ Compiles successfully
- API `/api/skin-recommendations`: ✅ Returns product array
- API `/api/skin-analysis/ai`: ✅ Responds (returns 400 for missing image as expected)
- API `/api/products/{id}`: ✅ Returns image, size, price fields
- Navigation: ✅ Hamburger → Skin Analysis → Quiz/Camera flows intact

---

## Critical Crash Fix — Builds 49-51 Crashed on Launch

### Problem
Builds 49, 50, and 51 (all v1.3.0) crashed immediately on launch, before the login screen could render. The app was unusable.

### Root Cause
**`contexts/NotificationContext.js`** — The `NotificationProvider` wraps the entire app in `_layout.js`. Its `useEffect` called `expo-notifications` APIs (`addNotificationReceivedListener`, `addNotificationResponseReceivedListener`, `getLastNotificationResponseAsync`) without any error handling. If any of these calls threw an error during initialization (e.g., notification entitlement issues, native module initialization failure), the entire app crashed because the error propagated up through the provider tree.

This was introduced in commit `b7cccf5` (push notifications feature) and was included in every build since, but was never tested on TestFlight until now.

### Fix (Build 52 — Working)
Wrapped all `expo-notifications` calls in `NotificationContext.js` with try-catch blocks:
- Outer try-catch around the entire `useEffect` body
- Inner try-catch for each listener callback
- `.catch()` on the `getLastNotificationResponseAsync()` promise
- Try-catch on cleanup in the return function

If `expo-notifications` fails, the app continues to work normally — push notifications are gracefully degraded instead of crashing the app.

### Additional Fix (Build 53)
- **`app/blog/[slug].js`** — Wrapped `react-native-render-html` import in try-catch with fallback to plain text rendering. The library (v6.3.4, 4 years old) has known compatibility issues with React Native 0.78+.
- **5 files** — Fixed `import { AUTH_CONFIG }` (named import) to `import AUTH_CONFIG` (default import). `config/auth.js` uses `export default`, so the named import resulted in `undefined`. Files fixed: `app/blog/index.js`, `app/blog/[slug].js`, `app/bundle-builder.js`, `app/training.js`, `app/profile/orders/[id].js`.

### Build History
| Build | Version | Status | Issue |
|-------|---------|--------|-------|
| 47 | 1.1.0 | ✅ Working | App Store approved |
| 48 | 1.2.0 | ❌ Crash | Never tested (same bug) |
| 49 | 1.3.0 | ❌ Crash | NotificationContext crash |
| 50 | 1.3.0 | ❌ Crash | Same (clean cache rebuild) |
| 51 | 1.3.0 | ❌ Crash | AUTH_CONFIG fix alone insufficient |
| 52 | 1.3.0 | ✅ Working | NotificationContext try-catch fix |
| 53 | 1.3.0 | ✅ Working | + react-native-render-html safe-load |

### Files Changed
- `contexts/NotificationContext.js` — All notification listeners wrapped in try-catch
- `app/blog/[slug].js` — Safe-load `react-native-render-html`, fallback to plain text
- `app/blog/index.js` — Fixed AUTH_CONFIG import
- `app/bundle-builder.js` — Fixed AUTH_CONFIG import
- `app/training.js` — Fixed AUTH_CONFIG import
- `app/profile/orders/[id].js` — Fixed AUTH_CONFIG import

### Lesson Learned
Any code that runs at app startup (context providers, module-level imports) must be wrapped in try-catch. A single unhandled error in a provider that wraps the app tree will crash the entire app before any UI renders.

---

*Session updated: February 10, 2026*
