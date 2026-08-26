# The Lock Screen order card

Date: 26 Aug 2026 · app version 1.12.0, runtime 1.12.0, iOS build 104

An iOS Live Activity showing the order number, a three-step bar and what is happening now,
on the Lock Screen and in the Dynamic Island.

## Why this needed a binary

A Live Activity is rendered by a **Widget Extension**: a second target in the Xcode
project, compiled into the app. EAS Update ships the JS bundle to builds that already
carry the runtime — it cannot add a target. So this is a new build and an App Store round.

**That is the only part that needs a binary.** Everything else — when the card starts, what
it says, the lifecycle, the push-token plumbing — is JavaScript and ships over the air. So
the wording and behaviour can be changed after this without another review.

## How it was built

`expo-widgets`, which has been the supported route since SDK 56. The Live Activity is a
React component using `@expo/ui` primitives, and the config plugin generates the Widget
Extension target, the App Group and the SwiftUI scaffolding at prebuild. No Swift written
by hand.

The iOS project is committed (bare workflow — `scripts/sync-runtime-version.js` writes the
runtime version straight into `Expo.plist`), so prebuild was run locally and the result
reviewed rather than switching to CNG. It reproduced the project faithfully:

| File | Change |
| --- | --- |
| `Info.plist` | `NSSupportsLiveActivities`, app group id, push flag |
| `GenosysUAE.entitlements` | `com.apple.security.application-groups` |
| `project.pbxproj`, `Podfile` | the new target |
| `ios/ExpoWidgetsTarget/` | generated: `index.swift`, `Info.plist`, entitlements |

`AppDelegate.swift` was untouched.

Prebuild did re-encode the three legacy splash images, which `verify:splash` caught — they
must stay byte-identical to `assets/splash.png` or there is a flash on cold launch. Copied
back from the source of truth.

### Configuration

```json
["expo-widgets", {
  "bundleIdentifier": "ae.genosys.app.widgets",
  "groupIdentifier": "group.ae.genosys.app",
  "enablePushNotifications": true,
  "widgets": []
}]
```

`widgets: []` because there is no home screen widget — the Live Activity is the whole
point of the target.

## The card

`widgets/OrderActivity.tsx`. It renders in a separate runtime with a tight time budget,
often while the app is not running, so it derives nothing: every string arrives already
translated, and the bar arrives as a count.

`utils/orderActivity.js` does that translation, from the same `getOrderProgress` the
in-app tracker uses — so the Lock Screen and the order screen can never disagree, and cash
on delivery gets *Confirmed* where a card order gets *Paid* in both places.

### The props are a wire format

The server will send this shape inside an APNs payload, and ActivityKit decodes nothing if
it does not match — the symptom is a push that reports success and displays nothing. So
the shape is pinned in `scripts/smoke-order-progress.js` rather than discovered on a
device: exact key set, types, translated labels, and the COD/prepaid label swap.

Change `OrderActivityProps`, `buildOrderActivityState` and the server's payload builder
together or not at all.

## Lifecycle

`utils/orderLiveActivity.js`. One card at a time, for the newest order still in flight;
two orders' worth would be noise. It is synced when the orders screen loads, not awaited —
the card is a nicety and the orders list should never wait on it — and every path is
wrapped, including the `require` of the widget module, so a build without the target or an
Android device is a no-op rather than a crash on someone's order history.

A delivered or cancelled order gets a final state and then the card ends, rather than
being yanked away.

## What is not done yet

**The APNs channel.** Today the card is started by the app, so it appears when the app has
been opened. To have it appear and update while the app is force-quit, the server needs to
push to ActivityKit directly:

- Expo's push service does not relay these. They go to `ae.genosys.app.widgets` on the
  topic `ae.genosys.app.push-type.liveactivity`, over HTTP/2, with an APNs `.p8` key.
- Two different tokens, and confusing them is the usual cause of a silent failure: the
  **push-to-start** token is app-wide and starts a card when nothing is running; the
  **per-activity** token updates a card that already exists. Neither is the ordinary device
  token. `registerTokens` in `utils/orderLiveActivity.js` already collects the first.
- The natural place to send from is where `sendOrderStatusPushNotification` is already
  called: `app/api/admin/orders/[id]/route.ts` on the website.

All of that is server-side plus JS, so **it needs no further binary** once this build ships.

## Needed from the Apple Developer account

- The App Group `group.ae.genosys.app` must exist and be enabled for both
  `ae.genosys.app` and `ae.genosys.app.widgets`. EAS will usually sync this when it manages
  credentials; if the build fails on provisioning, that is why.
- An APNs `.p8` key for the server half, when we get to it.

## Verification

- `expo prebuild --platform ios` reproduces the project with only the intended changes
- `npm run verify:release` clean, including the splash guard
- `expo export --platform ios` bundles clean
- 20 new checks on the activity payload shape and on which orders get a card

Local `pod install` could not run — this machine's CocoaPods is on Ruby 2.6 and the
Expo autolinking scripts need 2.7 or later. The EAS build is the compile check.
