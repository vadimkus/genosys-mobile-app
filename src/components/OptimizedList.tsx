import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '../contexts/ThemeContext';
import { OptimizedImage } from './OptimizedImage';

const { width } = Dimensions.get('window');

interface OptimizedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  imageUrl?: string;
  isOnSale?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface OptimizedListProps {
  data: OptimizedProduct[];
  onItemPress: (item: OptimizedProduct) => void;
  onItemAddToCart?: (item: OptimizedProduct) => void;
  numColumns?: number;
  estimatedItemSize?: number;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  style?: any;
  contentContainerStyle?: any;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const OptimizedList: React.FC<OptimizedListProps> = ({
  data,
  onItemPress,
  onItemAddToCart,
  numColumns = 2,
  estimatedItemSize = 250,
  horizontal = false,
  showsHorizontalScrollIndicator = false,
  showsVerticalScrollIndicator = true,
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
}) => {
  const { theme } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: OptimizedProduct }) => {
      const cardWidth = horizontal ? 200 : (width - 60) / numColumns;

      return (
        <TouchableOpacity
          style={[
            styles.productCard,
            {
              width: cardWidth,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => onItemPress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.imageContainer}>
            <OptimizedImage
              source={{ uri: item.image || item.imageUrl || '' }}
              style={[
                styles.productImage,
                { width: cardWidth - 32, height: cardWidth - 32 },
              ]}
              resizeMode='cover'
              fallbackSource={require('../../assets/icon.png')}
              accessibilityLabel={`${item.name} product image`}
            />

            {item.isOnSale && (
              <View style={[styles.badge, styles.saleBadge]}>
                <Text style={styles.badgeText}>SALE</Text>
              </View>
            )}

            {item.isNew && (
              <View style={[styles.badge, styles.newBadge]}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
          </View>

          <View style={styles.productInfo}>
            <Text
              style={[styles.productName, { color: theme.colors.text }]}
              numberOfLines={2}
              ellipsizeMode='tail'
            >
              {item.name}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                AED {item.price.toFixed(2)}
              </Text>
            </View>

            {onItemAddToCart && (
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => onItemAddToCart(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [theme, numColumns, horizontal, onItemPress, onItemAddToCart]
  );

  const keyExtractor = useCallback((item: OptimizedProduct) => item.id, []);

  const getItemType = useCallback((item: OptimizedProduct) => {
    // This helps FlashList optimize rendering
    if (item.isFeatured) return 'featured';
    if (item.isNew) return 'new';
    return 'regular';
  }, []);

  const calculatedItemSize = useMemo(() => {
    if (horizontal) return 220;
    return (width - 60) / numColumns + 120; // Card height + padding
  }, [horizontal, numColumns]);

  const EmptyComponent = useMemo(() => {
    if (ListEmptyComponent) return ListEmptyComponent;

    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No products found
        </Text>
      </View>
    );
  }, [ListEmptyComponent, theme]);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      numColumns={horizontal ? undefined : numColumns}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      style={style}
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={EmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

// Horizontal Product Carousel
export const ProductCarousel: React.FC<{
  data: OptimizedProduct[];
  title?: string;
  onItemPress: (item: OptimizedProduct) => void;
  onItemAddToCart?: (item: OptimizedProduct) => void;
  onViewAllPress?: () => void;
  style?: any;
}> = ({ data, title, onItemPress, onItemAddToCart, onViewAllPress, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.carouselContainer, style]}>
      {title && (
        <View style={styles.carouselHeader}>
          <Text style={[styles.carouselTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {onViewAllPress && (
            <TouchableOpacity onPress={onViewAllPress}>
              <Text
                style={[styles.viewAllText, { color: theme.colors.primary }]}
              >
                View All
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <OptimizedList
        data={data}
        onItemPress={onItemPress}
        onItemAddToCart={onItemAddToCart}
        horizontal={true}
        estimatedItemSize={220}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      />
    </View>
  );
};

// Grid Product List
export const ProductGrid: React.FC<{
  data: OptimizedProduct[];
  onItemPress: (item: OptimizedProduct) => void;
  onItemAddToCart?: (item: OptimizedProduct) => void;
  numColumns?: number;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: any;
}> = ({
  data,
  onItemPress,
  onItemAddToCart,
  numColumns = 2,
  onEndReached,
  refreshing,
  onRefresh,
  style,
}) => {
  return (
    <OptimizedList
      data={data}
      onItemPress={onItemPress}
      onItemAddToCart={onItemAddToCart}
      numColumns={numColumns}
      estimatedItemSize={250}
      onEndReached={onEndReached}
      refreshing={refreshing}
      onRefresh={onRefresh}
      style={style}
      contentContainerStyle={styles.gridContent}
    />
  );
};

const styles = StyleSheet.create({
  productCard: {
    borderRadius: 12,
    margin: 8,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadge: {
    backgroundColor: '#ef4444',
  },
  newBadge: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  carouselContainer: {
    marginVertical: 16,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  carouselContent: {
    paddingHorizontal: 12,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
});

export default OptimizedList;
