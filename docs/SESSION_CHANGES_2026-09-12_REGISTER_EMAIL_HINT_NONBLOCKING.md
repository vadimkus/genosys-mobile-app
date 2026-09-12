# Register: did-you-mean hint no longer blocks (12 Sep 2026)

Ships with the next app release (pending, not yet built).

- `utils/emailAddressValidation.js`: known-domain list extended with ~35 real providers (mac.com, msn.com, gmx.*, mail.kz, yandex.kz, yahoo.co.in, inbox.lv, live.ae, eim.ae, ...) so they stop being "corrected". Mirrors the website list.
- `utils/authValidation.js`: an unconfirmed suggestion no longer sets `errors.email`. The amber hint with "Use this email" / "Keep what I entered" still renders in `app/auth/login.js`; tapping Create account keeps the address and sends `emailSuggestionConfirmed: true`.
- `scripts/smoke-auth-validation.js` scenario updated; 16 scenarios x 3 locales pass.
- Server (`/api/mobile/auth/register`) now returns a localized "You already have an account with this email, log in or use Forgot password" with `code: 'ACCOUNT_EXISTS'`; the app already surfaces `result.error`, so it shows without an app change.

Why: customers reported "invalid mail, cannot register". Web analysis in cosmetics-website `docs/SESSION_CHANGES_2026-09-12_REGISTRATION_EMAIL_FRICTION.md`.
