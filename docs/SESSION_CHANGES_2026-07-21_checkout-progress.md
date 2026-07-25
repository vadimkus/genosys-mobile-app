# Native Checkout Progress — 21 July 2026

## Scope

Added the website's journey-level checkout progress pattern to the shared
React Native app for iOS and Android.

## User flow

The progress indicator now appears across the complete purchase journey:

1. **Cart** — at the top of a populated Bag.
2. **Details & payment** — above the order summary on Checkout.
3. **Confirmation** — above the shared success state used by COD, card,
   Apple Pay, and Google Pay flows.

Completed and current segments are green; upcoming segments are gray. Checkout
users can tap the completed Cart step to return to the Bag and edit items.

## Accessibility and localization

- Every step exposes its localized label and status to screen readers.
- The current step uses the native selected accessibility state.
- The interactive Cart step has a minimum 44-point touch target and a
  descriptive accessibility hint.
- Full English, Russian, and Arabic copy is included.
- Arabic uses RTL row order and text direction.

## Files

- `components/checkout/CheckoutSteps.js`
- `components/OrderSuccessScreen.js`
- `app/(tabs)/bag.js`
- `app/checkout.js`
- `i18n/messages/en.json`
- `i18n/messages/ru.json`
- `i18n/messages/ar.json`

## Verification

- `npx tsc --noEmit`
- Translation JSON parse validation
- iOS Expo production bundle export
- Android Expo production bundle export
- IDE diagnostics: no errors

## Production OTA

- Channel / branch: `production`
- Runtime: `1.11.0`
- Platforms: iOS and Android
- Update group: `7f694b78-08e8-4b8f-ba0b-596e967f5fd7`
- Android update: `019f8363-547a-7299-8fc8-54df2beded13`
- iOS update: `019f8363-547a-7e82-aef5-562217f4eb6b`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/7f694b78-08e8-4b8f-ba0b-596e967f5fd7

Users receive the update on app launch; a second cold launch may be needed after
the bundle downloads.
