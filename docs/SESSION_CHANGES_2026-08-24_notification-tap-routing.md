# Notification taps only opened orders

Date: 2026-08-24

## The bug

The website started pushing blog announcements. The notification arrived on iOS,
but tapping it did nothing — the app opened on whatever screen it was last on.

`contexts/NotificationContext.js` matched exactly one shape:

```js
if (data?.type === 'order_status' && data?.orderId) {
  router.push(`/profile/orders/${data.orderId}`);
}
```

Anything else fell off the end of the `if` and was dropped without a log line,
in both the warm listener and the cold-start handler. Order notifications were
the only kind the app had ever sent, so nothing had exposed it before.

## The fix

`utils/notificationRouting.js` resolves a destination generically:

1. `notificationRoute(data)` — direct route for a known type. Orders
   (`order_status`, and `order-status` as the web push sender spells it) and blog
   posts.
2. Otherwise the payload's `url` is made absolute and handed to `handleDeepLink`
   from `utils/deepLinking.js`, which already maps every web path shape to a
   native route, strips `/en` `/ar` `/ru` prefixes, and falls back to the in-app
   WebView.

So a new notification type works as long as it carries a `url` — no change to
this file needed.

Both the warm listener and the cold-start handler now call the same
`navigateFromNotification(data)`. A payload with no destination is logged rather
than silently ignored.

## Why blog posts use `slug` and not `url`

The announcement payload carries a locale-prefixed URL (`/ru/blog/<slug>`) so
that push, email and web all point at the same localized page. The native route
is never locale-prefixed — `app/blog/[slug].js`. The slug is read directly, and
the URL path is left as the fallback.

## Shipping

JS only, no native module change, so it goes out over the air on the current
runtime (1.11.0):

```bash
eas update --channel production --message "Route blog notification taps to the post"
```

Users receive it on next launch. The notification already delivered cannot be
re-tapped into the post — it needs a new push after the update lands.

## Checking it

With the update installed, publish a test announcement from the website:

```bash
npx tsx --env-file=.env.local scripts/announce-blog-post.ts <slug> --mobile --force
```

Tap it from a cold start and from the background. Both should land on the post.
