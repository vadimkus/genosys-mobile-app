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
- Platforms: iOS and Android
- Update group: `6cb45b04-6f96-4dac-a8a3-0b3528b371d0`
- Source commit: `8ce2f45`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/6cb45b04-6f96-4dac-a8a3-0b3528b371d0
