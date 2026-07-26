# App Footer Freeze Hotfix OTA

Date: 2026-07-26

## Incident

Production OTA `3f146568` (gold shimmer) froze Account scroll — UI locked,
footer rendered as a large empty dark block with only the gold top edge.

## Cause

Continuous Reanimated + SVG sweep (`withRepeat` / `duration: 0` reset +
`onLayout` measurement) locked interaction on the Account `Animated.ScrollView`.

## Fix

`components/AppFooter.js`: remove all Reanimated/SVG animation. Keep static
gold border, top edge bar, and gold-tinted type. No layout measurement loop.

## Production OTA

- Branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `0b3cfd0b-63b4-4342-8886-6d3a9f213610`
- Source commit: `1cf4731`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/0b3cfd0b-63b4-4342-8886-6d3a9f213610

Supersedes broken shimmer OTA `3f146568`.
