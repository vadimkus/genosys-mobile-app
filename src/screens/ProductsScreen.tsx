import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_SPACING = 20;

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  clinicalData: {
    efficacy: number;
    safety: number;
    satisfaction: number;
  };
  aiRecommendation?: {
    score: number;
    reason: string;
  };
}

export default function ProductsScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const categories = ['All', 'Face', 'Body', 'Hair', 'Specialized'];

  const products: Product[] = [
    {
      id: '1',
      name: 'MULTI VITA RADIANCE CREAM',
      category: 'Face',
      price: 280,
      originalPrice: 320,
      image: 'https://genosys.ae/images/products/multi-vita-radiance-cream.jpg',
      description: 'Advanced multi-vitamin cream with clinical-grade ingredients for radiant, youthful skin.',
      ingredients: ['Vitamin C', 'Vitamin E', 'Hyaluronic Acid', 'Niacinamide', 'Retinol', 'Peptides'],
      benefits: ['Reduces fine lines', 'Improves skin texture', 'Boosts radiance', 'Hydrates deeply'],
      clinicalData: { efficacy: 94, safety: 98, satisfaction: 96 },
      aiRecommendation: { score: 92, reason: 'Perfect for your skin type and concerns' }
    },
    {
      id: '2',
      name: 'HR³ MATRIX HAIR SOLUTION',
      category: 'Hair',
      price: 450,
      originalPrice: 520,
      image: 'https://genosys.ae/images/products/hr3-matrix-hair-solution.jpg',
      description: 'Revolutionary hair matrix treatment with advanced peptide technology for hair restoration.',
      ingredients: ['Peptide Complex', 'Biotin', 'Keratin', 'Amino Acids', 'Growth Factors'],
      benefits: ['Stimulates hair growth', 'Strengthens follicles', 'Reduces hair loss', 'Improves density'],
      clinicalData: { efficacy: 89, safety: 95, satisfaction: 91 },
      aiRecommendation: { score: 88, reason: 'Ideal for your hair loss pattern' }
    },
    {
      id: '3',
      name: 'EyeCell EYE ZONE CARE',
      category: 'Face',
      price: 320,
      image: 'https://genosys.ae/images/products/eyecell-eye-zone-care.jpg',
      description: 'Specialized eye treatment with advanced cell technology for delicate eye area.',
      ingredients: ['Eye Peptides', 'Caffeine', 'Hyaluronic Acid', 'Vitamin K', 'Antioxidants'],
      benefits: ['Reduces dark circles', 'Minimizes puffiness', 'Smooths fine lines', 'Brightens eye area'],
      clinicalData: { efficacy: 91, safety: 97, satisfaction: 94 },
      aiRecommendation: { score: 90, reason: 'Excellent for your eye concerns' }
    },
    {
      id: '4',
      name: 'EPI TURNOVER BOOSTING PEELING',
      category: 'Face',
      price: 180,
      image: 'https://genosys.ae/images/products/epi-turnover-peeling.jpg',
      description: 'Gentle yet effective peeling gel for improved skin turnover and texture.',
      ingredients: ['AHA Complex', 'BHA', 'Enzymes', 'Hyaluronic Acid', 'Soothing Agents'],
      benefits: ['Exfoliates gently', 'Improves texture', 'Reduces acne', 'Brightens skin'],
      clinicalData: { efficacy: 87, safety: 93, satisfaction: 89 },
      aiRecommendation: { score: 85, reason: 'Good for your skin sensitivity' }
    },
    {
      id: '5',
      name: 'GENO-LED IR II',
      category: 'Specialized',
      price: 1200,
      image: 'https://genosys.ae/images/products/geno-led-ir-ii.jpg',
      description: 'Professional LED therapy device for advanced skin treatments.',
      ingredients: ['LED Technology', 'Infrared Light', 'Red Light Therapy', 'Blue Light Therapy'],
      benefits: ['Stimulates collagen', 'Reduces inflammation', 'Improves circulation', 'Anti-aging effects'],
      clinicalData: { efficacy: 96, safety: 99, satisfaction: 97 },
      aiRecommendation: { score: 95, reason: 'Perfect for professional treatments' }
    }
  ];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: Product) => {
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [{ text: 'OK' }]
    );
  };

  const handleBuyNow = (product: Product) => {
    navigation.navigate('Cart' as never);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {item.aiRecommendation && (
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        )}
        {item.originalPrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        
        <View style={styles.clinicalData}>
          <View style={styles.clinicalItem}>
            <Text style={styles.clinicalLabel}>Efficacy</Text>
            <Text style={styles.clinicalValue}>{item.clinicalData.efficacy}%</Text>
          </View>
          <View style={styles.clinicalItem}>
            <Text style={styles.clinicalLabel}>Safety</Text>
            <Text style={styles.clinicalValue}>{item.clinicalData.safety}%</Text>
          </View>
          <View style={styles.clinicalItem}>
            <Text style={styles.clinicalLabel}>Satisfaction</Text>
            <Text style={styles.clinicalValue}>{item.clinicalData.satisfaction}%</Text>
          </View>
        </View>

        {item.aiRecommendation && (
          <View style={styles.aiRecommendation}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>AI Recommendation</Text>
              <Text style={styles.aiScore}>{item.aiRecommendation.score}%</Text>
            </View>
            <Text style={styles.aiReason}>{item.aiRecommendation.reason}</Text>
          </View>
        )}

        <View style={styles.productPricing}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>AED {item.originalPrice}</Text>
          )}
          <Text style={styles.currentPrice}>AED {item.price}</Text>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.buyNowButton}
            onPress={() => handleBuyNow(item)}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;

    return (
      <View style={styles.productDetailModal}>
        <View style={styles.productDetailContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedProduct(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image 
              source={{ uri: selectedProduct.image }}
              style={styles.detailImage}
              resizeMode="cover"
            />
            
            <View style={styles.detailInfo}>
              <Text style={styles.detailName}>{selectedProduct.name}</Text>
              <Text style={styles.detailDescription}>{selectedProduct.description}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Key Ingredients</Text>
                {selectedProduct.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientName}>{ingredient}</Text>
                    <View style={styles.ingredientBar}>
                      <View style={[styles.ingredientFill, { width: `${85 + (index * 3)}%` }]} />
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Benefits</Text>
                {selectedProduct.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>✓</Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Clinical Data</Text>
                <View style={styles.clinicalChart}>
                  <View style={styles.clinicalBar}>
                    <Text style={styles.clinicalLabel}>Efficacy</Text>
                    <View style={styles.clinicalBarContainer}>
                      <View style={[styles.clinicalBarFill, { width: `${selectedProduct.clinicalData.efficacy}%` }]} />
                    </View>
                    <Text style={styles.clinicalValue}>{selectedProduct.clinicalData.efficacy}%</Text>
                  </View>
                  <View style={styles.clinicalBar}>
                    <Text style={styles.clinicalLabel}>Safety</Text>
                    <View style={styles.clinicalBarContainer}>
                      <View style={[styles.clinicalBarFill, { width: `${selectedProduct.clinicalData.safety}%` }]} />
                    </View>
                    <Text style={styles.clinicalValue}>{selectedProduct.clinicalData.safety}%</Text>
                  </View>
                  <View style={styles.clinicalBar}>
                    <Text style={styles.clinicalLabel}>Satisfaction</Text>
                    <View style={styles.clinicalBarContainer}>
                      <View style={[styles.clinicalBarFill, { width: `${selectedProduct.clinicalData.satisfaction}%` }]} />
                    </View>
                    <Text style={styles.clinicalValue}>{selectedProduct.clinicalData.satisfaction}%</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Clinical Products</Text>
          <Text style={styles.subtitle}>Advanced skincare with clinical-grade ingredients</Text>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartIcon}>🛍️</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Product Detail Modal */}
      {renderProductDetail()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 18,
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  categoryTabActive: {
    backgroundColor: '#1a1a1a',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  productsList: {
    padding: 20,
  },
  separator: {
    height: 20,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  productImageContainer: {
    position: 'relative',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  aiBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  productInfo: {
    padding: 20,
  },
  productCategory: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  productDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  clinicalData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  clinicalItem: {
    alignItems: 'center',
  },
  clinicalLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
    fontWeight: '500',
  },
  clinicalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  aiRecommendation: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  aiScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  aiReason: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  productDetailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  productDetailContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  detailImage: {
    width: '100%',
    height: 250,
  },
  detailInfo: {
    padding: 20,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    width: 120,
  },
  ingredientBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginLeft: 12,
  },
  ingredientFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 14,
    color: '#3b82f6',
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  clinicalChart: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  clinicalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clinicalBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  clinicalBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
});