import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { favorites, toggleFavorite, getFavoritesCount } = useFavorites();
  const [addingProducts, setAddingProducts] = useState(new Set());

  const handleProductPress = (product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to add items to your bag.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    if (product.status === 'out_of_stock' || product.stock === false) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    // Add to tracking set
    setAddingProducts(prev => new Set([...prev, product.id]));

    try {
      await addItem(product, 1, '', ''); // Add 1 quantity with no color/size variants
      console.log(`✅ Added ${product.name} to bag from favorites`);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      Alert.alert('Error', 'Failed to add item to bag. Please try again.');
    } finally {
      // Remove from tracking set after delay
      setTimeout(() => {
        setAddingProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
      }, 500);
    }
  };

  const handleRemoveFromFavorites = (product) => {
    toggleFavorite(product);
    console.log(`💔 ${product.name} removed from favorites`);
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Favorites</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Ionicons name="heart-outline" size={80} color="#E5E5EA" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Products you love will appear here. Tap the heart on any product to save it!
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.back()}
            >
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Favorites</Text>
          <View style={styles.headerRight}>
            <Ionicons name="heart" size={20} color="#E74C3C" />
            <Text style={styles.countText}>({getFavoritesCount()})</Text>
          </View>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {favorites.map((product, index) => (
            <View
              key={product.id}
              style={[styles.gridCard, index % 2 === 0 ? styles.gridCardLeft : styles.gridCardRight]}
            >
              <TouchableOpacity 
                onPress={() => handleProductPress(product)}
                activeOpacity={0.95}
              >
                <View style={styles.gridImageContainer}>
                  {product.image ? (
                    <Image 
                      source={{ uri: `https://www.genosys.ae${product.image}` }} 
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.gridImagePlaceholder}>
                      <Text style={styles.gridPlaceholderText}>
                        {product.name?.charAt(0) || 'G'}
                      </Text>
                    </View>
                  )}
                  
                  {/* Heart Button - Always filled red in favorites */}
                  <TouchableOpacity 
                    style={styles.favoriteHeart}
                    onPress={() => handleRemoveFromFavorites(product)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="heart" 
                      size={20} 
                      color="#E74C3C" 
                    />
                  </TouchableOpacity>
                  
                  {/* Badges */}
                  {product.badges && product.badges.length > 0 && (
                    <View style={styles.badgeContainer}>
                      {product.badges.slice(0, 2).map((badge, badgeIndex) => (
                        <View key={badgeIndex} style={[styles.badge, { backgroundColor: badge.color || '#007AFF' }]}>
                          <Text style={styles.badgeText}>{badge.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.gridContent}>
                  <Text style={styles.gridName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.gridCategory}>{product.category}</Text>
                  
                  {/* Pricing */}
                  {product.originalPrice && product.originalPrice !== (product.displayPrice || product.price) ? (
                    <View style={styles.priceContainer}>
                      <Text style={styles.originalPrice}>{product.originalPrice} AED</Text>
                      <Text style={styles.discountedPrice}>{(product.displayPrice || product.price).toFixed(2)} AED</Text>
                      {product.discountLabel && (
                        <Text style={styles.savings}>{product.discountLabel}</Text>
                      )}
                      <Text style={styles.vatText}>VAT included</Text>
                    </View>
                  ) : (
                    <View style={styles.priceContainer}>
                      <Text style={styles.gridPrice}>{(product.displayPrice || product.price).toFixed(2)} AED</Text>
                      <Text style={styles.vatText}>VAT included</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              
              {/* Add to Cart Button */}
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  (product.status === 'out_of_stock' || product.stock === false || addingProducts.has(product.id)) && styles.addToCartButtonDisabled
                ]}
                onPress={() => handleAddToCart(product)}
                disabled={product.status === 'out_of_stock' || product.stock === false || addingProducts.has(product.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={addingProducts.has(product.id) ? "checkmark" : "bag-add"} 
                  size={16} 
                  color="#ffffff" 
                  style={styles.addToCartIcon}
                />
                <Text style={styles.addToCartText}>
                  {addingProducts.has(product.id) 
                    ? 'Added!' 
                    : (product.status === 'out_of_stock' || product.stock === false) 
                      ? 'Out of Stock' 
                      : user 
                        ? 'Add to Bag' 
                        : 'Login to Buy'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  scrollView: {
    flex: 1,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  gridCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: (SCREEN_WIDTH - 40) / 2,
  },
  gridCardLeft: {
    marginRight: 8,
  },
  gridCardRight: {
    marginLeft: 8,
  },
  gridImageContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  gridImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPlaceholderText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#E74C3C',
  },
  favoriteHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridContent: {
    padding: 12,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 18,
  },
  gridCategory: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  
  // Pricing
  priceContainer: {
    marginBottom: 12,
  },
  beautyBoxPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  beautyBoxDiscount: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
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
  savings: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
    marginBottom: 2,
  },
  vatText: {
    fontSize: 9,
    color: '#86868B',
    fontStyle: 'italic',
  },
  
  // Add to Cart Button
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
  },
  addToCartIcon: {
    marginRight: 4,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  footer: {
    height: 100,
  },
});