import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
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
import { fetchProductById, fetchProductCategories, fetchProducts } from '../../services/api';
import { cacheProducts, getCachedProducts } from '../../services/productCache';
import { ShopSkeleton } from '../../components/SkeletonLoader';
import ProductOptionSheet from '../../components/ProductOptionSheet';
import * as haptics from '../../utils/haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { formatAed, resolvePriceView, discountLabelFor } from '../../utils/pricingDisplay';
import { computeProductBadges } from '../../utils/badges';
import { isProductOutOfStock } from '../../utils/stock';
import {
  applyProductOptionPrice,
  getInitialProductSelection,
  isProductOptionSelectionRequired,
  isProductSelectionComplete,
} from '../../utils/productOptions';
import { useLocalization } from '../../contexts/LocalizationContext';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getCategoryTranslationKey,
  normalizeCategoryCanonical,
  getCategoryTagsForProduct,
} from '../../utils/productLocalization';
import { filterAndRankProductsForSearch } from '../../utils/productSearch';
import { createLogger } from '../../utils/logger';
import AUTH_CONFIG from '../../config/auth';
import { buildAuthenticatedWebViewUrl } from '../../utils/webViewAuth';
import T from '../../utils/typography';
import { colors, tint, shadow, surfaces } from '../../utils/theme';
import { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { tabBarSpace } from '../../utils/tabBar';

// Logo, subtitle and the two side controls, plus padding. Only used for the
// first frame; onLayout replaces it with the measured height immediately after.
const ESTIMATED_HEADER_HEIGHT = 96;
import { withErrorBoundary } from '../../components/ErrorBoundary';
import { openWhatsApp } from '../../utils/support';

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

// Memoized grid card (M3): re-renders only when its own props change, so a
// search keystroke or unrelated state change no longer re-renders the whole
// grid. All handlers are passed as stable callbacks from ShopScreen.
const ShopGridCard = React.memo(function ShopGridCard({
  product,
  isFav,
  isAdding,
  qtyInBag,
  requiresOptions,
  user,
  locale,
  isRTL,
  t,
  onPress,
  onToggleFavorite,
  onAddToCart,
  onDecrement,
}) {
  // NEW is shown as a black pill next to the category (like the website
  // rail cards); other badges (e.g. Order) stay as an image overlay.
  const allBadges = computeProductBadges(product, {
    order: t('common.order'),
    inStock: t('stock.inStock'),
    new: t('common.new'),
  });
  const isNewProduct = allBadges.some((b) => String(b?.text || '').toLowerCase().trim() === (t('common.new')).toLowerCase() || String(b?.text || '').toLowerCase().trim() === 'new');
  const overlayBadges = allBadges.filter((b) => !(String(b?.text || '').toLowerCase().trim() === (t('common.new')).toLowerCase() || String(b?.text || '').toLowerCase().trim() === 'new'));

  return (
    <View style={styles.gridCard}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onPress(product)}
        activeOpacity={0.95}
      >
        <View style={styles.gridImageContainer}>
          {product.image ? (
            <Image
              source={`${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${product.image}`}
              style={styles.gridImage}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.gridImagePlaceholder}>
              <Text style={styles.gridPlaceholderText}>{product.name?.charAt(0) || 'G'}</Text>
            </View>
          )}

          {/* Badges (NEW moved to the meta row below the image) */}
          {overlayBadges.length > 0 && (
            <View style={[styles.badgeContainer, isRTL && styles.badgeContainerRTL]}>
              {overlayBadges.map((badge, badgeIndex) => {
                const badgeColor = badge.color || colors.blue;
                return (
                  <View
                    key={`${badge.text || 'badge'}-${badgeIndex}`}
                    style={[styles.badge, { backgroundColor: tint(badgeColor) }]}
                  >
                    <View style={[styles.badgeDot, { backgroundColor: badgeColor }]} />
                    <Text style={[styles.badgeText, { color: badgeColor }]}>{badge.text}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Favorite Heart Button */}
          <TouchableOpacity
            style={styles.favoriteHeart}
            // The heart is 32pt so it stays light over the product shot; 6pt of
            // slop each side takes the tappable area to the 44pt HIG minimum.
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={(e) => {
              e.stopPropagation(); // Prevent product card press
              onToggleFavorite(product);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isFav ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
            accessibilityState={{ selected: isFav }}
          >
            <View>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? colors.accent : colors.white}
              />
            </View>
          </TouchableOpacity>

          {/* Stock Status */}
          {isProductOutOfStock(product) && (
            <View style={styles.stockOverlay}>
              <View style={styles.stockBadge}>
                <View style={styles.stockDot} />
                <Text style={styles.stockOverlayText}>{t('stock.outOfStock')}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.gridContent, isRTL && styles.gridContentRTL]}>
          <Text style={[styles.gridName, isRTL && styles.gridNameRTL]} numberOfLines={2}>
            {getLocalizedProductName(product, locale) || product.name}
          </Text>
          <View style={[styles.gridMetaRow, isRTL && styles.gridMetaRowRTL]}>
            {isNewProduct ? (
              <View style={styles.newPill}>
                <Text style={styles.newPillText}>{t('common.new')}</Text>
              </View>
            ) : null}
            <Text style={[styles.gridCategory, { flexShrink: 1 }, isRTL && styles.gridCategoryRTL]} numberOfLines={1}>
              {getCategoryTranslationKey(product.category) ? t(getCategoryTranslationKey(product.category)) : product.category}
              {product.size ? ` · ${product.size}` : ''}
            </Text>
          </View>

          {(getLocalizedProductDescription(product, locale) || product.localizedDescription || product.description) && (
            <Text style={[styles.gridDescription, isRTL && styles.gridDescriptionRTL]} numberOfLines={2}>
              {getLocalizedProductDescription(product, locale) || product.localizedDescription || product.description}
            </Text>
          )}

          {/* Pricing Display — shared decision, see `resolvePriceView`. */}
          {(() => {
            const view = resolvePriceView(product, { user });

            if (view.kind === 'login') {
              return (
                <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
                  <Text style={styles.loginToSeePriceText}>{t('product.loginToSeePrice')}</Text>
                </View>
              );
            }

            if (view.kind === 'onRequest') {
              return (
                <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
                  <Text style={styles.priceOnRequestText}>{t('shop.priceOnRequest')}</Text>
                </View>
              );
            }

            if (view.kind === 'discounted') {
              const label = discountLabelFor(view, t);
              return (
                <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
                  <Text style={styles.originalPrice}>{formatAed(view.originalPrice)}</Text>
                  <Text style={styles.discountedPrice}>{formatAed(view.price)}</Text>
                  {label ? <Text style={styles.userDiscount}>{label}</Text> : null}
                  <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
                </View>
              );
            }

            return (
              <View style={[styles.priceContainer, isRTL && styles.priceContainerRTL]}>
                <Text style={styles.gridPrice}>{formatAed(view.price)}</Text>
                <Text style={styles.vatText}>{t('favorites.vatIncluded')}</Text>
              </View>
            );
          })()}

          {/* Add to Cart / Request Quote Button */}
          {product.isPriceOnRequest ? (
            <TouchableOpacity
              style={[styles.requestQuoteButton, isRTL && styles.addToCartButtonRTL]}
              onPress={() => {
                const productName = getLocalizedProductName(product, locale) || product.name || '';
                const message = t('product.requestQuoteMessage', { name: productName });
                openWhatsApp(message);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('shop.requestQuote')}
            >
              <Ionicons
                name="logo-whatsapp"
                size={16}
                color={colors.white}
                style={[styles.addToCartIcon, isRTL && styles.addToCartIconRTL]}
              />
              <Text style={[styles.addToCartText, isRTL && styles.addToCartTextRTL]}>
                {t('shop.requestQuote')}
              </Text>
            </TouchableOpacity>
          ) : (() => {
            const outOfStock = isProductOutOfStock(product);
            const isInBag = qtyInBag > 0 && !outOfStock;

            // In-bag state: show a [-] [N in Bag] [+] stepper so the user
            // can adjust quantity from the grid without opening the bag.
            if (isInBag) {
              const decLabel = t('shop.decreaseQuantity');
              const incLabel = t('shop.increaseQuantity');
              return (
                <View
                  style={[styles.qtyStepper, isRTL && styles.qtyStepperRTL]}
                  accessibilityRole="adjustable"
                  accessibilityLabel={`${t('shop.inBag')} (${qtyInBag}) — ${product?.name || ''}`}
                >
                  <TouchableOpacity
                    style={styles.qtyStepperBtn}
                    onPress={() => {
                      haptics.lightTap();
                      onDecrement(product.id);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={decLabel}
                    disabled={isAdding}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={18} color={colors.white} />
                  </TouchableOpacity>

                  <View style={styles.qtyStepperLabelWrap} pointerEvents="none">
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={colors.white}
                      style={styles.qtyStepperCheck}
                    />
                    <Text
                      style={styles.qtyStepperLabel}
                      numberOfLines={1}
                      allowFontScaling={false}
                    >
                      {`${t('shop.inBag')} (${qtyInBag})`}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.qtyStepperBtn}
                    onPress={() => onAddToCart(product)}
                    accessibilityRole="button"
                    accessibilityLabel={incLabel}
                    disabled={isAdding}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>
              );
            }

            return (
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  isRTL && styles.addToCartButtonRTL,
                  (outOfStock || isAdding) && styles.addToCartButtonDisabled,
                ]}
                onPress={() => onAddToCart(product)}
                disabled={outOfStock || isAdding}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={
                  outOfStock
                    ? t('stock.outOfStock')
                    : `${requiresOptions ? t('variant.chooseOptions') : t('shop.addToBag')} — ${product?.name || ''}`
                }
                accessibilityState={{ disabled: outOfStock || isAdding }}
              >
                <Ionicons
                  name={isAdding ? 'checkmark' : requiresOptions ? 'options-outline' : 'bag-add'}
                  size={16}
                  color={colors.white}
                  style={[styles.addToCartIcon, isRTL && styles.addToCartIconRTL]}
                />
                <Text style={[styles.addToCartText, isRTL && styles.addToCartTextRTL]}>
                  {isAdding
                    ? t('shop.added')
                    : outOfStock
                      ? t('stock.outOfStock')
                      : !user
                        ? t('shop.loginToBuy')
                        : requiresOptions
                          ? t('variant.chooseOptions')
                          : t('shop.addToBag')}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      </TouchableOpacity>
    </View>
  );
});

function ShopScreen() {
  const { user } = useAuth();
  const { t, locale, setLocale, dir } = useLocalization();
  // Animations disabled (kept only for header in bag.js)
  const { addItem, getProductTotalQuantity, decrementProductFromCart } = useCart();
  const { getFavoritesCount, toggleFavorite, isFavorite } = useFavorites();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  // True when the API failed AND the offline cache had nothing — the grid
  // would otherwise render silently blank with no retry affordance.
  const [loadFailed, setLoadFailed] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryBadges, setCategoryBadges] = useState({}); // { "Cream": "new", "Beauty Boxes": "new" }
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addingProducts, setAddingProducts] = useState(new Set()); // Track which products are being added
  const [optionProduct, setOptionProduct] = useState(null);
  const [optionSheetVisible, setOptionSheetVisible] = useState(false);
  const [optionRefreshing, setOptionRefreshing] = useState(false);
  const [optionRefreshError, setOptionRefreshError] = useState('');
  const [optionAdding, setOptionAdding] = useState(false);
  const optionRequestRef = useRef(0);
  const addLocksRef = useRef(new Set());
  const [langOpen, setLangOpen] = useState(false);
  const [langSwitching, setLangSwitching] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  // The shop's header is its own (logo, subtitle, avatar), but it borrows the
  // hide-on-scroll behaviour from the shared one so the catalogue behaves like
  // the articles do.
  // The safe-area padding is above the header, and nothing clips it, so the
  // travel has to clear the status bar as well or the bar parks half-visible
  // over it.
  const { onScroll: onHeaderScroll, translateY: headerTranslateY } = useCollapsibleHeader({
    hideOnScroll: true,
    hideDistance: (headerHeight || ESTIMATED_HEADER_HEIGHT) + insets.top + 10,
  });
  const isRTL = dir === 'rtl';
  // ─── Voice Search (only when native module is available) ───
  const speechAvailable = _speechAvailable;
  const [isListening, setIsListening] = useState(false);
  const [voicePartial, setVoicePartial] = useState('');
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  // Subtle fade-in for the grid once products are ready (presentation only).
  const contentFade = useRef(new RNAnimated.Value(0)).current;

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

  // Gentle fade-in when the catalog finishes loading.
  useEffect(() => {
    if (!loading) {
      RNAnimated.timing(contentFade, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const startVoiceSearch = useCallback(async () => {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          t('voiceSearch.permissionTitle'),
          t('voiceSearch.permissionMessage'),
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
        setLoadFailed(false);
        log.debug('Products loaded from API', { count: enhancedProducts.length });
        
        if (user?.discountType && user?.discountPercentage) {
          log.debug('User discount applied', { discountPercentage: user.discountPercentage, discountType: user.discountType });
        }
        
        // Cache for offline use (fire-and-forget), under the locale it was fetched in
        cacheProducts(enhancedProducts, locale);
      }
    } catch (error) {
      log.error('Error loading products from API', error?.message || error);
      
      // Offline fallback: try cached products
      try {
        // ignoreExpiry for offline. Reads this locale only: a cache written in another
        // language would show the wrong names, descriptions and slides.
        const cached = await getCachedProducts(true, locale);
        if (cached && cached.length > 0) {
          applyProducts(cached);
          setLoadFailed(false);
          log.debug('Using cached products (offline)', { count: cached.length });
        } else {
          setLoadFailed(true);
        }
      } catch (cacheErr) {
        log.warn('Cache fallback also failed', cacheErr?.message);
        setLoadFailed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const retryLoadProducts = () => {
    setLoadFailed(false);
    setLoading(true);
    loadProducts();
  };

  const loadCategories = async () => {
    try {
      log.debug('Loading categories from API...');
      const categoryResult = await fetchProductCategories();
      const categoryData = categoryResult?.categories || categoryResult;
      const badgeMap = categoryResult?.badgeMap;
      log.debug('Categories received', { hasData: !!categoryData });
      
      if (badgeMap && badgeMap instanceof Map) {
        setCategoryBadges(Object.fromEntries(badgeMap));
      }

      // Add "All" as the first option
      const allCategories = ['All', ...(Array.isArray(categoryData) ? categoryData : [])];
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
    Promise.all([loadProducts(), loadCategories()]).then(() => {
      initialLoadDone.current = true;
    });
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
          cacheProducts(enhancedProducts, locale);
        }
      } catch (err) {
        log.warn('Re-fetch for user pricing failed', err?.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale]);

  // Combined search and category filter effect
  useEffect(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        getCategoryTagsForProduct(product).includes(selectedCategory)
      );
    }

    // Direct product-name matches rank above bundles or descriptions that only
    // mention the term. Word order remains flexible.
    if (searchQuery.trim()) {
      filtered = filterAndRankProductsForSearch(filtered, searchQuery, {
        locale,
        t,
      });
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products, locale, t]);

  const handleProductPress = useCallback((product) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    });
  }, []);

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

  const requireLogin = useCallback(() => {
    Alert.alert(
      t('checkout.loginRequiredTitle'),
      t('checkout.loginRequiredMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.login'),
          onPress: () => router.push({
            pathname: '/auth/login',
            params: { returnTo: '/(tabs)/shop' },
          }),
        },
      ]
    );
  }, [t]);

  const closeOptionSheet = useCallback(() => {
    if (optionAdding) return;
    optionRequestRef.current += 1;
    setOptionSheetVisible(false);
    setOptionProduct(null);
    setOptionRefreshError('');
    setOptionRefreshing(false);
  }, [optionAdding]);

  const refreshOptionProduct = useCallback(async (fallbackProduct) => {
    if (!fallbackProduct?.id) return;
    const requestId = ++optionRequestRef.current;
    setOptionRefreshing(true);
    setOptionRefreshError('');
    try {
      const latest = await fetchProductById(fallbackProduct.id, user, { locale });
      if (requestId !== optionRequestRef.current) return;
      if (!latest) {
        setOptionRefreshError(t('variant.refreshFailed'));
        return;
      }
      if (isProductOutOfStock(latest)) {
        setOptionProduct(latest);
        setOptionRefreshError(t('stock.outOfStockMessage'));
        return;
      }
      setOptionProduct(latest);
    } catch (error) {
      if (requestId !== optionRequestRef.current) return;
      log.warn('Could not refresh product options', error?.message || error);
      setOptionRefreshError(t('variant.refreshFailed'));
    } finally {
      if (requestId === optionRequestRef.current) setOptionRefreshing(false);
    }
  }, [locale, t, user]);

  const openOptionSheet = useCallback((product) => {
    setOptionProduct(product);
    setOptionRefreshError('');
    setOptionSheetVisible(true);
    haptics.mediumTap();
    refreshOptionProduct(product);
  }, [refreshOptionProduct]);

  const addProductSelection = useCallback(async (product, quantity, selection) => {
    const productId = String(product?.id || '');
    if (!productId || addLocksRef.current.has(productId)) return false;
    addLocksRef.current.add(productId);
    setAddingProducts((prev) => new Set([...prev, productId]));

    try {
      if (!isProductSelectionComplete(product, selection)) {
        throw new Error('PRODUCT_OPTIONS_REQUIRED');
      }
      const productForCart = applyProductOptionPrice(product, selection);
      const added = await addItem(
        productForCart,
        Math.max(1, Number(quantity) || 1),
        selection.selectedColor || '',
        selection.selectedSize || ''
      );
      if (added === false) throw new Error('PRODUCT_OPTIONS_REQUIRED');
      haptics.success();
      log.debug('Added product selection to cart', {
        productId,
        selectedColor: selection.selectedColor || null,
        selectedSize: selection.selectedSize || null,
        quantity,
      });
      return true;
    } finally {
      addLocksRef.current.delete(productId);
      setTimeout(() => {
        setAddingProducts((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 500);
    }
  }, [addItem]);

  // Handle add to cart functionality
  const handleAddToCart = useCallback(async (product) => {
    if (product?.isPriceOnRequest) return;
    if (!user) {
      requireLogin();
      return;
    }
    if (isProductOutOfStock(product)) {
      Alert.alert(t('stock.outOfStock'), t('stock.outOfStockMessage'));
      return;
    }
    if (isProductOptionSelectionRequired(product)) {
      openOptionSheet(product);
      return;
    }

    try {
      await addProductSelection(product, 1, getInitialProductSelection(product));
    } catch (error) {
      log.error('Failed to add product to cart', error?.message || error);
      Alert.alert(t('common.error'), t('shop.addToBagFailed'));
    }
  }, [user, requireLogin, t, openOptionSheet, addProductSelection]);

  const handleConfirmOptions = useCallback(async (selection, quantity, latestProduct) => {
    if (optionAdding) return;
    setOptionAdding(true);
    try {
      const added = await addProductSelection(latestProduct, quantity, selection);
      if (added) {
        optionRequestRef.current += 1;
        setOptionSheetVisible(false);
        setOptionProduct(null);
        setOptionRefreshError('');
      }
    } catch (error) {
      log.error('Failed to add selected product option', error?.message || error);
      haptics.error();
      Alert.alert(t('common.error'), t('shop.addToBagFailed'));
    } finally {
      setOptionAdding(false);
    }
  }, [addProductSelection, optionAdding, t]);

  const handleToggleFavorite = useCallback(async (product) => {
    haptics.lightTap();
    try {
      const result = await toggleFavorite(product);
      log.debug(
        result === 'added'
          ? `favorite_added:${String(product?.id || '')}`
          : `favorite_removed:${String(product?.id || '')}`
      );
    } catch (err) {
      log.warn('toggleFavorite failed', err?.message || err);
    }
  }, [toggleFavorite]);

  const handleDecrementFromCart = useCallback((productId) => {
    decrementProductFromCart?.(productId);
  }, [decrementProductFromCart]);

  // Stable renderers so the memoized ShopGridCard actually skips re-renders (M3).
  const renderGridItem = useCallback(({ item: product }) => (
    <ShopGridCard
      product={product}
      isFav={!!isFavorite(product?.id)}
      isAdding={addingProducts.has(product.id)}
      qtyInBag={user ? (getProductTotalQuantity?.(product?.id) || 0) : 0}
      requiresOptions={isProductOptionSelectionRequired(product)}
      user={user}
      locale={locale}
      isRTL={isRTL}
      t={t}
      onPress={handleProductPress}
      onToggleFavorite={handleToggleFavorite}
      onAddToCart={handleAddToCart}
      onDecrement={handleDecrementFromCart}
    />
  ), [
    isFavorite,
    addingProducts,
    user,
    getProductTotalQuantity,
    locale,
    isRTL,
    t,
    handleProductPress,
    handleToggleFavorite,
    handleAddToCart,
    handleDecrementFromCart,
  ]);

  const keyExtractor = useCallback((item) => String(item.id), []);


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
      {/* The header floats over the grid — inset, rounded and on its own
          shadow, the same treatment as the search field below it — and steps
          out of the way on the way down the catalogue. */}
      <RNAnimated.View
        style={[
          styles.header,
          isRTL && styles.headerRtl,
          // Absolute insets measure from the parent's border box, so the
          // SafeAreaView's top padding does not offset this and the bar has to
          // clear the status bar itself.
          { top: insets.top, transform: [{ translateY: headerTranslateY }] },
        ]}
        onLayout={(e) => {
          const h = e?.nativeEvent?.layout?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h > 0) setHeaderHeight(h);
        }}
      >
        {/* Left: Language selector */}
        <View style={[styles.headerLeft, isRTL && styles.headerLeftRtl]}>
          <TouchableOpacity
            onPress={() => setLangOpen((v) => !v)}
            disabled={langSwitching}
            activeOpacity={0.85}
            style={styles.langButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.switchLanguage')}
          >
            <Text style={styles.langButtonText}>{currentLangCode}</Text>
            <Ionicons name={langOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.greenDeep} />
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
              accessibilityRole="button"
              accessibilityLabel={`${t('favorites.title')} (${getFavoritesCount()})`}
            >
              <View>
                <Ionicons 
                  name={getFavoritesCount() > 0 ? "heart" : "heart-outline"} 
                  size={24} 
                  color={colors.accent}
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
                <Ionicons name="person-outline" size={18} color={colors.secondaryLabel} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </RNAnimated.View>

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
              { top: (insets?.top || 0) + (headerHeight || ESTIMATED_HEADER_HEIGHT) + 6 },
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
      
      <RNAnimated.View style={[styles.gridFade, { opacity: contentFade }]}>
      <RNAnimated.FlatList
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarSpace(insets) + 16 },
          // The estimate covers the frame before onLayout reports, so the grid
          // does not start under the header and jump down once it does.
          { paddingTop: (headerHeight || ESTIMATED_HEADER_HEIGHT) + 10 },
        ]}
        onScroll={onHeaderScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        data={filteredProducts}
        numColumns={2}
        keyExtractor={keyExtractor}
        columnWrapperStyle={styles.gridRow}
        renderItem={renderGridItem}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListHeaderComponent={
          <View style={styles.contentContainer}>
            {/* Search Field */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchInputContainer, isRTL && styles.searchInputContainerRTL]}>
                <View style={[styles.searchIcon, isRTL && styles.searchIconRTL]}>
                  <Ionicons name="search" size={18} color={colors.secondaryLabel} />
                </View>
                <TextInput
                  style={[styles.searchInput, isRTL && styles.searchInputRTL]}
                  placeholder={t('shop.searchPlaceholder')}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={colors.secondaryLabel}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textAlign={isRTL ? 'right' : 'left'}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={[styles.searchClearIconButton, isRTL && styles.searchClearIconButtonRTL]}
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('shop.clearSearch')}
                  >
                    <Ionicons name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                )}

                {/* Voice Search Mic Button */}
                {speechAvailable && (
                  <TouchableOpacity
                    style={[styles.micButton, isRTL && styles.micButtonRTL]}
                    onPress={isListening ? stopVoiceSearch : startVoiceSearch}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('voiceSearch.label')}
                  >
                    <RNAnimated.View style={isListening ? { transform: [{ scale: pulseAnim }] } : undefined}>
                      <Ionicons
                        name={isListening ? 'mic' : 'mic-outline'}
                        size={20}
                        color={isListening ? colors.accent : colors.secondaryLabel}
                      />
                    </RNAnimated.View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Voice Search Listening Overlay */}
            {speechAvailable && (
              <Modal visible={isListening} transparent animationType="fade" onRequestClose={stopVoiceSearch}>
                <Pressable style={styles.voiceOverlay} onPress={stopVoiceSearch}>
                  <View style={styles.voiceModal}>
                    <RNAnimated.View style={[styles.voicePulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                      <Ionicons name="mic" size={40} color={colors.white} />
                    </RNAnimated.View>
                    <Text style={styles.voiceTitle}>{t('voiceSearch.listening')}</Text>
                    {voicePartial ? (
                      <Text style={styles.voicePartialText} numberOfLines={2}>{voicePartial}</Text>
                    ) : (
                      <Text style={styles.voiceHintText}>{t('voiceSearch.hint')}</Text>
                    )}
                    <TouchableOpacity style={styles.voiceStopBtn} onPress={stopVoiceSearch} activeOpacity={0.8}>
                      <Text style={styles.voiceStopText}>{t('voiceSearch.stop')}</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Modal>
            )}

            {/* Categories Filter — single horizontal scrollable row (no wrapping).
                New badges come only from API (lib/productBadges.ts on website). */}
            {categories.length > 0 && (() => {
              const isNewCategory = (c) => categoryBadges[c] === 'new';
              // Keep API order; do not force "new" categories to the front.
              const ordered = categories;
              return (
              <View style={styles.categoriesContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.categoriesScroll, isRTL && styles.categoriesScrollRTL]}
                >
                  {ordered.map((category) => {
                    const hasBadge = isNewCategory(category);
                    const isActive = selectedCategory === category;
                    return (
                      <View key={category} style={styles.categoryItem}>
                        {hasBadge && (
                          <View style={styles.categoryNewBadgeWrapper} pointerEvents="none">
                            <View style={[
                              styles.categoryNewBadge,
                              isActive && styles.categoryNewBadgeActive
                            ]}>
                              <Text
                                numberOfLines={1}
                                allowFontScaling={false}
                                style={[
                                  styles.categoryNewBadgeText,
                                  isActive && styles.categoryNewBadgeTextActive
                                ]}
                              >{t('common.new')}</Text>
                            </View>
                          </View>
                        )}
                        <TouchableOpacity
                          style={[
                            styles.categoryButton,
                            isRTL && styles.categoryButtonRTL,
                            isActive && styles.activeCategoryButton,
                          ]}
                          onPress={() => handleCategoryPress(category)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.categoryButtonText,
                              isRTL && styles.categoryButtonTextRTL,
                              isActive && styles.activeCategoryButtonText,
                            ]}
                            numberOfLines={1}
                          >
                            {getCategoryTranslationKey(category) ? t(getCategoryTranslationKey(category)) : category}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>

                <Text style={[styles.productCount, isRTL && styles.productCountRTL]}>
                  {filteredProducts.length} {t(filteredProducts.length === 1 ? 'shop.product' : 'shop.products')}
                  {selectedCategory !== 'All' && ` ${t('shop.in')} ${(getCategoryTranslationKey(selectedCategory) ? t(getCategoryTranslationKey(selectedCategory)) : selectedCategory)}`}
                  {searchQuery && ` ${t('shop.foundFor', { query: searchQuery })}`}
                </Text>
              </View>
              );
            })()}

            {/* Build Your Set Banner */}
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
                      🎁 {t('shop.buildYourSet')}
                    </Text>
                    <Text style={[styles.buildSetSubtitle, isRTL && styles.textRTL]}>
                      {t('shop.buildYourSetDesc')}
                    </Text>
                  </View>
                  <View style={styles.buildSetBadge}>
                    <Text style={styles.buildSetBadgeText}>{t('shop.upTo20Off')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          (searchQuery || selectedCategory !== 'All') ? (
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
          ) : (loadFailed && !loading) ? (
            /* API + cache both failed: show retry instead of a silent blank grid */
            <View style={styles.noResultsContainer}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.placeholder} style={{ marginBottom: 12 }} />
              <Text style={[styles.noResultsTitle, isRTL && styles.noResultsTitleRTL]}>
                {t('common.connectionErrorTitle')}
              </Text>
              <Text style={[styles.noResultsText, isRTL && styles.noResultsTextRTL]}>
                {t('common.connectionErrorText')}
              </Text>
              <TouchableOpacity
                style={[styles.clearSearchButton, styles.noResultsActionButton, { marginTop: 12 }]}
                onPress={retryLoadProducts}
              >
                <Text style={[styles.clearSearchText, isRTL && styles.clearSearchTextRTL]}>
                  {t('common.tryAgain')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      </RNAnimated.View>

      <ProductOptionSheet
        visible={optionSheetVisible}
        product={optionProduct}
        isRefreshing={optionRefreshing}
        refreshError={optionRefreshError}
        isAdding={optionAdding}
        onRetry={() => refreshOptionProduct(optionProduct)}
        onClose={closeOptionSheet}
        onConfirm={handleConfirmOptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.groupedBg,
  },
  loadingText: {
    ...T.body,
    color: colors.secondaryLabel,
    marginTop: 16,
  },
  gridFade: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.groupedBg,
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
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    ...shadow.card,
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
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    marginStart: 6,
  },
  langButtonText: {
    ...T.captionSmall,
    fontWeight: '800',
    color: colors.greenDeep, // matches website (green)
  },
  aiLinkBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginStart: 2,
  },
  aiLinkText: {
    ...T.labelSmall,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: colors.accent,
  },
  langOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  langMenu: {
    position: 'absolute',
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 130,
    shadowColor: colors.shadowCast,
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
    backgroundColor: colors.accentBg, // primary-50
  },
  langMenuItemText: {
    ...T.label,
    color: colors.label,
  },
  langMenuItemTextRtl: {
    textAlign: 'right',
  },
  langMenuItemTextActive: {
    color: colors.accent, // primary-600
    fontWeight: '800',
  },
  logo: {
    width: 110,
    height: 36,
  },
  subtitle: {
    ...T.captionSmall,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: colors.secondaryLabel,
    textAlign: 'center',
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
    backgroundColor: colors.cta,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoritesBadgeText: {
    ...T.badge,
    fontWeight: '600',
    color: colors.white,
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
    backgroundColor: colors.cta,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInitials: {
    ...T.label,
    color: colors.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    end: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },
  guestAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.subtleBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  productCount: {
    ...T.caption,
    fontWeight: '500',
    color: colors.secondaryLabel,
    marginTop: 8,
    paddingHorizontal: 20,
    textAlign: 'left',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...T.sectionTitle,
    fontSize: 22,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_SIDE_PADDING,
    justifyContent: 'space-between',
  },
  gridRow: {
    paddingHorizontal: GRID_SIDE_PADDING,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    ...surfaces.card,
    ...shadow.card,
    marginBottom: 16,
    // Soft elevation only — no hard border. overflow stays visible so the
    // image rounds itself (its own container clips) while card stays open.
  },
  gridImageContainer: {
    // Square tile (matches the website's aspect-square frames): square
    // studio photos fill edge-to-edge, wide photos letterbox on white.
    width: '100%',
    height: GRID_CARD_WIDTH,
    position: 'relative',
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.subtleBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPlaceholderText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.accent,
  },
  gridContent: {
    padding: 12,
  },
  gridContentRTL: {
    alignItems: 'flex-end',
  },
  gridName: {
    ...T.label,
    marginBottom: 4,
    lineHeight: 18,
  },
  gridNameRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  gridCategory: {
    ...T.productCategory,
    color: colors.secondaryLabel,
    marginBottom: 4,
  },
  gridCategoryRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  gridDescription: {
    ...T.productDescription,
    lineHeight: 14,
    marginBottom: 6,
  },
  gridDescriptionRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  gridPrice: {
    ...T.priceSmall,
    color: colors.accent,
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...surfaces.card,
    ...shadow.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    ...T.body,
    lineHeight: undefined,
    flex: 1,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondaryLabel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchClearIconButton: {
    marginLeft: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondaryLabel,
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
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: 280,
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  voicePulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cta,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceTitle: {
    ...T.sectionTitleSmall,
    marginBottom: 8,
  },
  voicePartialText: {
    ...T.bodySmall,
    fontWeight: '500',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 20,
  },
  voiceHintText: {
    ...T.caption,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  voiceStopBtn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: colors.groupedBg,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  voiceStopText: {
    ...T.label,
  },

  // No Results Styles
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsTitle: {
    ...T.sectionTitle,
    marginBottom: 8,
  },
  noResultsText: {
    ...T.body,
    color: colors.secondaryLabel,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  clearSearchButton: {
    backgroundColor: colors.cta,
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
    ...T.button,
    textAlign: 'center',
  },

  // Categories Styles — single horizontal scroll row (matches web mobile)
  categoriesContainer: {
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  categoriesScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14, // headroom so the floating "NEW" badge sits clearly above the pill
    paddingBottom: 4,
  },
  categoriesScrollRTL: {
    flexDirection: 'row-reverse',
  },
  categoryItem: {
    position: 'relative',
    // Wider gap so the localised "new" badge (e.g. Russian "Новинка", longer
    // than English "NEW") can overflow the pill without touching the next
    // pill. The badge is absolutely positioned above the pill and can be
    // wider than the pill itself.
    marginRight: 14,
    overflow: 'visible',
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 56,
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeCategoryButton: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
  },
  // Transparent positioner that spans the pill's horizontal extent and
  // centers the badge above it. Using a wrapper (instead of a hard-coded
  // translateX on the badge itself) lets the badge auto-size for any
  // locale — "NEW" (EN), "Новинка" (RU), "جديد" (AR) — without forcing
  // the text onto a second line. `overflow: visible` lets the badge
  // extend slightly past the pill edges when the localized word is
  // wider than the pill itself; the extra marginRight on categoryItem
  // gives it room before the next pill starts.
  categoryNewBadgeWrapper: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    overflow: 'visible',
  },
  categoryNewBadge: {
    backgroundColor: colors.green,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.white,
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  categoryNewBadgeActive: {
    backgroundColor: colors.white,
  },
  categoryNewBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  categoryNewBadgeTextActive: {
    color: colors.accent,
  },
  categoryButtonText: {
    ...T.label,
    color: colors.label,
    fontWeight: '500',
    fontSize: 13,
  },
  activeCategoryButtonText: {
    color: colors.accent,
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
  // NEW pill in the meta row (matches the website rail cards)
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridMetaRowRTL: {
    flexDirection: 'row-reverse',
  },
  newPill: {
    backgroundColor: colors.label,
    borderRadius: 980,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  newPillText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badgeContainerRTL: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
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
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Stock Overlay — frosted capsule (legible over any product image)
  stockOverlay: {
    position: 'absolute',
    bottom: 8,
    start: 0,
    end: 0,
    alignItems: 'center',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
  },
  stockOverlayText: {
    ...T.captionTiny,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.red,
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
    ...T.priceStrikethrough,
    fontSize: 12,
  },
  discountedPrice: {
    ...T.priceDiscount,
    fontSize: 15,
  },
  savings: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
    backgroundColor: colors.redBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  vatText: {
    fontSize: 9,
    color: colors.secondaryLabel,
    fontStyle: 'italic',
    marginTop: 2,
  },
  userDiscount: {
    fontSize: 10,
    color: colors.greenDeep,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  // Add to Cart Button Styles
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cta,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
    minHeight: 36,
  },
  requestQuoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.whatsappDeep,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
    minHeight: 36,
  },
  priceOnRequestText: {
    ...T.label,
    letterSpacing: 0.3,
    color: colors.accent,
  },
  loginToSeePriceText: {
    ...T.labelSmall,
    color: colors.secondaryLabel,
    fontWeight: '700',
    marginBottom: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: colors.tertiary,
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
    ...T.buttonTiny,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.white,
  },
  addToCartTextRTL: {
    writingDirection: 'rtl',
  },

  // In-bag quantity stepper (replaces the flat "In Bag (N)" button once
  // the product has been added). Keeps the same 44px height as the
  // original button so the card's vertical rhythm is preserved.
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: colors.greenDeep,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 44,
    overflow: 'hidden',
  },
  qtyStepperRTL: {
    flexDirection: 'row-reverse',
  },
  qtyStepperBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  qtyStepperLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  qtyStepperCheck: {
    marginRight: 6,
  },
  qtyStepperLabel: {
    ...T.buttonTiny,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
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
    backgroundColor: colors.accentBg,
    borderRadius: 14,
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
    ...T.label,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  buildSetSubtitle: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    lineHeight: 16,
  },
  buildSetBadge: {
    backgroundColor: colors.cta,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buildSetBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});

// Screen-level error boundary: a render crash here shows a recoverable
// error screen instead of taking down the whole navigation stack.
export default withErrorBoundary(ShopScreen, { screenName: 'Shop' });
