# GENOSYS Rewards wallet passes

**Date:** 15 September 2026  
**Runtime:** 1.12.0  
**Delivery:** OTA-compatible; do not publish until the website provider
capability is enabled and physically verified.

## Native behavior

- The retail Rewards membership card reads `wallet.apple` / `wallet.google`
  capability flags from the existing membership API.
- iOS requests an Apple installation URL; Android requests Google.
- The authenticated request returns a five-minute HTTPS URL containing no
  bearer token or customer PII.
- `expo-web-browser` opens the provider flow and returns the customer to the
  app when dismissed.
- Partner accounts never reach the Rewards branch and the backend rejects them
  independently.
- EN/RU/AR copy, RTL layout, loading lock, haptic feedback and failure alerts
  are included.

## Release status

- Apple Wallet signing, live issuance, and physical iPhone installation passed.
- Published the iOS production OTA on runtime `1.12.0`:
  `bd494daa-ac73-48b2-b9e8-5975c5be785e`.
- The update message is `Add Apple Wallet rewards card`.
- Android was intentionally excluded because Google Wallet remains in
  `[TEST ONLY]` demo mode pending publishing access.
- Customers may need to fully close and reopen the iOS app twice: the first
  launch downloads the OTA and the next launch applies it.

## Automated verification

- Wallet contract/localization smoke passed.
- Full ESLint passed.
- No-dash guard passed.
- Expo exports passed for both iOS and Android.
