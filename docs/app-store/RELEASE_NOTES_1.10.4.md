# Release Notes — Version 1.10.4 (Build 93)

**App Name:** Genosys UAE
**Bundle ID:** ae.genosys.app
**Version:** 1.10.4
**iOS Build:** 93
**Platform:** iOS (also shipped to Android — versionCode 88)
**Runtime Version:** 1.10.4
**Submission focus:** Full Apple-native UI redesign (whole app) + native in-app payments

---

## App Store "What's New" Text

```
We gave Genosys UAE a clean, modern redesign — top to bottom.

• A refreshed, Apple-style look across every screen — Shop, Product, Bag,
  Checkout, Orders, Favorites and Profile — with soft cards, clearer layouts
  and smoother, scroll-aware navigation.
• Faster, fully native checkout: card, Apple Pay, Google Pay and Link are
  processed right inside the app with a one-tap payment sheet and an instant,
  animated order confirmation.
• A simpler menu — everything now lives neatly in your Profile.
• Polished empty states, a smoother app launch, and many small refinements.

Beautifully localized in English, العربية and Русский.
```

---

## What's New in Version 1.10.4

### Full Apple-native UI redesign (entire app)
- A cohesive, first-party iOS look rolled across **every** screen: grouped
  backgrounds, soft floating cards, scroll-aware navigation headers, Settings-style
  rows with icon tiles, tinted status capsules, and a consistent button hierarchy.
- **Redesigned screens:** Shop, Product, Bag, Checkout, Orders (list + detail),
  Favorites, Profile (and all sub-pages), Sign in / Sign up, the company/info pages
  (About, Brand, Delivery, Contact, FAQ, Locations, Partners, Training, Blog), the
  AI Skin-Analysis flow (concerns, quiz, results, camera results), Bundle Builder,
  the Genie AI chat, and the in-app payment screen.
- **Simpler navigation:** the hamburger menu was removed; all of its destinations
  now live, logically grouped, inside the **Profile** tab (Explore + Information).
- **Polished details:** branded empty states that blend into the background, a
  consistent gray GENOSYS logo on light screens, refined order-success and payment
  screens, and clearer copy (e.g. Cash-on-Delivery confirmation now states the
  confirmation email has already been sent).
- **Fully localized** in English, Arabic (RTL) and Russian — complete translation
  parity across all three languages.

### Native Payment Sheet (Card · Apple Pay · Google Pay · Link)
- **In-app payment** — Card, Apple Pay, Google Pay and Link are processed inside
  the app using the native Stripe Payment Sheet. No browser hand-off.
- **Apple Pay** — One-tap Apple Pay checkout on supported devices.
- **Instant confirmation** — The result is shown immediately after the sheet
  completes (no waiting on a browser page to refresh).
- **3-D Secure** — Bank verification challenges are handled in-sheet and return
  to the app automatically.
- **Hosted fallback retained** — Retrying an older pending order still uses the
  existing secure hosted checkout.

### Unified, modern order confirmation
- A single full-screen success screen (animated checkmark + haptic) is now shown
  for **all** order types — card, Apple Pay, and Cash on Delivery — so the
  confirmation experience is consistent everywhere.

### Smoother app launch (flicker fix)
- The native splash logo is now held on screen until the app's first screen has
  painted, removing the brief logo flicker some users saw at startup. The branded
  launch animation crossfades smoothly into the app.

### Why this is App Store compliant (physical goods)
- GENOSYS sells **physical cosmetic products** shipped to a UAE address.
- Per App Store Review Guideline 3.1.3(e) / 3.1.5, physical goods consumed
  **outside** the app must use standard payment processing, **not** In-App
  Purchase. Payments are processed by **Stripe**. Apple takes no commission on
  these physical-goods transactions.

---

## App Store Connect Metadata

| Field | Value |
|-------|-------|
| Version | 1.10.4 |
| iOS Build | 93 |
| Android Version Code | 88 |
| Runtime Version | 1.10.4 |
| Category | Shopping |
| Content Rating | 4+ |
| Price | Free |
| Min iOS Version | 15.1 |

**Promotional Text (reuse from 1.10.2):**
> Authentic GENOSYS Korean dermacosmetics in the UAE. Shop serums, SPF, masks and professional devices with fast local delivery and secure checkout.

---

## Review Notes for Apple

