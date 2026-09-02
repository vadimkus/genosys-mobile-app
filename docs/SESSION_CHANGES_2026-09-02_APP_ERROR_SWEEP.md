# App error sweep

**Date:** 2 September 2026 (afternoon)

Layers: crash reporting, Expo doctor, a correctness lint, navigation targets
against real routes, asset references against disk, and the existing 23 smoke
and verify scripts.

## Found and fixed (OTA `f683c504`)

**The brand screen has crashed on open since 26 August.** The refactor that
removed the brand logo (`eb74443`, "the logos are gone") deleted the
react-native `Image` import along with the logo, but two other `<Image>` uses
stayed: the YouTube thumbnails and the product shot. Every open of Profile ->
brand since then threw `ReferenceError: Image is not defined`. Import restored.

`app/profile/edit.js` had a plain function named `useCatAvatar`, which is not a
hook but reads as one and trips the rules-of-hooks check. Renamed
`openCatAvatarPicker`.

## The guard

Nothing in the toolchain could see a JSX component used without its import, or
a hook called where hooks cannot be. Both have now shipped as crashes (the
profile and product screens earlier this year, the brand screen this week).
`eslint.config.mjs` added with correctness rules only, no style rules:
`react-hooks/rules-of-hooks`, `react/jsx-no-undef`, `no-undef`, duplicate
keys/props/cases, unreachable code, unsafe optional chaining. `npm run
verify:lint`, and `verify:release` now starts with it. Verified it reports the
brand crash when the import is removed again. Four stale disable comments for
a TypeScript plugin that was never installed were removed, plus twelve unused
directives.

## Checked and clean

- 125 `router.push`/`href` targets all resolve to a file under `app/`
  (`/(tabs)/x` explicit-group form included).
- 16 `require('../assets/...')` references all exist on disk.
- All 23 smoke and verify scripts pass.
- Both bundles export (the OTA publish is the proof).

## Not available

Sentry is wired (`genosys/mobile-app`) but the only token on this machine is
the website's and cannot read that project. Real user crash data was not
reviewed. A read-scoped token for the mobile project would let the next sweep
start from what users actually hit.

## Needs a native build (cannot go out over the air)

Expo doctor, two real items:

1. **Hermes memory regression.** `expo@57.0.4` ships Hermes V1
   `250829098.0.14`; versions up to `.15` carry a known memory regression,
   fixed in `.16`. Remedy is `npx expo install expo@^57.0.9 --fix` (pulls
   React Native 0.86.2+), then a new iOS and Android build. Worth folding
   into the next store submission rather than doing on its own.
2. **Duplicate `@expo/ui`** (`57.0.4` at root, `57.0.13` under
   `expo-widgets`). Same `--fix` run should resolve it; if not, a resolution
   override.

Also 29 packages behind their SDK-57 expected versions; minor, same run.
