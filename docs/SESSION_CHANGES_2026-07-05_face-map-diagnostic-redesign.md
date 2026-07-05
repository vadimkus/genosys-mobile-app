# Session Changes — 2026-07-05 — Face Map "Living Diagnostic" Redesign

## Context

Follow-up to the interactive skin map feature (commit `e31b408`). Two requests:

1. The "Choose Your Skin Concern" card grid below the face map duplicated the
   map's navigation (same 8 concerns twice on one screen) — mirror of the web
   cleanup done in cosmetics-website commit `e181a4bd`.
2. Make the hotspot dots "beautiful, more interesting" — researched current
   beauty-tech patterns (Revieve LiveAR, Perfect Corp/YouCam, GlowXLab): the
   dominant aesthetic is the AI skin-analysis scanner — scan animations,
   biometric HUD markers, staggered analysis-point reveals.

## Changes

### `components/ConcernFaceMap.js` (redesigned)

- **Scan sweep intro** — a soft light band with a red laser edge sweeps down
  the face once on mount (1.7s); each dot pops in with a spring exactly as
  the scan line passes its latitude (top → bottom).
- **Breathing dots** — smaller frosted-glass dots (13px, translucent white)
  replace the heavy red-ringed dots; pulses have one-time per-dot phase
  offsets (300ms steps) so they travel across the face like a wave instead
  of blinking in unison.
- **Target reticle** — active dot grows a slowly rotating dashed focus ring
  with 4 crosshair ticks (SVG, 7s/rev) — clinical HUD style.
- **Leader-line callout** — zone label chip connects to the dot with a thin
  leader line (medical callout); chip flips below the dot for the scalp zone
  (cy < 18%) to avoid clipping at the card's top edge.
- **Quick chips cloud** — "All concerns" pill chips (icon + short name) below
  the hint/results area give one-tap access to all 8 concerns.
- Uses existing deps only: RN Animated + react-native-svg (15.12.1).

### `app/skin-concerns.js`

- Removed the duplicated "Choose Your Skin Concern" title + 2-column card
  grid (navigation now: map zones + quick chips; concern-detail unchanged).
- Added `short: { en, ar, ru }` labels to each CONCERNS entry (used by the
  chips). `concern-detail.js` consumption of CONCERNS unaffected.
- Cleaned unused imports/styles (Ionicons, Dimensions, grid card styles).

### Excluded

- `utils/badges.js` had an unrelated cosmetic line-reorder — left unstaged.

## Ship

- Bundle validated with `npx expo export --platform ios` (compiles clean).
- OTA: branch `production`, runtime `1.10.4`, iOS + Android,
  update group `c55923dc-6f99-4bf7-8732-51d70a26c78a`.
- Commit `7d5c2a5` pushed to `main`.

## Possible follow-up

- Port the same dot treatment (scan sweep / reticle / breathing pulses) to
  the web `components/products/ConcernFaceMap.tsx` for visual parity.
