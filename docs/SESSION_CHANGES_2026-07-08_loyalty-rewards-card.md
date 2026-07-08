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

## Delivery

- JS-only change → shipped via EAS OTA update (runtime 1.10.5, production branch)
