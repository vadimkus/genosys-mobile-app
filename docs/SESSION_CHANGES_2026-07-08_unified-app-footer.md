# Session Changes — Unified App Footer (2026-07-08)

## Context

User flagged the footer block on the Account screen (GENOSYS / Official
Distributor / www.genosys.ae / copyright / version) as looking unprofessional —
inconsistent spacing, weak hierarchy, and slightly different implementations
copy-pasted across screens. Request: make it professionally formatted and
aligned, apply consistently across other screens, ship OTA.

## What changed

### New shared component: `components/AppFooter.js`

Single source of truth for the brand footer. Design:

- 40px hairline divider on top (visual separation from content)
- `GENOSYS` wordmark — 12px, weight 700, letter-spacing 3 (premium spaced caps)
- Localized tagline (default: "Official Distributor in the UAE" EN/AR/RU),
  overridable via `tagline` prop (Training uses "Professional Training Resources")
- `www.genosys.ae` link — brand red, weight 600, larger tap target, haptic tap
- Single meta line: `© 2026 GENOSYS  ·  All rights reserved  ·  v1.10.5`
  ("All rights reserved" localized for AR/RU; version from `expoConfig.version`,
  hidden via `showVersion={false}` if needed)
- Consistent vertical rhythm (6/12/12), centered, systemGray2 meta color

### Screens updated (replaced bespoke footers)

| Screen | Before |
|---|---|
| `app/profile.js` (Account) | 5-line stacked footer, mixed sizes/colors |
| `app/about.js` | Same block + separate version line |
| `app/brand.js` | Same block, no version |
| `app/training.js` | Different styles (underlined link, label-size wordmark) |

### Screens that gained the footer (had none)

- `app/contact.js`
- `app/partners.js`
- `app/delivery.js`
- `app/locations.js`
- `app/faq.js`

The whole Profile → Information section now ends with an identical,
professionally aligned brand block.

### Cleanup

- Removed duplicated footer StyleSheet blocks from profile/about/brand/training
- Removed now-unused `Linking`/`Constants` imports and `appVersion` var where
  the footer was their only consumer

## Verification

- All 10 touched files parse clean via Babel with `babel-preset-expo`
- No dangling `styles.footer*` references

## Shipping

- Commit `c605f3a` — "Unify screen footers with shared AppFooter brand block"
- OTA published: channel `production`, runtime `1.10.5`, both platforms
  - Update group `86490b6f-93ea-4ecd-a9ac-bb266881b764`
  - Pure JS change — no runtime bump needed
