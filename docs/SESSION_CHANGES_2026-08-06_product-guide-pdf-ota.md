# In-app Product Guide PDF experience — 2026-08-06

## Summary

Product documentation now opens in a dedicated native app screen instead of
leaving GENOSYS through `Linking.openURL`.

## UX

- Native Back control returns to the still-mounted product page, preserving its
  scroll position, selected variant, gallery position, video state, and expanded
  sections.
- Native Download, Share, and Open Externally actions remain visible below the
  document.
- The production `genosys.ae/pdf-viewer` is embedded through the existing
  `react-native-webview` dependency. An iOS viewer user agent is used on both
  platforms so the website selects its Google Docs rendering path instead of
  relying on Android WebView to render a raw PDF.
- Website toolbar, navigation, footer, and chat controls are hidden so the
  document is framed only by native app chrome.
- Loading percentage, progress bar, 30-second timeout, retry, HTTP/network error,
  invalid-link, and offline-friendly states are included.

## Security and URL handling

- Only HTTPS PDFs on the exact `genosys.ae` host are accepted.
- Top-level WebView navigation is restricted to the exact GENOSYS viewer and
  canonical PDF URLs.
- The production viewer's `docs.google.com/viewer` iframe is allowed only as a
  subframe.
- Existing path case is preserved, including `/documents/PPT/...`.
- Viewer construction keeps already encoded filename characters intact across
  the query-string layer, including spaces and `%26`.

## Download behavior

- Download uses Expo FileSystem's installed legacy-compatible API with byte
  progress and caches PDFs under the app cache directory.
- A cached PDF is reused on later taps, including while offline.
- After download, iOS opens the native share/preview sheet for the local file.
  Android converts the local file to a content URI and asks the system to open
  it with an installed PDF-capable app. Because `expo-sharing` is not present in
  the store binary, direct cross-platform attachment sharing was intentionally
  not added; adding that native module would not be OTA-safe.

## Files

- `app/product-guide.js`
- `app/product/[id].js`
- `app/AuthWrapper.js`
- `utils/productGuide.js`
- `i18n/messages/en.json`
- `i18n/messages/ru.json`
- `i18n/messages/ar.json`
- `scripts/smoke-product-guide.js`
- `package.json`

## Verification

- `npm run smoke:product-guide`
- `npm run verify:release`
- `npx tsc --noEmit`
- iOS and Android Expo exports
- `npx expo-doctor`

## Production OTA

- Channel/branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Message: `Add polished in-app product guide PDF viewer`
- Update group: pending publication
