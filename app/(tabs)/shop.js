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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShopScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductPress = (product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  };

  // Split products for different sections
  const featuredProducts = products.slice(0, 6);
  const gridProducts = products.slice(6);

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
          <Text style={styles.title}>Genosys</Text>
          <Text style={styles.subtitle}>Premium Skincare & Beauty</Text>
          <Text style={styles.productCount}>{products.length} products</Text>
        </View>

        {/* Featured Products - Horizontal Carousel */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {featuredProducts.map((product) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={styles.featuredCard}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.95}
                >
                  <View style={styles.featuredImageContainer}>
                    {product.image ? (
                      <Image 
                        source={{ uri: `https://www.genosys.ae${product.image}` }} 
                        style={styles.featuredImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Text style={styles.placeholderText}>
                          {product.name?.charAt(0) || 'G'}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredCategory}>{product.category}</Text>
                    <Text style={styles.featuredName} numberOfLines={2}>{product.name}</Text>
                    {product.description && (
                      <Text style={styles.featuredDescription} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                    <Text style={styles.featuredPrice}>{product.price} AED</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Products Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <View style={styles.gridContainer}>
            {gridProducts.map((product, index) => (
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
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#86868B',
    fontWeight: '400',
    marginBottom: 8,
  },
  productCount: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '500',
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
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  featuredCard: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    width: '100%',
    height: 200,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#E74C3C',
  },
  featuredContent: {
    padding: 20,
  },
  featuredCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E74C3C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
    lineHeight: 22,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#86868B',
    marginBottom: 8,
    lineHeight: 18,
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
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
});
