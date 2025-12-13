import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchProductCategories, fetchProducts } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Allowed categories (order as desired in UI)
const ALLOWED_CATEGORY_ORDER = [
  'All',
  'Microneedling',
  'PRO Solution',
  'Cleanser',
  'Peeling',
  'Toner/Mist',
  'Serum',
  'Cream',
  'Mask',
  'Sun',
  'Cushion BB',
  'Scalp/Hair',
  'Eye Care',
  'Device',
  'Holiday Kits',
  'Beauty Boxes',
];

// Map incoming category strings to the allowed display categories
const CATEGORY_MAP = {
  'microneedling': 'Microneedling',
  'pro solution': 'PRO Solution',
  'cleanser': 'Cleanser',
  'peeling': 'Peeling',
  'toner/mist': 'Toner/Mist',
  'toner / mist': 'Toner/Mist',
  'serum': 'Serum',
  'cream': 'Cream',
  'mask': 'Mask',
  'sun': 'Sun',
  'cushion bb': 'Cushion BB',
  'cushion bb, sun': 'Cushion BB',
  'cushion bb, sun, cream': 'Cushion BB',
  'scalp/hair': 'Scalp/Hair',
  'eye care': 'Eye Care',
  'device': 'Device',
  'holiday kits': 'Holiday Kits',
  'kits': 'Holiday Kits',
  'beauty boxes': 'Beauty Boxes',
};

const normalizeCategory = (cat) => {
  if (!cat) return null;
  const key = cat.trim().toLowerCase();
  return CATEGORY_MAP[key] || null;
};

const buildAllowedCategoryList = (foundCategories = []) => {
  const seen = new Set();
  const list = ['All'];
  ALLOWED_CATEGORY_ORDER.slice(1).forEach((allowed) => {
    if (foundCategories.includes(allowed) && !seen.has(allowed)) {
      seen.add(allowed);
      list.push(allowed);
    }
  });
  return list;
};

