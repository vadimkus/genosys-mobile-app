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
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProductById } from '../../services/api';
import ProductVariantSelector from '../../components/ProductVariantSelector';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

// Safely format price values that may come as strings from the API
const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return num.toFixed(2);
  }
  return value ?? '—';
};

// Coerce any incoming value to a displayable string
const asText = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join('\n');
  if (typeof value === 'object') return Object.values(value || {}).join('\n');
  return String(value);
};

const dedupeList = (arr = []) => {
  const seen = new Set();
  const out = [];
  arr.forEach((raw) => {
    const val = asText(raw).trim();
    if (!val) return;
    const key = val.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(val);
    }
  });
  return out;
};

// Helper to pick the first non-empty field from possible API keys
const pickField = (product, keys) => {
  if (!product) return '';
  for (const key of keys) {
    const value = product[key];
    const text = asText(value);
    if (text.trim().length > 0) return text;
  }
  return '';
};

// Try to parse JSON strings (arrays/objects); fall back to raw value
const parseMaybeJSON = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const getArrayField = (product, keys) => {
  if (!product) return [];
  for (const key of keys) {
    const raw = product[key];
    const parsed = parseMaybeJSON(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.map(asText).filter((t) => t.trim().length > 0);
      if (cleaned.length) return dedupeList(cleaned);
    } else if (typeof parsed === 'string') {
      const t = parsed.trim();
      if (t.startsWith('[') && t.endsWith(']')) {
        try {
          const arr = JSON.parse(t);
          if (Array.isArray(arr)) {
            const cleaned = arr.map(asText).filter((v) => v.trim().length > 0);
            if (cleaned.length) return dedupeList(cleaned);
          }
        } catch {}
      }
      if (t.length) return [t];
    }
  }
  return [];
};

const getObjectField = (product, keys) => {
  if (!product) return null;
  for (const key of keys) {
    const parsed = parseMaybeJSON(product[key]);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  }
  return null;
};

const deriveDiscountFromBadges = (product) => {
  const badges = product?.badges || [];
  for (const badge of badges) {
    const text = (badge.text || '').toLowerCase();
    const match = text.match(/(\d+)\s*%/);
    if (match) {
      const pct = Number(match[1]);
      if (pct > 0 && pct < 100) {
        const base = Number(product?.displayPrice ?? product?.price ?? 0);
        if (Number.isFinite(base) && base > 0) {
          const original = base / (1 - pct / 100);
          return { percent: pct, original };
        }
        return { percent: pct, original: null };
      }
    }
  }
  return null;
};

