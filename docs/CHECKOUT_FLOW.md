# Checkout Flow

The checkout screen (`app/checkout.js`) handles the complete order placement flow including delivery details, payment method selection, order review with waterfall pricing, and order submission.

## Screen Structure

```
┌─────────────────────────────────┐
│  ← Back    Checkout    Refresh  │  ← Header
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 📦 Order Header Card     │  │  ← Collapsible order summary
│  │ 3 items • AED 361.25  ▾  │  │     (CheckoutOrderHeaderCard)
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│                                 │
│  📍 DELIVERY DETAILS            │  ← Section 1: delivery
│  ┌───────────────────────────┐  │
│  │ First Name               │  │
│  │ Last Name                │  │
│  │ Email                    │  │
│  │ Phone (UAE format)       │  │
│  │ Emirate (dropdown)       │  │
│  │ Delivery Address         │  │
│  │ Saved addresses list     │  │
│  │ Order Notes              │  │
│  └───────────────────────────┘  │
│                                 │
│  💳 PAYMENT METHOD              │  ← Section 2: payment
│  ┌───────────────────────────┐  │
│  │ ○ Cash on Delivery (COD) │  │
│  │ ● Pay by Card (Stripe)   │  │
│  └───────────────────────────┘  │
│                                 │
│  🧾 ORDER SUMMARY              │  ← Section 3: review
│  ┌───────────────────────────┐  │
│  │ Retail Price    AED 500   │  │  ← Waterfall pricing
│  │ VIP Discount   -AED 75   │  │     (see WATERFALL_PRICING.md)
│  │ Subtotal       AED 425   │  │
│  │ Bundle Disc.   -AED 64   │  │
│  │ Net Subtotal   AED 361   │  │
│  │ Shipping       FREE      │  │
│  │ VAT            AED 17    │  │
│  │ ─────────────────────── │  │
│  │ TOTAL          AED 361   │  │
│  │ ┌─────────────────────┐ │  │
│  │ │ You saved: AED 139  │ │  │
│  │ └─────────────────────┘ │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │     PLACE ORDER           │  │  ← Submit button
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Sections

### 1. Delivery Details

| Field | Validation | Notes |
|-------|-----------|-------|
| First Name | Required | Auto-filled from user profile |
| Last Name | Required | Auto-filled from user profile |
| Email | Required, valid email | Uses `isValidEmail()` from `checkoutFormUtils` |
| Phone | Required, valid UAE mobile | National format (05x xxx xxxx), validated by `isValidUaeMobileNational()` |
| Emirate | Required, dropdown | Emirates loaded from `getAvailableEmirates()` with flag icons |
| Address | Required | Free text, auto-filled from saved addresses |
| Order Notes | Optional | Additional delivery instructions |

#### Saved Addresses

- Loaded from `getAddresses()` via `AuthContext`
- Tapping a saved address auto-fills: name, phone, email, emirate, and address
- User can also manually type a new address

#### Phone Number Handling

- Input normalized to UAE national digits via `normalizeUaeToNationalDigits()`
- Formatted for display via `formatUaeNationalForInput()`
- Converted to E.164 format for API via `toE164UaePhone()`

### 2. Payment Method

Two options:

| Method | Key | Behavior |
|--------|-----|----------|
| Cash on Delivery | `cod` | Order submitted directly via `submitCODOrder()` |
| Pay by Card | `card` | Order submitted via `submitCardOrder()`, redirects to Stripe WebView |

- Default payment method persisted via `paymentPreferences` service
- Selection triggers `setDefaultPaymentMethod()` for next visit

### 3. Order Summary (Waterfall Pricing)

Full waterfall pricing breakdown. See [WATERFALL_PRICING.md](./WATERFALL_PRICING.md) for details.

Uses `computeWaterfallBreakdown(items, user)` from `utils/cartUtils.js` and `calculateCartTotals()` for shipping/VAT.

## Order Header Card

`CheckoutOrderHeaderCard` component at the top:
- Shows item count, total, and delivery ETA
- Collapsible (chevron toggle) to show/hide item thumbnails
- Displays delivery estimate via `getDeliveryEtaInfo()`

## Order Submission Flow

```
User taps "Place Order"
  ↓
Validate all required fields
  ↓ (fail → scroll to first error, show inline messages)
  ↓ (pass)
Generate order number via generateOrderNumber()
  ↓
Payment === COD?
  ├── Yes → submitCODOrder({ items, customer, emirate, address, ... })
  │         ↓ success → Clear cart → Navigate to order confirmation
  │         ↓ error → Show alert
  └── No  → submitCardOrder({ items, customer, emirate, address, ... })
            ↓ success → Receive paymentUrl
            ↓ Navigate to /payment/stripe WebView
            ↓ error → Show alert
```

### Validation

- Inline error messages below each field
- First invalid field scrolled into view on submit
- Phone validated as UAE mobile format
- Email validated with regex
- Haptic feedback on validation errors and successful submit

## Emirate Selection

- Emirates dropdown with flag icons (`EmirateFlagIcon` component)
- Emirates loaded dynamically based on available shipping rates
- Changing emirate updates shipping cost via `setSelectedEmirate()`
- Each emirate shows: flag icon + localized name via `formatEmirateLabel()`

## Key Dependencies

| File | Purpose |
|------|---------|
| `app/checkout.js` | Main checkout screen |
| `components/checkout/CheckoutOrderHeaderCard.js` | Collapsible order header |
| `components/checkout/EmirateFlagIcon.js` | Emirate flag icons |
| `components/CollapsibleFooter.js` | Reusable collapsible section |
| `utils/cartUtils.js` | `calculateCartTotals()`, `computeWaterfallBreakdown()` |
| `utils/checkoutFormUtils.js` | Form validation, phone formatting, delivery ETA |
| `utils/addressUtils.js` | Address parsing and formatting |
| `services/orderService.js` | `submitCODOrder()`, `submitCardOrder()`, `generateOrderNumber()` |
| `services/paymentPreferences.js` | Persist default payment method |
| `contexts/CartContext.js` | Cart state, items, emirate, shipping |
| `contexts/AuthContext.js` | User profile, saved addresses |

## RTL Support

Full RTL support:
- Section headers reverse icon/text direction
- Form fields align text right
- Emirate dropdown mirrors layout
- Payment option rows reverse
- Summary rows reverse label/value positions
- All text uses `writingDirection: 'rtl'`
