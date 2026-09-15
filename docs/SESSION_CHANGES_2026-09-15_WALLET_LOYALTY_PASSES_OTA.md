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

## Release gate

No OTA is published while wallet providers are disabled. Before publishing,
complete the website provider setup, then test Apple Wallet on a physical
iPhone and Google Wallet on an approved Android demo account.

## Automated verification

- Wallet contract/localization smoke passed.
- Full ESLint passed.
- No-dash guard passed.
- Expo exports passed for both iOS and Android.
