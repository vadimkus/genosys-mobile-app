# Full App Sweep — Analysis Only (2026-07-08)

Analysis session, NO code changes made. Awaiting discussion before action.

## What was done

- Two exhaustive code audits (core logic layers + screens/UX layer)
- Dependency health check (npm outdated / npm audit)
- Competitor research: Sephora, Dermalogica, SkinCeuticals, 2026 beauty commerce benchmarks
- Full report canvas: `~/.cursor/projects/Users-vadimkus-VisionDrive/canvases/genosys-app-sweep-2026-07-08.canvas.tsx`

## Bug counts

- 4 CRITICAL (all in checkout/payment/cart path)
- 13 HIGH, 15 MEDIUM, 7 LOW

## Critical bugs

1. **C1 stripe.js** — cart only cleared when user taps nav button after payment;
   back-gesture leaves paid items in cart (re-order risk)
2. **C2 checkout.js/orderService.js** — orderNumber generated once at mount;
   retry after server error resubmits identical number → duplicate order risk
3. **C3 AuthContext.js** — updateProfile uses stale user.token after async
   setUser fallback → 401
4. **C4 CartContext.js** — promo effect missing shippingRates dep → free-gift
   flicker during startup race

## Notable HIGH

- Payment Sheet not re-initialized after non-cancel error (stale sheet on retry)
- Biometric setup can store plaintext password when token exists
- VAT display can differ from server by ~3.3 AED (shipping VAT ambiguity)
- Favorites sync races → duplicate wishlist entries / dropped local favorites
- RTL never applied on Arabic cold start (hydration guard race)
- Accessibility near-zero on icon-only buttons app-wide (shop/bag/PDP)
- Bag tap targets 32×32 (below 44pt minimum)
- Apple Sign-In errors + ErrorBoundary hardcoded English
- Card payments routed to /payments/applepay/intent (naming risk)

## Systemic patterns

1. Accessibility missing on all icon-only buttons except PDP stepper
2. Silent add-to-cart failures (skin-analysis, camera, bundle-builder) → phantom "Added"
3. Three parallel i18n systems: t() JSON + bundle-builder l() helper + PDP copy map

## Dependencies

- Expo SDK 54 → 57 available (support window closing; upgrade = native build)
- Stripe RN 0.50 → 0.68; Sentry 7 → 8; async-storage 2 → 3
- 23 npm audit vulns — ALL build-time tooling, nothing ships in binary

## Feature gaps vs competitors (ranked by revenue impact)

1. Replenishment reminders (60–90d cycle; highest-leverage retention in beauty)
2. Back-in-stock notify me (S effort)
3. Abandoned-cart push (S effort, infra exists)
4. Loyalty points (Sephora: 80% of sales; SkinCeuticals has B2B pro tier → clinics)
5. Personalized AM/PM routine from skin analysis (feeds #1)
6. Referral program
7. Clinic booking bridge (Dermalogica's core feature)
8. Subscribe & save (2.3x LTV multiplier)
9. UGC / review photos
10. Barcode scanner (authenticity check, distributor positioning)

## Proposed sequencing (pending discussion)

- Phase 1 (OTA, days): critical + payment HIGH fixes, silent cart failures, a11y pass
- Phase 2 (OTA + backend, 1–2 wks): back-in-stock, abandoned cart, replenishment v1,
  medium bugs, i18n consolidation
- Phase 3 (store build): SDK 57 + Stripe/Sentry upgrade, then loyalty/routines/subscriptions

## Open questions for Vadim

1. Loyalty: B2C, B2B pro tier, or both?
2. Replenishment: push only or + WhatsApp (Twilio exists)?
3. Booking: lead form vs full scheduling?
4. Schedule SDK 57 native build with next store release?
