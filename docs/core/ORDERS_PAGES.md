# Orders Pages

The app has two order screens: the **Orders List** (`app/profile/orders.js`) and the **Order Detail** (`app/profile/orders/[id].js`). Both display waterfall pricing breakdowns using server-stored discount data.

## Orders List

**File:** `app/profile/orders.js`

### Layout

```
┌─────────────────────────────────┐
│  ← Back    My Orders    🔄     │  ← Header with refresh
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ Order: ORD-2026-001  ▾   │  │  ← Expandable card
│  │         [Details ›] [🗑]  │  │
│  │ ● PAID                    │  │  ← Status badge
│  │ 07 Feb 2026 • Dubai       │  │  ← Date + emirate
│  │ CARD • PAID               │  │  ← Payment info
│  │ AED 361.25    3 items     │  │  ← Total + count
│  │ Shipping: FREE            │  │
│  │                           │  │
│  │ ┌─── Expanded View ────┐ │  │  ← Toggle with chevron
│  │ │ Order Summary         │ │  │
│  │ │ 2× Product Name      │ │  │  ← Item list
│  │ │   Full: AED 200       │ │  │
│  │ │   Disc: 15%           │ │  │
│  │ │   After: AED 170      │ │  │
│  │ │ ───────────────────── │ │  │
│  │ │ Retail Price  AED 500 │ │  │  ← Waterfall
│  │ │ VIP Disc.    -AED 75  │ │  │
│  │ │ Subtotal     AED 425  │ │  │
│  │ │ Bundle Disc. -AED 64  │ │  │
│  │ │ ───────────────────── │ │  │
│  │ │ You saved: AED 139    │ │  │  ← You Saved banner
│  │ │ ───────────────────── │ │  │
│  │ │ Subtotal     AED 361  │ │  │
│  │ │ Shipping     FREE     │ │  │
│  │ │ VAT          AED 17   │ │  │
│  │ │ Total        AED 361  │ │  │
│  │ └──────────────────────┘ │  │
│  │                           │  │
│  │ [💬 WhatsApp Support]     │  │  ← Always shown
│  │ [💳 Pay Now]              │  │  ← Only for unpaid card orders
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ (next order card...)      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Order Loading

```
fetchUserOrders(token, { status: 'pending' })   ← Pending orders first
fetchUserOrders(token, { page: 1, limit: 30 })  ← Recent orders
  ↓
De-duplicate by id/orderNumber
  ↓
Filter out cancelled/deleted orders
  ↓
Sort by date (newest first)
```

### Order Card Features

| Feature | Details |
|---------|---------|
| **Expand/Collapse** | Chevron toggle shows/hides the order summary body |
| **Details button** | Navigates to order detail page (`/profile/orders/[id]`) |
| **Delete button** | Long-press only (650ms delay), prevents accidental deletion |
| **Status badge** | Color-coded pill (green=paid, red=pending/cancelled, blue=shipped) |
| **Pay Now** | Shown for unpaid card orders; opens Stripe WebView |
| **WhatsApp Support** | Opens WhatsApp with pre-filled order inquiry message |

### Delete Rules

Orders can only be deleted by the user when:
- Status is `pending`
- Payment status is NOT `paid` or `confirmed`

Delete requires a long-press (650ms) to prevent accidental taps. A short tap shows a hint alert.

### Expanded View: Item Breakdown

Each item shows:
- Quantity and name with optional size/color
- Promo items labeled as "FREE"
- For discounted items: full price (strikethrough), discount %, and final price
- Original unit price inferred from `inferOriginalUnitPriceFromPct()` using the order's `discountPercentage`

### Expanded View: Waterfall Pricing

Uses server-stored order fields (not `computeWaterfallBreakdown`):

| Order Field | Used For |
|-------------|----------|
| `discountAmount` | VIP discount amount |
| `discountPercentage` | VIP discount % label |
| `bundleDiscountAmount` | Bundle discount amount |
| `bundleDiscountPercentage` | Bundle discount % label |
| `subtotal` | Net subtotal after discounts |

Retail total is reconstructed: `subtotal + discountAmount + bundleDiscountAmount`

Color scheme: Purple (#7C3AED) for VIP, Green (#16A34A) for bundle. See [WATERFALL_PRICING.md](./WATERFALL_PRICING.md).

### Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Pending | Red | `#dc2626` |
| Paid / Confirmed / Delivered | Green | `#27AE60` |
| Cancelled | Red | `#dc2626` |
| Shipped | Blue | `#007AFF` |
| Other | Gray | `#8E8E93` |

