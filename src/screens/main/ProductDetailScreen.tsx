import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const { productId } = route.params as { productId: string };
    if (productId) {
      const foundProduct = productService.getProductById(productId);
      setProduct(foundProduct || null);
      if (foundProduct) {
        setSelectedSize(foundProduct.defaultSize || (foundProduct.sizeOptions && foundProduct.sizeOptions[0]) || '');
      }
    }
    setLoading(false);
  }, [route.params]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      Alert.alert(
        'Added to Cart',
        `${product.name} (${quantity} item${quantity > 1 ? 's' : ''}) has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) }
        ]
      );
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#dc2626" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Special handling for INTENSIVE REPAIR COLLAGEN MASK
  const isCollagenMask = product.name.toLowerCase().includes('intensive repair collagen mask');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>

      {/* Product Name */}
      <View style={styles.productNameSection}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.productName}>{product.name}</Text>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {product.isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>SALE</Text>
          </View>
        )}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>

      {/* Size Selection */}
      {product.sizeOptions && product.sizeOptions.length > 0 && (
        <View style={styles.sizeSelectionContainer}>
          <Text style={[styles.sizeSelectionTitle, { color: theme.colors.text }]}>Size</Text>
          <View style={styles.sizeOptionsContainer}>
            {product.sizeOptions.map((size, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sizeOption,
                  selectedSize === size && styles.sizeOptionSelected
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.sizeOptionText,
                  { color: theme.colors.text },
                  selectedSize === size && styles.sizeOptionTextSelected
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Stock Status */}
      <View style={styles.stockStatusContainer}>
        <View style={[styles.stockIndicator, { backgroundColor: product.inStock ? '#10b981' : '#ef4444' }]}>
          <Ionicons 
            name={product.inStock ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color="#ffffff" 
          />
        </View>
        <Text style={[styles.stockStatusText, { color: theme.colors.text }]}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </Text>
      </View>

      {/* Product Category */}
      <TouchableOpacity 
        style={styles.stockStatusContainer}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Products', params: { category: product.category } })}
      >
        <View style={[styles.stockIndicator, { backgroundColor: '#10b981' }]}>
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color="#ffffff" 
          />
        </View>
        <Text style={[styles.stockStatusText, { color: theme.colors.text }]}>
          {product.category}
        </Text>
      </TouchableOpacity>

      {/* Reviews and Price */}
      <View style={styles.reviewsPriceSection}>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐⭐⭐⭐ {product.averageRating.toFixed(1)}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>AED {product.price.toFixed(2)}</Text>
          <Text style={styles.vatText}>(VAT included)</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>AED {product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>

      {/* Add to Cart Section */}
      <View style={styles.cartSection}>
        <Text style={styles.cartSectionTitle}>Add to Cart</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(-1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>AED {(product.price * quantity).toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.content}>

        {/* Comprehensive Product Information for All Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>
            {isCollagenMask 
              ? "INTENSIVE REPAIR COLLAGEN MASK is a professional-grade sheet mask designed to restore skin firmness and elasticity. This innovative mask provides intensive repair and anti-aging benefits with hydrolyzed collagen and hyaluronic acid for comprehensive skin nourishment and hydration."
              : product.description || "Premium Korean dermacosmetics product designed for professional skincare results. This high-quality product combines advanced Korean skincare technology with proven ingredients to deliver exceptional results for all skin types."
            }
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailsList}>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> {product.category === 'Serum' ? 'Advanced skin brightening serum' : product.category === 'Cream' ? 'Professional skincare cream' : product.category === 'Mask' ? 'Professional sheet mask' : 'Professional skincare product'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> {product.category === 'Serum' ? 'Skin brightening and melanin control' : product.category === 'Cream' ? 'Anti-aging and skin nourishment' : product.category === 'Mask' ? 'Intensive skin repair and hydration' : 'Professional skincare treatment'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> {product.category === 'Serum' ? 'MELAZERO® melanin care complex with multi-vitamin formula' : product.category === 'Cream' ? 'Advanced peptides with Korean skincare technology' : product.category === 'Mask' ? 'Hydrolyzed collagen with hyaluronic acid' : 'Korean skincare technology with proven ingredients'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> {product.category === 'Serum' ? 'Skin brightening, even skin tone, natural radiance, melanin control' : product.category === 'Cream' ? 'Anti-aging, skin firmness, hydration, wrinkle reduction' : product.category === 'Mask' ? 'Intensive hydration, skin firmness, elasticity, anti-aging' : 'Professional skincare results, skin health, premium quality'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> {product.category === 'Serum' ? 'Daily brightening treatment, morning and evening' : product.category === 'Cream' ? 'Daily anti-aging care, morning and evening' : product.category === 'Mask' ? '2-3 times per week for intensive treatment' : 'As directed for optimal results'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially {product.category === 'Serum' ? 'dull and uneven skin' : product.category === 'Cream' ? 'mature and aging skin' : product.category === 'Mask' ? 'dry and damaged skin' : 'all skin types'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Application:</Text> {product.category === 'Serum' ? 'Apply to clean skin before moisturizer' : product.category === 'Cream' ? 'Apply to clean skin as final step' : product.category === 'Mask' ? 'Apply to clean skin, leave for 15-20 minutes' : 'Apply to clean skin as directed'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• Professional-Grade Quality</Text>
            <Text style={styles.featureItem}>• Dermatologically Tested</Text>
            <Text style={styles.featureItem}>• Korean Skincare Technology</Text>
            <Text style={styles.featureItem}>• Safe for All Skin Types</Text>
            <Text style={styles.featureItem}>• Clinically Proven Results</Text>
            <Text style={styles.featureItem}>• Premium Ingredients</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            {isCollagenMask ? (
              <>
                <Text style={styles.benefitItem}>• Intensive Hydration - Provides deep moisture for soft, supple skin</Text>
                <Text style={styles.benefitItem}>• Enhanced Elasticity - Boosts collagen production for improved skin firmness</Text>
                <Text style={styles.benefitItem}>• Reduces Fine Lines - Diminishes appearance of wrinkles for youthful complexion</Text>
                <Text style={styles.benefitItem}>• Skin Brightening - Enhances radiance and evens skin tone</Text>
                <Text style={styles.benefitItem}>• Deep Nourishment - Delivers essential nutrients for skin health</Text>
                <Text style={styles.benefitItem}>• Anti-Aging Properties - Combats signs of aging for younger-looking skin</Text>
              </>
            ) : (
              <>
                <Text style={styles.benefitItem}>• Advanced Skincare Technology - Utilizes cutting-edge Korean skincare innovations</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers salon-quality results at home</Text>
                <Text style={styles.benefitItem}>• Skin Health Improvement - Promotes overall skin health and vitality</Text>
                <Text style={styles.benefitItem}>• Premium Ingredients - Contains high-quality, carefully selected ingredients</Text>
                <Text style={styles.benefitItem}>• Dermatologist Recommended - Trusted by skincare professionals worldwide</Text>
                <Text style={styles.benefitItem}>• Long-lasting Effects - Provides sustained benefits for improved skin appearance</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Ingredients</Text>
          <View style={styles.ingredientsList}>
            {isCollagenMask ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hydrolyzed Collagen:</Text> Protein that supports skin structure and improves firmness.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Powerful humectant that attracts and retains moisture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitamin E:</Text> Antioxidant that protects skin from environmental damage.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Seaweed Extract:</Text> Rich in minerals and vitamins for skin nourishment.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Argan Oil:</Text> Moisturizes and softens skin with essential fatty acids.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Shea Butter:</Text> Natural emollient that soothes and hydrates skin.</Text>
              </>
            ) : (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Advanced Peptides:</Text> Stimulate collagen production for firmer, younger-looking skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Provides intense hydration and plumps skin for a youthful appearance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitamin C:</Text> Powerful antioxidant that brightens skin and reduces signs of aging.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Improves skin texture and reduces the appearance of pores.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Ceramides:</Text> Strengthen skin barrier and lock in moisture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Plant Extracts:</Text> Natural botanicals that soothe and nourish the skin.</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.usageList}>
            {isCollagenMask ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse skin thoroughly and apply toner if desired</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Remove mask from package and unfold carefully</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Placement:</Text> Apply mask to face, adjusting for proper fit</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Duration:</Text> Leave on for 15-20 minutes for optimal results</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Removal:</Text> Gently remove mask and massage remaining essence into skin</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Frequency:</Text> Use 2-3 times per week for best results</Text>
              </>
            ) : (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly with a gentle cleanser</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount to clean, dry skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage into skin using upward circular motions</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Absorption:</Text> Allow product to fully absorb into the skin</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Follow-up:</Text> Apply your regular moisturizer and sunscreen</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Frequency:</Text> Use daily for best results, morning and/or evening</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.noteText}>
            <Text style={styles.noteLabel}>Note:</Text> This product is dermatologically tested and clinically proven for professional skincare results. For best results, use consistently as part of your daily skincare routine. Store in a cool, dry place away from direct sunlight. If irritation occurs, discontinue use and consult a dermatologist.
          </Text>
        </View>
      </View>

      {/* Shipping Info */}
        <View style={styles.shippingInfo}>
          <Text style={styles.shippingTitle}>Shipping Information</Text>
          <Text style={styles.shippingItem}>🚚 Free Shipping on orders over 1,000 AED</Text>
          <Text style={styles.shippingItem}>💳 Secure Payment with Stripe checkout</Text>
          <Text style={styles.shippingItem}>🏛️ 5% UAE Tax Payer - Supporting local economy</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  productImage: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#f3f4f6',
  },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  productNameSection: {
    padding: 20,
    paddingBottom: 10,
  },
  reviewsPriceSection: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  brand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc2626',
    marginRight: 12,
  },
  vatText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  detailsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  featuresList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  benefitsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  benefitItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  ingredientsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  ingredientLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  usageList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  usageItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  usageLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteLabel: {
    fontWeight: '600',
    color: '#92400e',
  },
  stockStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  stockIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stockStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  cartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  cartSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shippingInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  shippingItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  sizeSelectionContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sizeSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  sizeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  sizeOptionSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  sizeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  sizeOptionTextSelected: {
    color: '#ffffff',
  },
});
