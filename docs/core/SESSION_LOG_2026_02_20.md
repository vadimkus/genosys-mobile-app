# Session Log — February 20, 2026

## Fix: Routine Chip Cart State for Products with Size Variants

### Problem

9 products with size variants (e.g., Snow O₂ Cleanser 180ml/500ml, Snow Booster 200ml/1000ml) would not persist their green "in cart" state when added from routine chips. Tapping a chip would flash green briefly then revert to black. Tapping again would add a **duplicate** instead of removing.

### Root Cause

A mismatch between how `addItem` stores and `isInCart` checks cart items:

1. **`addItem`** (in `CartContext.js`) is called from routine chips with `selectedSize = ''`
2. `normalizeSizeKey()` auto-selects the first available variant size (e.g., `"200ml"`)
3. The item is stored in the cart with `selectedSize: "200ml"`
4. **`isInCart`** checks `item.selectedSize === normalizedSize` where `normalizedSize = ''`
5. `"200ml" !== ""` → `isInCart` returns `false` → chip doesn't stay green
6. **`removeItem`** has the same mismatch — can't find the item to remove

Products without size variants (e.g., serums, SPF creams) were unaffected because `normalizeSizeKey` returns `''` for them, matching the default.

### Affected Products (9 unique across 7 concern pages)

| # | Product | Sizes | Pages |
|---|---------|-------|-------|
| 10 | SNOW O₂ CLEANSER | 180ml, 500ml | All except hair-loss |
| 15 | INTENSIVE PROBLEM CONTROL TONER | 200ml, 500ml | acne-treatment |
| 16 | SNOW BOOSTER | 200ml, 1000ml | pigmentation, anti-aging, scars, sun-protection |
| 25 | SOOTHING REPAIR POSTCREAM | 20g, 100g | sensitivity, scars-treatment |
| 28 | INTENSIVE HYDRO SOOTHING CREAM | 50g, 250g | hydration, sensitivity |
| 29 | MOISTURE REPLENISHING HYALURON CREAM | 50g, 250g | pigmentation, hydration, sun-protection |
| 30 | INTENSIVE PROBLEM CONTROL CREAM | 50g, 250g | acne-treatment |
| 31 | MULTI VITA RADIANCE CREAM | 50g, 230g | pigmentation, sun-protection |
| 32 | MULTI FUNCTIONAL ANTI-WRINKLE CREAM | 50g, 250g | anti-aging |

### Fix

**File:** `app/concern-detail.js`

Instead of using the cart context's `isInCart(cartId)` (which does a strict match on `selectedSize`), the fix accesses `items` directly from the cart context and checks by product ID only — since routine chips don't offer size selection.

**Changes:**

1. Destructure `items` (aliased as `cartItems`) from `useCart()` instead of `isInCart`
2. Add `isProductInCart(productId)` helper — checks `cartItems.some(item => String(item.product?.id) === productId)` ignoring size/color
3. Add `findCartItem(productId)` helper — finds the actual cart entry so we can pass its real `selectedSize` and `selectedColor` to `removeItem`
4. Update `handleChipPress` to use `findCartItem` for removal (passes the item's actual stored size, ensuring exact match for `removeItem`)
5. Update chip rendering to use `isProductInCart(cartId)` instead of `isInCart(cartId)` for the green visual state

### Why This is Safe

- Only affects routine product chips on the concern-detail screen
- The `CartContext.js` is completely unchanged — no risk to the bag, checkout, product pages, or any other cart flow
- Products without size variants still work identically (their stored size is already `''`)
- `addItem` still auto-selects default size — items go into the cart with proper pricing for the default variant
- `removeItem` now receives the correct stored size, so removal works for all products

### No Native Rebuild Required

This is a JavaScript-only change. An Expo restart or OTA update (`eas update`) is sufficient.

---

*Files changed:*
- `app/concern-detail.js` — routine chip cart state and removal logic
