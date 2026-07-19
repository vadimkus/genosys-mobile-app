# Native Clinic Homecare Scripts

Date: 2026-07-19
Status: implemented and bundled locally; no OTA or build submission

## Native workflow

- Partner Portal includes a Homecare Scripts shortcut.
- Clinic users can create recommendations from retail products, add an internal patient reference and product-use notes, edit into immutable versions, share through the native iOS/Android share sheet, and revoke links.
- Available and pending Clinic Points are visible in the native screen.
- Clinics can review recent Clinic Points transactions and apply available points to paid, credit, or COD partner orders.
- Consignment stock orders cannot consume points because settlement happens later through the consignment report.
- The patient continues on the responsive website via the private `/r/{token}` link; no patient app installation or login is required.

## Integration

- Screen: `app/homecare-scripts.js`
- API client: `services/homecareService.js`
- Partner order submission sends the requested Clinic Points amount; the website API rechecks and caps the spend atomically.
- Authentication uses the existing native API key plus bearer token.
- API origin uses `AUTH_CONFIG.WEB_ORIGIN`, while product images use `AUTH_CONFIG.ASSET_ORIGIN`.

## Local verification

- TypeScript check: pass.
- iOS Metro production export: pass.
- Android Metro production export: pass (initial Homecare implementation).
- `/r/*` association and fallback verification (`npm run verify:homecare-links`): pass.
- The iOS AASA explicitly excludes `/r/*`, and Android intent filters leave it unclaimed, so patient links open the responsive website even when the app is installed. Manually invoked scheme links are opened in a browser context rather than the generic in-app WebView, preserving the website cart and checkout.
