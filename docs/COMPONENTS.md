# Components


## ErrorBoundary

A React error boundary component that catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | `undefined` | Child components to render |
| `fallback` | `ComponentType<{error: Error, retry: () => void}>` | `undefined` | Custom fallback component |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` | `undefined` | Error callback function |

### Example

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## OptimizedImage

An optimized image component using FastImage with caching, loading states, and error handling.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `ImageSourcePropType` | `undefined` | Image source |
| `style` | `StyleProp<ImageStyle>` | `undefined` | Image styles |
| `resizeMode` | `'contain' | 'cover' | 'stretch' | 'center'` | `'cover'` | Image resize mode |
| `priority` | `'low' | 'normal' | 'high'` | `'normal'` | Loading priority |
| `cache` | `'immutable' | 'web' | 'memory'` | `'immutable'` | Cache strategy |
| `fallbackSource` | `ImageSourcePropType` | `undefined` | Fallback image source |
| `showLoadingIndicator` | `boolean` | `true` | Show loading indicator |
| `accessibilityLabel` | `string` | `undefined` | Accessibility label |

### Example

```tsx
import { OptimizedImage } from './components/OptimizedImage';

<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
  priority="high"
  cache="immutable"
  accessibilityLabel="Product image"
/>
```

## OptimizedList

An optimized list component using FlashList for better performance with large datasets.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Array of data items |
| `onItemPress` | `(item: T) => void` | `undefined` | Item press handler |
| `onItemAddToCart` | `(item: T) => void` | `undefined` | Add to cart handler |
| `numColumns` | `number` | `1` | Number of columns |
| `horizontal` | `boolean` | `false` | Horizontal scrolling |
| `refreshing` | `boolean` | `false` | Refresh state |
| `onRefresh` | `() => void` | `undefined` | Refresh handler |

### Example

```tsx
import { ProductGrid } from './components/OptimizedList';

<ProductGrid
  data={products}
  onItemPress={(product) => navigation.navigate('ProductDetail', { productId: product.id })}
  onItemAddToCart={(product) => addToCart(product)}
  numColumns={2}
  refreshing={refreshing}
  onRefresh={handleRefresh}
/>
```