// Spec fields mapping to support website-like details
const SPEC_FIELDS = [
  { label: 'Size', keys: ['size', 'volume', 'productSize'] },
  { label: 'Skin Type', keys: ['skinType', 'skin_type', 'skinTypes'] },
  { label: 'Formulation', keys: ['formulation', 'texture'] },
  { label: 'Key Benefits', keys: ['keyBenefits', 'benefits', 'advantages'] },
  { label: 'Origin', keys: ['origin', 'countryOfOrigin', 'madeIn'] },
  { label: 'Usage', keys: ['usage'] },
  { label: 'Age Group', keys: ['ageGroup'] },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addItem, isInCart, getItemQuantity } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      console.log('🔍 Loading enhanced product with ID:', id);
      
      // Use enhanced fetchProductById with user context
      const enhancedProduct = await fetchProductById(id, user);
      
      if (enhancedProduct) {
        setProduct(enhancedProduct);
        console.log('✅ Product loaded from database:', enhancedProduct.name);
        console.log('📋 Product data from server:', {
          hasVariants: enhancedProduct.variants?.length || 0,
          hasBadges: enhancedProduct.badges?.length || 0,
          calculatedPrice: enhancedProduct.displayPrice || enhancedProduct.price
        });

        // Set default selections from enhanced API data
        if (enhancedProduct.variants && enhancedProduct.variants.length > 0) {
          // Find default variant or use first available one
          const defaultVariant = enhancedProduct.variants.find(v => v.isDefault) || 
                                  enhancedProduct.variants.find(v => v.available) ||
                                  enhancedProduct.variants[0];
          if (defaultVariant) {
            setSelectedSize(defaultVariant.size);
          }
        }

        if (enhancedProduct.colorVariants && enhancedProduct.colorVariants.length > 0) {
          // Use first available color variant
          setSelectedColor(enhancedProduct.colorVariants[0].value);
        }

        if (user && enhancedProduct.originalPrice && enhancedProduct.originalPrice !== (enhancedProduct.displayPrice || enhancedProduct.price)) {
          console.log('💰 User has discount applied server-side');
        }
          } else {
            Alert.alert('Error', 'Product not found');
            router.back();
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
      // Server provides complete product data, no client calculations needed
      addItem(product, 1, selectedColor, selectedSize);
      
      let message = `${product.name} has been added to your bag`;
      if (selectedSize) {
        message += `\nSize: ${selectedSize}`;
      }
      if (selectedColor) {
        message += `\nColor: ${selectedColor}`;
      }
      
      Alert.alert(
        '🛍️ Added to Bag',
        message,
        [
          { text: 'Continue Shopping', style: 'default' },
          { text: 'View Bag', style: 'default', onPress: () => router.push('/(tabs)/bag') }
        ]
      );
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    console.log(`📐 Size changed to ${size}`);
    
    // Find the selected variant for pricing display (enhanced API provides this)
    if (product.variants) {
      const selectedVariant = product.variants.find(v => v.size === size);
      if (selectedVariant) {
        console.log(`💰 Variant price: ${selectedVariant.price} AED`);
      }
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    console.log(`🎨 Color changed to ${color}`);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = async () => {
    if (!product) return;
    const url = `https://genosys.ae/products/${product.id}`;
    const message = `${asText(product.name)}\n${formatPrice(product.displayPrice || product.price)} AED\n${url}`;
    try {
      await Share.share(
        {
          title: asText(product.name) || 'Genosys Product',
          message,
          url,
        },
        { dialogTitle: 'Share product' }
      );
    } catch (error) {
      console.error('Failed to share product', error);
      Alert.alert('Error', 'Could not open share sheet. Please try again.');
    }
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

    const formatted = formatDescription(asText(product.description));
    const isLong = formatted.length > 500;

    if (isLong && !showFullDescription) {
      return formatted.substring(0, 500) + '...';
    }

    return formatted;
  };

  const renderInfoSection = (title, content) => {
    const text = asText(content);
    if (!text || text.trim().length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{text}</Text>
        </View>
      </View>
    );
  };

  const renderSpecs = () => {
    if (!product) return null;
    const rows = SPEC_FIELDS.map(({ label, keys }) => {
      const value = pickField(product, keys);
      return value ? { label, value: asText(value) } : null;
    }).filter(Boolean);

    if (!rows.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.specList}>
          {rows.map((row, idx) => (
            <View key={row.label + idx} style={styles.specItem}>
              <Text style={styles.specLabel}>{row.label}</Text>
              <Text style={styles.specValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderListSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.listContainer}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listText}>{asText(item)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderKeyValueSection = (title, obj) => {
    if (!obj || typeof obj !== 'object') return null;
    const entries = Object.entries(obj).filter(([k, v]) => asText(v).trim().length > 0);
    if (!entries.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.specList}>
          {entries.map(([k, v], idx) => (
            <View key={k + idx} style={styles.specItem}>
              <Text style={styles.specLabel}>{asText(k)}</Text>
              <Text style={styles.specValue}>{asText(v)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
            <Ionicons name="chevron-back" size={22} color="#1D1D1F" />
        </TouchableOpacity>
        
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonMiddle]}
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
            <Text style={styles.category}>{asText(product.category)}</Text>
            <Text style={styles.productName}>{asText(product.name)}</Text>
            
            {/* Enhanced Size and Stock Info from Server */}
            {(product.size || product.hasVariants || (product.variants && product.variants.length > 0)) && (
              <View style={styles.sizeInfoContainer}>
                <Text style={styles.sizeInfo}>
                  {product.variants && product.variants.length > 0
                    ? `${product.variants.length} sizes available`
                    : product.hasVariants 
                      ? 'Multiple sizes available'
                      : `Size: ${asText(product.size)}`}
                </Text>
                {(product.stock || product.inStock) && (
                  <Text style={styles.stockInfo}>✓ In Stock</Text>
                )}
              </View>
            )}
              
              {/* Enhanced Pricing with Beauty Boxes Special Display */}
              {product.category === 'Beauty Boxes' || (product.name && product.name.toLowerCase().includes('beauty box')) ? (
                // Special pricing display for Beauty Boxes on detail page
                <View style={styles.beautyBoxDetailPricing}>
                  <Text style={styles.beautyBoxDetailFullPrice}>
                    Full Price: {formatPrice(product.originalPrice || product.displayPrice || product.price || 0)} AED
                  </Text>
                  <View style={styles.beautyBoxDetailDiscountRow}>
                    <Text style={styles.beautyBoxDetailDiscount}>15% OFF (Bundle Discount)</Text>
                    <Text style={styles.beautyBoxDetailFinalPrice}>
                      Final: {formatPrice(product.displayPrice || product.price || 0)} AED
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.price}>
                  {(() => {
                    const base = product.displayPrice || product.price || 0;
                    const derived = deriveDiscountFromBadges(product);
                    const orig = product.originalPrice || (derived?.original || null);
                    if (orig && orig > base) {
                      return (
                        <Text>
                          <Text style={styles.originalPrice}>{formatPrice(orig)} AED </Text>
                          <Text style={styles.discountedPrice}>{formatPrice(base)} AED</Text>
                        </Text>
                      );
                    }
                    return `${formatPrice(base)} AED`;
                  })()}
                </Text>
              )}
          </View>

            {/* Enhanced Product Variant Selector */}
            {((product.variants && product.variants.length > 0) || 
              (product.colorVariants && product.colorVariants.length > 0) ||
              product.hasVariants) && (
              <ProductVariantSelector
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={handleSizeChange}
                onColorChange={handleColorChange}
              />
            )}

          {/* Product content sections from API */}
          {renderInfoSection(
            'About this product',
            pickField(product, ['details', 'productDetails', 'product_details', 'detail']) || getDisplayDescription()
          )}

          {renderInfoSection(
            'Benefits',
            pickField(product, ['benefits', 'keyBenefits', 'benefit', 'advantages'])
          )}

          {renderInfoSection(
            'Directions',
            pickField(product, ['directions', 'howToUse', 'usage', 'application', 'how_to_use'])
          )}

          {renderInfoSection(
            'Key Ingredients',
            pickField(product, ['keyIngredients', 'ingredients', 'key_ingredients', 'composition'])
          )}

          {renderInfoSection(
            'Note',
            pickField(product, ['note', 'notes', 'warning', 'caution'])
          )}

          {renderSpecs()}

          {renderListSection(
            'Key Benefits',
            getArrayField(product, ['keyBenefits', 'benefits', 'advantages', 'keyFeatures'])
          )}

          {renderListSection(
            'Target Concerns',
            getArrayField(product, ['targetConcerns', 'concerns'])
          )}

          {renderListSection(
            'Ingredients',
            getArrayField(product, ['ingredients'])
          )}

          {renderInfoSection(
            'How to Use',
            pickField(product, ['howToUse', 'directions', 'usage'])
          )}

          {renderKeyValueSection(
            'Product Details',
            getObjectField(product, ['productDetails'])
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
                <Text style={styles.detailValue}>In Stock</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
          <TouchableOpacity
          style={[styles.addToBagButton, isInCart(product.id) && styles.inCartButton]}
            onPress={handleAddToBag}
        >
          <Ionicons 
            name={isInCart(product.id) ? "checkmark" : "bag"} 
            size={20} 
            color="#ffffff" 
            style={styles.buttonIcon}
          />
            <Text style={styles.addToBagText}>
            {isInCart(product.id) ? `In Bag (${getItemQuantity(product.id)})` : 'Add to Bag'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#1D1D1F',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
  headerButtonMiddle: {
    marginHorizontal: 16,
  },
  headerButtonLast: {
    marginLeft: 0,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
    backgroundColor: '#F5F5F7',
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
    fontWeight: '700',
    color: '#E74C3C',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Space for bottom button
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
    lineHeight: 34,
    marginBottom: 12,
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
    color: '#6E6E73',
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
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  featureList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
    marginBottom: 8,
  },
  detailGrid: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listBullet: {
    fontSize: 18,
    color: '#E74C3C',
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#1D1D1F',
    lineHeight: 22,
  },
  specList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  specLabel: {
    fontSize: 15,
    color: '#6E6E73',
    fontWeight: '600',
  },
  specValue: {
    flex: 1,
    fontSize: 15,
    color: '#1D1D1F',
    textAlign: 'right',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6E6E73',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area for home indicator
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addToBagButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inCartButton: {
    backgroundColor: '#27AE60',
    shadowColor: '#27AE60',
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToBagText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sizeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  sizeInfo: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockInfo: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: '#86868B',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
  },
  // Beauty Boxes detail page pricing styles
  beautyBoxDetailPricing: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E74C3C',
    marginVertical: 8,
  },
  beautyBoxDetailFullPrice: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 8,
  },
  beautyBoxDetailDiscountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beautyBoxDetailDiscount: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: 'bold',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  beautyBoxDetailFinalPrice: {
    fontSize: 18,
    color: '#27AE60',
    fontWeight: 'bold',
  },
});