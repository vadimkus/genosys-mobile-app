# Language switcher on product and blog screens — 2026-08-25

## Why

The app has had full three-language support for a while — `LocalizationContext`,
message bundles, RTL handling, and a mobile API that localizes product copy and
blog content off the `x-locale` header. The only way to reach it was
Profile > Language.

That meant changing language required leaving whatever you were reading,
navigating two screens, switching, and finding your way back. On the product and
blog screens — the two that actually carry translated copy — that is enough
friction that most people never discover the translations exist.

Same gap was fixed on the website in the same session.

## What changed

New `components/LocaleSwitchButton.js`: the green locale code with a chevron,
opening a small dropdown anchored under it.

Presentation is copied from the language control already in the home header
(`app/(tabs)/shop.js`) — same green `greenDeep` code, same chevron that flips
when open, same card/hairline/shadow menu with the active row tinted brand red.
The first version of this component used a globe pill and a full-width bottom
sheet, which made the same feature read as two different things depending on
which screen you were on.

The home control can hard-code its menu position because it owns its header.
This one is dropped into three different headers, so it measures the trigger
with `measureInWindow` and hangs the menu off it, clamped to the screen edges,
aligning to the trigger's leading edge under RTL and its trailing edge under
LTR.

Added to:

| Screen | Placement |
|---|---|
| `app/product/[id].js` | Header bar, beside share and favourite |
| `app/blog/[slug].js` | `CollapsibleHeader` right slot |
| `app/blog/index.js` | `CollapsibleHeader` right slot |

On both blog screens it takes the slot the refresh icon had. That icon
duplicated pull-to-refresh, which both screens already support.

## Behaviour

English and Russian apply in place. All three screens list `locale` in the
effect that fetches their content, so the copy is refetched from the API and
swaps under the reader without losing their position.

Arabic restarts the app. `I18nManager.forceRTL` only takes effect before the
React tree mounts, so `LocalizationContext.applyRTLIfNeeded` calls
`Updates.reloadAsync()` whenever direction flips, which drops the reader on the
home screen. That is a platform constraint, not a choice. The home control
switches straight through and lets the restart happen, so this one does too —
an earlier confirmation alert here was one more way the two controls behaved
differently for no reason the user could see.

When the user is signed in the choice is also written back through
`updateUserSettings`, matching the Profile > Language screen, so it follows them
to other devices.

## Shipping

JS only, no native dependency added, so it goes out over the air on the existing
`1.11.0` runtime:

```bash
eas update --branch production --environment production -m "Language switcher on product and blog screens"
```

Existing installs pick it up on next launch.
