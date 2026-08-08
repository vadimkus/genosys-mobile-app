# Shop Product Option Selection Parity — 2026-08-08

## Problem and RCA

The native Shop grid called:

```text
addItem(product, 1, '', '')
```

for every ordinary product. `CartContext` then normalized an empty size to the
default/first variant. Size products therefore entered the bag with an option
the customer never chose. Color products entered with an empty color and were
only caught later by the native checkout validation.

The server order endpoint recalculates prices from canonical product data, but
it does not reject a missing product option. A missing size can therefore price
as the product/default unit and a missing color can be persisted as null. The
native checkout gate remains a second line of defense, but the Shop grid must
prevent the invalid line earlier.

## Website behavior used as reference

The live website product card does not quick-add a product with more than one
size/color. Its CTA changes to **Choose Options** and opens the product detail
page. The PDP exposes option controls, current price, quantity and add
confirmation. The existing PDP preselects its first configured option.

Native now keeps the explicit-choice business rule while using a bottom sheet
instead of forcing a Shop-to-PDP navigation. The sheet deliberately starts
required dimensions unselected so a compact-grid add can never be interpreted
as customer consent to an arbitrary default.

## Live option inventory

Verified against `https://genosys.ae/api/mobile/products` on 2026-08-08.
Thirteen sellable products require an explicit choice:

### Size

- `cmr6dajor031ygfnm6rsjkicf` — CERABARRIER BIOME GEL CLEANSER:
  `200ml` AED 380 / `600ml` AED 620
- `10` — SNOW O₂ CLEANSER: `180ml` AED 330 / `500ml` AED 510
- `28` — INTENSIVE HYDRO SOOTHING CREAM: `50g` AED 290 / `250g` AED 420
- `30` — INTENSIVE PROBLEM CONTROL CREAM: `50g` AED 290 / `250g` AED 420
- `29` — MOISTURE REPLENISHING HYALURON CREAM: `50g` AED 290 / `250g` AED 420
- `32` — MULTI FUNCTIONAL ANTI-WRINKLE CREAM: `50g` AED 290 / `250g` AED 420
- `31` — MULTI VITA RADIANCE CREAM: `50g` AED 290 / `230g` AED 420
- `25` — SOOTHING REPAIR POSTCREAM: `20g` AED 204 / `100g` AED 440
- `1` — Microneedle Roller: `0.25mm`, `0.1mm`, `0.2mm`, `0.15mm`, `0.5mm`
  at AED 230
- `15` — INTENSIVE PROBLEM CONTROL TONER: `200ml` AED 260 / `500ml` AED 490
- `16` — SNOW BOOSTER: `200ml` AED 260 / `1000ml` AED 490

### Color/shade

- `cmljaahes0017e9ex5yfv76en` — REVITA GLOW BLEMISH BALM CREAM:
  `Bright`, `Natural`
- `41` — SKIN CARING BLEMISH BALM CUSHION:
  `Beige`, `Ivory`, `Camel`

The mobile payload carries DB size/color variants as
`variants[] { size, color, price, available, isDefault }`. Config-backed shade
products also carry `colorVariants[] { value, label, hex }`; Revita currently
uses this fallback with an empty `variants` array. Product-level `stock` /
`inStock` and per-variant `available` drive disabled states. The authenticated
payload applies the user's active discount to variant prices, while
`pricing.discountPercentage` allows the client to reconstruct the correct
variant retail/original price for display and order hints.

No separate package option dimension exists in the live catalog. Package/variant
support is nevertheless generic: any future size+color combinations present in
`variants` are extracted and compatibility/OOS rules are enforced without an
ID-specific branch.

## Native UX

- Shop cards show **Choose Options** for every product requiring a choice.
- Tapping opens an OTA-safe React Native modal/bottom sheet over the existing
  FlatList, preserving scroll position, filters and search state.
- Sheet includes localized product image/name, final and original/discount
  pricing, size and/or shade groups, selected/OOS states, quantity controls,
  Cancel/Close and Add to Bag.
- Required groups start blank. A single/no-option product keeps one-tap add;
  a single available option is safely attached automatically.
- Options are refreshed from the single-product API while the sheet is open.
  Cached options remain visible during refresh; missing/stale option data blocks
  confirmation and offers retry.
- Product or variant OOS changes disable confirmation. Compatibility logic also
  clears a now-invalid paired size/color.
- Add locks prevent rapid double-confirmation. Reopening the sheet supports
  repeated explicit adds.
- Logged-out cards keep the existing Login to Buy flow.
- EN/RU/AR copy, RTL layout, Dynamic Type-friendly wrapping, 44–52pt controls,
  safe-area padding, accessibility roles/states, haptics and native slide
  animation are included.

## Cart, pricing and order integrity

- `utils/productOptions.js` is the canonical native adapter for API variants,
  config-backed `colorVariants`, explicit-selection decisions, compatibility,
  price resolution and composite keys.
- `CartContext.addItem()` now refuses a non-bundle add when required options are
  missing. It no longer silently chooses a default multi-option size.
- Cart identity remains `product + color + size + bundle identity`.
  Same product/options merge; different colors/sizes stay separate.
- Selected variant pricing updates both legacy price fields and the server
  pricing contract stored on the cart line, including VIP/original-price math.
- Existing bag labels, checkout/order payload fields and server recalculation
  continue to receive `selectedSize` / `selectedColor`.
- Checkout validation now uses the same option adapter and also rejects stale,
  unavailable or otherwise invalid selections.
- Other native product-card surfaces route option-required items to their PDP
  instead of invoking a blank quick-add.

## Files

- `app/(tabs)/shop.js`
- `components/ProductOptionSheet.js`
- `components/ProductGridItem.js`
- `app/favorites.js`
- `app/chat.js`
- `components/ChatButton.js`
- `app/concern-detail.js`
- `app/skin-analysis.js`
- `app/skin-analysis-camera.js`
- `components/SkinAnalysisResults.js`
- `contexts/CartContext.js`
- `app/checkout.js`
- `utils/productOptions.js`
- `scripts/smoke-product-options.js`
- `i18n/messages/en.json`
- `i18n/messages/ru.json`
- `i18n/messages/ar.json`
- `package.json`

## Verification

- Live API/native extraction comparison: 13/13 affected products matched.
- `npm run smoke:product-options`: pass.
- `npm run verify:release`: pass, including pricing, cart, order payload,
  repository, product guide and new option tests.
- `npx tsc --noEmit`: pass.
- EN/RU/AR JSON parse: pass.
- `npx expo export --platform ios`: pass.
- `npx expo export --platform android`: pass.
- `git diff --check`: pass.
- Live website `/products`: loaded and inspected; logged-out state correctly
  presents Login to see price.
- Native simulator/device visual test was unavailable on this Mac:
  Xcode `simctl` and Android `adb` are not installed.
- `expo-doctor`: 18/19 checks. The only failure is pre-existing SDK 57 patch
  drift (28 Expo/RN packages); dependencies were intentionally not changed so
  this release remains OTA-safe.

## Backend

No website/backend change was needed. Production already supplies canonical
option, price and availability data for all affected products.

## Production deployment

- Branch: `production`
- Runtime: `1.11.0`
- Commit: `bcb668cd48e9459533558aa265b9b3070bd1061e`
- Update group: `92520eb8-513e-41ec-ace4-a1c4e00f78e7`
- iOS update: `019fdfc0-70ae-7826-a5d9-a456f2034208`
- Android update: `019fdfc0-70ae-742a-a43d-5922f66700df`
- Dashboard: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/updates/92520eb8-513e-41ec-ace4-a1c4e00f78e7
