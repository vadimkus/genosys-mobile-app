# Release Notes — Version 1.10.3 (Build 91)

**App Name:** Genosys UAE
**Bundle ID:** ae.genosys.app
**Version:** 1.10.3
**iOS Build:** 91
**Platform:** iOS (also shipped to Android — versionCode 87)
**Submission focus:** Native in-app payment experience (Stripe Payment Sheet)

---

## App Store "What's New" Text

```
This update brings a faster, fully native checkout.

Card, Apple Pay, Google Pay and Link payments now happen right inside the app with a native payment sheet — no more switching to the browser and waiting for the page to load. You confirm your payment in one tap and see the result instantly.

Apple Pay is now available for one-tap checkout on supported devices. Includes stability improvements and a smoother, more reliable payment flow.
```

---

## What's New in Version 1.10.3

### Native Payment Sheet (Card · Apple Pay · Google Pay · Link)
- **In-app payment** — Card, Apple Pay, Google Pay and Link payments are now processed inside the app using the native Stripe Payment Sheet. The app no longer hands off to Safari / an in-app browser for checkout.
- **Apple Pay** — One-tap Apple Pay checkout on supported devices, presented as the standard native Apple Pay overlay.
- **Instant confirmation** — Payment result is shown immediately after the sheet completes, instead of waiting for a browser page to refresh and the app to poll for status.
- **3-D Secure** — Bank "verify your card" (3DS) challenges are handled in-sheet and return to the app automatically.
- **Hosted fallback retained** — Retrying an older pending order still uses the existing secure hosted checkout, so no in-flight orders break.

### Why this is App Store compliant (physical goods)
- GENOSYS sells **physical cosmetic products** that are shipped to a UAE address.
- Per App Store Review Guideline 3.1.3(e) / 3.1.5, physical goods and services consumed **outside** the app must use standard payment processing, **not** In-App Purchase.
- Payments are processed by **Stripe** (card / Apple Pay / Google Pay / Link). There is no digital content, no subscription, and no in-app purchase. Apple takes no commission on these physical-goods transactions.

### Stability
- Payment flow reliability improvements and reduced checkout wait time.

---

## App Store Connect Metadata

| Field | Value |
|-------|-------|
| Version | 1.10.3 |
| iOS Build | 91 |
| Android Version Code | 87 |
| Runtime Version | 1.10.3 |
| Category | Shopping |
| Content Rating | 4+ |
| Price | Free |
| Min iOS Version | 15.1 |

**Promotional Text (reuse from 1.10.2):**
> Authentic GENOSYS Korean dermacosmetics in the UAE. Shop serums, SPF, masks and professional devices with fast local delivery and secure checkout.

---

## Review Notes for Apple

```
This release replaces the previous browser-based card checkout with the native
Stripe Payment Sheet (card, Apple Pay, Google Pay, Link). Apple Pay is now
enabled in this build.

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
   any CVC, any postal code → payment succeeds, confirmation shown instantly.
7. Apple Pay (on a device with a card in Wallet): the native Apple Pay overlay
   appears in the sheet.
8. Cash on Delivery is also available and requires no in-app payment.

3-D Secure: a 3DS test card presents an in-sheet challenge that returns to the
app automatically. Declines show an error and allow retry.

No new data collection. New native SDK: @stripe/stripe-react-native (Stripe's
official iOS SDK) — used solely to render the payment sheet and Apple Pay.
```

---

## Demo / Test Account

| Field | Value |
|-------|-------|
| **Email** | appreview@genosys.ae |
| **Password** | GenosysReview2026! |

Pre-created, no email verification required. Verified working on production
`https://genosys.ae` (login redirects to /products with a valid session).

**Note:** This account has a VIP discount applied, visible on regular
(non-bundle) product prices.

---

## Payment Information (UPDATED in 1.10.3)

### Native Stripe Payment Sheet
- Card, Apple Pay, Google Pay, and Link are presented in a single native sheet.
- Processed by Stripe; the app receives a PaymentIntent client secret from the
  backend (`/api/mobile/payments/applepay/intent`) and confirms it in-app.
- Review/testing uses Stripe test card `4242 4242 4242 4242` (any future expiry,
  any CVC). No real charges during testing.