```
This release ships a full Apple-native UI redesign across the entire app
(presentation only — no change to data handling) and the native Stripe Payment
Sheet (card, Apple Pay, Google Pay, Link) with a unified order confirmation.
The hamburger menu was removed and its items consolidated into the Profile tab.
Apple Pay is enabled in this build.

IMPORTANT — PHYSICAL GOODS / NO IAP:
This app sells physical cosmetic products shipped to a UAE delivery address.
All payments are processed by Stripe using standard payment processing, as
required for physical goods (Guideline 3.1.3 / 3.1.5). There are no digital
goods, subscriptions, or in-app purchases. Apple Pay is used only as a payment
method for these physical goods.

Demo account (no email verification needed):
  Email:    appreview@genosys.ae
  Password: GenosysReview2026!

How to review the new payment sheet:
1. Sign in with the demo account above.
2. Shop tab → add any product to the bag.
3. Bag → Proceed to Checkout → fill delivery details (Emirate: Dubai).
4. Select "Card Payment" → tap Pay.
5. CONFIRM the native payment sheet appears IN-APP (no Safari / browser).
6. Card test: use Stripe test card 4242 4242 4242 4242, any future expiry,
   any CVC, any postal code → payment succeeds, animated confirmation shown.
7. Apple Pay (on a device with a card in Wallet): the native Apple Pay overlay
   appears in the sheet.
8. Cash on Delivery is also available and requires no in-app payment; it shows
   the same confirmation screen.

3-D Secure: a 3DS test card presents an in-sheet challenge that returns to the
app automatically. Declines show an error and allow retry.

No new data collection. Native SDKs in this build: @stripe/stripe-react-native
(payment sheet + Apple Pay) and expo-splash-screen (launch flicker fix).
```

---

## Demo / Test Account

| Field | Value |
|-------|-------|
| **Email** | appreview@genosys.ae |
| **Password** | GenosysReview2026! |

Pre-created, no email verification required. Verified working on production
`https://genosys.ae`.

**Note:** This account has a VIP discount applied, visible on regular
(non-bundle) product prices.

---

## Payment Information (UPDATED in 1.10.3+)

### Native Stripe Payment Sheet
- Card, Apple Pay, Google Pay, and Link are presented in a single native sheet.
- Processed by Stripe; the app receives a PaymentIntent client secret from the
  backend (`/api/mobile/payments/applepay/intent`) and confirms it in-app.
- Review/testing uses Stripe test card `4242 4242 4242 4242` (any future expiry,
  any CVC). No real charges during testing.

### Apple Pay — AVAILABLE
- **Supersedes earlier documentation that stated "Apple Pay NOT available".**
- Enabled as a payment method for **physical goods** via Stripe (merchant ID
  `merchant.ae.genosys.app`, `com.apple.developer.in-app-payments` entitlement).
- Standard payment processing — **not** In-App Purchase. No Apple commission.

### Cash on Delivery (COD)
- No payment collected in-app; collected on physical delivery in the UAE.
- Standard payment method in the UAE market.

---

## Important Notes for Reviewers

1. **Physical products only** — All purchases are physical cosmetics shipped
   within the UAE. No digital goods, subscriptions, or in-app purchases.
2. **Payment sheet is in-app** — Card/Apple Pay run inside the app (native
   sheet), not in Safari.
3. **UAE delivery only** — Ships to all 7 emirates. Dubai 45 AED, other emirates
   70 AED, free over 1,000 AED.
4. **Internet connection required** — Data fetched from `https://genosys.ae/api/mobile/`.
5. **Orders during testing** — Real product data; test orders can be identified
   and cancelled by our team.

---

## Permissions (unchanged)

| Permission | Purpose |
|------------|---------|
| Face ID / Touch ID | Optional biometric login |
| Camera | AI Skin Analysis + profile photo |
| Photo Library | Choose profile / analysis photo |
| Push Notifications | Order status updates |
| Speech Recognition | Voice product search |

No **new** runtime permissions added. Apple Pay uses the in-app-payments
entitlement (merchant ID), not a runtime permission prompt.

---

## Technical Summary

### Native dependencies
- `@stripe/stripe-react-native@0.50.3` — Stripe's official iOS SDK; renders the
  payment sheet and Apple Pay.
- `expo-splash-screen@~31.0.13` — holds the native splash until the JS launch
  layer paints (launch flicker fix).

