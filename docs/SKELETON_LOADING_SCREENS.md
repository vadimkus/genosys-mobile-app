# Skeleton Loading Screens

## Overview

Loading spinners (ActivityIndicator) have been replaced with shimmer/skeleton placeholder screens across the three main loading states: shop grid, product detail, and orders list. This significantly improves perceived performance by showing a content-shaped preview while data loads.

---

## Implementation

### Component: `components/SkeletonLoader.js`

A reusable module that exports:

| Export | Description |
|---|---|
| `ShimmerBar` (default) | Single animated bar with configurable width, height, and border radius |
| `ShopSkeleton` | Category row + 6-card product grid skeleton |
| `ProductDetailSkeleton` | Hero image + specs + description skeleton |
| `OrdersSkeleton` | 3 order card skeletons |

### Animation

Each `ShimmerBar` uses a looping `Animated.timing` opacity animation:
- Oscillates between `0.3` and `1.0` opacity
- 800ms per direction (1.6s full cycle)
- Uses native driver for 60fps performance
- Each bar animates independently for a natural stagger effect

### Color

All skeleton bars use `#E5E7EB` (Tailwind gray-200), matching the app's light UI palette.

---

## Integration Points

### Shop Screen (`app/(tabs)/shop.js`)

**Before:**
```jsx
<SafeAreaView style={styles.loadingContainer}>
  <ActivityIndicator size="large" color="#dc2626" />
  <Text>{t('shop.loading')}</Text>
</SafeAreaView>
```

**After:**
```jsx
<SafeAreaView style={styles.loadingContainer}>
  <ShopSkeleton />
</SafeAreaView>
```

### Product Detail (`app/product/[id].js`)

**Before:**
```jsx
<ActivityIndicator size="large" color="#dc2626" />
<Text>{t('productScreen.loadingDetails')}</Text>
```

**After:**
```jsx
<ProductDetailSkeleton />
```

### Orders (`app/profile/orders.js`)

**Before:**
```jsx
<ActivityIndicator size="large" color="#dc2626" />
<Text>{t('ordersScreen.loading')}</Text>
```

**After:**
```jsx
<OrdersSkeleton />
```

---

## Customization

To create a skeleton for a new screen:

```jsx
import ShimmerBar from '../components/SkeletonLoader';

function MyScreenSkeleton() {
  return (
    <View>
      <ShimmerBar width="60%" height={20} borderRadius={10} />
      <ShimmerBar width="100%" height={120} borderRadius={12} style={{ marginTop: 12 }} />
      <ShimmerBar width="40%" height={16} style={{ marginTop: 8 }} />
    </View>
  );
}
```

Props for `ShimmerBar`:
- `width` — CSS width value (string or number), default `'100%'`
- `height` — number in pixels, default `16`
- `borderRadius` — number, default `8`
- `style` — additional View styles (e.g., margins)
