# Session Changes — 2026-07-06 — Build Your Set: audit fixes (pricing alignment + labels)

Follow-up to the cross-platform Build Your Set audit
(`cosmetics-website/docs/BUILD_YOUR_SET_AUDIT_2026-07-06.md`).

## 1. Best-discount-wins pricing alignment (`utils/cartUtils.js`)

Bundle ("Build Your Set") lines previously got the bundle tier discount ONLY in mobile
totals, while the server (`cartPricing.ts` `contractBeatsBundle`) and the bag's per-line
badges already gave VIP customers the better personal discount. Result: a VIP >20%
customer saw a HIGHER bag total than Stripe actually charged.

- `calculateCartTotals`: bundle lines now price at `retail × (1 − max(bundlePct, vipPct))`
  when the user has an eligible percentage discount (`isUserDiscountExcludedProduct`
  respected per line — e.g. Hydro Cool Mask keeps the tier discount).
- `computeWaterfallBreakdown`: bundle lines attribute their discount to the winner —
  VIP wins → counted in `userDiscountTotal`; tier wins → `bundleDiscountTotal`.
  (Previously bundle lines were force-excluded from VIP.)

Display now matches what the server charges on all totals, not just line badges.

## 2. Builder screen (`app/bundle-builder.js`)

- **Pricing preview** now best-discount-wins per line (same rule as above), with a
  dynamic discount row label: "Bundle Discount (x%)" / "VIP Discount (y%)" / "Discount"
  (mixed case, e.g. VIP-excluded product in the set).
- **"Required" → "Recommended"**: enforced nowhere (min 2 items is the only gate), so the
  badge was a false promise. Renamed in EN/AR/RU, restyled red → amber, step-pill dot
  amber too. Same decision applied on the website.
- **`formatAed`** used in footer + summary pricing rows (was hardcoded `X.XX AED`).
- Discount rows show whenever there is an actual discount (`discountAmount > 0`),
  covering VIP-only cases below the 2-item tier.

## 3. Catalog changes (server-side, `cosmetics-website` repo)

- Bio Meso PDRN ampoules (60000 / Homecare 5000) now appear in the **Serum** step.
- **SRS (Skin Renewal Peeling System)** re-admitted to the builder → appears in the
  **Peeling** step (was excluded by name). Checkout guards updated to accept it as a
  bundle line. Mobile picks both up automatically via `/api/mobile/bundle-builder`.

## Ship

- OTA published to `production`, runtime 1.10.4 (see commit for update group).
- Server-side changes deployed with the cosmetics-website push (commit `checkoutPricingGuards`,
  bundle-builder API + page).

## Verification

- `npx expo export --platform ios` — bundle compiles.
- Manual math check: VIP 25% + 2-item set (5% tier): line = retail × 0.75, waterfall
  attributes to VIP; non-VIP user: retail × 0.95 attributed to bundle.