### iOS native config
- `com.apple.developer.in-app-payments` entitlement with `merchant.ae.genosys.app`
  (in tracked `ios/GenosysUAE/GenosysUAE.entitlements`).
- Both pods autolink via `use_native_modules!`; EAS runs `pod install`. No new
  entitlements vs build 91, so existing provisioning applies.

### App integration
- `<StripeProvider>` at the app root (`app/_layout.js`).
- `SplashScreen.preventAutoHideAsync()` at startup; `hideAsync()` once the JS
  launch cover paints, with a safety fallback so the splash can never stick.
- `app/payment/stripe.js` uses `initPaymentSheet` + `presentPaymentSheet`; on
  success it renders the shared `components/OrderSuccessScreen`.
- `app/checkout.js` (COD) renders the same `OrderSuccessScreen` for a unified
  confirmation.
- `components/VideoLaunchScreen.js` crossfades the logo cover into the splash
  video instead of hard-cutting.

### Backend (already deployed — cosmetics-website commit `ded04d4e`)
- `app/api/mobile/payments/applepay/intent/route.ts` PaymentIntent uses
  `automatic_payment_methods: { enabled: true }`, so the sheet surfaces every
  method enabled in the Stripe Dashboard. Pricing/validation, order persistence,
  and webhook fulfillment unchanged.

### Versioning
- Version `1.10.3 → 1.10.4`, iOS build `91 → 92`, Android versionCode `87 → 88`,
  runtime `1.10.3 → 1.10.4` (native dependency added → new runtime).

---

## TestFlight Test Matrix (build 93 / 1.10.4)

| # | Test | Expected |
|---|------|----------|
| 0 | Browse all tabs (Shop/Orders/Profile) | Redesigned Apple-native UI; menu items live under Profile (no hamburger) |
| 1 | Cold launch | Splash logo holds steady, no flicker; crossfades into app |
| 2 | New checkout → Pay | Native sheet appears in-app (no Safari) |
| 3 | Pay with **card** (`4242…`) | Success → animated confirmation → CONFIRMED + emails |
| 4 | Pay with **Apple Pay** | Native Apple Pay overlay → success |
| 5 | **COD** order | Same animated confirmation screen as card/Apple Pay |
| 6 | Google Pay (Android build) | Success |
| 7 | 3-D Secure card | In-sheet challenge completes, returns to app |
| 8 | Card decline | Error shown, retry possible |
| 9 | EN + AR (RTL) | Sheet, success screen, and launch render correctly |
| 10 | Cancel the sheet | Returns to clean "Secure payment" screen, can retry |
| 11 | Webhook | Order CONFIRMED + customer/admin emails |
| 12 | Retry old pending order | Hosted browser fallback still works |

---

## Compliance Notes

- **Privacy Policy:** in-app (Profile > Privacy Policy) and https://genosys.ae/privacy
- **Terms & Conditions:** in-app (Profile > Terms & Conditions)
- **Data Encryption:** all API traffic over HTTPS/TLS
- **No In-App Purchases:** all transactions are for physical goods via Stripe
- **No prohibited content:** professional cosmetics and beauty products only

---

## Support Information

- **Website:** https://genosys.ae
- **Support Email:** sales@genosys.ae
- **Support Phone / WhatsApp:** +971 58 548 76 65
- **Review contact:** Vadim Sagatdinov, +971 55 915 2985

---

## Version History

| Version | Build | Key Changes |
|---------|-------|-------------|
| 1.10.4 | 93 | Full Apple-native UI redesign across the app; hamburger menu consolidated into Profile; gray logo/empty-state polish; en/ar/ru parity |
| 1.10.4 | 92 | Unified animated order-success (card/Apple Pay/COD), launch flicker fix (expo-splash-screen), native payment sheet polish |
| 1.10.3 | 91 | Native Stripe Payment Sheet (card/Apple Pay/Google Pay/Link), Apple Pay enabled, instant in-app confirmation |
| 1.10.2 | 88 | iOS Universal Links (associated domains + AASA), camera usage description, perf/stability |
| 1.10.1 | 83 | Build Your Set discount clarity, dynamic bundle tier fix, checkout pricing display |
| 1.10.0 | 82 | Release hardening |
| 1.8.0 | 74 | In-bag size/color chips, checkout validation, OTA support, 50-issue audit |

---

**Thank you for reviewing Genosys UAE!**
For any questions during review, contact: sales@genosys.ae
