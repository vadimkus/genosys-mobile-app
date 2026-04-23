# Session Changes — 2026-04-23 (Cart & Products UX)

Three user-reported UX bugs were fixed in this session across iOS, Android,
and the mobile web PWA (the web fixes live in the `cosmetics-website` repo
and are documented there in `docs/CART_UX_FIXES_2026-04-23.md`).

## 1. Free items always render at the bottom of the bag

**File:** `contexts/CartContext.js`

The promo-reconciliation effect short-circuited when the set of promo items
didn't change, which left newly added bundle lines rendered *above* existing
free masks. The effect now always rebuilds the cart as
`[...nonPromo, ...keptPromo, ...toAdd]` and only bails out when the result is
structurally identical to the previous state. Free/promo items are now
guaranteed to be at the tail of the array regardless of add/remove order.

## 2. "In Bag (N)" green button state on the shop screen

**Files:** `app/(tabs)/shop.js`, `components/ProductGridItem.js`,
`i18n/messages/{en,ar,ru}.json`

When a product is already in the bag the button now:

- switches to a light-green pill (`#F0FDF4` bg, `#BBF7D0` border)
- shows a checkmark icon in `#15803D`
- renders `"In Bag (N)"` / `"В корзине (N)"` / `"في الحقيبة (N)"` using the
  live quantity from `useCart().getItemQuantity`
- continues to call `handleAddToCart` on tap, so tapping again adds another
  unit — matching the requested behaviour

`ProductGridItem` (used on favourites and other grids) now accepts an
optional `inCartQty` prop so other screens can opt in to the same treatment
without a breaking change.

New translation key: `shop.inBag` ("In Bag" / "В корзине" / "في الحقيبة").

## 3. Russian "Новинка" badge no longer overlaps category pills

**File:** `app/(tabs)/shop.js`

The badge was absolutely positioned with a hard-coded `translateX: -14px`,
which centred the 3-letter "NEW" but not the 7-letter "Новинка". The badge
wrapped to two lines and overlapped the next pill.

Fix:

- New `categoryNewBadgeWrapper` absolute container with `left: 0; right: 0;
  alignItems: 'center'; overflow: 'visible'` — centres the badge dynamically.
- `categoryNewBadge` no longer has a fixed transform or `maxWidth`, so it can
  size to its content.
- Badge `<Text>` uses `numberOfLines={1}` and `allowFontScaling={false}` so
  it can never wrap.
- `categoryItem` margin bumped from 8 → 14 px to give the wider localised
  badge room to overflow without touching the next pill.

## Verification

- ESLint / Metro: no new warnings in edited files.
- Manual smoke tests (Expo Go, iOS + Android):
  1. Add 1 × Anti-Aging Beauty Box → two free masks appear *below* the box.
  2. Add a second bundle → new bundle line renders *above* the free masks;
     free masks stay at the bottom.
  3. Tap "Add to Bag" on a product on the shop screen → button turns green
     and shows "In Bag (1)". Tap again → "In Bag (2)". Cart matches.
  4. Switch locale to Russian → "Новинка" centres above each pill, never
     wraps, never touches the next pill.

## OTA publish

Pushing to `main` alone does **not** ship an OTA update — `eas update` has
to be run explicitly. Both platforms were published from commit
`5a55e8c8c4d263f5250c0c8f34ddbc08fabbe347`:

- iOS update group `5fefb644-4e42-4df3-8741-3d818ecfc4f9` (update ID
  `019dba08-82c8-7d1e-8643-9b653c1d3a1f`) — runtime `1.0.0`, branch
  `production`.
- Android update group `628e3ff8-c27e-422c-8488-9384de3a8c66` (update ID
  `019dba09-2829-747e-a196-e67c35b116dd`) — runtime `1.0.0`, branch
  `production`.

### Regression fixed

The previous four OTAs shipped to Android only (iOS was skipped for: checkout
parity, profile headers, favorites, and one of the Batch C updates). Always
publish **both** platforms:

```bash
CI=1 eas update --branch production --platform ios     --message "..."
CI=1 eas update --branch production --platform android --message "..."
```

`--platform all` currently fails in this repo because the Expo export
attempts a web bundle and `react-native-web` isn't installed. Until we
either install `react-native-web` or restrict `platforms` in app config,
run the two commands explicitly.

### What users see

With `updates.checkAutomatically: ON_LOAD` and
`fallbackToCacheTimeout: 5000`, a user must fully quit the app (swipe up
from the app switcher) and reopen once. On a good connection the new
bundle downloads within the 5-second window and the first relaunch shows
the fix; otherwise the second relaunch shows it.

## Related

- Web side of the same change: `cosmetics-website/docs/CART_UX_FIXES_2026-04-23.md`
