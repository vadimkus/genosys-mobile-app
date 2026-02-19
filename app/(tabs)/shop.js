import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
  Alert,
  Modal,
  Pressable,
  I18nManager,
  Animated as RNAnimated,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// expo-speech-recognition requires a native build; gracefully degrade when
// the native module isn't linked (e.g. Expo Go or an older binary).
let ExpoSpeechRecognitionModule = null;
let useSpeechRecognitionEvent = (_event, _cb) => {}; // no-op fallback
let _speechAvailable = false;
try {
  const sr = require('expo-speech-recognition');
  if (sr?.ExpoSpeechRecognitionModule) {
    ExpoSpeechRecognitionModule = sr.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = sr.useSpeechRecognitionEvent;
    _speechAvailable = true;
  }
} catch {
  // native module not available – voice search will be hidden
}
import { fetchProductCategories, fetchProducts } from '../../services/api';
import { cacheProducts, getCachedProducts } from '../../services/productCache';
import { ShopSkeleton } from '../../components/SkeletonLoader';
import * as haptics from '../../utils/haptics';
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
import NavigationDrawer from '../../components/NavigationDrawer';
import { buildAuthenticatedWebViewUrl } from '../../utils/webViewAuth';


const log = createLogger('Shop');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIDE_PADDING = 20;
const GRID_GUTTER = 12;
const GRID_CARD_WIDTH = Math.floor((SCREEN_WIDTH - GRID_SIDE_PADDING * 2 - GRID_GUTTER) / 2);

// Allowed categories (order as desired in UI)
const ALLOWED_CATEGORY_ORDER = [
  'All',
  'Skin Concern',
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
  'Bio Meso',
  'Holiday Kits',
  'Beauty Boxes',
];

// RU: preferred visual grouping/order so long labels wrap nicely.
// (Matches desired lines: "Все товары + Уход за областью вокруг глаз", etc.)
const RU_CATEGORY_PRIORITY_ORDER = [
  'All',
  'Skin Concern',
  'Eye Care',
  'PRO Solution',
  'Sun',
  'Peeling',
  'Scalp/Hair',
  'Cream',
  'Mask',
];

const VIRTUAL_CATEGORIES = ['Skin Concern'];

const buildAllowedCategoryList = (foundCategories = []) => {
  const seen = new Set();
  const list = ['All'];
  ALLOWED_CATEGORY_ORDER.slice(1).forEach((allowed) => {
    if ((foundCategories.includes(allowed) || VIRTUAL_CATEGORIES.includes(allowed)) && !seen.has(allowed)) {
      seen.add(allowed);
      list.push(allowed);
    }
  });
  return list;
};

