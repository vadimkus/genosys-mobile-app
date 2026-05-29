# Device Info Headers — Admin Notification Device Type Fix (OTA)

Date: 2026-05-29

## Context

Admin "New User Registration" emails for users who registered **via the mobile
app** showed **Device Type: Desktop** instead of Mobile.

Root cause was server-side, but driven by the app: the native HTTP client uses
plain `fetch`, which sends a native `User-Agent`
(`GenosysUAE/… CFNetwork/… Darwin/…` on iOS, `okhttp/…` on Android). None of
these contain `mobile`/`iphone`/`android`, so the website's `parseUserAgent()`
defaulted to `desktop`. Because `/api/mobile/*` is gated by the mobile
`x-api-key`, every request is from the app — so "desktop" was always wrong.

## Native App Changes Published

- Added `utils/deviceInfo.js`:
  - `getDeviceInfo()` derives `deviceType` (`mobile`/`tablet`, never desktop),
    `os`, `osVersion`, and best-effort `deviceModel` from `Platform`
    (`Platform.OS`, `Platform.isPad`, `Platform.Version`, `Platform.constants`)
    and `expo-constants` (`Constants.deviceName`).
  - `deviceInfoHeaders()` builds `x-app-platform`, `x-device-type`,
    `x-device-os`, `x-device-os-version`, `x-device-model`. Wrapped in
    `try/catch` so device-info collection can never break an auth request.
- `services/authService.js`: register, Google, and Apple auth requests now
  attach `...deviceInfoHeaders()`.

No native dependencies were added (`expo-constants` was already in the build,
`Platform` is core React Native), so this is a **JS-only OTA** — no
`runtimeVersion` bump.

## Server (cosmetics-website) Changes

Committed and pushed separately in `cosmetics-website` commit `1453608a`:

- `lib/deviceDetection.ts`: added `resolveDeviceInfo(headers, { fallbackDeviceType })`
  which prefers explicit `x-device-*` headers, falls back to UA parsing, and
  defaults to `mobile` (never `desktop`) on the mobile-only endpoints. Native
  requests now report `browser: 'Mobile App'`.
- `app/api/mobile/auth/register/route.ts`, `.../google/route.ts`,
  `.../apple/route.ts`: use `resolveDeviceInfo(..., { fallbackDeviceType: 'mobile' })`.
  The Apple route now also sends device + IP + geo `additionalInfo` (previously
  none).

The server fix corrects the "Desktop" label for **all** users immediately,
including older app builds that don't yet send the new headers.

## Verification

- `npx tsc --noEmit` on the website project passed.
- Device type is `mobile` for phones, `tablet` for iPad; OS/model are
  best-effort and omitted if unavailable.

## EAS Update

- Branch: `production`
- Platform: `android`, `ios`
- Runtime: `1.10.1`
- Message: `Fix: send device info headers so admin registration emails show correct device type`
- Update group ID: `95074c63-7bda-4d7c-ac73-1fa403f4efbe`
- Android update ID: `019e7280-520f-74f9-9d60-9b1d3cc9e04e`
- iOS update ID: `019e7280-520f-761b-a3ff-077692b428e9`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/95074c63-7bda-4d7c-ac73-1fa403f4efbe

## Notes

- The OTA was published from the local working tree; EAS reported commit
  `698387c1…*` (dirty). The native fix was committed afterward in
  `genosys-mobile-app` commit `725ffef`, so the published JS now corresponds to
  committed code.
- Unrelated in-progress splash work (`components/VideoLaunchScreen.js` and the
  `splash-launchscreen-binary82.png` asset, which depends on native build ≥ 83)
  was deliberately **stashed during the OTA** and restored afterward, so it did
  not ship to runtime `1.10.1` users.

## Testing

After the OTA lands, register a throwaway account from the app and confirm the
admin email shows Device Type = Mobile, the correct OS version, and the device
model (and Browser = Mobile App).
