# Empty States

## Overview

When pages have no content to display (no favorites, no orders, empty cart), the app shows a friendly empty state with the **unicorn mascot image** — matching the mobile web design. This provides a consistent, branded experience across all platforms.

## Unicorn Image

| Property | Value |
|----------|-------|
| Source | `https://genosys.ae/_next/image?url=%2Fimages%2Favatar%2Funi.png&w=512&q=75` |
| Original file | `/public/images/avatar/uni.png` (on the web) |
| Format | PNG, served via Next.js image optimisation |
| Component | `Image` from `expo-image` with `contentFit="contain"` |

The image is loaded from the web CDN (no local asset needed). `expo-image` provides disk + memory caching so subsequent loads are instant.

## Pages Using Unicorn Empty State

### Favorites Page (`app/favorites.js`)

**When:** `favorites.length === 0`

```
┌─────────────────────────┐
│  ← My Favorites         │
├─────────────────────────┤
│                         │
│        🦄 (200x200)     │  ← Unicorn image
│                         │
│    No Favorites Yet     │  ← emptyTitle
│   Tap the heart on any  │  ← emptySubtitle
│   product to save it    │
│                         │
│   [ Browse Products ]   │  ← Red CTA button
│                         │
└─────────────────────────┘
```

| Style | Value |
|-------|-------|
| Image size | 200 x 200px |
| Image margin | 24px bottom |
| Title | 24px, bold, `#1D1D1F` |
| Subtitle | 16px, `#86868B`, centered |
| Button | Red (`#dc2626`), 17px white text |

**i18n keys:** `favorites.emptyTitle`, `favorites.emptySubtitle`, `favorites.browseProducts`

### Orders Page (`app/profile/orders.js`)

**When:** `sortedOrders.length === 0`

```
┌─────────────────────────┐
│  ← My Orders            │
├─────────────────────────┤
│                         │
│        🦄 (240x240)     │  ← Unicorn image
│                         │
│     No orders yet       │  ← emptyTitle
│   When you place orders │  ← emptyText
│   they will appear here │
│                         │
│   [ Start Shopping ]    │  ← Red CTA button
│                         │
└─────────────────────────┘
```

| Style | Value |
|-------|-------|
| Image size | 240 x 240px |
| Image margin | 24px bottom |
| Title | 18px, semibold, `#1D1D1F` |
| Subtitle | 14px, `#8E8E93`, centered |
| Button | Red (`#dc2626`), navigates to shop |

**i18n keys:** `ordersScreen.noOrdersYet`, `ordersScreen.noOrdersHint`, `bag.startShopping`

## Image Implementation

Both pages use `expo-image` for the unicorn image:

```javascript
import { Image } from 'expo-image';

const EMPTY_UNI_IMAGE = 'https://genosys.ae/_next/image?url=%2Fimages%2Favatar%2Funi.png&w=512&q=75';

<Image
  source={EMPTY_UNI_IMAGE}
  style={styles.emptyUniImage}
  contentFit="contain"
/>
```

Using `contentFit="contain"` ensures the full unicorn is visible without cropping, regardless of the container's aspect ratio.

## Consistency with Mobile Web

The mobile web uses the same `uni.png` image on:
- Empty favorites (`/app/favorites/FavoritesClient.tsx`)
- Empty orders (`/app/orders/page.tsx`)
- Empty cart (`/app/cart/CartClient.tsx`)
- Empty order history (`/components/profile/OrderHistory.tsx`)

The native app matches this pattern for favorites and orders. The cart empty state could be updated in a future iteration.

## Files Modified

- `app/favorites.js` — Added unicorn image, switched from `react-native` Image to `expo-image`
- `app/profile/orders.js` — Already had unicorn image (no changes needed)
