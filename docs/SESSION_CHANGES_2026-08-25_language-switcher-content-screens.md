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

New `components/LocaleSwitchButton.js`: a compact globe + locale pill that opens
a bottom sheet with the three languages.

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
home screen. That is a platform constraint, not a choice, so the sheet asks
first — reusing the same `profile.restartRequired*` strings the language screen
uses — rather than yanking the screen away unannounced.

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
