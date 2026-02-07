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
        "paths": ["/products/*", "/cart", "/orders", "/profile", "/favorites", "/skin-recommendation"]
      }
    ]
  }
}
```

Replace `TEAM_ID` with the Apple Developer Team ID.

### Android - Intent Filters

Configured in `app.json` under `android.intentFilters`:

- **Action**: `VIEW`
- **Auto-verify**: `true`
- **Supported paths**: `/products/*`, `/cart`, `/orders`, `/profile`, `/favorites`, `/skin-recommendation`

**Requirement**: A Digital Asset Links file must be hosted at `https://genosys.ae/.well-known/assetlinks.json`.

### Custom URL Scheme

The app uses `genosys://` as its custom scheme (configured via `scheme: "genosys"` in `app.json`).

Examples:
- `genosys://product/123` → Opens product detail
- `genosys://chat` → Opens AI chatbot
- `genosys://skin-analysis` → Opens skin analysis

---

## Route Mapping

| Incoming URL Pattern | App Route | Description |
|---|---|---|
| `*/products/{id}` | `/product/[id]` | Product detail page |
| `*/cart` or `*/bag` | `/(tabs)/bag` | Shopping bag |
| `*/orders` | `/(tabs)/orders` | Order history |
| `*/track/{orderNumber}` | `/(tabs)/orders` | Order tracking |
| `*/profile` | `/profile` | User profile |
| `*/favorites` | `/favorites` | Wishlist |
| `*/skin-recommendation` | `/skin-analysis` | AI skin analysis |
| `*/chat` | `/chat` | AI chatbot |
| `*/checkout` | `/checkout` | Checkout screen |
| `*/blog/*`, `*/training`, `*/brand`, etc. | `/webview` | Opens in in-app WebView |

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
