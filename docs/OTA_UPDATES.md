# OTA Updates (Expo Updates)

Over-the-air JavaScript updates let us ship bug fixes and UI tweaks to users
without a new App Store / Play Store submission. Native code changes still
require a full build + store submission.

## Current state (April 2026)

- **Enabled** on iOS and Android, `production` channel
- **Expo project URL**: `https://u.expo.dev/b874a5c1-c47e-4c4e-9286-42e431978d51`
- **Runtime version**: `1.0.0` (decoupled from `version` — only changes when
  native code / native deps change)
- **Launch wait**: 5000 ms — iOS waits up to 5 s for the JS bundle at launch
  before falling back to the embedded bundle

## Config lives in two places (keep them in sync)

| File | Applies to | Notes |
|------|-----------|-------|
| `app.json` `updates` block + `runtimeVersion` | Source of truth for Android (and managed iOS) | Android production profile in `eas.json` runs `npx expo prebuild --no-install`, which regenerates the native Android OTA config from here on every build. |
| `ios/GenosysUAE/Supporting/Expo.plist` | iOS runtime source of truth | iOS production profile in `eas.json` does **not** run prebuild, so the committed `ios/` folder is used as-is. Manual edits here persist across builds. |

If you change one, change the other. The two files must carry identical
values for `EXUpdatesURL` / `updates.url` and `EXUpdatesRuntimeVersion` /
`runtimeVersion`.

## Publishing an OTA update

```bash
# Ship a JS-only change to production users on both platforms
eas update --channel production --message "short description of the fix"
```

Users will receive the update on their next app launch (within the 5 s
launch wait window, otherwise on the launch after).

## When to bump `runtimeVersion`

Bump it (e.g. `1.0.0` → `1.1.0`) **only** when you change:

- Native dependencies (`react-native`, `expo-*` with native code, custom modules)
- `app.json` that affects native code (permissions, bundle identifiers, icons, splash, URL schemes)
- Anything that touches `ios/` or Android `android/` (generated) content

Changing `runtimeVersion` means users on the old runtime will **not** receive
the new JS bundle until they upgrade through the store. Both `app.json` and
`Expo.plist` must be bumped together.

## When NOT to bump `runtimeVersion`

- Pure JS changes (React components, styles, API calls, translations)
- Text / copy updates
- New screens that use only existing native capabilities

These ship via `eas update` to the current runtime.

## Verification after a build

1. Build + install the staging/production build on a device
2. Confirm first-launch behaviour (embedded bundle loads)
3. Publish an `eas update --channel production` with a visible marker (e.g.
   console log or small UI change)
4. Cold-start the app twice — the second launch should show the marker
5. Check the Expo dashboard → Updates → verify the manifest was fetched
