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

## Related

- Web side of the same change: `cosmetics-website/docs/CART_UX_FIXES_2026-04-23.md`
