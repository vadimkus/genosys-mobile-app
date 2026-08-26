# Three-step order tracker, and why the lock-screen card is not in this release

Date: 26 Aug 2026

## What was asked

A lock-screen card like the Slider delivery app's: order number, a three-step bar,
paid → shipped → delivered, with cash on delivery handled sensibly. Shipped over OTA.

## What can and cannot go over the air

The card itself **cannot**. It is an iOS Live Activity, and this app has none of what one
needs:

- `ios/` contains a single target, `GenosysUAE`. A Live Activity needs a **Widget
  Extension** target, which is Swift and SwiftUI, compiled into the binary.
- No `NSSupportsLiveActivities` in the Info.plist, no ActivityKit anywhere, no
  `expo-live-activity` or `@bacons/apple-targets` in the dependency tree.
- `runtimeVersion` is pinned at `1.11.0`. EAS Update ships the **JS bundle** to builds
  already carrying that runtime. It cannot add a native target.

There is a second obstacle on the server. Expo's push service does not relay Live Activity
updates. Those go to a separate APNs topic — `<bundleId>.push-type.liveactivity` — and
need our own APNs p8 key and a direct APNs client.

So the card needs: a widget extension, a native bridge to start and update activities from
JS, a runtime bump, a fresh EAS build, App Store review, and an APNs channel on the
website. That is a binary release, not an update.

## What shipped instead

The state the card would render, which the app needed anyway and the widget will read from
when it is built.

### The rule: step one is *acceptance*, not payment

A literal "paid → shipped → delivered" bar is wrong for cash on delivery, where the money
arrives at the door. Step one could never complete before step three, so every COD
customer would watch an empty bar until the courier knocked.

So step one means the order was accepted, and only its label changes:

| Step | Prepaid (card, Apple Pay, bank transfer) | Cash on delivery |
| --- | --- | --- |
| 1 | Paid | Confirmed |
| 2 | Shipped | Shipped |
| 3 | Delivered | Delivered · paid on delivery |

One bar, one progress rule, one label difference. Payment is a note on step one when it is
taken up front and on step three when it is taken at the door.

Completion, per step:

- **one** — prepaid: `paymentStatus === 'paid'`, or status has reached CONFIRMED.
  COD: status has reached CONFIRMED. A *failed* card payment leaves it open.
- **two** — status is SHIPPED or DELIVERED.
- **three** — status is DELIVERED.

CONFIRMED and PROCESSING share step one: the server's ladder has five rungs and the
tracker has three stops, and both of those mean accepted, not yet with a courier.

A cancelled order shows no progress at all, with a line saying so, rather than a blank bar.

### Files

- `utils/orderModel.js` — `getOrderProgress(order)` and `isOrderSettled(order)`.
  `isOrderSettled` is deliberately stricter than the existing `isPaidLikeOrder`, which
  counts `confirmed` as paid: true for a card order, never true for COD. It does treat a
  *delivered* COD order as settled, since the money changed hands at the door whether or
  not anyone updated the payment field afterwards.
- `components/OrderProgress.js` — the tracker.
- `app/profile/orders/[id].js` — placed on the order-number card, so the two things a
  customer opens this screen for are in one place.
- `i18n/messages/{en,ru,ar}.json` — three new strings. The step labels themselves reuse the
  existing `statusPaid` / `statusConfirmed` / `statusShipped` / `statusDelivered`.
- `scripts/smoke-order-progress.js` — 42 checks, wired into `verify:release`.

### The connecting line is drawn in halves

Each column draws half a line on each side of its dot, laid out by flex. The obvious
alternative — one absolutely-positioned bar with an animated width — has to be anchored
with `left` or `right`, and this app runs `I18nManager.forceRTL` *and* applies
`row-reverse` on top of it, so those get swapped twice and the fill grows from the wrong
end in Arabic. Halves follow whatever direction the row is using and there is nothing to
get backwards.

A segment lights once the dot it leads to has been reached, so the line never runs past the
last thing that actually happened.

## Push was already done

`lib/expoPush.ts` on the website already sends a per-status, per-locale notification, and
`utils/notificationRouting.js` already routes an `order_status` tap to
`/profile/orders/<id>`. The admin status endpoint (`app/api/admin/orders/[id]/route.ts`)
fires it on every transition. Nothing needed building; the tracker is simply what the
customer now lands on.

## Verification

- 42 smoke checks across COD, prepaid, cancelled, current-step selection, snake_case and
  lowercase field shapes, a missing order, and the segment rule
- Rendered every state in all three languages through react-native-web and eyeballed:
  labels swap correctly by payment method, the COD note sits under Delivered, a failed card
  payment leaves step one open, cancelled greys out with its explanation
- `npm run verify:release` clean, `expo export --platform ios` bundles clean

## Not verified

Arabic under a real `forceRTL`. The preview harness would not apply it — the English block
was unchanged with the flag on, so the simulation proved nothing. The component follows the
convention documented in `docs/rtl/SHOP_SCREEN_RTL_SUPPORT.md` and used by every other row
in the app (`isRTL && flexDirection: 'row-reverse'`), so it will agree with its siblings on
the same screen whatever that convention actually renders. Worth a look on a device.

## Next, for the Live Activity

1. Widget Extension target with an ActivityKit `ActivityAttributes` mirroring
   `getOrderProgress`'s output.
2. Native module to start the activity at checkout and end it on delivery.
3. `NSSupportsLiveActivities` in the Info.plist, runtime bump, EAS build, submit.
4. APNs p8 key and a direct client on the website, pushing to the live-activity topic from
   the same place `sendOrderStatusPushNotification` is called today.
