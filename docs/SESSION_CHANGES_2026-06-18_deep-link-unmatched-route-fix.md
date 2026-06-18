# Session Changes — 2026-06-18: Deep link "Unmatched Route" fix

## Symptom

A customer (Heike Lutz) was sent product links over WhatsApp:

- `https://genosys.ae/products/29`
- `https://genosys.ae/products/32`

Tapping them on a device with the Genosys app installed opened the app and showed
Expo Router's **"Unmatched Route — Page could not be found — `genosys://products/32`"**
screen instead of the product.

## Root cause

- iOS `associatedDomains: ["applinks:genosys.ae"]` + Android intent filters for
  `/products/*` cause those web URLs to open the app.
- The website uses **plural** product URLs (`/products/{id}`), but the app route is
  **singular** (`app/product/[id].js`).
- Expo Router's built-in file-based linking resolves the launching URL first. It
  fails to match `products/{id}` and renders the default "Unmatched Route" screen.
- The custom `setupDeepLinkListener` (in `app/_layout.js`) mapped the URL correctly,
  but it ran too late — Expo Router had already routed to the unmatched screen. It
  also force-redirected product cold-start links to `/auth/login`, which is wrong UX
  for a shared product link.

## Fix

1. **Added `app/+native-intent.js`** — the official Expo Router hook. Its
   `redirectSystemPath({ path })` runs for both cold-start (`initial: true`) and warm
   (`initial: false`) links, *before* route resolution, and rewrites web URL shapes to
   real routes:
   - `/products/{id}` (and `/product/{id}`) → `/product/{id}`  ← the fix
   - `/products` → `/(tabs)/shop`
   - `/products/concern/{slug}` → `/concern-detail?slug=...`
   - `/cart` or `/bag` → `/(tabs)/bag`
   - `/orders` → `/(tabs)/orders`
   - `/track/{orderNumber}` → `/profile/orders/{orderNumber}`
   - `/skin-recommendation` → `/skin-analysis`
   - known 1:1 routes (profile, blog, about, etc.) pass through
   - any other `genosys.ae` page → in-app WebView (no dead ends)
   - locale prefixes (`/en/`, `/ar/`, `/ru/`) stripped

2. **Removed the conflicting `setupDeepLinkListener` registration** from
   `app/_layout.js`. External routing is now owned by `+native-intent.js`, and auth
   gating remains handled declaratively by `app/AuthWrapper.js` (products are not a
   protected route, so shared product links no longer force a login).

3. `utils/deepLinking.js` (`handleDeepLink`) is **kept** — it is still used for
   in-app link taps inside the chat (`app/chat.js`, `components/ChatButton.js`).

## Files changed

- `app/+native-intent.js` (new)
- `app/_layout.js` (removed deep-link listener import + useEffect)
- `docs/core/DEEP_LINKING.md` (updated mechanism + testing)

## Notes

- This is a **JS-only** change (no native config change), so it can ship via EAS
  Update (OTA) on runtime version `1.10.2` without an App Store resubmission.
- Products 29 (Moisture Replenishing Hyaluron Cream) and 32 (Multi Functional
  Anti-Wrinkle Cream) both exist on the site at AED 290 — the URLs were valid; only
  the app's routing was broken.

## Verification

```bash
xcrun simctl openurl booted "https://genosys.ae/products/32"   # → product 32 opens
xcrun simctl openurl booted "https://genosys.ae/products/29"   # → product 29 opens
adb shell am start -a android.intent.action.VIEW -d "https://genosys.ae/products/32"
```
