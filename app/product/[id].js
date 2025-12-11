import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      // Load all products and find the specific one
      const response = await fetch('https://www.genosys.ae/api/mobile/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'genosys_secure_mobile_2025_v1',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.data && Array.isArray(result.data)) {
          const foundProduct = result.data.find(p => p.id === id);
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            Alert.alert('Error', 'Product not found');
            router.back();
          }
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBag = () => {
    if (product) {
      addToCart(product);
      Alert.alert(
        '🛍️ Added to Bag',
        `${product.name} has been added to your bag`,
        [
          { text: 'Continue Shopping', style: 'default' },
          { text: 'View Bag', style: 'default', onPress: () => router.push('/(tabs)/bag') }
        ]
      );
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon');
  };

  const formatDescription = (text) => {
    if (!text) return '';
    
    // Replace multiple newlines with proper line breaks
    return text
      .replace(/\n\n/g, '\n\n')
      .replace(/Regular price:/g, '\n💰 Regular price:')
      .replace(/Bundle price:/g, '💰 Bundle price:')
      .replace(/Save \d+%/g, (match) => `💝 ${match}`)
      .replace(/Kit includes:/g, '\n📦 Kit includes:')
      .replace(/Key ingredients:/g, '\n🧪 Key ingredients:')
      .replace(/Clinical study:/g, '\n🔬 Clinical study:')
      .replace(/Features:/g, '\n✨ Features:')
      .trim();
  };

  const getDisplayDescription = () => {
    if (!product?.description) return '';
    
    const formatted = formatDescription(product.description);
    const isLong = formatted.length > 500;
    
    if (isLong && !showFullDescription) {
      return formatted.substring(0, 500) + '...';
    }
    
    return formatted;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.loadingText}>Loading Product...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#1D1D1F" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonLast]}
            onPress={handleWishlistToggle}
          >
            <Ionicons 
              name={isWishlisted ? "heart" : "heart-outline"} 
              size={22} 
              color={isWishlisted ? "#E74C3C" : "#1D1D1F"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Product Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: `https://www.genosys.ae${product.image}` }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroImagePlaceholder}>
              <Text style={styles.heroPlaceholderText}>
                {product.name?.charAt(0) || 'G'}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.price}>{product.price} AED</Text>
            {product.size && (
              <Text style={styles.size}>{product.size}</Text>
            )}
          </View>

          {/* Full Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this product</Text>
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{getDisplayDescription()}</Text>
                {product.description.length > 500 && (
                  <TouchableOpacity 
                    style={styles.readMoreButton}
                    onPress={() => setShowFullDescription(!showFullDescription)}
                  >
                    <Text style={styles.readMoreText}>
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Rating Section */}
          {product.rating && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Rating</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={styles.star}>
                      {star <= product.rating ? '★' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text style={styles.ratingText}>{product.rating}/5 stars</Text>
              </View>
            </View>
          )}

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featureList}>
              <Text style={styles.feature}>• Premium quality ingredients</Text>
              <Text style={styles.feature}>• Clinically tested formula</Text>
              <Text style={styles.feature}>• Dermatologist recommended</Text>
              <Text style={styles.feature}>• Suitable for all skin types</Text>
              <Text style={styles.feature}>• Fast and secure delivery</Text>
              <Text style={styles.feature}>• 30-day return policy</Text>
            </View>
          </View>

          {/* Product Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Brand</Text>
                <Text style={styles.detailValue}>Genosys</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{product.category}</Text>
              </View>
              {product.size && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Size</Text>
                  <Text style={styles.detailValue}>{product.size}</Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>SKU</Text>
                <Text style={styles.detailValue}>GS-{product.id}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Availability</Text>
                <Text style={[styles.detailValue, { color: product.stock ? '#2ECC71' : '#E74C3C' }]}>
                  {product.stock ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <SafeAreaView style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.priceSection}>
            <Text style={styles.footerPrice}>{product.price} AED</Text>
            <Text style={styles.footerPriceLabel}>Total</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.addToBagButton, !product.stock && styles.addToBagButtonDisabled]}
            onPress={handleAddToBag}
            activeOpacity={0.8}
            disabled={!product.stock}
          >
            <Text style={styles.addToBagText}>
              {!product.stock ? 'Out of Stock' : 
               isInCart(product.id) ? `In Bag (${getItemQuantity(product.id)})` : 'Add to Bag'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#86868B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorText: {
    fontSize: 18,
    color: '#86868B',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButtonLast: {
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 64,
    fontWeight: '600',
    color: '#E74C3C',
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  productInfo: {
    marginBottom: 32,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  size: {
    fontSize: 16,
    color: '#86868B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  descriptionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  description: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
  },
  ratingText: {
    fontSize: 16,
    color: '#86868B',
    fontWeight: '500',
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 16,
    color: '#6E6E73',
    lineHeight: 22,
  },
  detailGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6E6E73',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  priceSection: {
    flex: 1,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  footerPriceLabel: {
    fontSize: 14,
    color: '#86868B',
    marginTop: 2,
  },
  addToBagButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  addToBagButtonDisabled: {
    backgroundColor: '#86868B',
  },
  addToBagText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
