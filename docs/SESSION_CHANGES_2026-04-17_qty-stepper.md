# Products-grid quantity stepper & multi-variant "In Bag" fix (app)

_Last updated: 2026-04-17_

## Problem

Reported: for products with multiple sizes (cleansers, creams) the grid
card's "Add to Bag" button did **not** turn green after adding, while
products without size variants did. User also asked for in-place +/-
controls so they can adjust quantity without opening the bag.

## Root cause

`shop.js` was computing the grid count as

```js
const qtyInBag = getItemQuantity(product.id, '', '');
```

But `CartContext.addItem` normalises an empty `selectedSize` to the
product's default variant size (via `normalizeSizeKey`). So a sized
product's cart line is stored with `selectedSize = '180ml'` (or whatever
the default is), never `''`. The strict triple-key lookup
`(productId + color + size)` therefore always returned 0 for those
products, so `isInBag` was never true and the button stayed red.

Non-sized products have no variants, `normalizeSizeKey` returns `''`, the
stored line matches `('', '')`, and the green state worked. That matched
the observed behaviour exactly.

## Fix

### 1. Add `getProductTotalQuantity(productId)` to `CartContext`

Sums every non-promo cart line with a matching `product.id`, ignoring
size/colour. This is what the grid should use because we don't know which
variant the user will tap — we just want the total "how many of this
product are in my bag".

### 2. Add `decrementProductFromCart(productId)` to `CartContext`

Powers the new `-` button. Finds the most recently added non-promo line
for that product, decrements its quantity by 1, and removes the line
entirely when quantity drops to 0. Promo/free items are never touched
because they are auto-managed by the free-mask reconciliation effect.

### 3. Swap the grid card's button for a `[-] [N in Bag] [+]` stepper

In `shop.js`, when `qtyInBag > 0`:

- replaced the green "In Bag (N)" button with a solid-green row:
  `<[-]>  ✓ In Bag (N)  <[+]>`,
- `+` reuses the existing `handleAddToCart(product)` path (same behaviour
  as before — adds one more unit of the default variant),
- `-` calls `decrementProductFromCart(product.id)` with a light haptic,
- stepper keeps the same 44px min-height as the original button so grid
  rhythm is preserved.

When `qtyInBag === 0`, the original red "Add to Bag" button still renders
(unchanged copy, layout, disabled states).

## Files touched

- `contexts/CartContext.js` — added `decrementProductFromCart`,
  `getProductTotalQuantity`; both exposed through the context value.
- `app/(tabs)/shop.js` — swapped `getItemQuantity(..., '', '')` for
  `getProductTotalQuantity(product.id)`, branched render
  (stepper when in bag, button otherwise), added
  `qtyStepper*` styles, removed the now-unused
  `addToCartButtonInBag` / `addToCartTextInBag` styles.
- `i18n/messages/{en,ar,ru}.json` — added `shop.decreaseQuantity` and
  `shop.increaseQuantity` for the stepper's accessibility labels.

No changes needed in `concern-detail.js` or favourites — those already
use an any-variant match (`items.some(id === productId)`).

## Manual test plan

- EN / AR / RU locales.
- Product without sizes (e.g. sheet mask): Add → stepper shows `In Bag (1)`
  → `+` → `(2)` → `-` → `(1)` → `-` → back to red "Add to Bag".
- Cleanser / cream (multiple sizes): open PDP, pick a size, Add → go back
  to shop → the card for that product now shows the green stepper with
  the correct count.
- Two different sizes of same product in bag: stepper shows combined total
  (e.g. `(3)` for 1×180ml + 2×500ml); tapping `-` removes from the most
  recently added size line; `+` adds default variant.
- Out-of-stock and price-on-request products: stepper does not render,
  existing CTAs unchanged.
- RTL layout (Arabic): stepper row flips direction.

## Shipping

OTA via `eas update --branch production --platform all` (single command
now that `react-native-web` is installed — see
`SESSION_CHANGES_2026-04-23_cart-ux.md`).