## Order Detail

**File:** `app/profile/orders/[id].js`

### Layout

```
┌─────────────────────────────────┐
│  ← Back   Order Details    🔄  │  ← Header
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ 📦 Order Number           │  │  ← Order number card
│  │ ORD-2026-001              │  │
│  │ 🕐 07 Feb 2026 at 2:30 PM │  │
│  └───────────────────────────┘  │
│                                 │
│  ℹ️ ORDER STATUS                │  ← Status section
│  │ PAID                      │  │
│                                 │
│  💳 PAYMENT METHOD              │  ← Payment section
│  │  Pay by Card              │  │
│                                 │
│  📝 ORDER NOTES (if any)       │  ← Notes section
│  │ "Please deliver before 5" │  │
│                                 │
│  🛍️ ITEMS                       │  ← Items section
│  ┌───────────────────────────┐  │
│  │ [IMG] Product Name  [15%] │  │  ← Item card with thumbnail + discount pill
│  │       AED 170.00          │  │
│  │ Qty: 2 • Size: 50ml      │  │
│  │ Each: AED 170.00          │  │
│  │ Full Price: AED 200.00    │  │  ← Strikethrough
│  │ Discount (15%): -AED 30   │  │
│  │ After Discount: AED 170   │  │
│  │ Total: AED 340.00         │  │  ← Only when qty > 1
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ 🎁 Free Items             │  │  ← Promo items (green)
│  │ [IMG] Hydro Cool Mask FREE│  │  ← Smaller thumbnail
│  └───────────────────────────┘  │
│                                 │
│  📍 SHIPPING DETAILS            │  ← Shipping section
│  │ Customer: John Doe        │  │
│  │ Phone: +971 50 123 4567   │  │
│  │ Email: john@example.com   │  │
│  │ Emirate: Dubai            │  │
│  │ Address: Building A, ...  │  │
│                                 │
│  🧮 ORDER SUMMARY              │  ← Summary section (waterfall)
   │  │ Retail Price (3 items)    │  │  ← Strikethrough
   │  │              AED 500      │  │
   │  │ VIP Disc. (15%)           │  │  ← Purple
   │  │             -AED 75       │  │
   │  │ Subtotal    AED 425       │  │  ← Muted (when both discounts)
   │  │ Bundle Disc. (15%)        │  │  ← Green
   │  │             -AED 64       │  │
   │  │ ─────────────────────     │  │
   │  │ Net Subtotal AED 361      │  │  ← Bold
   │  │ Shipping to Dubai  FREE   │  │  ← Green + banner
   │  │ ✓ Free shipping applied!  │  │  ← Green checkmark banner
   │  │ VAT (incl.)   AED 17     │  │
   │  │ All prices VAT inclusive  │  │  ← Red note
   │  │ ═════════════════════     │  │
   │  │ TOTAL        AED 361.25   │  │  ← Bold red
   │  │ 🎉 You saved: AED 139    │  │  ← Green celebration banner
│                                 │
│  [🔄 Reorder]                   │  ← Adds items back to cart
│  [💳 Pay Now]                   │  ← Only for unpaid orders
│  [💬 WhatsApp Support]          │
└─────────────────────────────────┘
```

### Data Loading

```
fetchUserOrderById(token, id)
  ↓ (fail)
fetchUserOrders(token) → find by id or orderNumber
  ↓
setOrder(match)
```

### Sections

