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
- iOS loads the canonical PDF as the top-level WKWebView document, using
  WebKit's native multi-page PDF renderer for vertical scrolling and pinch zoom.
- Android embeds the production `genosys.ae/pdf-viewer` through the existing
  `react-native-webview` dependency and uses an iOS viewer user agent so the
  website selects its Google Docs rendering path instead of relying on Android
  WebView to render a raw PDF.
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
- Update group: `98dc00d6-5169-47d0-babe-9a5873515ec2`
- Android update: `019fd631-ac02-77aa-942e-250b922c1a3e`
- iOS update: `019fd631-ac02-726c-a882-273000e8635e`
- App commit: `f84387b8cfc1fef0adb106f114d51959e24f117c`
- Dashboard: <https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/98dc00d6-5169-47d0-babe-9a5873515ec2>

## iOS scrolling follow-up

Production testing found that the original iOS implementation displayed page 1
and the `1 / 27` page count, but vertical gestures did not move to later pages.

### Root cause

The native WebView loaded the GENOSYS HTML viewer as its top-level document. That
viewer put Google Docs inside a fixed-height, cross-origin iframe whose parent
was `overflow-hidden`. The injected cleanup expanded the iframe parent to
`100vh`, but it could not remove the nested scroll boundary. iOS WKWebView does
not reliably transfer touch scrolling into a PDF/document viewer nested inside
an iframe. The loading overlay was not the cause because it explicitly used
`pointerEvents="none"`.

### Fix

- iOS now loads the canonical HTTPS PDF directly as the top-level WKWebView
  source. This removes the nested iframe and lets WKWebView's native PDF renderer
  own vertical paging, horizontal interaction, and pinch zoom.
- Android keeps the GENOSYS/Google viewer path because Android WebView does not
  reliably render raw PDFs.
- Scrolling, bounce, indicators, Android nested scrolling, and Android pinch
  zoom are explicitly enabled.
- Viewer cleanup injection and the forced iOS user agent now apply only to
  Android; they cannot alter the iOS native PDF document.
- Security remains unchanged: both the exact canonical PDF and exact viewer URL
  were already allowlisted, while other top-level destinations remain blocked.
- The product-guide smoke now fails if iOS is routed back through the iframe
  viewer or if required scroll/zoom/touch properties disappear.

### Replacement production OTA

- Channel/branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Message: `Fix iOS Product Guide PDF scrolling`
- Update group: pending publication
