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
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchProductCategories } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShopScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const loadProducts = async () => {
    try {
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
          setProducts(result.data);
          setFilteredProducts(result.data);
          console.log('✅ Products loaded:', result.data.length);
          
          // Extract categories from products for immediate use
          const uniqueCategories = [...new Set(result.data.map(product => product.category))];
          const validCategories = uniqueCategories.filter(cat => cat && cat.trim() !== '');
          const allCategories = ['All', ...validCategories];
          
          console.log('🏷️ Extracted categories:', allCategories);
          setCategories(allCategories);
        }
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
      setCategories(allCategories);
      console.log('✅ Categories set:', allCategories);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      // Fallback to demo categories
      setCategories(['All', 'Professional Skincare', 'Cleansers', 'Moisturizers', 'Serums']);
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://genosys.ae/_next/image?url=%2Fimages%2Fprd_logo.png&w=512&q=75' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Premium Skincare & Beauty</Text>
          
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
                      selectedCategory === category && styles.activeCategoryButton,
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
        </View>


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
                  </View>
                  
                  <View style={styles.gridContent}>
                    <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.gridCategory}>{product.category}</Text>
                    {product.description && (
                      <Text style={styles.gridDescription} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    <Text style={styles.gridPrice}>{product.price} AED</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 40,
  },
  subtitle: {
    fontSize: 17,
    color: '#86868B',
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
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
    overflow: 'hidden',
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
    marginTop: 16,
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
    marginTop: 16,
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // Negative margin to account for item margins
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
    margin: 4, // Add margin to create spacing between buttons
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
});
