# Partner Portal entry on app login

Date: 2026-07-20

## Change

- Added a localized **Partner Portal** entry card to the native app login screen.
- Selecting it sets `/partner-portal` as the authenticated return destination.
- Email/password, Google, Apple, and biometric authentication all preserve that destination through the existing `AuthWrapper` flow.
- The primary CTA changes to **Sign In to Partner Portal** so the selected destination is explicit.
- EN, RU, and AR copy and RTL layout are included.
- Switching from login to registration clears the partner destination so a new retail account is not sent into the partner-only access guard.

## Access control

This is navigation only. It does not weaken access rules: `/partner-portal` remains a protected route, and the portal still requires server-backed `partnerPortalAccess`.

## Release

- Published via EAS Update to branch/channel `production`.
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `f4adcf0a-6ace-492f-8360-fb79d38bbd4a`
- Source commit: `d4ce85a`