| Section | Icon | Color | Content |
|---------|------|-------|---------|
| Order Number | 📦 receipt | Red | Order number (monospace) + date/time |
| Order Status | ℹ️ info-circle | Blue | Status badge pill |
| Payment Method | 💳 card | Green | Method label +  Pay status |
| Order Notes | 📝 chatbox | Gray | Free text (conditional) |
| Items | 🛍️ bag-handle | Red | Item cards with discount breakdown |
| Shipping Details | 📍 location | Green | Customer info, address |
| Order Summary | 🧮 calculator | Blue | Waterfall pricing breakdown |

### Item Card Features

Each paid item shows:
- **Product thumbnail** (56×56 rounded image) with placeholder icon when unavailable
- Name with discount percentage pill badge (green)
- Price per unit and total
- Per-item discount breakdown:
  - Full price (strikethrough)
  - Discount amount and percentage
  - Price after discount
- Line totals for qty > 1

Promo/free items shown separately in a green section with **smaller thumbnails** (40×40) and gift placeholder icon.

### Image URL Resolution

Order items may store image paths in different formats:
- **Relative paths** (e.g., `/images/products/anti-aging-beauty-box.jpg`) — stored in the database
- **Full URLs** (e.g., `https://genosys.ae/images/products/...`) — already complete

The `resolveImageUrl()` helper function (defined in `orders/[id].js`) normalizes these:

```javascript
const resolveImageUrl = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return `${ASSET_ORIGIN}${s.startsWith('/') ? '' : '/'}${s}`;
};
```

Where `ASSET_ORIGIN` defaults to `AUTH_CONFIG.ASSET_ORIGIN` (typically `https://genosys.ae`).

This pattern matches the approach used in `PerfectCombinationCard.js` and other components that successfully display product images.

### Discount Inference

For historical orders that don't store original prices per item, the original unit price is inferred:

```javascript
inferOriginalUnitPriceFromPct({ unitPrice, discountPct })
// Formula: originalPrice = unitPrice / (1 - discountPct/100)
```

Items excluded from VIP discount inference:
- Beauty Boxes (name contains "beauty box")
- Hydro Cool Mask (name contains "hydro cool mask")
- Devices (name contains "genoled", "gentron", "hairgen")

### Reorder

The "Reorder" button:
1. Filters out promo items
2. Fetches fresh product data for each item via `fetchProductById()`
3. Adds items to cart via `addItem()` with original size/color
4. Shows success alert with option to view bag
5. Handles partial failures (some products may no longer be available)

### Actions

| Button | Condition | Action |
|--------|-----------|--------|
| Reorder | Always | Add items back to cart |
| Pay Now | Unpaid + card payment | Open Stripe WebView |
| WhatsApp Support | Always | Open WhatsApp with order inquiry |

## Email Display Logic

For Apple Sign-In users, the order may contain an Apple relay email (`@privaterelay.appleid.com`). The detail page checks for a real `contactEmail` on the user profile and displays that instead.

## Payment Method Detection

| Check | Method |
|-------|--------|
| `isApplePayLike()` | Checks payment method, metadata flow, and provider for Apple Pay |
| `isCodLike()` | Matches "cod", "cash", "cash_on_delivery" |
| `isCardLike()` | Matches "card", "stripe", "apple", "online" |

## Related Files

| File | Purpose |
|------|---------|
| `app/profile/orders.js` | Orders list screen |
| `app/profile/orders/[id].js` | Order detail screen |
| `services/api.js` | `fetchUserOrders()`, `fetchUserOrderById()`, `deleteUserOrder()`, `fetchProductById()` |
| `services/orderService.js` | `getPaymentUrlForExistingOrder()` |
| `contexts/OrdersContext.js` | Orders count for tab badge |
| `contexts/AuthContext.js` | User token and profile |
| `contexts/CartContext.js` | Cart actions for reorder |
| `utils/emirateUtils.js` | `formatEmirateLabel()` |
| `config/auth.js` | `AUTH_CONFIG.ASSET_ORIGIN` for image URL resolution |
| `components/SkeletonLoader.js` | `OrdersSkeleton` loading state |

## i18n

All labels are internationalized across `ordersScreen.*`, `ordersDetail.*`, `checkout.*`, and `common.*` namespaces. See translation files:
- `i18n/messages/en.json`
- `i18n/messages/ar.json`
- `i18n/messages/ru.json`
