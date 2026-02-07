# Shop Page Features

The shop page (`app/(tabs)/shop.js`) is the main landing screen of the app. It displays the full product catalog with search, category filtering, product cards, and promotional banners.

## Layout Structure

```
┌────────────────────────────────┐
│  [≡] [EN ▾]    GENOSYS ♥   [👤] │  ← Fixed Header
├────────────────────────────────┤
│  🔍 Search products...         │  ← Search Field
├────────────────────────────────┤
│  All | Microneedling | PRO ... │  ← Category Filter (wrap grid)
│  Cleanser | Peeling | Toner... │
│  12 products in Cream          │  ← Product Count
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ 🎁 Build Your Set        │  │  ← Banner (Beauty Boxes only)
│  │ Mix & match, save 20%   │  │
│  └──────────────────────────┘  │
├────────────────────────────────┤
│  ┌──────┐  ┌──────┐           │  ← 2-Column Product Grid
│  │ Prod │  │ Prod │           │
│  │ Card │  │ Card │           │
│  └──────┘  └──────┘           │
│  ┌──────┐  ┌──────┐           │
│  │      │  │      │           │
│  ...                           │
└────────────────────────────────┘
```

## Header

The fixed header contains three sections:

| Position | Element | Action |
|----------|---------|--------|
| Left | Hamburger menu icon | Opens `NavigationDrawer` |
| Left | Language selector (EN/RU/العربية) | Opens language dropdown modal |
| Center | GENOSYS logo + subtitle | Brand display with shimmer animation |
| Center | Heart icon with badge | Opens `/favorites` |
| Right | User avatar / initial | Opens `/profile` |

### Language Selector

- Dropdown modal with three options: English, Русский, العربية
- Changing language triggers `setLocale()` from `LocalizationContext`
- Current language displayed as 2-letter code (EN, RU, AR)

### Navigation Drawer

- Opened by hamburger icon
- Full-screen overlay drawer component (`components/NavigationDrawer.js`)
- Contains links to major app sections

## Search

- Real-time text filtering with `searchQuery` state
- Filters product names (localized) against the query
- Clear button appears when text is entered
- RTL-aware text alignment

## Categories

### Category Order

Categories are displayed in a fixed order defined by `ALLOWED_CATEGORY_ORDER`:

```
All → Microneedling → PRO Solution → Cleanser → Peeling → Toner/Mist →
Serum → Cream → Mask → Sun → Cushion BB → Scalp/Hair → Eye Care →
Device → Holiday Kits → Beauty Boxes
```

Only categories that have actual products are shown. The list is built by `buildAllowedCategoryList()` which filters the master order against available categories from the API.

### Russian Category Ordering

For Russian locale, categories are reordered using `RU_CATEGORY_PRIORITY_ORDER` to optimize visual wrapping of long translated labels:

```
All → Eye Care → PRO Solution → Sun → Peeling → Scalp/Hair → Cream → Mask → (rest by label length)
```

### Category Display

- Rendered as a flex-wrap grid of pill buttons
- Active category highlighted with green background (`#16A34A`)
- Tapping a category filters products; tapping again resets to "All"
- Product count shown below categories: `"12 products in Cream"`
- Subtle pulse animation on selected category (when animations enabled)

## Build Your Set Banner

A promotional banner linking to the bundle builder.

### Visibility

```javascript
selectedCategory === 'Beauty Boxes' && !searchQuery
```

The banner **only** appears when:
1. The "Beauty Boxes" category is selected
2. No active search query

### Behavior

- Taps open a WebView to `https://genosys.ae/{locale}/bundle-builder`
- Displays gift emoji, title, description, and "Up to 20% OFF" badge
- Localized via `shop.buildYourSet` and `shop.buildYourSetDesc` i18n keys

## Product Grid

### Layout

- 2-column grid with equal-width cards
- Card width calculated dynamically: `(SCREEN_WIDTH - padding - gutter) / 2`
- Side padding: 20px, gutter between cards: 12px

### Product Card Features

Each card displays:

| Element | Details |
|---------|---------|
| Product image | Cached via `expo-image` with `memory-disk` policy |
| Badges | Filtered: removes "Best Seller", "Limited Edition", "50% OFF"; keeps "New" only for PDRN/Bio-Ferment mask |
| Favorite heart | Toggle heart icon with haptic feedback |
| Product name | Localized via `getLocalizedProductName()` |
| Price display | Context-aware (see below) |
| Add to Bag button | Adds to cart with haptic feedback + animation |

### Price Display Logic

| Product Type | Display |
|-------------|---------|
| **Regular (with VIP discount)** | Strikethrough original + discounted price in red |
| **Beauty Boxes** | Strikethrough calculated original (`price / 0.85`) + "15% OFF" pill + actual price |
| **Hydro Cool Mask** | Fixed price only, no discount display |
| **Devices** | Price only, no discount display |
| **Fixed price override** | Price only, no discount display |

### Badge Filtering Rules

- Remove: "Best Seller", "Limited Edition", "50% OFF"
- Remove "Bundle Offer" from Beauty Boxes (redundant)
- Remove "Professional" from Eye Zone Kit and Bio-Ferment Mask
- Keep "New" only for PDRN Mask and Bio-Ferment Mask

## Data Flow

```
fetchProducts(user, locale) → products[]
  ↓
cacheProducts(products)  ← persisted for offline use
  ↓
buildAllowedCategoryList(foundCategories) → categories[]
  ↓
filter by selectedCategory + searchQuery → filteredProducts[]
  ↓
render product grid
```

### Offline Support

Products are cached via `productCache` service. On network failure, cached products are loaded with `getCachedProducts()`.

### Pull-to-Refresh

`RefreshControl` triggers `handleRefresh()` which re-fetches products and categories from the API.

## Loading State

Uses `ShopSkeleton` component showing:
- Category pill row placeholder
- 6-card product grid shimmer placeholders

## RTL Support

Full RTL support throughout:
- Header layout reverses (hamburger → right, avatar → left)
- Search field text alignment flips
- Category grid uses `flexDirection: 'row-reverse'`
- Product card layout mirrors
- All text uses `writingDirection: 'rtl'`

## Related Files

| File | Purpose |
|------|---------|
| `app/(tabs)/shop.js` | Main shop screen |
| `components/NavigationDrawer.js` | Hamburger menu drawer |
| `components/SkeletonLoader.js` | Loading skeleton (`ShopSkeleton`) |
| `utils/productRules.js` | Product type detection and pricing rules |
| `utils/productLocalization.js` | Localized names, descriptions, categories |
| `services/api.js` | `fetchProducts()`, `fetchProductCategories()` |
| `services/productCache.js` | Offline product caching |
| `contexts/FavoritesContext.js` | Favorites state management |
| `utils/haptics.js` | Haptic feedback utilities |
