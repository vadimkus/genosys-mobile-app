# The order card on Android

Date: 27 Aug 2026

Where Android stands after the iOS Lock Screen card shipped, and what it would
take to match it.

## Nothing is broken today

Every path is gated on `Platform.OS === 'ios'`:

```js
function available() {
  return Platform.OS === 'ios';
}
```

`available()` guards `startOrderActivityForNewOrder`, `syncOrderActivity`,
`updateOrderActivityFromPush` and `registerTokens`, so on Android they return
before touching anything. `widgets/OrderActivity` is loaded through a
`try`/`catch` require that is never reached. The server's APNs client is only
called for the ActivityKit topic, so an Android user simply has no tokens and
no card is attempted.

Android users get the ordinary Expo push notification on every status change,
which is what they got before any of this work.

## The bundle had drifted

Six OTA updates went out `--platform ios` during the build-out. None were
Android-visible in effect, but the platforms were on different JavaScript, which
makes "which bundle is this user on?" a harder question than it needs to be.
Caught up on 27 Aug (update group `d72943e2`).

**Ship to both platforms unless there is a reason not to.** An iOS-only publish
is a decision, not a default.

## Android does now have an equivalent

Android 16 (API 36) introduced `Notification.ProgressStyle`, a segmented
progress bar built for exactly this: deliveries and multi-step orders. Android
16 QPR1 (API 36.1) added the promotion pipeline — the status-bar chip and the
elevated Lock Screen slot. Google calls it progress-centric notifications, and
it is the real functional answer to Live Activities.

### What it would cost

| | |
| --- | --- |
| Delivery | A new **binary**, not OTA. Native Kotlin plus a config plugin. |
| Library | Notifee is archived and has no support for it. Either a community fork or our own Expo module. |
| SDK | Promotion needs the 36.1 SDK; React Native 0.86 compiles against base 36. Calling it directly fails at runtime. |
| Manifest | `POST_PROMOTED_NOTIFICATIONS`, and `setRequestPromotedOngoing(true)`. |
| Reach | Rich version on Android 16+ only. Older devices fall back to a plain ongoing notification. |

### The design does not carry over

This is the part worth knowing before promising anyone a matching card:
**custom layouts are not allowed on promoted notifications.** You get Google's
`ProgressStyle` template or you get no promotion.

So the wordmark, the delivery sentence, the three named steps and the rewards
line have no equivalent. What survives is a title, a line of text, and a
segmented bar. It is the same *information*, not the same card, and it should
be designed for Android rather than ported.

### What we would reuse

Most of the thinking, none of the drawing:

- `buildOrderActivityState` / `buildOrderActivityProps` — the three-step model,
  the COD rule that step one means accepted rather than paid
- The delivery promise and its three rules, including the emirate split
- All the translated strings

The transport is different: FCM rather than APNs, so `lib/apnsLiveActivity.ts`
does not apply, though `lib/orderLiveActivity.ts` — which decides start, update
or end — would.

## The decision this rests on

Whether it is worth a binary release comes down to the share of orders coming
from Android, and how many of those users are on Android 16 or newer. That
number is not in this repo. Worth pulling before committing to the work.
