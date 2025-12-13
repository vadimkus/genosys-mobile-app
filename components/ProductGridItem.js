import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { hasProductSizeVariants, getProductSizeOptions } from '../utils/productPricing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 20px padding + 20px gap

export default function ProductGridItem({ product }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const imageUrl = product.image_url || (product.image ? `https://genosys.ae${product.image}` : null);
  const isOutOfStock = product.status === 'out_of_stock' || product.stock === false;

  // Debug log to see what badges we have
  console.log(`🔍 ProductGridItem: ${product.name}`, {
    hasBadges: !!product.badges,
    badgeCount: product.badges?.length || 0,
    badges: product.badges?.map(b => b.text) || [],
    hasDiscount: !!product.hasDiscount,
    rating: product.rating
  });

  return (
    <TouchableOpacity
      style={[styles.card, isOutOfStock && styles.cardOutOfStock]}
      onPress={handlePress}
      activeOpacity={0.95}
      disabled={isOutOfStock}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, isOutOfStock && styles.imageOutOfStock]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              {product.name?.charAt(0) || 'G'}
            </Text>
          </View>
        )}
        
        {/* Stock Status Overlay */}
        {isOutOfStock && (
          <View style={styles.stockOverlay}>
            <Text style={styles.stockOverlayText}>Out of Stock</Text>
          </View>
        )}
        
        {/* Badges on Image */}
        {product.badges && product.badges.length > 0 && (
          <View style={styles.badgesContainer}>
            {product.badges.slice(0, 2).map((badge, index) => (
              <View key={index} style={[styles.badge, { backgroundColor: badge.color || '#007AFF' }]}>
                <Text style={styles.badgeText}>{badge.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        {/* Badges removed from content area to avoid duplication - they show on image */}
        
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        
        {/* Size Badge */}
        {(product.size || hasProductSizeVariants(product.id)) && (
          <View style={styles.sizeBadgeContainer}>
            <View style={styles.sizeBadge}>
              <Text style={styles.sizeBadgeText}>
                {hasProductSizeVariants(product.id) 
                  ? `${getProductSizeOptions(product.id).length} sizes`
                  : `Size: ${product.size}`}
              </Text>
            </View>
            {product.inStock && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>In Stock</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Enhanced Pricing with Beauty Box Logic */}
        <View style={styles.priceContainer}>
          {product.category === 'Beauty Boxes' ? (
            <View style={styles.beautyBoxPricing}>
              <Text style={styles.discountedPrice}>
                {product.displayPrice?.toFixed(2) || product.price} AED
              </Text>
              <Text style={styles.originalPrice}>
                {((product.displayPrice || product.price) / 0.85).toFixed(2)} AED
              </Text>
              <Text style={styles.beautyBoxDiscount}>15% off (Bundle Discount)</Text>
            </View>
          ) : product.hasDiscount ? (
            <View style={styles.discountPricing}>
              <Text style={styles.originalPrice}>
                {product.originalPrice} AED
              </Text>
              <Text style={styles.discountedPrice}>
                {product.displayPrice.toFixed(2)} AED
              </Text>
              <View style={styles.savingsContainer}>
                <Text style={styles.savings}>
                  Save {product.discountAmount.toFixed(0)} AED
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.price}>
              {product.displayPrice?.toFixed(2) || product.price} AED
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    // overflow: 'hidden', // Remove this to allow badges to show outside
  },
  cardOutOfStock: {
    opacity: 0.6,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8, // Maintain aspect ratio
    backgroundColor: '#F5F5F7',
    position: 'relative',
    overflow: 'visible', // Make sure badges aren't clipped
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E74C3C',
  },
  stockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  stockOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    minWidth: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 18,
  },
  category: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  discountPricing: {
    alignItems: 'flex-start',
  },
  originalPrice: {
    fontSize: 12,
    color: '#86868B',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
    marginBottom: 2,
  },
  savingsContainer: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savings: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Beauty Box Pricing Styles
  beautyBoxPricing: {
    alignItems: 'flex-start',
  },
  beautyBoxDiscount: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
    marginTop: 2,
  },
  
  // Size Badge Styles
  sizeBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  sizeBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sizeBadgeText: {
    fontSize: 9,
    color: '#666666',
    fontWeight: '500',
  },
  stockBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  stockBadgeText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '600',
  },
});