export default function ShopScreen() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { getFavoritesCount, toggleFavorite, isFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addingProducts, setAddingProducts] = useState(new Set()); // Track which products are being added

  const loadProducts = async () => {
    try {
      console.log('🛍️ Loading enhanced products with user context...');
      
      // Use enhanced fetchProducts function with user context
      const enhancedProducts = await fetchProducts(user);
      
      if (enhancedProducts && enhancedProducts.length > 0) {
        setProducts(enhancedProducts);
        setFilteredProducts(enhancedProducts);
        console.log('✅ Enhanced products loaded:', enhancedProducts.length);
        
        // Debug first few products
        console.log('🔍 First 3 enhanced products badges:');
        enhancedProducts.slice(0, 3).forEach(p => {
          console.log(`  - ${p.name}: ${p.badges?.length || 0} badges`, p.badges?.map(b => b.text) || []);
        });
        
        if (user?.discountPercentage) {
          console.log('💰 User discount applied:', user.discountPercentage + '% ' + user.discountType);
        }
        
        // Extract categories from products (normalized, unique, allowed)
        const normalizedCats = [];
        const seen = new Set();
        enhancedProducts.forEach((product) => {
          const mapped = normalizeCategory(product.category);
          if (mapped && !seen.has(mapped)) {
            seen.add(mapped);
            normalizedCats.push(mapped);
          }
        });
        setCategories(buildAllowedCategoryList(normalizedCats));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('🏷️ Loading categories from API...');
      const categoryData = await fetchProductCategories();
      console.log('📦 Categories received:', categoryData);
      
      // Add "All" as the first option
      const allCategories = ['All', ...categoryData];
      setCategories(prev => {
        const normalized = [];
        const seen = new Set();
        allCategories.forEach((cat) => {
          const mapped = normalizeCategory(cat);
          if (mapped && !seen.has(mapped)) {
            seen.add(mapped);
            normalized.push(mapped);
          }
        });
        const finalList = buildAllowedCategoryList(normalized);
        console.log('✅ Categories set:', finalList);
        return finalList;
      });
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      // If categories already derived from products, keep them; otherwise minimal fallback
      setCategories(prev => prev.length ? prev : ['All']);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    await loadCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Combined search and category filter effect
  useEffect(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const handleProductPress = (product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    // Clear search when selecting a category for better UX
    if (searchQuery) {
      setSearchQuery('');
    }
  };

  // Handle add to cart functionality
  const handleAddToCart = async (product) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to add products to your bag.',
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
      console.log(`✅ Added ${product.name} to cart`);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      Alert.alert('Error', 'Failed to add product to bag. Please try again.');
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

  const handleToggleFavorite = (product) => {
    const result = toggleFavorite(product);
    console.log(result === 'added' 
      ? `💖 ${product.name} added to favorites!`
      : `💔 ${product.name} removed from favorites!`);
  };


  // Use all filtered products for the grid

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.loadingText}>Loading Genosys Products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header - Apple Store Style */}
      <View style={styles.header}>
        {/* Left Side Spacer */}
        <View style={styles.headerSpacer} />
        
        {/* Centered Logo & Text with Heart */}
        <View style={styles.headerCenter}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://genosys.ae/_next/image?url=%2Fimages%2Fprd_logo.png&w=512&q=75' }}
              style={styles.logo}
              resizeMode="contain"
            />
            {/* Favorites Heart Icon - Close to Logo */}
            <TouchableOpacity 
              style={styles.favoritesButton}
              onPress={() => router.push('/favorites')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={getFavoritesCount() > 0 ? "heart" : "heart-outline"} 
                size={24} 
                color={getFavoritesCount() > 0 ? "#E74C3C" : "#C7C7CC"} 
              />
              {getFavoritesCount() > 0 && (
                <View style={styles.favoritesBadge}>
                  <Text style={styles.favoritesBadgeText}>
                    {getFavoritesCount() > 99 ? '99+' : getFavoritesCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Premium Skincare & Beauty</Text>
        </View>
        
        {/* Right Side Elements */}
        <View style={styles.headerRight}>
          
          {/* User Avatar */}
          <TouchableOpacity 
            style={styles.userIndicator} 
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            {user ? (
              <View style={styles.userAvatar}>
                <Text style={styles.userInitials}>
                  {(user.name?.charAt(0) || user.email?.charAt(0) || 'G').toUpperCase()}
                </Text>
                <View style={styles.onlineDot} />
              </View>
            ) : (
              <View style={styles.guestAvatar}>
                <Ionicons name="person-outline" size={18} color="#86868B" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#E74C3C"
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* Search Field */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <View style={styles.searchIcon}>
                <Ionicons name="search" size={18} color="#86868B" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#86868B"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons name="close" size={14} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              <View style={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.activeCategoryButton
                    ]}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.activeCategoryButtonText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Product Count under Categories */}
              <Text style={styles.productCount}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {searchQuery && ` found for "${searchQuery}"`}
              </Text>
            </View>
          )}

          {/* Products Grid */}
          <View style={styles.section}>
          
          {filteredProducts.length === 0 && (searchQuery || selectedCategory !== 'All') ? (
            /* No Search/Filter Results */
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsTitle}>No products found</Text>
              <Text style={styles.noResultsText}>
                {searchQuery && selectedCategory !== 'All' 
                  ? `No products found for "${searchQuery}" in ${selectedCategory} category.`
                  : searchQuery 
                    ? `No products found for "${searchQuery}". Try different keywords.`
                    : `No products found in ${selectedCategory} category.`
                }
              </Text>
              <View style={styles.clearButtonsContainer}>
                {searchQuery && (
                  <TouchableOpacity 
                    style={[styles.clearSearchButton, styles.clearButton]}
                    onPress={() => setSearchQuery('')}
                  >
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
                {selectedCategory !== 'All' && (
                  <TouchableOpacity 
                    style={[styles.clearSearchButton, styles.clearButton]}
                    onPress={() => setSelectedCategory('All')}
                  >
                    <Text style={styles.clearSearchText}>Show All</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            /* Products Grid */
            <View style={styles.gridContainer}>
              {filteredProducts.map((product, index) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={[styles.gridCard, index % 2 === 0 ? styles.gridCardLeft : styles.gridCardRight]}
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
                    
                    {/* Badges */}
                    {product.badges && product.badges.length > 0 && (
                      <View style={styles.badgeContainer}>
                        {product.badges
                          .filter((badge) => {
                            const text = (badge.text || '').toLowerCase();
                            return text !== 'best seller' && text !== 'limited edition' && text !== '50% off';
                          })
                          .slice(0, 2)
                          .map((badge, badgeIndex) => (
                          <View key={badgeIndex} style={[styles.badge, { backgroundColor: badge.color || '#007AFF' }]}>
                            <Text style={styles.badgeText}>{badge.text}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {/* Favorite Heart Button */}
                    <TouchableOpacity 
                      style={styles.favoriteHeart}
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent product card press
                        handleToggleFavorite(product);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons 
                        name={isFavorite(product.id) ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isFavorite(product.id) ? "#E74C3C" : "#ffffff"} 
                      />
                    </TouchableOpacity>
                    
                    {/* Stock Status */}
                    {(product.status === 'out_of_stock' || product.stock === false) && (
                      <View style={styles.stockOverlay}>
                        <Text style={styles.stockOverlayText}>Out of Stock</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.gridContent}>
                    <Text style={styles.gridName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.gridCategory}>{product.category}</Text>
                    
                    
                    {/* Badges removed from content area to avoid duplication - they show on image */}
                    
                    {product.description && (
                      <Text style={styles.gridDescription} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    
                    {/* Beauty Boxes Special Pricing Display */}
                    {(() => {
                      const category = product.category;
                      const name = product.name || '';
                      const hasBeautyBoxInName = name.toUpperCase().includes('BEAUTY BOX');
                      const isCategoryBeautyBoxes = category === 'Beauty Boxes';
                      const isBeautyBox = isCategoryBeautyBoxes || hasBeautyBoxInName;
                      
                      return isBeautyBox;
                    })() ? (
                      <View style={styles.priceContainer}>
                        <Text style={styles.originalPrice}>{((product.displayPrice || product.price || 0) / 0.85).toFixed(2)} AED</Text>
                        <Text style={styles.userDiscount}>15% OFF (Bundle Discount)</Text>
                        <Text style={styles.gridPrice}>{(product.displayPrice || product.price || 0).toFixed(2)} AED</Text>
                        <Text style={styles.vatText}>VAT included</Text>
                      </View>
                    ) : product.originalPrice && product.originalPrice !== (product.displayPrice || product.price) ? (
                      <View style={styles.priceContainer}>
                        <Text style={styles.originalPrice}>{product.originalPrice} AED</Text>
                        <Text style={styles.discountedPrice}>{(product.displayPrice || product.price || 0).toFixed(2)} AED</Text>
                        {product.discountLabel && (
                          <Text style={styles.userDiscount}>{product.discountLabel}</Text>
                        )}
                        <Text style={styles.vatText}>VAT included</Text>
                      </View>
                    ) : (
                      <View style={styles.priceContainer}>
                        <Text style={styles.gridPrice}>{(product.displayPrice || product.price || 0).toFixed(2)} AED</Text>
                        <Text style={styles.vatText}>VAT included</Text>
                      </View>
                    )}

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
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    zIndex: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  logo: {
    width: 110,
    height: 36,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  
  // Elegant Favorites Heart Button - Bigger and Close to Logo
  favoritesButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  favoritesBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoritesBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  
  // Elegant User Avatar
  userIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  guestAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E5E5EA',
  },
  productCount: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'left',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
    paddingHorizontal: 20,
    letterSpacing: -0.3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    // Remove overflow: 'hidden' to allow badges to show
  },
  gridCardLeft: {
    marginRight: 8,
  },
  gridCardRight: {
    marginLeft: 8,
  },
  gridImageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#F5F5F7',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPlaceholderText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#E74C3C',
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
    marginBottom: 4,
  },
  gridDescription: {
    fontSize: 11,
    color: '#86868B',
    lineHeight: 14,
    marginBottom: 6,
  },
  gridPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#86868B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // No Results Styles
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  clearButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  clearSearchButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButton: {
    flex: 1,
    maxWidth: 120,
  },
  clearSearchText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Categories Styles
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 60,
    margin: 4,
  },
  activeCategoryButton: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  activeCategoryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Badge Styles
  badgeContainer: {
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
  },
  
  // Favorite Heart Button
  favoriteHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Stock Overlay
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
  
  
  // Content Badge Styles removed - badges now only show on image overlay
  
  // Enhanced Pricing Styles
  priceContainer: {
    alignItems: 'flex-start',
  },
  originalPrice: {
    fontSize: 12,
    color: '#86868B',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E74C3C',
  },
  savings: {
    fontSize: 10,
    color: '#E74C3C',
    fontWeight: '600',
    backgroundColor: '#E74C3C20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  vatText: {
    fontSize: 9,
    color: '#86868B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  userDiscount: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
    marginBottom: 2,
  },
  
  // Add to Cart Button Styles
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    minHeight: 36,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
  },
  addToCartIcon: {
    marginRight: 6,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
