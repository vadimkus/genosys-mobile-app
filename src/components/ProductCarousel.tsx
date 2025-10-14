import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Product } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_SPACING = 16;

interface ProductCarouselProps {
  products: Product[];
  title: string;
  onProductPress: (productId: string) => void;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  showNewBadge?: boolean;
}

export default function ProductCarousel({
  products,
  title,
  onProductPress,
  showViewAll = true,
  onViewAllPress,
  showNewBadge = false,
}: ProductCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * (CARD_WIDTH + CARD_SPACING),
      animated: true,
    });
  };

  const renderProductCard = (product: Product, index: number) => (
    <TouchableOpacity
      key={product.id}
      style={[
        styles.productCard,
        { marginLeft: index === 0 ? 0 : CARD_SPACING }
      ]}
      onPress={() => onProductPress(product.id)}
    >
      <View style={styles.productImageContainer}>
        <Image 
        source={{
          uri: product.name === 'POWER SOLUTION PCS'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FPCS.jpg&w=1200&q=75'
            : product.name === 'POWER SOLUTION SWS'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FSWS.jpg&w=1200&q=75'
            : product.name === 'PROBLEM CONTROL SERUM'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FPRSS.jpg&w=1200&q=75'
            : product.name === 'SOOTHING REPAIR POSTCREAM'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FSRC.jpg&w=1200&q=75'
            : product.name === 'SKIN DEFENDER LIP & EYE MAKEUP REMOVER'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FDEF.jpg&w=1200&q=75'
            : product.name === 'SNOW O₂ CLEANSER'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FSNOW.jpg&w=1200&q=75'
            : product.name === 'SNOW BOOSTER'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FBOOS.jpg&w=1200&q=75'
            : product.name === 'SKIN RENEWAL PEELING SYSTEM (SRS)'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FSRS.jpg&w=1200&q=75'
            : product.name === 'SOOTHING BOMB SEA ALGAE MASK'
            ? 'https://genosys.ae/_next/image?url=%2Fimages%2FSEA.jpg&w=1200&q=75'
            : product.imageUrl || 'https://picsum.photos/300/300?random=0'
        }}
          style={styles.productImage}
          resizeMode="cover"
          onError={(error) => {
            console.log(`❌ Image failed to load for ${product.name}: ${product.imageUrl}`);
            console.log('Error:', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log(`✅ Image loaded successfully for ${product.name}: ${product.imageUrl}`);
          }}
        />
        {product.isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>SALE</Text>
          </View>
        )}
        {(product.isNew || showNewBadge) && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          Genosys {product.name}
        </Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>AED {product.price.toFixed(2)}</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>AED {product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐⭐⭐⭐⭐ {product.averageRating.toFixed(1)}/5</Text>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {products.slice(0, Math.ceil(products.length / 2)).map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index === currentIndex ? '#dc2626' : '#d1d5db' }
          ]}
          onPress={() => scrollToIndex(index)}
        />
      ))}
    </View>
  );

  if (products.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No products available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAll && onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContainer}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
      >
        {products.map((product, index) => renderProductCard(product, index))}
      </ScrollView>
      
      {products.length > 2 && renderDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  carouselContainer: {
    paddingRight: 20,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  saleBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saleText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#f59e0b',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
