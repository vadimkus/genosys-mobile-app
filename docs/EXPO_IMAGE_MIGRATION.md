# expo-image Migration

## Overview

All product and UI images have been migrated from React Native's built-in `Image` component to `expo-image`, which provides built-in caching, smooth transitions, and significantly better performance—especially noticeable on product grids with many images.

---

## Why expo-image

| Feature | RN Image | expo-image |
|---|---|---|
| Disk caching | Manual setup needed | Built-in (`memory-disk`) |
| Memory caching | Basic | Two-tier (memory + disk) |
| Fade-in transitions | Not built-in | `transition={200}` prop |
| Blurhash placeholders | Not supported | Built-in support |
| Image format support | Standard | + AVIF, WebP, animated GIF/WebP |
| Performance | Adequate | Significantly faster on lists |
| Bundle size impact | Included in RN | ~200KB additional |

---

## Files Migrated

| File | Images Changed | Notes |
|---|---|---|
| `app/(tabs)/shop.js` | Product grid images, logo | Added `transition={200}`, `cachePolicy="memory-disk"` |
| `app/product/[id].js` | Hero product image | Added `transition={300}` for smooth detail view |
| `app/chat.js` | Product cards in AI chat | Product recommendation images |
| `app/profile/orders.js` | Empty state illustration | |
| `components/product/PerfectCombinationCard.js` | Combo product images | |
| `components/BrandedLaunchScreen.js` | Splash logo | Local asset via `require()` |
| `components/ParallaxScrollView.js` | Parallax header image | |

---

## API Changes

### Import Change

```diff
- import { ..., Image, ... } from 'react-native';
+ import { ... } from 'react-native';
+ import { Image } from 'expo-image';
```

### Prop Changes

| RN Image | expo-image | Notes |
|---|---|---|
| `source={{ uri: url }}` | `source={url}` | String directly, or `{ uri }` both work |
| `resizeMode="cover"` | `contentFit="cover"` | Same values: cover, contain, fill, etc. |
| `resizeMode="contain"` | `contentFit="contain"` | |
| — | `transition={200}` | Fade-in duration in ms |
| — | `cachePolicy="memory-disk"` | Two-tier caching |
| — | `placeholder={blurhash}` | Blurhash string (optional, not yet used) |

### Configuration Used

All remote images use:
```jsx
<Image
  source={imageUrl}
  style={styles.image}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

Local assets (e.g., splash logo) use:
```jsx
<Image
  source={require('../assets/logo.png')}
  style={styles.logo}
  contentFit="contain"
/>
```

---

## Future Enhancements

- **Blurhash placeholders**: Generate blurhash strings server-side for each product image and pass via API. This provides instant colored placeholders while images load.
- **Progressive loading**: Use low-res thumbnails as `placeholder` with full-res as `source`.
- **Prefetching**: Use `Image.prefetch(urls)` to warm the cache for products about to scroll into view.
