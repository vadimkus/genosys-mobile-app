# Profile Partner Card Spacing OTA

Date: 2026-07-21 (republished 2026-07-25)

## Issue

On partner accounts, the black Partner Portal card sat only 4 px above the
Orders/Bag cards. Their rounded surfaces and shadows visually overlapped.

## Fix

- Increased the Partner Portal card's bottom separation to 16 px.
- Limited the partner terms subtitle to two lines with an explicit 16 px line
  height so longer English, Russian, and Arabic text cannot push unpredictably
  into the next row.
- No native dependency or configuration changed; the fix is OTA-compatible.

## Regression

The first production publish (2026-07-21, group `40aecb30-b398-4d6d-bb79-300ce8f26219`)
worked, but the change was never committed. Later OTAs (checkout progress, email
validation, search relevance) were built from `main` with `marginBottom: 4` and
overwrote the fix. Republished 2026-07-25 with the spacing change committed.

## Production OTA (2026-07-25 republish)

- Branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `433a73c2-dc3e-44a6-85e6-2b995d31703a`
- Source commit: `789c586e6bc66df60dfe31c9e8e0543af84207b0`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/433a73c2-dc3e-44a6-85e6-2b995d31703a
