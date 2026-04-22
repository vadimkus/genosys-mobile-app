# Mobile App Parity with Web — 2026-04-17

## Context

Website shipped a week of UI improvements (most notably the profile-edit iOS-native form pass `743e482e` and the favorites empty-state sweep `4fcf9aa2`/`e82573fb`). User asked to port the same changes to the Genosys native apps (iOS + Android) so all three surfaces behave identically. Android via OTA now; iOS bundled into the next TestFlight build.

## Audit — what shipped on web, what applies to mobile app

| Website commit | Surface | Port to app? |
|---|---|---|
| `743e482e` Profile edit iOS-native form pass | Profile → Edit | **YES — ported** |
| `e82573fb`/`4fcf9aa2` Favorites empty-state sweep | Favorites | **YES — copy + login nudge ported** |
| `337ab81b` Mobile-web hamburger dedup | Mobile web menu | N/A (apps use tab bar) |
| `05689100`/`58eeb5ca` Stock: hyaluron 50g | Catalog | N/A (apps read API) |
| `4f8b82d4`/`737fe53b` PWA profile + CLDR plurals + "Genosys Mobile"→"UAE" | PWA profile | N/A (PWA-specific; app IS "Genosys Mobile") |
| `300eec4a` Google Play badge | Mobile web CTA | N/A (it's the app itself) |
| `255e5a48` PDP 5 improvements | Product detail | Already shipped as batches A/B/C (`76d2fc0` / `cb4709b` / `e27dc49`) |
| `4181da36` Products listing UX | Shop tab | Already shipped (`20b2f55`) |
| `ef6192d8` Hero AI CTA | Home hero | Different UX on mobile (out of scope) |

## What was ported

### Profile → Edit (`app/profile/edit.js`)

- **Section headings renamed** (kill dup with page title "Edit Profile"):
  - `profilePicture`: "Profile Picture" → **"Photo"**
  - `personalInfo`: "Personal Information" → **"Name & Contact"**
  - `additionalInformation`: "Additional Information" → **"About You"**
- **Dropped red `*` asterisks** on 5 required fields (firstName, lastName, email, contactEmail, phone). At 5/7 fields they carried no information.
- **Marked DOB + Gender `(optional)`** using the existing `optionalMark` style and `editProfile.optional` key.
- **Readonly Email** now shows a lock icon + muted label + universal **"Used to sign in to your account"** hint. Apple Relay users still get the blue `shield-checkmark` info box beneath — now as secondary context, not the primary explanation.
- **Contact Email hint** softened from amber warning banner (`#FFFBEB` bg + `#B45309`) to neutral gray inline text with mail icon. It's helpful info, not a warning.
- Added new styles: `labelRow`, `fieldLabelMuted`, `textInputReadOnly`, `hintRow`, `hintText`, `hintTextInline`.

### Favorites empty state (`app/favorites.js`)

- `emptyTitle`: "No Favorites Yet" → **"Save What You Love"** (warmer hero)
- `emptySubtitle`: "Tap the heart on any product to keep it close." (explains mechanic)
- **Login nudge** for signed-out guests: "Sign in to sync your favorites across devices" + a `Sign in` action with `log-in-outline` icon. Hidden once authenticated. Favorites are currently per-device, so this exposes sync as a real incentive.
- Uni mascot marked decorative (`accessible={false}`) — the heading already carries the meaning.

### i18n (EN / RU / AR)

Renamed section keys + added `editProfile.emailHint`, `favorites.signInToSync`, `favorites.signIn`. Updated `favorites.emptyTitle` and `favorites.emptySubtitle` across all three locales. JSON parse-verified via `node -e "JSON.parse(...)"`.

## Verification

- `node --check app/profile/edit.js` → OK
- `node --check app/favorites.js` → OK
- `node -e "JSON.parse(...)"` on all three locale files → OK
- `ReadLints` on touched files → clean
- `git diff --stat` → 5 files, +131 / -47

## Deployment

| Platform | How | Status |
|---|---|---|
| Android | `eas update --platform android --channel production` | ✅ Live. Update ID `019db45d-00f2-7e8a-8f2c-5cc85a22c6ff`. Runtime 1.0.0. Reaches all existing installs on next app open. |
| iOS | Git push to main | ✅ Pushed. Will bundle into next TestFlight build (iOS buildNumber already bumped 76→77 in working tree by user — left uncommitted for TF build session). |

## Commit

`814f5b9` — `feat(profile+favorites): parity with web — iOS-native form + warmer empty state`

## Files touched

| Area | File |
|---|---|
| Form UI | `app/profile/edit.js` |
| Empty state | `app/favorites.js` |
| i18n | `i18n/messages/en.json`, `i18n/messages/ru.json`, `i18n/messages/ar.json` |

---

# Round 2 — Checkout + Legal parity (same day, later)

## Context

Web shipped a checkout UI overhaul (commits `b629bd4c`, `e7695343`, `04189e4f`) and a Terms & Conditions `lastUpdated` bump (`97857489`). Ported the applicable parts to native.

## What changed on native

### Checkout (`app/checkout.js` + `components/checkout/*`)

- **Default payment method** → `PAYMENT_METHODS.CARD` on first render (matches web). First-time users now see Card selected, not COD. Existing users keep whatever they saved. Legacy `apple_pay` preference falls through to CARD instead of COD.
- **Order summary pill** — replaced the aggressive red `#dc2626` header with a calm white card:
  - Red-tinted (`#FEE2E2`) circular badge with a `bag-handle` icon in red.
  - Uppercase `ORDER #...` eyebrow (gray, letter-spaced).
  - Bold 18pt total in near-black.
  - Small gray item-count subtitle.
  - Chevron in `#6B7280`, not white.
  - Added `accessibilityRole`, `accessibilityState.expanded`, `accessibilityLabel`.
- **Form inputs** — added autofill hints:
  - firstName: `autoComplete="given-name"` + `textContentType="givenName"`.
  - lastName: `autoComplete="family-name"` + `textContentType="familyName"`.
  - email: `autoComplete="email"` + `textContentType="emailAddress"` + `autoCorrect={false}`.
  - phone: `autoComplete="tel-national"` + `textContentType="telephoneNumber"`.
  - address: `autoComplete="street-address"` + `textContentType="fullStreetAddress"`.
- **Order notes** — `maxLength={500}` to mirror web.
- **Back button (`CheckoutSteps`)** — `accessibilityRole`, `accessibilityLabel={t('common.back')}`, `hitSlop` for a comfortable target.

### Things NOT ported (deliberate)

- **Sticky bottom CTA** — native already has `CollapsibleFooter` with `placeOrderButton`. The web version was catching up to native parity, not the other way around.
- **Delivery location row with Pencil icon** — native uses an emirate-grid selector inside `CheckoutAddressForm`, which is already tactile. Adding a redundant row would hurt rather than help.
- **Free Mask Promotion pill with Clock icon** — native `/bag` uses `ProgressCard` components instead of a promo banner, so there's no "Valid until" line to soften.
- **2026 copyright sweep** — native already renders dynamic `new Date().getFullYear()` and i18n `footerCopyright` already says `2026`. Nothing to do.
- **`PrivacySettings.tsx` "November 2025 → March 2026" note** — no native equivalent exists.
- **iOS Safari 16pt font rule** — web-only rationale; RN inputs are fine at current 15pt.

### Legal

- `i18n/messages/{en,ar,ru}.json` — `terms.lastUpdatedDate`:
  - `"December 11, 2025"` → `"April 17, 2026"` (en).
  - `"11 ديسمبر 2025"` → `"17 أبريل 2026"` (ar).
  - `"11 декабря 2025"` → `"17 апреля 2026"` (ru).
- Privacy Policy `lastUpdatedDate` left unchanged — web content wasn't revised, so the native date shouldn't move either.

## Verification

- `npx expo export --platform android` bundled cleanly (3.79 MB HBC).
- No ESLint / TS errors on the modified files.
- No native (iOS/Android) code changed — OTA-safe.

## Commit

`fc7161d` — `feat(checkout+legal): parity with web — card-default, calm summary, autofill`

## Android OTA

Published to `production` channel:
- Update group ID: `1351cd90-329c-4fec-b10d-71858d47676c`
- Android update ID: `019db625-9ad2-7d64-bde2-f4a9c433f973`
- EAS Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/1351cd90-329c-4fec-b10d-71858d47676c

## iOS

Code committed and pushed; no TestFlight build issued this session. Bundle will ride along on the next iOS release build.

## Files touched (Round 2)

| Area | File |
|---|---|
| Checkout screen | `app/checkout.js` |
| Order summary pill | `components/checkout/CheckoutOrderHeaderCard.js` |
| Form inputs | `components/checkout/CheckoutAddressForm.js` |
| Order notes | `components/checkout/OrderSummaryCard.js` |
| Header a11y | `components/checkout/CheckoutSteps.js` |
| Payment default | `services/paymentPreferences.js` |
| Terms date (i18n) | `i18n/messages/en.json`, `i18n/messages/ar.json`, `i18n/messages/ru.json` |
