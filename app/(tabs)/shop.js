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
  Alert,
  Modal,
  Pressable,
  Animated,
  Easing,
  I18nManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchProductCategories, fetchProducts } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct, getCanonicalUnitPrice, isBeautyBoxProduct } from '../../utils/productRules';
import { useLocalization } from '../../contexts/LocalizationContext';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getCategoryTranslationKey,
  normalizeCategoryCanonical,
  getCategoryTagsForProduct,
} from '../../utils/productLocalization';
import { createLogger } from '../../utils/logger';
import AUTH_CONFIG from '../../config/auth';
import { useAnimation } from '../../contexts/AnimationContext';

const log = createLogger('Shop');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIDE_PADDING = 20;
const GRID_GUTTER = 12;
const GRID_CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_SIDE_PADDING * 2 - GRID_GUTTER) / 2);

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

// RU: preferred visual grouping/order so long labels wrap nicely.
// (Matches desired lines: "Все товары + Уход за областью вокруг глаз", etc.)
const RU_CATEGORY_PRIORITY_ORDER = [
  'All',
  'Eye Care',
  'PRO Solution',
  'Sun',
  'Peeling',
  'Scalp/Hair',
  'Cream',
  'Mask',
];

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
  const { t, locale, setLocale, dir } = useLocalization();
  const { enabled: animationsEnabled, toggle: toggleAnimations } = useAnimation();
  const { addItem } = useCart();
  const { getFavoritesCount, toggleFavorite, isFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addingProducts, setAddingProducts] = useState(new Set()); // Track which products are being added
  const [langOpen, setLangOpen] = useState(false);
  const [langSwitching, setLangSwitching] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [subtitleWidth, setSubtitleWidth] = useState(0);
  const isRTL = dir === 'rtl';

  // Shared pulse for categories + hearts (visible but not disruptive).
  const categoryPulse = React.useRef(new Animated.Value(0)).current;
  const heartPulse = React.useRef(new Animated.Value(0)).current;
  const pulseLoopsRef = React.useRef({ category: null, heart: null });

  // Premium header subtitle animation (shimmer + breath)
  const subtitleShine = React.useRef(new Animated.Value(0)).current;
  const subtitleBreath = React.useRef(new Animated.Value(0)).current;
  const subtitleLoopRef = React.useRef({ shine: null, breath: null });

  // Card animation store keyed by product.id (no hooks inside list map)
  const cardAnimRef = React.useRef(new Map());

  const startFloatLoop = (anim) => {
    try {
      anim.loop?.stop?.();
    } catch {}
    anim.loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim.float, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim.pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim.float, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim.pulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.loop.start();
  };

  const getCardAnim = (id, index = 0) => {
    const key = String(id || '');
    if (!key) return null;
    const existing = cardAnimRef.current.get(key);
    if (existing) return existing;
    const anim = {
      opacity: new Animated.Value(1),
      enterY: new Animated.Value(0),
      float: new Animated.Value(0),
      pulse: new Animated.Value(0),
      loop: null,
      didInit: false,
    };
    cardAnimRef.current.set(key, anim);

    if (animationsEnabled) {
      // Pop-in once when the card is first created (schedule to avoid doing work inline in render).
      anim.didInit = true;
      anim.opacity.setValue(0);
      anim.enterY.setValue(8);
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 280 + Math.min(220, index * 18),
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(anim.enterY, {
            toValue: 0,
            damping: 14,
            stiffness: 180,
            mass: 0.7,
            useNativeDriver: true,
          }),
        ]).start();
        startFloatLoop(anim);
      }, 0);
    }

    return anim;
  };

  // When toggling animations on/off, start/stop loops and normalize values.
  useEffect(() => {
    cardAnimRef.current.forEach((anim) => {
      try { anim.loop?.stop?.(); } catch {}
      anim.loop = null;

      if (!animationsEnabled) {
        anim.didInit = false;
        anim.opacity.setValue(1);
        anim.enterY.setValue(0);
        anim.float.setValue(0);
        anim.pulse.setValue(0);
        return;
      }

      startFloatLoop(anim);
    });
  }, [animationsEnabled]);

  // Categories + heart "breathing/pumping" loops (enabled only when fun mode is ON).
  useEffect(() => {
    const stopAll = () => {
      try { pulseLoopsRef.current.category?.stop?.(); } catch {}
      try { pulseLoopsRef.current.heart?.stop?.(); } catch {}
      pulseLoopsRef.current.category = null;
      pulseLoopsRef.current.heart = null;
    };

    stopAll();
    if (!animationsEnabled) {
      categoryPulse.setValue(0);
      heartPulse.setValue(0);
      return;
    }

    pulseLoopsRef.current.category = Animated.loop(
      Animated.sequence([
        Animated.timing(categoryPulse, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(categoryPulse, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopsRef.current.category.start();

    pulseLoopsRef.current.heart = Animated.loop(
      Animated.sequence([
        Animated.timing(heartPulse, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(heartPulse, {
          toValue: 0,
          duration: 520,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopsRef.current.heart.start();

    return stopAll;
  }, [animationsEnabled, categoryPulse, heartPulse]);

  // Header subtitle shimmer/breath (enabled only when fun mode is ON).
  useEffect(() => {
    const stopAll = () => {
      try { subtitleLoopRef.current.shine?.stop?.(); } catch {}
      try { subtitleLoopRef.current.breath?.stop?.(); } catch {}
      subtitleLoopRef.current.shine = null;
      subtitleLoopRef.current.breath = null;
    };

    stopAll();
    if (!animationsEnabled) {
      subtitleShine.setValue(0);
      subtitleBreath.setValue(0);
      return;
    }

    // Breath (very subtle)
    subtitleLoopRef.current.breath = Animated.loop(
      Animated.sequence([
        Animated.timing(subtitleBreath, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleBreath, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    subtitleLoopRef.current.breath.start();

    // Shimmer sweep (runs even if width is 0; will become visible once measured)
    subtitleLoopRef.current.shine = Animated.loop(
      Animated.sequence([
        Animated.timing(subtitleShine, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(subtitleShine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    subtitleLoopRef.current.shine.start();

    return stopAll;
  }, [animationsEnabled, subtitleShine, subtitleBreath]);

  const renderProductCardInner = (product) => {
    const isFav = !!isFavorite(product?.id);
    return (
      <>
        <View style={styles.gridImageContainer}>
          {product.image ? (
            <Image
              source={{ uri: `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}` }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.gridImagePlaceholder}>
              <Text style={styles.gridPlaceholderText}>{product.name?.charAt(0) || 'G'}</Text>
            </View>
          )}

          {/* Badges */}
          {(() => {
            const nameLower = (product?.name || '').trim().toLowerCase();
            const isOutOfStock = product.status === 'out_of_stock' || product.stock === false;
            const isMesopeciaKit = nameLower.includes('mesopecia') && nameLower.includes('kit');
            const isHolidayKit = nameLower.includes('holiday') && nameLower.includes('kit');
            const isPdrnMask = nameLower.includes('pdrn') && nameLower.includes('mask');
            const isBioFermentMask = nameLower.includes('bio') && nameLower.includes('ferment') && nameLower.includes('mask');
            const isEyeZoneKit = nameLower.includes('eye') && nameLower.includes('zone') && nameLower.includes('kit');
            const isBeautyBox = isBeautyBoxProduct(product);

            const baseBadges = (product.badges || []).filter((badge) => {
              const text = (badge.text || '').toLowerCase().trim();
              if (text === 'best seller' || text === 'limited edition' || text === '50% off') return false;
              // Remove "Bundle Offer" badge from Beauty Boxes
              if (isBeautyBox && text.includes('bundle') && text.includes('offer')) return false;
              // Remove "Professional" badge from specific products
              if (text === 'professional' && (isEyeZoneKit || isBioFermentMask)) return false;
              // Keep "New" only for PDRN mask
              if (text === 'new' && !(isPdrnMask || isBioFermentMask)) return false;
              return true;
            });

            const computedBadges = [];
            if (!isOutOfStock) {
              if (isMesopeciaKit) {
                computedBadges.push({ text: t('common.order'), color: '#FF9500', priority: 0 });
              } else if (!isHolidayKit) {
                computedBadges.push({ text: t('stock.inStock'), color: '#34C759', priority: 0 });
              }
            }

            // Add "New" badge to Bio Ferment Mask even if backend doesn't send it
            const hasNewBadge = baseBadges.some((b) => String(b?.text || '').toLowerCase().trim() === 'new');
            if (isBioFermentMask && !hasNewBadge) {
              computedBadges.push({ text: t('common.new'), color: '#007AFF', priority: 1 });
            }

            const badges = [...computedBadges, ...baseBadges]
              .sort((a, b) => (a.priority || 10) - (b.priority || 10))
              .slice(0, 2);

            if (!badges.length) return null;

            return (
              <View style={[styles.badgeContainer, isRTL && styles.badgeContainerRTL]}>
                {badges.map((badge, badgeIndex) => (
                  <View
                    key={`${badge.text || 'badge'}-${badgeIndex}`}
                    style={[styles.badge, { backgroundColor: badge.color || '#007AFF' }]}
                  >
                    <Text style={styles.badgeText}>{badge.text}</Text>
                  </View>
                ))}
              </View>
            );
          })()}

          {/* Favorite Heart Button */}
          <TouchableOpacity
            style={styles.favoriteHeart}
            onPress={(e) => {
              e.stopPropagation(); // Prevent product card press
              handleToggleFavorite(product);
            }}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                animationsEnabled && isFav && {
                  transform: [{
                        scale: heartPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }),
                  }],
                },
              ]}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? '#dc2626' : '#ffffff'}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Stock Status */}
          {(product.status === 'out_of_stock' || product.stock === false) && (
            <View style={styles.stockOverlay}>
              <Text style={styles.stockOverlayText}>{t('stock.outOfStock')}</Text>
            </View>
          )}
        </View>

        <View style={[styles.gridContent, isRTL && styles.gridContentRTL]}>
          <Text style={[styles.gridName, isRTL && styles.gridNameRTL]} numberOfLines={2}>
            {getLocalizedProductName(product, locale) || product.name}
          </Text>
          <Text style={[styles.gridCategory, isRTL && styles.gridCategoryRTL]}>
            {getCategoryTranslationKey(product.category) ? t(getCategoryTranslationKey(product.category)) : product.category}
          </Text>

          {(getLocalizedProductDescription(product, locale) || product.localizedDescription || product.description) && (
            <Text style={[styles.gridDescription, isRTL && styles.gridDescriptionRTL]} numberOfLines={2}>
              {getLocalizedProductDescription(product, locale) || product.localizedDescription || product.description}
            </Text>
          )}

          {/* Beauty Boxes Special Pricing Display */}
          {(() => {
            const category = product.category;
            const nm = getLocalizedProductName(product, locale) || product.name || '';
            const hasBeautyBoxInName = nm.toUpperCase().includes('BEAUTY BOX');
            const isCategoryBeautyBoxes = category === 'Beauty Boxes';
            const isBeautyBox = isCategoryBeautyBoxes || hasBeautyBoxInName;
            return isBeautyBox;
          })() ? (
            <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
              <Text style={styles.originalPrice}>{((product.displayPrice || product.price || 0) / 0.85).toFixed(2)} AED</Text>
              <Text style={styles.userDiscount}>{t('bag.bundleDiscount15')}</Text>
              <Text style={styles.gridPrice}>{(product.displayPrice || product.price || 0).toFixed(2)} AED</Text>
              <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
            </View>
          ) : (hasFixedPriceOverride(product) || isHydroCoolMask(product) || isDeviceProduct(product)) ? (
            <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
              <Text style={styles.gridPrice}>{getCanonicalUnitPrice(product).toFixed(2)} AED</Text>
              <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
            </View>
          ) : product.originalPrice && product.originalPrice !== (product.displayPrice || product.price) ? (
            <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
              <Text style={styles.originalPrice}>{product.originalPrice} AED</Text>
              <Text style={styles.discountedPrice}>{(product.displayPrice || product.price || 0).toFixed(2)} AED</Text>
              {product.discountLabel && <Text style={styles.userDiscount}>{product.discountLabel}</Text>}
              <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
            </View>
          ) : (
            <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
              <Text style={styles.gridPrice}>{(product.displayPrice || product.price || 0).toFixed(2)} AED</Text>
              <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isRTL && styles.addToCartButtonRTL,
              (product.status === 'out_of_stock' || product.stock === false || addingProducts.has(product.id)) && styles.addToCartButtonDisabled,
            ]}
            onPress={() => handleAddToCart(product)}
            disabled={product.status === 'out_of_stock' || product.stock === false || addingProducts.has(product.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={addingProducts.has(product.id) ? 'checkmark' : 'bag-add'}
              size={16}
              color="#ffffff"
              style={[styles.addToCartIcon, isRTL && styles.addToCartIconRTL]}
            />
            <Text style={[styles.addToCartText, isRTL && styles.addToCartTextRTL]}>
              {addingProducts.has(product.id)
                ? t('shop.added')
                : (product.status === 'out_of_stock' || product.stock === false)
                  ? t('stock.outOfStock')
                  : user
                    ? t('shop.addToBag')
                    : t('shop.loginToBuy')}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const currentLangCode = langSwitching
    ? '...'
    : (locale === 'ar' ? 'AR' : locale === 'ru' ? 'RU' : 'EN');

  const handleSelectLocale = async (nextLocale) => {
    const next = String(nextLocale || '').toLowerCase();
    if (!['en', 'ru', 'ar'].includes(next)) return;
    setLangOpen(false);
    setLangSwitching(true);
    try {
      await setLocale?.(next);
    } finally {
      // If a reload happens (AR <-> non-AR), the app will restart anyway.
      setTimeout(() => setLangSwitching(false), 150);
    }
  };

  const loadProducts = async () => {
    try {
      log.debug('Loading products with user context...');
      
      // Use enhanced fetchProducts function with user context
      const enhancedProducts = await fetchProducts(user, { locale });
      
      if (enhancedProducts && enhancedProducts.length > 0) {
        setProducts(enhancedProducts);
        setFilteredProducts(enhancedProducts);
        log.debug('Products loaded', { count: enhancedProducts.length });
        
        // Debug first few products
        log.debug('First 3 products badges (debug)');
        enhancedProducts.slice(0, 3).forEach(p => {
          log.debug('Product badges', { name: getLocalizedProductName(p, locale) || p.name, count: p.badges?.length || 0 });
        });
        
        if (user?.discountPercentage) {
          log.debug('User discount applied', { discountPercentage: user.discountPercentage, discountType: user.discountType });
        }
        
        // Extract categories from products (normalized, unique, allowed)
        const normalizedCats = [];
        const seen = new Set();
        enhancedProducts.forEach((product) => {
          const tags = getCategoryTagsForProduct(product);
          tags.forEach((tag) => {
            if (tag && !seen.has(tag)) {
              seen.add(tag);
              normalizedCats.push(tag);
            }
          });
        });
        setCategories(buildAllowedCategoryList(normalizedCats));
      }
    } catch (error) {
      log.error('Error loading products', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      log.debug('Loading categories from API...');
      const categoryData = await fetchProductCategories();
      log.debug('Categories received', { hasData: !!categoryData });
      
      // Add "All" as the first option
      const allCategories = ['All', ...categoryData];
      setCategories(prev => {
        const normalized = [];
        const seen = new Set();
        allCategories.forEach((cat) => {
          const mapped = normalizeCategoryCanonical(cat);
          if (mapped && !seen.has(mapped)) {
            seen.add(mapped);
            normalized.push(mapped);
          }
        });
        const finalList = buildAllowedCategoryList(normalized);
        log.debug('Categories set', { count: finalList.length });
        return finalList;
      });
    } catch (error) {
      log.error('Error loading categories', error?.message || error);
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
        getCategoryTagsForProduct(product).includes(selectedCategory)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const norm = (s) => String(s || '').toLowerCase().normalize('NFKD');
      const q = norm(searchQuery).trim();
      filtered = filtered.filter((product) => {
        const canonical = normalizeCategoryCanonical(product?.category) || '';
        const canonicalKey = canonical ? getCategoryTranslationKey(canonical) : null;
        const canonicalLabel = canonicalKey ? t(canonicalKey) : canonical;

        const tagLabels = getCategoryTagsForProduct(product).map((tag) => {
          const k = getCategoryTranslationKey(tag);
          return k ? t(k) : tag;
        });

        const haystack = [
          getLocalizedProductName(product, locale),
          product?.name,
          getLocalizedProductDescription(product, locale),
          product?.description,
          product?.category,
          canonical,
          canonicalLabel,
          ...tagLabels,
        ]
          .map(norm)
          .join(' ');

        return haystack.includes(q);
      });
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
        t('checkout.loginRequiredTitle'),
        t('checkout.loginRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.login'), onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    if (product.status === 'out_of_stock' || product.stock === false) {
      Alert.alert(t('stock.outOfStock'), t('stock.outOfStockMessage'));
      return;
    }

    // Add to tracking set
    setAddingProducts(prev => new Set([...prev, product.id]));

    try {
      await addItem(product, 1, '', ''); // Add 1 quantity with no color/size variants
      log.debug('Added to cart', { productId: product?.id });
    } catch (error) {
      log.error('Failed to add product to cart', error?.message || error);
      Alert.alert(t('common.error'), t('shop.addToBagFailed'));
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
    log.debug(
      result === 'added'
        ? `favorite_added:${String(product?.id || '')}`
        : `favorite_removed:${String(product?.id || '')}`
    );
  };


  // Use all filtered products for the grid

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>{t('shop.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header - Apple Store Style */}
      <View
        style={[styles.header, isRTL && styles.headerRtl]}
        onLayout={(e) => {
          const h = e?.nativeEvent?.layout?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h > 0) setHeaderHeight(h);
        }}
      >
        {/* Left: Language dropdown (like website) */}
        <View style={[styles.headerLeft, isRTL && styles.headerLeftRtl]}>
          <TouchableOpacity
            onPress={() => setLangOpen((v) => !v)}
            disabled={langSwitching}
            activeOpacity={0.85}
            style={styles.langButton}
            accessibilityRole="button"
            accessibilityLabel="Switch language"
          >
            <Text style={styles.langButtonText}>{currentLangCode}</Text>
            <Ionicons name={langOpen ? 'chevron-up' : 'chevron-down'} size={14} color="#16A34A" />
          </TouchableOpacity>

          {/* Animation toggle (two vertical lines like website) */}
          <TouchableOpacity
            onPress={() => toggleAnimations?.()}
            activeOpacity={0.85}
            style={styles.animToggleBtn}
            accessibilityRole="button"
            accessibilityLabel={`Animations ${animationsEnabled ? 'enabled' : 'disabled'}. Tap to ${animationsEnabled ? 'disable' : 'enable'} animations.`}
          >
            <View style={styles.animIcon}>
              <View
                style={[
                  styles.animBar,
                  { backgroundColor: animationsEnabled ? '#16A34A' : '#111827' },
                ]}
              />
              <View
                style={[
                  styles.animBar,
                  { backgroundColor: animationsEnabled ? '#16A34A' : '#111827' },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Centered Logo & Text with Heart */}
        <View style={styles.headerCenter}>
          <View style={[styles.logoContainer, isRTL && styles.logoContainerRtl]}>
            <Image 
              source={{ uri: AUTH_CONFIG.LOGO_URL }}
              style={styles.logo}
              resizeMode="contain"
            />
            {/* Favorites Heart Icon - Close to Logo */}
            <TouchableOpacity 
              style={styles.favoritesButton}
              onPress={() => router.push('/favorites')}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  animationsEnabled && {
                    transform: [{
                      scale: heartPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }),
                    }],
                  },
                ]}
              >
                <Ionicons 
                  name={getFavoritesCount() > 0 ? "heart" : "heart-outline"} 
                  size={24} 
                  // requested: red heart (even when empty, it stays outline but red)
                  color="#dc2626"
                />
              </Animated.View>
              {getFavoritesCount() > 0 && (
                <View style={styles.favoritesBadge}>
                  <Text style={styles.favoritesBadgeText}>
                    {getFavoritesCount() > 99 ? '99+' : getFavoritesCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View
            style={styles.subtitleWrap}
            onLayout={(e) => {
              const w = e?.nativeEvent?.layout?.width;
              if (typeof w === 'number' && Number.isFinite(w) && w > 0) setSubtitleWidth(w);
            }}
          >
            <Animated.Text
              style={[
                styles.subtitle,
                animationsEnabled && {
                  opacity: subtitleBreath.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }),
                  transform: [{
                    translateY: subtitleBreath.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }),
                  }],
                },
              ]}
            >
              {t('shop.subtitle')}
            </Animated.Text>

            {/* Shimmer highlight sweep */}
            {animationsEnabled ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.subtitleShine,
                  {
                    transform: [
                      { rotate: '18deg' },
                      {
                        translateX: subtitleShine.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-(Math.max(120, subtitleWidth) * 0.7), Math.max(120, subtitleWidth) * 0.9],
                        }),
                      },
                    ],
                    opacity: subtitleBreath.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.24] }),
                  },
                ]}
              />
            ) : null}
          </View>
        </View>
        
        {/* Right Side Elements */}
        <View style={[styles.headerRight, isRTL && styles.headerRightRtl]}>
          {/* User Avatar */}
          <TouchableOpacity 
            style={styles.userIndicator} 
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            {user ? (
              <View style={styles.userAvatar}>
                <Text style={styles.userInitials}>
                  {(user.name?.charAt(0) || user.contactEmail?.charAt(0) || user.email?.charAt(0) || 'G').toUpperCase()}
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

      {/* Language dropdown menu (modal overlay) */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <Pressable style={styles.langOverlay} onPress={() => setLangOpen(false)}>
          <View
            style={[
              styles.langMenu,
              { top: (insets?.top || 0) + (headerHeight || 56) + 6 },
              { start: 16 },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleSelectLocale('en')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'en' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.langMenuItemTextRtl, locale === 'en' && styles.langMenuItemTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectLocale('ru')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'ru' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.langMenuItemTextRtl, locale === 'ru' && styles.langMenuItemTextActive]}>
                Русский
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSelectLocale('ar')}
              activeOpacity={0.85}
              style={[styles.langMenuItem, locale === 'ar' && styles.langMenuItemActive]}
            >
              <Text style={[styles.langMenuItemText, isRTL && styles.langMenuItemTextRtl, locale === 'ar' && styles.langMenuItemTextActive]}>
                العربية
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#dc2626"
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* Search Field */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputContainer, isRTL && styles.searchInputContainerRTL]}>
              <View style={[styles.searchIcon, isRTL && styles.searchIconRTL]}>
                <Ionicons name="search" size={18} color="#86868B" />
              </View>
              <TextInput
                style={[styles.searchInput, isRTL && styles.searchInputRTL]}
                placeholder={t('shop.searchPlaceholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#86868B"
                autoCapitalize="none"
                autoCorrect={false}
                textAlign={isRTL ? 'right' : 'left'}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={[styles.searchClearIconButton, isRTL && styles.searchClearIconButtonRTL]}
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
              <View style={[styles.categoriesGrid, isRTL && styles.categoriesGridRTL]}>
                {(() => {
                  const list = Array.isArray(categories) ? [...categories] : [];
                  if (locale !== 'ru') return list;

                  // 1) Put preferred RU categories first in the exact order.
                  const picked = [];
                  const remaining = new Set(list);
                  RU_CATEGORY_PRIORITY_ORDER.forEach((cat) => {
                    if (remaining.has(cat)) {
                      picked.push(cat);
                      remaining.delete(cat);
                    }
                  });

                  // 2) Append whatever else exists, sorted by translated label length (short -> long).
                  const getLabel = (cat) =>
                    getCategoryTranslationKey(cat) ? t(getCategoryTranslationKey(cat)) : cat;
                  const rest = Array.from(remaining);
                  rest.sort((a, b) => String(getLabel(a)).length - String(getLabel(b)).length);

                  return [...picked, ...rest];
                })().map((category) => (
                  <Animated.View
                    key={category}
                    style={[
                      animationsEnabled && {
                        transform: [{
                          scale: categoryPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, selectedCategory === category ? 1.015 : 1.01],
                          }),
                        }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        isRTL && styles.categoryButtonRTL,
                        locale === 'ru' && styles.ruCategoryButton,
                        selectedCategory === category && styles.activeCategoryButton
                      ]}
                      onPress={() => handleCategoryPress(category)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        isRTL && styles.categoryButtonTextRTL,
                        locale === 'ru' && styles.ruCategoryButtonText,
                        selectedCategory === category && styles.activeCategoryButtonText
                      ]}>
                        {getCategoryTranslationKey(category) ? t(getCategoryTranslationKey(category)) : category}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              
              {/* Product Count under Categories */}
              <Text style={[styles.productCount, isRTL && styles.productCountRTL]}>
                {filteredProducts.length} {t(filteredProducts.length === 1 ? 'shop.product' : 'shop.products')}
                {selectedCategory !== 'All' && ` ${t('shop.in')} ${(getCategoryTranslationKey(selectedCategory) ? t(getCategoryTranslationKey(selectedCategory)) : selectedCategory)}`}
                {searchQuery && ` ${t('shop.foundFor', { query: searchQuery })}`}
              </Text>
            </View>
          )}

          {/* Products Grid */}
          <View style={styles.section}>
          
          {filteredProducts.length === 0 && (searchQuery || selectedCategory !== 'All') ? (
            /* No Search/Filter Results */
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsTitle, isRTL && styles.noResultsTitleRTL]}>{t('shop.noResults')}</Text>
              <Text style={[styles.noResultsText, isRTL && styles.noResultsTextRTL]}>
                {searchQuery && selectedCategory !== 'All' 
                  ? t('shop.noResultsForQueryCategory', { query: searchQuery, category: selectedCategory })
                  : searchQuery 
                    ? t('shop.noResultsForQuery', { query: searchQuery })
                    : t('shop.noResultsInCategory', { category: selectedCategory })
                }
              </Text>
              <View style={[styles.clearButtonsContainer, isRTL && styles.clearButtonsContainerRTL]}>
                {searchQuery && (
                  <TouchableOpacity 
                    style={[styles.clearSearchButton, styles.noResultsActionButton]}
                    onPress={() => setSearchQuery('')}
                  >
                    <Text style={[styles.clearSearchText, isRTL && styles.clearSearchTextRTL]} numberOfLines={1} ellipsizeMode="tail">
                      {t('shop.clearSearch')}
                    </Text>
                  </TouchableOpacity>
                )}
                {selectedCategory !== 'All' && (
                  <TouchableOpacity 
                    style={[styles.clearSearchButton, styles.noResultsActionButton]}
                    onPress={() => setSelectedCategory('All')}
                  >
                    <Text style={[styles.clearSearchText, isRTL && styles.clearSearchTextRTL]} numberOfLines={1} ellipsizeMode="tail">
                      {t('shop.showAll')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProducts.map((product, index) => {
                const anim = getCardAnim(product.id, index);
                
                // Always use Animated.View to prevent remounting when toggling animations
                // When animations disabled, anim values are already set to static (opacity: 1, translateY: 0, etc.)
                const floatY = anim.float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
                const translateY = Animated.add(anim.enterY, floatY);
                const scale = anim.pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.008] });

                return (
                  <Animated.View
                    key={product.id}
                    style={[
                      styles.gridCard,
                      {
                        opacity: anim.opacity,
                        transform: [{ translateY }, { scale }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => handleProductPress(product)}
                      activeOpacity={0.95}
                    >
                      {renderProductCardInner(product)}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
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
  scrollContent: {
    paddingBottom: 32,
  },
  contentContainer: {
    // IMPORTANT: do not set flex: 1 inside a ScrollView, it can prevent the content height
    // from growing beyond the viewport on small screens (e.g. iPhone SE), making it look
    // like only 1 product exists because you can’t scroll to the rest.
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
  headerRtl: {
    flexDirection: 'row-reverse',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  headerLeftRtl: {
    alignItems: 'flex-end',
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
  logoContainerRtl: {
    flexDirection: 'row-reverse',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  headerRightRtl: {
    justifyContent: 'flex-start',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A', // matches website (green)
  },
  animToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  animIcon: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    width: 18,
  },
  animBar: {
    width: 3,
    height: 14,
    borderRadius: 999,
  },
  langOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  langMenu: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  langMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  langMenuItemActive: {
    backgroundColor: '#fef2f2', // primary-50
  },
  langMenuItemText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  langMenuItemTextRtl: {
    textAlign: 'right',
  },
  langMenuItemTextActive: {
    color: '#dc2626', // primary-600
    fontWeight: '800',
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
  subtitleWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  subtitleShine: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    width: 44,
    backgroundColor: '#16A34A',
    borderRadius: 999,
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
    end: -4,
    backgroundColor: '#dc2626',
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
    backgroundColor: '#dc2626',
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
    end: -1,
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
    color: '#dc2626',
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
    paddingHorizontal: GRID_SIDE_PADDING,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
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
    color: '#dc2626',
  },
  gridContent: {
    padding: 12,
  },
  gridContentRTL: {
    alignItems: 'flex-end',
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 18,
  },
  gridNameRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  gridCategory: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 4,
  },
  gridCategoryRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  gridDescription: {
    fontSize: 11,
    color: '#86868B',
    lineHeight: 14,
    marginBottom: 6,
  },
  gridDescriptionRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
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
  searchClearIconButton: {
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
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  clearSearchButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  noResultsActionButton: {
    // Allow long translations (e.g. RU) without overlapping: buttons can wrap to the next row.
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 150,
    maxWidth: 220,
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
  categoriesGridRTL: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
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
  ruCategoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    minWidth: 0,
  },
  activeCategoryButton: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  ruCategoryButtonText: {
    fontSize: 13,
  },
  activeCategoryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Badge Styles
  badgeContainer: {
    position: 'absolute',
    top: 8,
    start: 8,
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  badgeContainerRTL: {
    alignItems: 'flex-end',
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
    end: 8,
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
    start: 0,
    end: 0,
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
  priceContainerRTL: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 12,
    color: '#86868B',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
  },
  savings: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '600',
    backgroundColor: '#dc262620',
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
    backgroundColor: '#dc2626',
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
  addToCartIconRTL: {
    marginRight: 0,
    marginLeft: 6,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  addToCartTextRTL: {
    writingDirection: 'rtl',
  },

  // RTL Support Styles
  searchInputContainerRTL: {
    flexDirection: 'row-reverse',
  },
  searchIconRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  searchInputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  searchClearIconButtonRTL: {
    marginLeft: 0,
    marginRight: 12,
  },
  categoryButtonRTL: {
    alignItems: 'flex-end',
  },
  categoryButtonTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  productCountRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  noResultsTitleRTL: {
    textAlign: 'right',
  },
  noResultsTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  clearButtonsContainerRTL: {
    flexDirection: 'row-reverse',
  },
  clearSearchTextRTL: {
    textAlign: 'right',
  },
  addToCartButtonRTL: {
    flexDirection: 'row-reverse',
  },
});
