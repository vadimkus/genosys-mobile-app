# Native Registration Email Domain Validation

Date: 2026-07-21

## Outcome

The native iOS and Android registration screen now detects likely email-provider typos before account creation.

- Practical syntax validation replaces the former minimal regex.
- Common mistakes such as `gmail.con` and `gmial.com` show an inline “Did you mean?” card.
- Users can apply the corrected address in one tap or explicitly confirm the entered address; the app never silently rewrites email.
- The explicit confirmation travels to the shared mobile registration API.
- Server-side DNS validation rejects domains that cannot receive mail, including attempts to retain `gmail.con`.
- Exact server validation messages are now surfaced by the native authentication service.
- EN, RU, and AR copy is included with RTL-compatible layout and 44-point actions.

## Key files

- `app/auth/login.js`
- `utils/emailAddressValidation.js`
- `services/authService.js`
- `i18n/messages/en.json`
- `i18n/messages/ru.json`
- `i18n/messages/ar.json`

The shared API/domain implementation is documented in the website repository:
`docs/SESSION_CHANGES_2026-07-21_EMAIL_DOMAIN_VALIDATION.md`.

## Verification

- TypeScript passed.
- EN/RU/AR JSON parsing passed.
- Native typo-detection smoke passed.
- Expo export passed for iOS and Android.
- Shared mobile registration endpoint:
  - unconfirmed `gmail.con` → `EMAIL_DOMAIN_SUGGESTION`
  - explicitly retained `gmail.con` → `EMAIL_DOMAIN_INVALID`

## Production OTA

Published to the `production` branch/channel for runtime `1.11.0` on 2026-07-21:

- Update group: `a542f8cb-d1b3-497c-a69a-ace97b26d834`
- Platforms: iOS and Android
- Message: `Improve checkout progress and registration email validation`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/a542f8cb-d1b3-497c-a69a-ace97b26d834