### Apple Pay — NOW AVAILABLE
- **Supersedes the previous documentation that stated "Apple Pay NOT available".**
- Apple Pay is enabled as a payment method for **physical goods** via Stripe
  (merchant ID `merchant.ae.genosys.app`, `com.apple.developer.in-app-payments`
  entitlement).
- Standard payment processing — **not** In-App Purchase. Apple takes no
  commission on physical-goods payments.

### Cash on Delivery (COD)
- No payment collected in-app; collected on physical delivery in the UAE.
- Standard payment method in the UAE market.

---

## Important Notes for Reviewers

1. **Physical products only** — All purchases are physical cosmetics shipped
   within the UAE. No digital goods, subscriptions, or in-app purchases.
2. **Payment sheet is in-app** — The key change to verify is that card/Apple Pay
   now run inside the app (native sheet), not in Safari.
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

No **new** permissions added in this release. Apple Pay uses the
in-app-payments entitlement (merchant ID), not a runtime permission prompt.

---

## Technical Summary

### New native dependency
- `@stripe/stripe-react-native@0.50.3` (matched to Expo SDK 54), Stripe's
  official iOS SDK. Used only to present the payment sheet and Apple Pay.

### iOS native config
- `com.apple.developer.in-app-payments` entitlement added with
  `merchant.ae.genosys.app` (added directly to the tracked
  `ios/GenosysUAE/GenosysUAE.entitlements`).
- Stripe pod autolinked via `use_native_modules!`; EAS runs `pod install`.
- EAS regenerated the App Store provisioning profile to include the Apple Pay
  capability during this build.

### App integration
- `<StripeProvider>` mounted at the app root (`app/_layout.js`) with the live
  publishable key + merchant identifier + URL scheme.
- `services/orderService.js` → `createCardPaymentSheetIntent()` requests the
  PaymentIntent and returns the `clientSecret`.
- `app/checkout.js` card branch navigates to `app/payment/stripe.js`, which calls
  `initPaymentSheet` (Apple Pay + Google Pay + 3DS return URL) then
  `presentPaymentSheet`. Hosted-browser fallback retained for retrying older
  pending orders.

### Backend (already deployed — cosmetics-website commit `ded04d4e`)
- `app/api/mobile/payments/applepay/intent/route.ts` PaymentIntent now uses
  `automatic_payment_methods: { enabled: true }`, so the sheet surfaces every
  method enabled in the Stripe Dashboard (card, Apple Pay, Google Pay, Link).
  Server-side pricing/validation, order persistence (upsert by orderNumber), and
  webhook fulfillment unchanged.

### Versioning
- Version `1.10.2 → 1.10.3`, iOS build `88 → 91`, Android versionCode `86 → 87`,
  runtime `1.10.2 → 1.10.3` (new native runtime — a native dependency was added,
  which isolates OTA channels from the previous binary).

---

## TestFlight Test Matrix (build 91 / 1.10.3)

| # | Test | Expected |
|---|------|----------|
| 1 | New checkout → Pay | Native sheet appears in-app (no Safari) |
| 2 | Pay with **card** (`4242…`) | Success shown immediately → order CONFIRMED + emails |
| 3 | Pay with **Apple Pay** | Native Apple Pay overlay → success |
| 4 | Google Pay (Android build) | Success |
| 5 | 3-D Secure card | In-sheet challenge completes, returns to app |
| 6 | Card decline | Error shown, retry possible |
| 7 | EN + AR (RTL) | Sheet + screen render correctly |
| 8 | Cancel the sheet | Returns to screen, can retry |
| 9 | Webhook | Order CONFIRMED + customer/admin emails (verify in DB/admin) |
| 10 | Retry old pending order | Hosted browser fallback still works |

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
| 1.10.3 | 91 | Native Stripe Payment Sheet (card/Apple Pay/Google Pay/Link), Apple Pay enabled, instant in-app confirmation, hosted fallback retained |
| 1.10.2 | 88 | iOS Universal Links (associated domains + AASA), camera usage description, perf/stability |
| 1.10.1 | 83 | Build Your Set discount clarity, dynamic bundle tier fix, checkout pricing display |
| 1.10.0 | 82 | Release hardening |
| 1.8.0 | 74 | In-bag size/color chips, checkout validation, OTA support, 50-issue audit |

---

**Thank you for reviewing Genosys UAE!**
For any questions during review, contact: sales@genosys.ae
