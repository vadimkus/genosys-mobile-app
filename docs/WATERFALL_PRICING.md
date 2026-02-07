# Waterfall Pricing Breakdown

The waterfall pricing feature provides a transparent, step-by-step breakdown of how the final order price is calculated. It shows each discount layer applied sequentially, making it easy for customers to understand their savings.

## Overview

The waterfall is displayed across four screens:
- **Checkout** (`app/checkout.js`) — full waterfall in the order summary section
- **Bag** (`app/(tabs)/bag.js`) — waterfall inside the collapsible footer
- **Orders List** (`app/profile/orders.js`) — waterfall in the expanded order card
- **Order Detail** (`app/profile/orders/[id].js`) — waterfall in the order summary section

## Waterfall Flow

```
Retail Price (strikethrough)           AED 500.00
├── Your Discount / VIP (purple)      -AED  75.00  (15%)
├── Intermediate Subtotal (muted)      AED 425.00
├── Bundle Discount (green)           -AED  63.75  (15%)
╰── Net Subtotal                       AED 361.25
    Shipping                           FREE
    VAT (5% included)                  AED  17.20
    ─────────────────────────────────
    Total                              AED 361.25

    ┌──────────────────────────────┐
    │   You saved: AED 138.75     │
    └──────────────────────────────┘
```

### Conditional Lines

| Line | Shown When |
|------|-----------|
| Retail Price (strikethrough) | Any discount exists |
| VIP Discount | User has `discountPercentage > 0` and eligible items exist |
| Intermediate Subtotal | **Both** VIP and Bundle discounts exist |
| Bundle Discount | Beauty Box items in the cart |
| Net Subtotal | Any discount exists |
| You Saved Banner | Any discount exists and `totalSaved > 0` |

When no discounts apply, only the plain subtotal, shipping, VAT, and total are shown.

## Color Scheme

| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Retail Price | Gray + strikethrough | `#9CA3AF` | Original price before discounts |
| VIP Discount | Purple | `#7C3AED` | User/VIP discount — stands out distinctly |
| Intermediate Subtotal | Muted Gray | `#9CA3AF` | Transitional value, de-emphasized |
| Bundle Discount | Green | `#16A34A` | Bundle savings — positive connotation |
| Net Subtotal | Black (bold) | `#1D1D1F` | Final subtotal, emphasized |
| You Saved Banner | Green bg + border | `#F0FDF4` bg, `#BBF7D0` border, `#16A34A` text | Celebratory savings highlight |

## Shared Utility: `computeWaterfallBreakdown`

**File:** `utils/cartUtils.js`

```javascript
computeWaterfallBreakdown(items, user) → {
  retailTotal,           // Sum of original prices × quantities
  userDiscountTotal,     // VIP discount amount
  bundleDiscountTotal,   // Bundle (Beauty Box) discount amount
  afterVipSubtotal,      // retailTotal - userDiscountTotal
  userDiscountPct,       // VIP discount percentage
  bundleDiscountPct,     // Bundle discount percentage
  hasUserDiscount,       // Boolean: VIP discount applies
  hasBundleDiscount,     // Boolean: bundle discount applies
  hasAnyDiscount,        // Boolean: any discount applies
  totalSaved,            // userDiscountTotal + bundleDiscountTotal
}
```

### Calculation Logic

1. **Iterate each cart item** and determine the retail (original) unit price:
   - Use `originalPrice` from the product or its size variant
   - Fall back to `displayPrice` or `price`

2. **Skip excluded items:**
   - Promo/free items (`isPromotionItem === true` or `selectedSize === '__PROMO__'`)
   - Items with `price === 0`

3. **VIP Discount** — applied per item if:
   - User has `discountPercentage > 0`
   - Item is **not** a Beauty Box, Hydro Cool Mask, Device, or has a fixed price override
   - Formula: `retailUnitPrice × (discountPct / 100) × quantity`

4. **Bundle Discount** — applied per item if:
   - Item is a Beauty Box product (`isBeautyBoxProduct()`)
   - `originalPrice > displayPrice` (the box has a bundle price)
   - Formula: `(originalPrice - displayPrice) × quantity`

