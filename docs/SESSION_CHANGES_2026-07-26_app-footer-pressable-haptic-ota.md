# App Footer Pressable + Haptic OTA

Date: 2026-07-26

## Change

`components/AppFooter.js` — keep original white/graphite styling.
Whole card is pressable → `https://www.genosys.ae` with medium haptic.
Website / email links keep their own targets + medium haptic.
Press opacity feedback only (no gold frame / no continuous animation).

## Production OTA

- Branch: `production`
- Runtime: `1.11.0`
- (group filled after publish)