export default function ShopScreen() {
  const { user } = useAuth();
  const { t, locale, setLocale, dir } = useLocalization();
  // Animations disabled (kept only for header in bag.js)
  const { addItem } = useCart();
  const { getFavoritesCount, toggleFavorite, isFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryBadges, setCategoryBadges] = useState({}); // { "Cream": "new", "Beauty Boxes": "new" }
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addingProducts, setAddingProducts] = useState(new Set()); // Track which products are being added
  const [langOpen, setLangOpen] = useState(false);
  const [langSwitching, setLangSwitching] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const isRTL = dir === 'rtl';

  // ─── Voice Search (only when native module is available) ───
  const speechAvailable = _speechAvailable;
  const [isListening, setIsListening] = useState(false);
  const [voicePartial, setVoicePartial] = useState('');
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  // Map app locale to BCP-47 for speech recognizer
  const speechLocale = locale === 'ar' ? 'ar-AE' : locale === 'ru' ? 'ru-RU' : 'en-US';

  // Hook calls are unconditional (React rules-of-hooks) but the imported
  // fallback is a harmless no-op when the native module isn't available.
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setVoicePartial('');
  });

  useSpeechRecognitionEvent('result', (ev) => {
    const text = ev.results?.[0]?.transcript || '';
    if (ev.isFinal) {
      setSearchQuery(text);
      setIsListening(false);
      setVoicePartial('');
    } else {
      setVoicePartial(text);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', (ev) => {
    log.warn('Voice search error', ev?.error || ev);
    setIsListening(false);
    setVoicePartial('');
  });

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      const loop = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          RNAnimated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startVoiceSearch = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          t('voiceSearch.permissionTitle') || 'Microphone Access',
          t('voiceSearch.permissionMessage') || 'Please allow microphone access in Settings to use voice search.',
        );
        return;
      }
      haptics.lightTap();
      ExpoSpeechRecognitionModule.start({
        lang: speechLocale,
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch (err) {
      log.error('Voice search start error', err?.message || err);
    }
  }, [speechLocale, t]);

  const stopVoiceSearch = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule?.stop();
    } catch {}
    setIsListening(false);
    setVoicePartial('');
  }, []);

  // Animations disabled — static values only


  const renderProductCardInner = (product) => {
    const isFav = !!isFavorite(product?.id);
    return (
      <>
        <View style={styles.gridImageContainer}>
          {product.image ? (
            <Image
              source={`${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}`}
              style={styles.gridImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
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
            <View>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? '#dc2626' : '#ffffff'}
              />
            </View>
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

          {/* Pricing Display */}
          {product.isPriceOnRequest ? (
            <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
              <Text style={styles.priceOnRequestText}>{t('shop.priceOnRequest') || 'Price on Request'}</Text>
            </View>
          ) : (() => {
            const category = product.category;
            const nm = getLocalizedProductName(product, locale) || product.name || '';
            const hasBeautyBoxInName = nm.toUpperCase().includes('BEAUTY BOX');
            const isCategoryBeautyBoxes = category === 'Beauty Boxes';
            const isBeautyBox = isCategoryBeautyBoxes || hasBeautyBoxInName;
            return isBeautyBox;
          })() ? (
            <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
              <Text style={styles.originalPrice}>{(product.originalPrice || ((product.displayPrice || product.price || 0) / 0.85)).toFixed(2)} AED</Text>
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

          {/* Add to Cart / Request Quote Button */}
          {product.isPriceOnRequest ? (
            <TouchableOpacity
              style={[styles.requestQuoteButton, isRTL && styles.addToCartButtonRTL]}
              onPress={() => {
                const productName = getLocalizedProductName(product, locale) || product.name || '';
                const message = encodeURIComponent(
                  (t('product.requestQuoteMessage') || "Hi, I'm interested in {name}. Could you please provide pricing information?").replace('{name}', productName)
                );
                Linking.openURL(`https://wa.me/971585487665?text=${message}`);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="logo-whatsapp"
                size={16}
                color="#ffffff"
                style={[styles.addToCartIcon, isRTL && styles.addToCartIconRTL]}
              />
              <Text style={[styles.addToCartText, isRTL && styles.addToCartTextRTL]}>
                {t('shop.requestQuote') || 'Request Quote'}
              </Text>
            </TouchableOpacity>
          ) : (
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
          )}
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

  const applyProducts = (productList) => {
    setProducts(productList);
    setFilteredProducts(productList);
    const normalizedCats = [];
    const seen = new Set();
    productList.forEach((product) => {
      const tags = getCategoryTagsForProduct(product);
      tags.forEach((tag) => {
        if (tag && !seen.has(tag)) {
          seen.add(tag);
          normalizedCats.push(tag);
        }
      });
    });
    setCategories(buildAllowedCategoryList(normalizedCats));
  };

  const loadProducts = async () => {
    try {
      log.debug('Loading products with user context...');
      
      // Use enhanced fetchProducts function with user context
      const enhancedProducts = await fetchProducts(user, { locale });
      
      if (enhancedProducts && enhancedProducts.length > 0) {
        applyProducts(enhancedProducts);
        log.debug('Products loaded from API', { count: enhancedProducts.length });
        
        if (user?.discountPercentage) {
          log.debug('User discount applied', { discountPercentage: user.discountPercentage, discountType: user.discountType });
        }
        
        // Cache for offline use (fire-and-forget)
        cacheProducts(enhancedProducts);
      }
    } catch (error) {
      log.error('Error loading products from API', error?.message || error);
      
      // Offline fallback: try cached products
      try {
        const cached = await getCachedProducts(true); // ignoreExpiry for offline
        if (cached && cached.length > 0) {
          applyProducts(cached);
          log.debug('Using cached products (offline)', { count: cached.length });
        }
      } catch (cacheErr) {
        log.warn('Cache fallback also failed', cacheErr?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      log.debug('Loading categories from API...');
      const categoryData = await fetchProductCategories();
      log.debug('Categories received', { hasData: !!categoryData });
      
      // Extract badge metadata from API response (e.g. { "Cream": "new", "Beauty Boxes": "new" })
      if (categoryData?._badgeMap && typeof categoryData._badgeMap === 'object') {
        setCategoryBadges(categoryData._badgeMap);
      }

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

  // Track whether initial load has happened
  const initialLoadDone = useRef(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
    initialLoadDone.current = true;
  }, []);

  // Re-fetch products when user becomes available (login) to get personalized pricing.
  // Uses fetchProducts directly to avoid stale closure over `user`.
  useEffect(() => {
    if (!initialLoadDone.current || !user?.id) return;
    log.debug('User context available, re-fetching products for personalized pricing');
    (async () => {
      try {
        const enhancedProducts = await fetchProducts(user, { locale });
        if (enhancedProducts && enhancedProducts.length > 0) {
          applyProducts(enhancedProducts);
          cacheProducts(enhancedProducts);
        }
      } catch (err) {
        log.warn('Re-fetch for user pricing failed', err?.message);
      }
    })();
  }, [user?.id]);

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
    haptics.selectionTick();
    if (category === 'Skin Concern') {
      router.push('/skin-concerns');
      return;
    }
    setSelectedCategory(category);
    if (searchQuery) {
      setSearchQuery('');
    }
  };

  // Handle add to cart functionality
  const handleAddToCart = async (product) => {
    if (product?.isPriceOnRequest) return; // price-on-request products cannot be added
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
      haptics.success();
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
    haptics.lightTap();
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
        <ShopSkeleton />
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
        {/* Left: Hamburger, then Language selector */}
        <View style={[styles.headerLeft, isRTL && styles.headerLeftRtl]}>
          <TouchableOpacity
            onPress={() => setMenuOpen((v) => !v)}
            activeOpacity={0.85}
            style={styles.hamburgerBtn}
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <Ionicons name={menuOpen ? 'close' : 'menu'} size={22} color={menuOpen ? '#16A34A' : '#374151'} />
          </TouchableOpacity>

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
        </View>
        
        {/* Centered Logo & Text with Heart */}
        <View style={styles.headerCenter}>
          <View style={[styles.logoContainer, isRTL && styles.logoContainerRtl]}>
            <Image 
              source={AUTH_CONFIG.LOGO_URL}
              style={styles.logo}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
            {/* Favorites Heart Icon - Close to Logo */}
            <TouchableOpacity 
              style={styles.favoritesButton}
              onPress={() => router.push('/favorites')}
              activeOpacity={0.7}
            >
              <View>
                <Ionicons 
                  name={getFavoritesCount() > 0 ? "heart" : "heart-outline"} 
                  size={24} 
                  color="#dc2626"
                />
              </View>
              {getFavoritesCount() > 0 && (
                <View style={styles.favoritesBadge}>
                  <Text style={styles.favoritesBadgeText}>
                    {getFavoritesCount() > 99 ? '99+' : getFavoritesCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.subtitleWrap}>
            <Text style={styles.subtitle}>
              {t('shop.subtitle')}
            </Text>
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

              {/* Voice Search Mic Button – only shown when native module is available */}
              {speechAvailable && (
                <TouchableOpacity
                  style={[styles.micButton, isRTL && styles.micButtonRTL]}
                  onPress={isListening ? stopVoiceSearch : startVoiceSearch}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={t('voiceSearch.label') || 'Voice search'}
                >
                  <RNAnimated.View style={isListening ? { transform: [{ scale: pulseAnim }] } : undefined}>
                    <Ionicons
                      name={isListening ? 'mic' : 'mic-outline'}
                      size={20}
                      color={isListening ? '#dc2626' : '#86868B'}
                    />
                  </RNAnimated.View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Voice Search Listening Overlay – only rendered when native module is available */}
          {speechAvailable && (
            <Modal visible={isListening} transparent animationType="fade" onRequestClose={stopVoiceSearch}>
              <Pressable style={styles.voiceOverlay} onPress={stopVoiceSearch}>
                <View style={styles.voiceModal}>
                  <RNAnimated.View style={[styles.voicePulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="mic" size={40} color="#ffffff" />
                  </RNAnimated.View>
                  <Text style={styles.voiceTitle}>{t('voiceSearch.listening') || 'Listening...'}</Text>
                  {voicePartial ? (
                    <Text style={styles.voicePartialText} numberOfLines={2}>{voicePartial}</Text>
                  ) : (
                    <Text style={styles.voiceHintText}>{t('voiceSearch.hint') || 'Say a product name'}</Text>
                  )}
                  <TouchableOpacity style={styles.voiceStopBtn} onPress={stopVoiceSearch} activeOpacity={0.8}>
                    <Text style={styles.voiceStopText}>{t('voiceSearch.stop') || 'Stop'}</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          )}

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
                })().map((category) => {
                  const hasBadge = categoryBadges[category] === 'new' || category === 'Skin Concern';
                  const isActive = selectedCategory === category;
                  return (
                  <View key={category} style={{ position: 'relative' }}>
                    {hasBadge && (
                      <View style={[
                        styles.categoryNewBadge,
                        isActive && styles.categoryNewBadgeActive
                      ]}>
                        <Text style={[
                          styles.categoryNewBadgeText,
                          isActive && styles.categoryNewBadgeTextActive
                        ]}>{t('common.new')}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        isRTL && styles.categoryButtonRTL,
                        locale === 'ru' && styles.ruCategoryButton,
                        isActive && styles.activeCategoryButton
                      ]}
                      onPress={() => handleCategoryPress(category)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        isRTL && styles.categoryButtonTextRTL,
                        locale === 'ru' && styles.ruCategoryButtonText,
                        isActive && styles.activeCategoryButtonText
                      ]}>
                        {getCategoryTranslationKey(category) ? t(getCategoryTranslationKey(category)) : category}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  );
                })}
              </View>
              
              {/* Product Count under Categories */}
              <Text style={[styles.productCount, isRTL && styles.productCountRTL]}>
                {filteredProducts.length} {t(filteredProducts.length === 1 ? 'shop.product' : 'shop.products')}
                {selectedCategory !== 'All' && ` ${t('shop.in')} ${(getCategoryTranslationKey(selectedCategory) ? t(getCategoryTranslationKey(selectedCategory)) : selectedCategory)}`}
                {searchQuery && ` ${t('shop.foundFor', { query: searchQuery })}`}
              </Text>
            </View>
          )}

          {/* Build Your Set Banner — only under Beauty Boxes category */}
          {selectedCategory === 'Beauty Boxes' && !searchQuery && (
            <TouchableOpacity
              style={styles.buildSetBanner}
              activeOpacity={0.85}
              onPress={() => {
                router.push('/bundle-builder');
              }}
            >
              <View style={[styles.buildSetContent, isRTL && styles.buildSetContentRTL]}>
                <View style={styles.buildSetTextArea}>
                  <Text style={[styles.buildSetTitle, isRTL && styles.textRTL]}>
                    🎁 {t('shop.buildYourSet') || 'Build Your Set'}
                  </Text>
                  <Text style={[styles.buildSetSubtitle, isRTL && styles.textRTL]}>
                    {t('shop.buildYourSetDesc') || 'Mix & match products and save up to 20%'}
                  </Text>
                </View>
                <View style={styles.buildSetBadge}>
                  <Text style={styles.buildSetBadgeText}>{t('shop.upTo20Off') || 'Up to 20% OFF'}</Text>
                </View>
              </View>
            </TouchableOpacity>
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
              {filteredProducts.map((product, index) => (
                <View key={`${product.id}-${index}`} style={styles.gridCard}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => handleProductPress(product)}
                    activeOpacity={0.95}
                  >
                    {renderProductCardInner(product)}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
        </View>
      </ScrollView>

      {/* Navigation Drawer (hamburger menu) */}
      <NavigationDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        headerHeight={(insets?.top || 0) + (headerHeight || 56)}
      />
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  headerLeftRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
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
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
    marginStart: 2,
  },
  aiLinkBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginStart: 2,
  },
  aiLinkText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#dc2626',
    letterSpacing: 0.5,
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

  // Voice Search Mic Button
  micButton: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRTL: {
    marginLeft: 0,
    marginRight: 10,
  },

  // Voice Listening Overlay
  voiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceModal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  voicePulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  voicePartialText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 20,
  },
  voiceHintText: {
    fontSize: 14,
    color: '#86868B',
    textAlign: 'center',
    marginBottom: 16,
  },
  voiceStopBtn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  voiceStopText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
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
  categoryNewBadge: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -12 }],
    backgroundColor: '#22C55E',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    zIndex: 10,
  },
  categoryNewBadgeActive: {
    backgroundColor: '#ffffff',
  },
  categoryNewBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  categoryNewBadgeTextActive: {
    color: '#dc2626',
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
  requestQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    minHeight: 36,
  },
  priceOnRequestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    letterSpacing: 0.3,
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
  // Build Your Set Banner
  buildSetBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    overflow: 'hidden',
  },
  buildSetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  buildSetContentRTL: {
    flexDirection: 'row-reverse',
  },
  buildSetTextArea: {
    flex: 1,
  },
  buildSetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  buildSetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  buildSetBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buildSetBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
