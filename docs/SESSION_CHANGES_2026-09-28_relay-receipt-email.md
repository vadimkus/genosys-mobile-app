# Checkout: real receipt email for Apple Hide My Email accounts (28 Sep 2026)

The website stopped sending any mail to `@privaterelay.appleid.com` (it is never delivered from
our Gmail sender). All 16 relay orders on record came from the app, because checkout pre-filled
the relay address. 9 of those accounts had no contact email, so they got no confirmation.

## Change (commit `475a206`)

- `app/checkout.js`: relay accounts with no saved contact email start with an empty email field
  instead of the relay address. A relay address is rejected (`checkout.validationRelayEmail`).
  "Receipt goes to {email}" sits above the Pay button for relay accounts once a valid email is in.
- `components/checkout/CheckoutAddressForm.js`: hint under the email field for relay accounts
  (`checkout.receiptEmailHint`), replaced by the error when one shows.
- New keys in `i18n/messages/{en,ru,ar}.json` under `checkout`.
- Asked at checkout only, next to address and phone; never at sign-in (App Review 4.8 / 5.1.1).
  If review ever objects, make the field optional for relay accounts.

## Server side (website `34bd2c360`)

`/api/mobile/orders`, `/api/mobile/checkout/stripe`, `/api/mobile/payments/applepay/intent` save
the typed email as the account's `contactEmail` when the account is relay and has none, so every
later confirmation, status update and review request goes there. Works with older app builds too
(they only benefit when the customer overwrites the pre-filled relay address).

## Release

- `npm run verify:release` passed.
- OTA: `npx eas-cli@latest update --branch production --environment production --platform all`,
  runtime `1.13.0`, update group `54f0b73f-c01a-47cd-871e-a15249b0383e`.
