# OTA Updates (Expo Updates)

Over-the-air JavaScript updates let us ship bug fixes and UI tweaks to users
without a new App Store / Play Store submission. Native code changes still
require a full build + store submission.

## Current state (April 2026)

- **Enabled** on iOS and Android, `production` channel
- **Expo project URL**: `https://u.expo.dev/b874a5c1-c47e-4c4e-9286-42e431978d51`
- **Runtime version**: concrete app-version-aligned runtime, currently `1.9.0`.
  This project uses the bare workflow, so EAS Update requires a string runtime
  instead of `{ "policy": "appVersion" }`. `scripts/sync-runtime-version.js`
  keeps `app.json`, `package.json`, `package-lock.json`, and iOS `Expo.plist`
  aligned to `expo.version`.
- **Launch wait**: 5000 ms — iOS waits up to 5 s for the JS bundle at launch
  before falling back to the embedded bundle

## Config lives in two places (synced automatically before builds)

| File | Applies to | Notes |
|------|-----------|-------|
| `app.json` `updates` block + concrete `runtimeVersion` | Source of truth for Expo/EAS Update | `runtimeVersion` is written as the current `expo.version` because bare workflow updates reject runtime policies. |
| `ios/GenosysUAE/Supporting/Expo.plist` | iOS native runtime source of truth | EAS iOS production runs `node scripts/sync-runtime-version.js` before build. The script writes `EXUpdatesRuntimeVersion` from `app.json` `expo.version`. |

Before local release work, run:

```bash
npm run sync:runtime
```

The two files must carry identical values for `EXUpdatesURL` / `updates.url`;
runtime uses the app-version policy in Expo config and the resolved app
version in native iOS.

## Publishing an OTA update

```bash
# Ship a JS-only change to production users on both platforms
eas update --channel production --message "short description of the fix"
```

Users will receive the update on their next app launch (within the 5 s
launch wait window, otherwise on the launch after).

## When to bump `runtimeVersion`

Bump `expo.version` (then run `npm run sync:runtime`, which writes the matching concrete runtime) **only** when you change:

- Native dependencies (`react-native`, `expo-*` with native code, custom modules)
- `app.json` that affects native code (permissions, bundle identifiers, icons, splash, URL schemes)
- Anything that touches `ios/` or Android `android/` (generated) content

Changing the resolved runtime means users on the old runtime will **not**
receive the new JS bundle until they upgrade through the store. Do not hand-edit
`runtimeVersion`; update `expo.version`, then run `npm run sync:runtime`.

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
