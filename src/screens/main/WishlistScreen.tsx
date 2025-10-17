import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { WishlistService, WishlistItem } from '../../services/wishlistService';
import { useStore } from '../../store/useStore';

type WishlistScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with 16px padding on each side

export default function WishlistScreen() {
  const navigation = useNavigation<WishlistScreenNavigationProp>();
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const { user } = useStore();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist items
  useEffect(() => {
    if (user?.id) {
      loadWishlistItems();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadWishlistItems = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await WishlistService.getWishlistItems(user.id);
      console.log('🔍 Raw wishlist data:', data);
      const products = await WishlistService.convertWishlistItemsToProducts(data);
      console.log('🔍 Converted products:', products.map(p => ({ id: p.id, name: p.name, image: p.image })));
      setWishlistItems(products);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      Alert.alert('Error', 'Failed to load wishlist items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to manage your wishlist.');
      return;
    }

    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await WishlistService.removeFromWishlist(productId, user.id);
              await loadWishlistItems(); // Reload wishlist
              Alert.alert('Success', 'Item removed from wishlist');
            } catch (error) {
              console.error('Error removing from wishlist:', error);
              Alert.alert('Error', 'Failed to remove item from wishlist. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [{ text: 'OK' }]
    );
  };

  const handleViewProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const renderWishlistItem = (product: Product) => (
    <View
      key={product.id}
      style={[styles.productCard, { backgroundColor: theme.colors.card }]}
    >
      <TouchableOpacity
        style={styles.productImageContainer}
        onPress={() => handleViewProduct(product)}
      >
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('🖼️ Image load error for product:', product.name, 'URL:', product.image, 'Error:', error.nativeEvent.error);
            }}
            onLoad={() => {
              console.log('🖼️ Image loaded successfully for product:', product.name, 'URL:', product.image);
            }}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#9ca3af" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(product.id)}
        >
          <Ionicons name="heart" size={20} color="#dc2626" />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <TouchableOpacity onPress={() => handleViewProduct(product)}>
          <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>
        </TouchableOpacity>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.colors.text }]}>
            AED {product.price}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
              AED {product.originalPrice}
            </Text>
          )}
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
            {product.rating} ({product.reviewCount})
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(product)}
        >
          <Ionicons name="cart" size={16} color="#ffffff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Wishlist
          </Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading wishlist...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Wishlist ({wishlistItems.length})
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {wishlistItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Your Wishlist is Empty
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Save products you love by tapping the heart icon
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
            >
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {wishlistItems.map(renderWishlistItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    width: cardWidth,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    height: cardWidth * 1.2,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  rating: {
    fontSize: 12,
  },
  addToCartButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderImage: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
});
