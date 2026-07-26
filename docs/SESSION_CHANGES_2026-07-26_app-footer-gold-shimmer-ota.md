# App Footer Gold Shimmer OTA

Date: 2026-07-26

## Research

Website luxury gold treatment (certificate page) uses:
1. A sliding shimmer band: `transparent → rgba(218,165,32,0.2) → transparent`
2. A multi-stop gold gradient (`#d4af37` / `#f9e79f`) with animated position
3. Soft gold ornamental accents

Industry best practice for RN (OTA-safe): do **not** animate gradient
colors every frame — slide a narrow gold LinearGradient band with Reanimated
`translateX` inside `overflow: hidden`. Prefer existing deps over Skia for
this use case.

## Fix

`components/AppFooter.js` (shared Account / About / Brand / Training footer):
- Soft gold outer glow (`shadowColor: #D4AF37`)
- Gold hairline border + breathing top gold edge bar
- Diagonal gold shimmer sweep (~2.2s, 2.8s pause) via `react-native-svg`
  LinearGradient + Reanimated
- Gold-tinted wordmark / links
- Respects system Reduce Motion (static gold styling only)

No new native dependencies — OTA-compatible on runtime `1.11.0`.

## Production OTA

- Branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `3f146568-e3df-43fe-b581-04cbdaef88ff`
- Source commit: `c80ffe9`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/3f146568-e3df-43fe-b581-04cbdaef88ff
