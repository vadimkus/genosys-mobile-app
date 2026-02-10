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

*Session completed: February 10, 2026*
