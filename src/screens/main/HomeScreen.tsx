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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootStackParamList,
  MainTabParamList,
} from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import ProductCarousel from '../../components/ProductCarousel';
import {
  SkeletonLoader,
  ProductCardSkeleton,
} from '../../components/SkeletonLoader';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ProductCarousel as OptimizedProductCarousel } from '../../components/OptimizedList';
import { trackScreenLoad } from '../../utils/performance';
import { typography } from '../../constants/typography';

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
    const endTracking = trackScreenLoad('HomeScreen');
    loadData();
    return endTracking;
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

      console.log(
        `✅ Loaded ${featured.length} featured, ${newProducts.length} new products`
      );
      console.log(
        '⭐ Featured products:',
        featured.map(p => p.name)
      );
      console.log(
        '🆕 New products:',
        newProducts.map(p => p.name)
      );
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
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.centerContainer}>
              <Image
                source={require('../../../login/Logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <SkeletonLoader width={200} height={16} />
            </View>
          </View>
        </View>

        {/* Featured Products Skeleton */}
        <View style={styles.sectionContainer}>
          <SkeletonLoader
            width={200}
            height={20}
            style={{ marginBottom: 16 }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carouselContainer}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={`featured-skeleton-${index}`} style={styles.skeletonCard}>
                <ProductCardSkeleton />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* New Products Skeleton */}
        <View style={styles.sectionContainer}>
          <SkeletonLoader
            width={150}
            height={20}
            style={{ marginBottom: 16 }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carouselContainer}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={`new-skeleton-${index}`} style={styles.skeletonCard}>
                <ProductCardSkeleton />
              </View>
            ))}
          </ScrollView>
        </View>
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
          <View style={styles.centerContainer}>
            <Image
              source={require('../../../login/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Premium dermacosmetics and products
            </Text>
          </View>
        </View>
      </View>

      {/* Featured Products Carousel - Optimized */}
      <OptimizedProductCarousel
        data={featuredProducts as any}
        title='Genosys Kits - discount'
        onItemPress={product =>
          navigation.navigate('ProductDetail', { productId: product.id })
        }
        onViewAllPress={() =>
          navigation.navigate('MainTabs', {
            screen: 'Products',
            params: { featured: true },
          })
        }
      />

      {/* New Products Carousel - Optimized */}
      <OptimizedProductCarousel
        data={newProducts as any}
        title='New Arrivals'
        onItemPress={product =>
          navigation.navigate('ProductDetail', { productId: product.id })
        }
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 95,
    height: 63,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 13,
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
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  carouselContainer: {
    marginTop: 16,
  },
  skeletonCard: {
    width: 200,
    marginRight: 16,
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
