# Session: GENOSYS Rewards membership card (2026-07-08)

Companion to `cosmetics-website/docs/SESSION_CHANGES_2026-07-08_LOYALTY_REWARDS_LAUNCH.md`.

## What was added

- `services/api.js` — `fetchMembership(token)` calls `GET /api/mobile/membership` (endpoint existed on backend but the app never used it; now upgraded with partner track + ledger balance)
- `components/MembershipCard.js` — new profile card:
  - **Rewards track:** tier badge (Member/Silver/Gold/Platinum), points balance with AED value, earn-rate multiplier, progress bar to next tier, member number
  - **Partner track:** dark "GENOSYS Professional Partner" card with contractual discount (accounts with ≥20% discount)
  - Hides itself for guests or when the fetch fails; RTL-aware
- `app/profile.js` — card rendered between the profile card and Quick Actions
- i18n: `rewards.*` keys added to EN/AR/RU

## Phase 2 — points redemption at checkout (same day)

- `app/checkout.js`: fetches the rewards balance on mount (retail track only), computes the redeemable quote client-side (blocks of 100 pts = AED 5, max 20% of subtotal, disabled when the account has a personal discount), adjusts the displayed total/VAT, and sends `redeemPoints` with both COD and card submissions (server re-validates and clamps)
- `components/checkout/CheckoutOrderHeaderCard.js`: "★ Use my points (N pts) −AED X" checkbox row between shipping and VAT
- `services/orderService.js`: `redeemPoints` forwarded in `submitCODOrder` and `createCardPaymentSheetIntent` payloads
- i18n: `rewards.useMyPoints` in EN/AR/RU

## Delivery

- JS-only changes → shipped via EAS OTA update (runtime 1.10.5, production branch)
