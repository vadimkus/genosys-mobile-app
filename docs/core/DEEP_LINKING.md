# Deep Linking / Universal Links

## Overview

The app supports both **custom URL scheme** (`genosys://`) and **universal links** (`https://genosys.ae/...`), enabling marketing emails, shared product links, and order tracking links to open directly in the app.

---

## Configuration

### iOS - Associated Domains

Configured in `app.json` under `ios.associatedDomains`:

```json
"associatedDomains": [
  "applinks:genosys.ae",
  "applinks:www.genosys.ae"
]
```

**Requirement**: An `apple-app-site-association` (AASA) file must be hosted at `https://genosys.ae/.well-known/apple-app-site-association` with the following structure:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.ae.genosys.app",
        "paths": [
          "/products/*", "/cart", "/orders", "/profile", "/favorites",
          "/skin-recommendation", "/skin-analysis", "/blog/*",
          "/bundle-builder", "/training", "/chat", "/checkout"
        ]
      }
    ]
  }
}
```

Replace `TEAM_ID` with the Apple Developer Team ID.

### Android - Intent Filters

Configured in `app.json` under `android.intentFilters` (updated Jun 1, 2026):

- **Action**: `VIEW`
- **Auto-verify**: `true`
- **Verified host**: `genosys.ae`
- **Supported paths** (20 total):
  - `/products/*`
  - `/cart`
  - `/orders`
  - `/profile`
  - `/favorites`
  - `/skin-recommendation`
  - `/skin-analysis`
  - `/blog`
  - `/bundle-builder`
  - `/training`
  - `/chat`
  - `/checkout`
  - `/track`
  - `/locations`
  - `/brand`
  - `/delivery`
  - `/faq`
  - `/partners`
  - `/about`
  - `/contact`

**Requirement**: A Digital Asset Links file must be hosted at `https://genosys.ae/.well-known/assetlinks.json`.

`www.genosys.ae` is intentionally not listed for Android App Links because it redirects to `genosys.ae`; Google Digital Asset Links requires `/.well-known/assetlinks.json` to be served directly without redirects. The app's URL parser can still route `www.genosys.ae` URLs if they arrive via the custom scheme or other app entry points.

### Custom URL Scheme

The app uses `genosys://` as its custom scheme (configured via `scheme: "genosys"` in `app.json`).

Examples:
- `genosys://product/123` → Opens product detail
- `genosys://chat` → Opens AI chatbot
- `genosys://skin-analysis` → Opens skin analysis

---

## Route Mapping

Updated February 11, 2026 — all screens now route to **native implementations** (no WebView).

| Incoming URL Pattern | App Route | Description |
|---|---|---|
| `*/products` | `/(tabs)/shop` | Product catalog |
| `*/products/{id}` | `/product/[id]` | Product detail page |
| `*/cart` or `*/bag` | `/(tabs)/bag` | Shopping bag |
| `*/orders` | `/(tabs)/orders` | Order history |
| `*/track/{orderNumber}` | `/(tabs)/orders` | Order tracking |
| `*/profile` | `/profile` | User profile |
| `*/favorites` | `/favorites` | Wishlist |
| `*/skin-recommendation` or `*/skin-analysis` | `/skin-analysis` | AI skin analysis |
| `*/chat` | `/chat` | AI chatbot |
| `*/checkout` | `/checkout` | Checkout screen |
| `*/bundle-builder` | `/bundle-builder` | Build Your Set |
| `*/blog` | `/blog` | Blog listing |
| `*/blog/{slug}` | `/blog/[slug]` | Blog article detail |
| `*/training` | `/training` | Professional training |
| `*/locations` | `/locations` | Store locations |
| `*/brand` | `/brand` | Brand page |
| `*/delivery` | `/delivery` | Delivery info |
| `*/faq` | `/faq` | FAQ page |
| `*/partners` | `/partners` | Partners page |
| `*/about` | `/about` | About page |
| `*/contact` | `/contact` | Contact page |
| `*/certificates` | `/webview` | Opens in WebView (only remaining WebView route) |

Locale prefixes (`/en/`, `/ar/`, `/ru/`) are automatically stripped before routing.

---

## Implementation Files

| File | Purpose |
|---|---|
| `utils/deepLinking.js` | URL parsing, route mapping, listener setup |
| `app/_layout.js` | Initializes the deep link listener at app startup |
| `app.json` | iOS `associatedDomains`, Android `intentFilters`, custom `scheme` |

---

## How It Works

1. **Cold start**: `Linking.getInitialURL()` captures the URL that launched the app. After a 500ms delay (to allow navigation to mount), it routes to the matched screen.
2. **Background/foreground**: `Linking.addEventListener('url', ...)` handles URLs received while the app is already running.
3. **Fallback**: Any `genosys.ae` URL that doesn't match a known route is opened in the in-app WebView.

---

## Testing

```bash
# iOS Simulator
xcrun simctl openurl booted "genosys://product/42"
xcrun simctl openurl booted "https://genosys.ae/products/42"

# Android Emulator
adb shell am start -a android.intent.action.VIEW -d "genosys://product/42"

# Expo Go (custom scheme only)
npx uri-scheme open "genosys://product/42" --ios
```

---

## Server-Side Setup Required

For universal links to work in production builds:

1. **iOS**: Host AASA file at `https://genosys.ae/.well-known/apple-app-site-association`
2. **Android**: Host Digital Asset Links at `https://genosys.ae/.well-known/assetlinks.json`
3. Both files must be served with `Content-Type: application/json` and accessible without redirects.
