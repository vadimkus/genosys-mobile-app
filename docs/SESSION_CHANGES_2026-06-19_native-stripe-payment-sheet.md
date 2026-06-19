# Session Changes — 2026-06-19: Native Stripe Payment Sheet

## Goal

Replace the Safari/in-app-browser hosted-checkout hand-off for card payments
with the **native Stripe Payment Sheet** (`@stripe/stripe-react-native`), giving
an in-app card + Apple Pay + Google Pay + Link experience with no browser
redirect and instant confirmation.

## Why (correcting a prior misconception)

`services/orderService.js` previously noted Apple Pay was removed "due to Apple's
high in-app payment fees (15-30%)". That is **incorrect for this business**:
Apple's IAP commission applies only to *digital* goods consumed in-app. GENOSYS
sells **physical goods**, which Apple *requires* to use standard payment
processing and takes **no commission**. Native Apple Pay via Stripe costs only
Stripe's normal fee (~2.9% + AED 1), same as a card. So the native sheet is fully
App Store compliant and fee-free.

## Backend (cosmetics-website — already deployed, commit ded04d4e)

- `app/api/mobile/payments/applepay/intent/route.ts`: PaymentIntent now uses
  `automatic_payment_methods: { enabled: true }` (was `payment_method_types:
  ['card']`) so the sheet surfaces every method enabled in the Stripe Dashboard
  (card, Apple Pay, Google Pay, Link). Server-side pricing/validation, the
  upsert-by-orderNumber order persistence, and webhook fulfillment are unchanged.
- The route returns `{ success, orderId, orderNumber, paymentIntentId,
  clientSecret }` and is the single source of the client secret for the sheet.

## Mobile app changes

### Dependency + native config
- `@stripe/stripe-react-native@0.50.3` (Expo SDK 54 matched via `expo install`).
- `app.json` config plugin: `merchantIdentifier: "merchant.ae.genosys.app"`,
  `enableGooglePay: true`.
- **iOS is a tracked bare project** and the iOS production EAS profile uses a
  custom `prebuildCommand` (`sync-runtime-version.js`), so `expo prebuild` does
  NOT run for iOS — the config plugin's Apple Pay entitlement is **not**
  auto-applied. It was therefore added manually to the committed
  `ios/GenosysUAE/GenosysUAE.entitlements`:
  `com.apple.developer.in-app-payments = [merchant.ae.genosys.app]`.
  The Stripe pod still links automatically because the `ios/Podfile` uses
  `use_native_modules!` autolinking (EAS runs `pod install`).
- Android is gitignored and regenerated via `expo prebuild` on its build profile,
  so the config plugin (incl. Google Pay) applies automatically there.

### Config
- `config/auth.js`: new `STRIPE` block — `publishableKey` (public `pk_live`, env
  override `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`), `merchantIdentifier`
  (`merchant.ae.genosys.app`), `merchantCountryCode: 'AE'`, `merchantDisplayName:
  'Genosys UAE'`, `urlScheme: 'genosys'`.

### Provider
- `app/_layout.js`: app wrapped in `<StripeProvider>` (publishableKey +
  merchantIdentifier + urlScheme) at the root.

### Order flow
- `services/orderService.js`: new `createCardPaymentSheetIntent(orderData)` →
  POSTs `/payments/applepay/intent`, returns `{ success, orderId, orderNumber,
  clientSecret }`. `submitCardOrder` (hosted) retained but no longer used by new
  checkout. Default export updated.
- `app/checkout.js`: card branch now calls `createCardPaymentSheetIntent` and
  navigates to `/payment/stripe` with `clientSecret` (was `paymentUrl`).
- `app/payment/stripe.js`: rewritten to support **both**:
  - `clientSecret` present → native Payment Sheet (`initPaymentSheet` with
    Apple Pay + Google Pay params + `returnURL` for 3DS, then
    `presentPaymentSheet`). On success shows confirmation immediately (webhook
    finalizes server-side); a best-effort status sync runs in the background.
  - `paymentUrl` present → hosted browser fallback (unchanged) — used by the
    "retry an older pending order" entry points in `profile/orders.js` and
    `profile/orders/[id].js`, which still pass `paymentUrl`.

### Versioning
- `app.json`: version `1.10.2 → 1.10.3`, iOS buildNumber `88 → 89`, Android
  versionCode `86 → 87`, runtimeVersion `1.10.2 → 1.10.3` (new native runtime
  because a native dependency was added — keeps OTA channels isolated from the
  old binary).

## Validation done
- `app.json` valid JSON; `expo-doctor` 17/17 checks pass.
- All changed JS/JSX babel-parse clean.
- Order smoke tests pass (`smoke:order-payload-pricing-contract`,
  `smoke:orders-repository`).
- Backend: tsc clean, build passes, 248 jest tests green (deployed).

## Known scope notes
- "Retry pending order" (orders list/detail) intentionally keeps the hosted
  browser fallback for now; can be migrated to the sheet later (the intent route
  upserts by orderNumber, so it's safe to reuse).
- Apple Pay requires the App ID Apple Pay capability + provisioning profile to
  include `merchant.ae.genosys.app`. EAS should sync this when it sees the new
  entitlement; approve any credential prompts during the build.

## TestFlight test matrix (build 89 / 1.10.3)
1. New checkout → Pay → native sheet appears in-app (no Safari).
2. Pay with **card** → success shown immediately → order CONFIRMED + emails.
3. Pay with **Apple Pay** (native overlay) → success.
4. Google Pay (Android build) → success.
5. 3-D Secure card → in-sheet challenge completes.
6. Card decline → error shown, can retry.
7. EN + AR (RTL) render.
8. Cancel the sheet → returns to screen, can retry.
9. Webhook → order CONFIRMED + customer/admin emails (verify in DB/admin).
