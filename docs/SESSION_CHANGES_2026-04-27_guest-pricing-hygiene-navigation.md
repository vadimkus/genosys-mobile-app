# Session Changes — Guest Pricing, Hygiene, Navigation

Date: 2026-04-27

## Context

Implemented the first production-hardening and conversion/navigation chunks after the mobile app audit.

## Changes

- Made catalogue browsing guest-accessible while keeping account, orders, bag, checkout, payment, and chat routes protected.
- Preserved protected-route intent through login using `returnTo` params in `app/AuthWrapper.js`.
- Hid product prices from logged-out users across shop cards, product detail, favorites, skin analysis recommendations, concern routines, and shared product cards.
- Kept cart/order/checkout pricing visible only behind authenticated/protected routes.
- Routed `/track/...` deep links to the native order-detail screen instead of the generic orders tab.
- Wired the previously unused `NavigationDrawer` into the shop header.
- Removed visible order empty-state diagnostics from `app/profile/orders.js`.
- Installed and initialized `@sentry/react-native`; Sentry uploads activate when `EXPO_PUBLIC_SENTRY_DSN` is configured.
- Stopped showing backend/debug delete/payment failure details in order alerts.
- Fixed the visible `includees` typo in the Cushion BB size label.

## Follow-Up: Order/Payment Reliability

- Moved `services/orderService.js` order creation, card checkout, and payment-resume calls from raw `fetch` to `authenticatedFetch`, so expired tokens can refresh and retry during checkout-critical calls.
- Added shared response parsing and safe user-facing order/payment errors while retaining backend details in logs.
- Updated `app/payment/stripe.js` Stripe status refresh to use `authenticatedFetch` with API key and bearer token.
- Kept payment status screen user copy generic on failures instead of rendering raw exception text.

## Verification

- `ReadLints` on edited files: no diagnostics.
- `npm run smoke:pricing-display`: passed.
- `npm run smoke:cart-pricing-contract`: passed.
- `npm run smoke:order-payload-pricing-contract`: passed.
- `npx expo export --platform ios --output-dir /tmp/genosys-mobile-export-verify --clear`: passed.
- `npx expo export --platform android --output-dir /tmp/genosys-mobile-export-android-verify --clear`: passed.
- `npx expo-doctor`: 16/17 passed; one existing non-CNG warning remains because native `android/ios` folders are present while app config also contains native config fields.
- After order/payment follow-up, re-ran `ReadLints`, all smoke tests, and iOS/Android exports: passed.
