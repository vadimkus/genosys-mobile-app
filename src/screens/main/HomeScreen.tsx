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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import ProductCarousel from '../../components/ProductCarousel';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useStore();
  const { theme } = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🏠 Loading home screen data...');
      
      const connected = await productService.initialize();
      setIsConnected(connected);
      
      const featured = productService.getFeaturedProducts();
      const newProducts = productService.getNewProducts();
      
      setFeaturedProducts(featured);
      setNewProducts(newProducts);
      
      console.log(`✅ Loaded ${featured.length} featured, ${newProducts.length} new products`);
      console.log('⭐ Featured products:', featured.map(p => p.name));
      console.log('🆕 New products:', newProducts.map(p => p.name));
    } catch (error) {
      console.error('❌ Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              {user?.firstName || 'User'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Premium dermacosmetics and products</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10b981' : '#f59e0b' }]} />
            <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
              {isConnected ? 'Live Data' : 'Offline Mode'}
            </Text>
          </View>
        </View>
      </View>

      {/* Featured Products Carousel */}
      <ProductCarousel
        products={featuredProducts}
        title="🎁 Genosys Kits - active discount"
        onProductPress={(productId) => navigation.navigate('ProductDetail', { productId })}
        onViewAllPress={() => navigation.navigate('MainTabs', { screen: 'Products', params: { featured: true } })}
      />

      {/* New Products Carousel */}
      <ProductCarousel
        products={newProducts}
        title="🆕 New Arrivals"
        onProductPress={(productId) => navigation.navigate('ProductDetail', { productId })}
        showViewAll={false}
      />

    </ScrollView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
  },
  greetingContainer: {
    flex: 1,
    marginRight: 12,
    minWidth: 200,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  debugText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});