5. **Aggregate:**
   - `retailTotal` = sum of all `retailUnitPrice × quantity`
   - `afterVipSubtotal` = `retailTotal - userDiscountTotal`
   - `totalSaved` = `userDiscountTotal + bundleDiscountTotal`

### Exclusion Rules (from `utils/productRules.js`)

| Product Type | VIP Discount | Bundle Discount | Reason |
|-------------|:---:|:---:|--------|
| Regular products | Yes | No | Standard VIP pricing |
| Beauty Boxes | No | Yes | Already bundle-discounted |
| Hydro Cool Mask | No | No | Fixed promotional price |
| Devices (GenoLED, Gentron, HairGen) | No | No | Fixed device pricing |
| Promo/Free items | No | No | Zero-cost items |

## Screen-Specific Implementation

### Checkout (`app/checkout.js` + `CheckoutOrderHeaderCard`)

- Waterfall computed in `checkout.js` via `computeWaterfallBreakdown(items, user)` and passed as `waterfall` prop to `CheckoutOrderHeaderCard`
- The **collapsible header card** (red bar with chevron at top of page) contains the full waterfall breakdown when expanded
- Includes: line items, promo items banner, free shipping banner, VAT note, "You Saved" banner
- This is the **only** order summary on the checkout page (no duplicate inline section)

### Bag (`app/(tabs)/bag.js`)

- Uses `computeWaterfallBreakdown(items, user)` directly
- Waterfall is rendered inside the `CollapsibleFooter` component's `details` prop
- Same visual structure as checkout

### Orders List (`app/profile/orders.js`)

- **Does not use** `computeWaterfallBreakdown` (no access to product objects)
- Reconstructs the waterfall from server-stored order fields:
  - `order.discountAmount` → VIP discount
  - `order.bundleDiscountAmount` → Bundle discount
  - `order.discountPercentage` → VIP percentage label
  - `order.bundleDiscountPercentage` → Bundle percentage label
  - `retailTotal = subtotal + discountAmount + bundleDiscountAmount`
- Displayed inside the expandable order card (chevron toggle)

### Order Detail (`app/profile/orders/[id].js`)

- Same server-field approach as Orders List
- Displayed in the dedicated "Order Summary" section card
- Also includes per-item discount breakdown with inferred original prices

## i18n Keys

All waterfall labels are internationalized (EN, AR, RU):

| Key | EN | AR | RU |
|-----|----|----|-----|
| `checkout.retailPrice` | Retail Price | سعر التجزئة | Розничная цена |
| `checkout.yourDiscount` | Your Discount | خصمك | Ваша скидка |
| `checkout.bundleDiscount` | Bundle Discount | خصم الباقة | Скидка набора |
| `checkout.intermediateSubtotal` | Subtotal | المجموع الفرعي | Подытог |
| `checkout.netSubtotal` | Net Subtotal | الصافي | Итого нетто |
| `checkout.youSaved` | You saved | وفرت | Вы сэкономили |
| `ordersDetail.retailPrice` | Retail Price | سعر التجزئة | Розничная цена |
| `ordersDetail.vipDiscount` | VIP Discount | خصم VIP | VIP скидка |
| `ordersDetail.bundleDiscount` | Bundle Discount | خصم الباقة | Скидка за набор |

## Related Files

| File | Purpose |
|------|---------|
| `utils/cartUtils.js` | `computeWaterfallBreakdown()` utility |
| `utils/productRules.js` | Product exclusion rules (`isBeautyBoxProduct`, `isHydroCoolMask`, etc.) |
| `app/checkout.js` | Checkout waterfall display |
| `app/(tabs)/bag.js` | Bag footer waterfall display |
| `app/profile/orders.js` | Orders list expanded waterfall |
| `app/profile/orders/[id].js` | Order detail waterfall |
| `i18n/messages/en.json` | English translations |
| `i18n/messages/ar.json` | Arabic translations |
| `i18n/messages/ru.json` | Russian translations |
