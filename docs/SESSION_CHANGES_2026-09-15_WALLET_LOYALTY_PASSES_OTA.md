# GENOSYS Rewards wallet passes

**Date:** 15 September 2026  
**Runtime:** 1.12.0 current, 1.13.0 native PassKit candidate
**Delivery:** OTA-compatible; Apple is active and Google remains gated until
publishing access is approved and physically verified.

## Native behavior

- The retail Rewards membership card reads `wallet.apple` / `wallet.google`
  capability flags from the existing membership API.
- iOS requests an Apple installation URL; Android requests Google.
- The authenticated request returns a five-minute HTTPS URL containing no
  bearer token or customer PII.
- `expo-web-browser` opens the provider flow and returns the customer to the
  app when dismissed.
- Runtime 1.12.0 uses Apple's supported direct `.pkpass` browser handoff.
- Runtime 1.13.0 downloads the signed pass to a bounded temporary file and
  presents it directly with native `PKAddPassesViewController`. The controller
  returns `added`, `already_added`, or `cancelled`; no Safari page remains.
- If the native module is unavailable, the proven direct browser flow remains
  as a fallback.
- Partner accounts never reach the Rewards branch and the backend rejects them
  independently.
- EN/RU/AR copy, RTL layout, loading lock, haptic feedback and failure alerts
  are included.

## Release status

- Apple Wallet signing, live issuance, and physical iPhone installation passed.
- Published the iOS production OTA on runtime `1.12.0`:
  `bd494daa-ac73-48b2-b9e8-5975c5be785e`.
- The update message is `Add Apple Wallet rewards card`.
- Published the Apple post-install return fix in iOS update group
  `fd2383e9-7edd-4c5f-8962-d37031005c86`, update
  `01a0a52a-97ed-7e73-8b77-3ffa6ba5e4d1`.
- The follow-up update message is `Fix Apple Wallet return confirmation`.
- Physical testing rejected that web landing page because iOS did not open a
  pass from its hidden frame and the page controls did not return reliably.
  The production website was rolled back to direct `.pkpass` delivery.
- Native PassKit is implemented for version/runtime 1.13.0 and requires a new
  App Store binary. It must not be published as an OTA to runtime 1.12.0.
- Android was intentionally excluded because Google Wallet remains in
  `[TEST ONLY]` demo mode. The publishing-access request was submitted after
  payments profile `6368-1116-8429` was linked; Google quotes a two-to-three
  business-day review.
- Customers may need to fully close and reopen the iOS app twice: the first
  launch downloads the OTA and the next launch applies it.

## Automated verification

- Wallet contract/localization smoke passed.
- Full ESLint passed.
- No-dash guard passed.
- Expo exports passed for both iOS and Android.
- Expo autolinking resolves the local `GenosysWallet` pod in runtime 1.13.0.
