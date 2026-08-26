import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
  FlatList,
  ScrollView,
  findNodeHandle,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { setAudioModeAsync } from 'expo-audio';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { fetchProductById } from '../../services/api';
import { getJson } from '../../services/httpClient';
import ProductVariantSelector from '../../components/ProductVariantSelector';
import { isBeautyBoxProduct } from '../../utils/productRules';
import { useLocalization, tStatic } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductDescription, getLocalizedProductSize } from '../../utils/productLocalization';
import BeautyBoxDetails from '../../components/product/BeautyBoxDetails';
import PerfectCombinationCard from '../../components/product/PerfectCombinationCard';
import RecommendedRoutineCard from '../../components/product/RecommendedRoutineCard';
import ProductReviews from '../../components/product/ProductReviews';
import TrustBadges from '../../components/product/TrustBadges';
import CollapsibleSection from '../../components/product/CollapsibleSection';
import ImageLightbox from '../../components/product/ImageLightbox';
import ProductQuickFactsCard from '../../components/product/ProductQuickFactsCard';
import BespokeContent, { BespokeHero } from '../../components/product/BespokeContent';
import Toast from '../../components/Toast';
import { ProductDetailSkeleton } from '../../components/SkeletonLoader';
import * as haptics from '../../utils/haptics';
import LocaleSwitchButton from '../../components/LocaleSwitchButton';
import { createLogger } from '../../utils/logger';
import AUTH_CONFIG from '../../config/auth';
import { getProductImages, getProductVideoUrl, getProductDocs } from '../../data/productConfig';
import {
  asText,
  normalizeForCompare,
  dedupeList,
  pickField,
  parseMaybeJSON,
  asStringList,
  filterListForLocale,
  asKeyValueObject,
  toHowToSteps,
  toIngredients,
  getObjectField,
} from '../../utils/productDetailUtils';
import { getCategoryTranslationKey, normalizeCategoryCanonical } from '../../utils/productLocalization';
import { getPricingDisplay, formatAed, resolvePriceView, discountLabelFor } from '../../utils/pricingDisplay';
import { isProductOutOfStock } from '../../utils/stock';
import T from '../../utils/typography';
import { colors, shadow, surfaces, tint } from '../../utils/theme';
import { withErrorBoundary } from '../../components/ErrorBoundary';
import SectionHeader from '../../components/SectionHeader';
import { useHideOnScroll } from '../../components/CollapsibleHeader';
import { openWhatsApp } from '../../utils/support';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Square hero stage, as on the website. The studio packshots are square, so a
// fixed 320 left roughly a quarter of the screen width as empty margin beside
// every product photo on the one screen where the photo has to sell.
const HEADER_HEIGHT = SCREEN_WIDTH;
// The product name joins the bar as the gallery leaves the screen. Tied to the
// hero's height rather than fixed pixels, so it tracks the square stage on any
// handset.
const HEADER_PILL_HEIGHT = 48;
const TITLE_FADE_IN = [HEADER_HEIGHT - 120, HEADER_HEIGHT - 40];
// The header icons are 36pt so they sit comfortably inside the floating pill.
// 4pt of slop on each side takes the tappable area to the 44pt HIG minimum
// without growing the pill itself.
const HEADER_HIT_SLOP = { top: 4, bottom: 4, left: 4, right: 4 };

// Spec fields mapping to support website-like details
const SPEC_FIELDS = [
  { label: 'Size', keys: ['size', 'volume', 'productSize'] },
  { label: 'Skin Type', keys: ['skinType', 'skin_type', 'skinTypes'] },
  { label: 'Formulation', keys: ['formulation', 'texture'] },
  { label: 'Origin', keys: ['origin', 'countryOfOrigin', 'madeIn'] },
];

// Website-style "Product Details" order (prefers values from product.productDetails when present)
const WEBSITE_DETAILS_ORDER = [
  { label: 'Form', keys: ['form'] },
  { label: 'Size', keys: ['size'] },
  { label: 'Target', keys: ['target'] },
  { label: 'Technology', keys: ['technology'] },
  { label: 'Key Benefits', keys: ['keyBenefits', 'key benefits'] },
  { label: 'Usage', keys: ['usage'] },
  { label: 'Skin Type', keys: ['skinType', 'skin type'] },
  { label: 'Application', keys: ['application'] },
  { label: 'Formulation', keys: ['formulation'] },
  { label: 'Origin', keys: ['origin'] },
  { label: 'Note', keys: ['note', 'notes'] },
];

const getObjValueCaseInsensitive = (obj, keys) => {
  if (!obj || typeof obj !== 'object') return '';
  const entries = Object.entries(obj);
  for (const wanted of keys) {
    const w = normalizeForCompare(wanted);
    for (const [k, v] of entries) {
      if (normalizeForCompare(k) === w) {
        return asText(v).trim();
      }
    }
  }
  return '';
};

const log = createLogger('ProductDetail');

/**
 * ProductVideo – shows a thumbnail with play button; loads video on tap.
 *
 * Migrated from expo-av → expo-video. Differences:
 *   • useVideoPlayer must be called unconditionally (Rules of Hooks), so
 *     the player is created upfront with the remote URL and paused until
 *     the user taps play.
 *   • iOS silent-switch override now uses expo-audio's setAudioModeAsync
 *     with the renamed `playsInSilentMode` key.
 *   • onError → statusChange event listener (`status === 'error'`).
 */
function ProductVideo({ videoUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  // Most product clips are portrait. Replace this fallback with the source's
  // real dimensions as soon as expo-video reports its tracks.
  const [videoAspectRatio, setVideoAspectRatio] = useState(9 / 16);

  const player = useVideoPlayer({ uri: videoUrl }, (p) => {
    p.loop = false;
    p.muted = false;
  });

  useEffect(() => {
    if (!player) return undefined;
    const adoptTrackAspectRatio = (tracks) => {
      const track = tracks?.find(
        ({ size }) => Number(size?.width) > 0 && Number(size?.height) > 0
      );
      if (track) {
        setVideoAspectRatio(track.size.width / track.size.height);
      }
    };
    const statusSub = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'error') {
        log.error('Video playback error', error?.message || 'unknown');
        setVideoError(true);
      } else if (status === 'readyToPlay') {
        adoptTrackAspectRatio(
          player.videoTrack ? [player.videoTrack] : player.availableVideoTracks
        );
      }
    });
    const sourceSub = player.addListener('sourceLoad', ({ availableVideoTracks }) => {
      adoptTrackAspectRatio(availableVideoTracks);
    });
    const endSub = player.addListener('playToEnd', () => {
      // Restore the compact play button after playback, matching the website.
      // Rewind so tapping the button again starts from the beginning.
      player.currentTime = 0;
      setIsPlaying(false);
    });
    return () => {
      statusSub.remove();
      sourceSub.remove();
      endSub.remove();
    };
  }, [player]);

  const handlePlay = async () => {
    try {
      // expo-audio's setAudioModeAsync: `playsInSilentModeIOS` (expo-av) →
      // `playsInSilentMode` (expo-audio). Needed so product video audio plays
      // even when the iOS silent switch is on.
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
    } catch (e) {
      log.warn('Audio mode set failed', e?.message || e);
    }
    setIsPlaying(true);
    try {
      player.play();
    } catch (e) {
      log.error('Video play error', e?.message || e);
    }
  };

  if (videoError) {
    return null;
  }

  // Before play: a compact grey play button (same pattern as the website
  // PDP) instead of a full-width 16:9 black box — keeps the page tight and
  // defers all video loading until the user actually taps.
  if (!isPlaying) {
    return (
      <View style={videoStyles.section}>
        <TouchableOpacity
          style={videoStyles.compactWrapper}
          activeOpacity={0.7}
          onPress={handlePlay}
          accessibilityRole="button"
          accessibilityLabel={tStatic('product.watchVideo')}
        >
          <View style={videoStyles.compactPlayButton}>
            <Ionicons name="play" size={28} color={colors.bodyText} style={{ marginLeft: 3 }} />
          </View>
          <Text style={videoStyles.compactLabel}>{tStatic('product.watchVideo')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={videoStyles.section}>
      <View style={[videoStyles.container, { aspectRatio: videoAspectRatio }]}>
        <VideoView
          player={player}
          style={videoStyles.player}
          contentFit="contain"
          nativeControls
        />
      </View>
    </View>
  );
}

const videoStyles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  title: {
    ...T.sectionTitle,
    fontWeight: '600',
    marginBottom: 16,
  },
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  compactWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.separator,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  compactLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedText,
  },
  player: {
    width: '100%',
    height: '100%',
  },
});

// PDP Batch C — inlined copy for strings that power the new UI surfaces
// (quantity stepper, toast, read-more control, VAT line, OOS messaging).
// Kept inline (mirrors TrustStrip/TrustBadges pattern) so translations
// ship with the JS bundle and are not subject to runtime i18n cache misses.
const PDP_COPY_MAP = {
  en: {
    addedToBag: 'added to bag',
    viewBag: 'View Bag',
    readMore: 'Read more',
    showLess: 'Show less',
    vatIncluded: 'VAT included',
    outOfStock: 'Out of stock',
    quantity: 'Quantity',
  },
  ar: {
    addedToBag: 'أُضيف إلى الحقيبة',
    viewBag: 'عرض الحقيبة',
    readMore: 'اقرأ المزيد',
    showLess: 'عرض أقل',
    vatIncluded: 'شامل ضريبة القيمة المضافة',
    outOfStock: 'غير متوفر',
    quantity: 'الكمية',
  },
  ru: {
    addedToBag: 'добавлен в корзину',
    viewBag: 'В корзину',
    readMore: 'Читать далее',
    showLess: 'Свернуть',
    vatIncluded: 'Цены включают НДС',
    outOfStock: 'Нет в наличии',
    quantity: 'Количество',
  },
};

const getPdpCopy = (locale) => {
  const lang = String(locale || '').toLowerCase().split('-')[0];
  return PDP_COPY_MAP[lang] || PDP_COPY_MAP.en;
};

/** iOS Settings–style filled glyph tile + bold section title (matches order details). */
function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  // The pill floats clear of the status bar, and absolute insets ignore the
  // SafeAreaView's padding, so it has to account for that itself — and travel
  // far enough to take the status bar strip with it when it goes.
  const [footerHeight, setFooterHeight] = useState(0);
  const headerTop = insets.top + 8;
  const { translateY: headerTranslateY, handleScroll: onHeaderScroll } = useHideOnScroll(
    headerTop + HEADER_PILL_HEIGHT + 8
  );
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewAggregate, setReviewAggregate] = useState(null); // { averageRating, reviewCount }
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const PDP_COPY = getPdpCopy(locale);

  // Conservative OOS detection: only treat as out-of-stock when an explicit
  // signal exists. Missing/undefined stock info should not block checkout.
  // Shared with the shop grid (utils/stock.js) so both surfaces agree (M1).
  const isOutOfStock = isProductOutOfStock(product);

  // Hoisted so the inline gallery and the full-screen Lightbox share the same
  // image array (avoids re-computing or getting out of sync).
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const productId = String(product.productNumber || product.id || id);
    return getProductImages(productId, product) || [];
  }, [product, id]);
  const { addItem, decrementCartItem, isInCart, getItemQuantity } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;
  const galleryRef = useRef(null);
  const scrollRef = useRef(null);
  const reviewsWrapperRef = useRef(null);
  // Subtle entrance motion for the content below the hero gallery (matches
  // order-details mount feel). Independent Animated.Values → does not touch
  // the scrollY-driven mini-header/gallery animation.
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentLift = useRef(new Animated.Value(12)).current;


  // Re-fetch when the auth token changes too (M4): logging in while the PDP
  // is mounted must replace guest pricing with the user's server pricing.
  useEffect(() => {
    // Logging in re-runs this while the guest request is still open. Both
    // resolve into the same setState, and the server answers guest requests
    // from cache faster than it computes a user's price, so without this flag
    // the stale guest reply lands last and the member sees retail again —
    // on a screen with an Add to Bag button under it.
    const run = { cancelled: false };
    loadProduct(run);
    return () => { run.cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.token, locale]);

  // Fade + lift the content in once the product is ready.
  useEffect(() => {
    if (loading || !product) return;
    contentFade.setValue(0);
    contentLift.setValue(12);
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentLift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [loading, product]);

  // Lightweight review aggregate fetch for the summary shown under product name.
  // The ProductReviews component renders its own full list further down — we keep
  // the summary call separate so the "Be the first to review" link can appear
  // instantly alongside the product header, without waiting for the full list.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const base = AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae';
    getJson(`${base}/api/products/${id}/reviews`, { headers: { apiKey: false } })
      .then((data) => {
        if (cancelled || !data) return;
        setReviewAggregate({
          averageRating: data.averageRating ?? null,
          reviewCount: data.reviewCount ?? 0,
        });
      })
      .catch(() => {
        // Non-critical; reviews are optional
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const scrollToSection = useCallback((ref) => {
    haptics.lightTap();
    const scrollable = scrollRef.current;
    const target = ref?.current;
    if (!scrollable || !target) return;
    // Animated.ScrollView proxies scrollTo. For measureLayout we need the native node handle
    // of the underlying ScrollView's inner view. `getScrollableNode()` returns it.
    const innerNode =
      (scrollable.getScrollableNode && scrollable.getScrollableNode()) ||
      findNodeHandle(scrollable);
    if (!innerNode || !target.measureLayout) return;
    target.measureLayout(
      innerNode,
      (_x, y) => {
        scrollable.scrollTo({ y: Math.max(0, y - 16), animated: true });
      },
      () => {}
    );
  }, []);

  const scrollToReviews = useCallback(() => scrollToSection(reviewsWrapperRef), [scrollToSection]);

  const loadProduct = async (run = { cancelled: false }) => {
    try {
      log.debug('Loading product', { id: String(id) });
      
      // Use enhanced fetchProductById with user context
      const enhancedProduct = await fetchProductById(id, user, { locale });

      if (run.cancelled) return;

      if (enhancedProduct) {
        setProduct(enhancedProduct);
        log.debug('Product loaded', {
          name: enhancedProduct.name,
          hasVariants: enhancedProduct.variants?.length || 0,
          hasBadges: enhancedProduct.badges?.length || 0,
        });

        // Set default selections from enhanced API data
        if (enhancedProduct.variants && enhancedProduct.variants.length > 0) {
          // Find default variant or use first available one
          const defaultVariant = enhancedProduct.variants.find(v => v.isDefault) || 
                                  enhancedProduct.variants.find(v => v.available) ||
                                  enhancedProduct.variants[0];
          if (defaultVariant) {
            setSelectedSize(defaultVariant.size);
          }
        }

        if (enhancedProduct.colorVariants && enhancedProduct.colorVariants.length > 0) {
          // Use first available color variant. Optional-chained because a variant
          // without `value` would otherwise select undefined, and the stock check
          // on Add to Bag reads that colour.
          const firstColor = enhancedProduct.colorVariants[0]?.value;
          if (firstColor) setSelectedColor(firstColor);
        }

        if (user && enhancedProduct.originalPrice && enhancedProduct.originalPrice !== (enhancedProduct.displayPrice || enhancedProduct.price)) {
          log.debug('User discount applied server-side');
        }
          } else {
            // Fall through to the null-product screen (has its own Go Back
            // button) instead of alert + forced back-nav.
            log.warn('Product not found', { id });
      }
    } catch (error) {
      // Don't router.back() here: the !product render branch shows a
      // "not found" screen with a Go Back button, and staying on the screen
      // lets the user retry via pull-back navigation instead of losing context.
      log.error('Error loading product', error?.message || error);
    } finally {
      if (!run.cancelled) setLoading(false);
    }
  };

  const handleAddToBag = () => {
    if (!product || product.isPriceOnRequest) return;

    if (!user) {
      haptics.lightTap();
      router.push({
        pathname: '/auth/login',
        params: { returnTo: `/product/${id}` },
      });
      return;
    }

    // OOS guard — no-op if product is out of stock (defensive, UI also disables the button).
    if (isOutOfStock) {
      haptics.lightTap();
      setToastMessage(PDP_COPY.outOfStock);
      setToastVisible(true);
      return;
    }

    // Ensure selected size variant pricing is respected in bag/checkout
    const unitPrice = (() => {
      if (selectedSize && Array.isArray(product.variants) && product.variants.length > 0) {
        const v = product.variants.find((vv) => String(vv.size) === String(selectedSize));
        const vp = Number(v?.price);
        if (Number.isFinite(vp) && vp > 0) return vp;
      }
      const base = Number(product.displayPrice ?? product.price ?? 0);
      return Number.isFinite(base) ? base : 0;
    })();

    const productForCart = {
      ...product,
      displayPrice: unitPrice,
      price: unitPrice,
    };

    const qty = Math.max(1, Number(quantity) || 1);
    const added = addItem(productForCart, qty, selectedColor, selectedSize);
    if (added === false) {
      haptics.warning();
      Alert.alert(
        t('checkout.variantRequiredTitle'),
        t('checkout.variantRequiredMessage', {
          products: getLocalizedProductName(product, locale) || product.name,
        })
      );
      return;
    }
    setQuantity(1);
    haptics.success();

    const safeName = getLocalizedProductName(product, locale) || product.name;
    const msg = qty > 1
      ? `${safeName} × ${qty} ${PDP_COPY.addedToBag.toLowerCase()}`
      : `${safeName} ${PDP_COPY.addedToBag.toLowerCase()}`;
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleViewBagFromToast = async () => {
    try {
      await AsyncStorage.setItem(
        '@genosys_nav_bag_source',
        JSON.stringify({ pathname: '/product/[id]', params: { id } })
      );
    } catch {
      // non-fatal
    }
    router.push('/(tabs)/bag');
  };

  const incrementQty = () => {
    haptics.selectionTick();
    setQuantity((q) => Math.min(99, (Number(q) || 1) + 1));
  };

  const decrementQty = () => {
    haptics.selectionTick();
    setQuantity((q) => Math.max(1, (Number(q) || 1) - 1));
  };

  const openLightbox = (idx = 0) => {
    haptics.lightTap();
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const handleSizeChange = (size) => {
    haptics.selectionTick();
    setSelectedSize(size);
    log.debug('Size changed', { size });
    
    // Find the selected variant for pricing display (enhanced API provides this)
    if (product.variants) {
      const selectedVariant = product.variants.find(v => v.size === size);
      if (selectedVariant) {
        log.debug('Variant price', { price: selectedVariant.price });
      }
    }
  };

  const getSelectedUnitPrice = () => {
    if (!product) return 0;
    if (selectedSize && Array.isArray(product.variants) && product.variants.length > 0) {
      const v = product.variants.find((vv) => String(vv.size) === String(selectedSize));
      const vp = Number(v?.price);
      if (Number.isFinite(vp) && vp > 0) return vp;
    }
    const base = Number(product.displayPrice ?? product.price ?? 0);
    return Number.isFinite(base) ? base : 0;
  };

  const getSelectedPricingDisplay = () => getPricingDisplay(product, { selectedSize, selectedColor });

  const handleColorChange = (color) => {
    haptics.selectionTick();
    setSelectedColor(color);
    log.debug('Color changed', { color });
  };

  const handleWishlistToggle = async () => {
    if (!product?.id) return;
    haptics.lightTap();
    try {
      const displayName = asText(getLocalizedProductName(product, locale) || product.name);
      const unitPrice = getSelectedUnitPrice();
      await toggleFavorite({
        id: product.id,
        name: displayName,
        image: product.image,
        price: unitPrice || product.displayPrice || product.price || 0,
      });
    } catch (e) {
      Alert.alert(t('common.error'), t('product.failedToUpdateFavorites'));
    }
  };

  const handleShare = async () => {
    if (!product) return;
    haptics.lightTap();
    const url = `${AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae'}/products/${product.id}`;
    const displayPricing = getSelectedPricingDisplay();
    const priceLine = user && displayPricing?.displayPrice ? `\n${formatAed(displayPricing.displayPrice)}` : '';
    const message = `${asText(getLocalizedProductName(product, locale) || product.name)}${priceLine}\n${url}`;
    try {
      await Share.share(
        {
          title: asText(getLocalizedProductName(product, locale) || product.name) || 'Genosys Product',
          message,
          url,
        },
        { dialogTitle: t('product.share') }
      );
    } catch (error) {
      log.error('Failed to share product', error?.message || error);
      Alert.alert(t('product.error'), t('product.shareError'));
    }
  };

  const handleOpenProductGuide = useCallback((doc) => {
    if (!doc?.url) return;
    haptics.lightTap();
    const localizedTitle = doc.isBrochure
      ? (t('product.brochure') || doc.title)
      : (doc.title || t('productGuide.title'));
    router.push({
      pathname: '/product-guide',
      params: {
        url: doc.url,
        title: localizedTitle,
      },
    });
  }, [t]);

  const formatDescription = (text) => {
    if (!text) return '';
    
    // Replace multiple newlines with proper line breaks
    return text
      .replace(/\n\n/g, '\n\n')
      .replace(/Regular price:/g, '\n💰 Regular price:')
      .replace(/Bundle price:/g, '💰 Bundle price:')
      .replace(/Save \d+%/g, (match) => `💝 ${match}`)
      .replace(/Kit includes:/g, '\n📦 Kit includes:')
      .replace(/Key ingredients:/g, '\n🧪 Key ingredients:')
      .replace(/Clinical study:/g, '\n🔬 Clinical study:')
      .replace(/Features:/g, '\n✨ Features:')
      .trim();
  };


  const getDisplayDescription = () => {
    if (!product?.description) return '';

    const formatted = formatDescription(asText(getLocalizedProductDescription(product, locale) || product.description));
    const isLong = formatted.length > 500;

    if (isLong && !showFullDescription) {
      return formatted.substring(0, 500) + '...';
    }

    return formatted;
  };

  const renderInfoSection = (title, content, options = {}) => {
    const text = asText(content);
    if (!text || text.trim().length === 0) return null;
    const variant = options?.variant;
    const isNote = variant === 'note';
    const body = (
      <View style={[styles.descriptionContainer, isNote && styles.noteContainer]}>
        <Text style={[styles.description, isNote && styles.noteText, isRTL && styles.textRTL]}>{text}</Text>
      </View>
    );
    if (options?.collapsible) {
      return (
        <CollapsibleSection
          title={title}
          icon={options.icon}
          iconColor={options.iconColor}
          defaultOpen={!!options.defaultOpen}
          isRTL={isRTL}
        >
          {body}
        </CollapsibleSection>
      );
    }
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
        {body}
      </View>
    );
  };

  const renderSpecs = () => {
    if (!product) return null;

    const productDetailsObj =
      asKeyValueObject(product?.productDetails) || getObjectField(product, ['productDetails']);

    const prettifySpecLabel = (raw) => {
      const key = asText(raw).trim();
      if (!key) return '';

      const normalized = key.replace(/\s+/g, '').toLowerCase();
      const special = {
        sizeoptions: t('product.spec.sizeOptions'),
        keybenefits: t('product.spec.keyBenefits'),
        skintype: t('product.spec.skinType'),
        formulation: t('product.spec.formulation'),
        origin: t('product.spec.origin'),
        howtouse: t('product.spec.howToUse'),
        how_to_use: t('product.spec.howToUse'),
        countryoforigin: t('product.spec.origin'),
        madein: t('product.spec.origin'),
        productsize: t('product.spec.size'),
        volume: t('product.spec.size'),
        size: t('product.spec.size'),
        form: t('product.spec.form'),
        target: t('product.spec.target'),
        technology: t('product.spec.technology'),
        usage: t('product.spec.usage'),
        application: t('product.spec.application'),
        note: t('product.spec.note'),
        notes: t('product.spec.note'),
        type: t('product.spec.type'),
      };
      if (special[normalized]) return special[normalized];

      // Convert camelCase / snake_case / kebab-case to Title Case.
      const spaced = key
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();
      if (!spaced) return key;
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    };

    // 1) Build website-style rows from productDetails (exact strings/labels from website)
    const websiteRows = (productDetailsObj
      ? WEBSITE_DETAILS_ORDER.map(({ label, keys }) => {
          const v = getObjValueCaseInsensitive(productDetailsObj, keys);
          return v ? { label, value: v } : null;
        }).filter(Boolean)
      : []);

    const usedLabels = new Set(websiteRows.map((r) => normalizeForCompare(r.label)));

    // 2) Add remaining SPEC_FIELDS as fallback (only if not already provided by productDetails)
    const fallbackRows = SPEC_FIELDS.map(({ label, keys }) => {
      if (usedLabels.has(normalizeForCompare(label))) return null;
      if (label === 'Size') {
        const value = (selectedSize || pickField(product, keys)).trim();
        return value ? { label, value: asText(value) } : null;
      }
      const value = pickField(product, keys);
      return value ? { label, value: asText(value) } : null;
    }).filter(Boolean);

    // 3) Add any remaining productDetails key/values not covered above
    const extraRows = [];
    if (productDetailsObj) {
      const usedKeys = new Set();
      WEBSITE_DETAILS_ORDER.forEach(({ keys }) =>
        keys.forEach((k) => usedKeys.add(normalizeForCompare(k)))
      );
      for (const [k, v] of Object.entries(productDetailsObj)) {
        const nk = normalizeForCompare(k);
        if (!nk || usedKeys.has(nk)) continue;
        const tv = asText(v).trim();
        if (!tv) continue;
        // File links (PDF brochures etc.) are rendered as Documentation
        // buttons, not raw paths in the specs table.
        const isFileLink =
          nk.includes('brochure') ||
          /\.(pdf|pptx?|docx?)(\?|$)/i.test(tv) ||
          tv.startsWith('/documents/');
        if (isFileLink) continue;
        extraRows.push({ label: asText(k).trim(), value: tv });
      }
    }

    const rows = [...websiteRows, ...fallbackRows, ...extraRows];

    if (!rows.length) return null;

    const renderSpecValue = (label, value) => {
      const txt = asText(value).trim();
      if (!txt) return null;

      const nlabel = normalizeForCompare(label);

      // Website-style field: keyBenefits is usually a comma-separated list; render as bullets.
      if (nlabel === normalizeForCompare('Key Benefits')) {
        // Prefer a single <Text> with newlines to avoid layout quirks (some devices render bullet rows but hide text).
        const parsed = parseMaybeJSON(txt);
        const parts =
          Array.isArray(parsed) ? dedupeList(parsed.map(asText)) : dedupeList(txt.split(',').map((s) => s.trim()).filter(Boolean));

        if (parts.length) {
          const capFirst = (s) => {
            const t = asText(s).trim();
            if (!t) return '';
            const first = t[0];
            if (!first) return t;
            const upper = first.toUpperCase();
            return upper + t.slice(1);
          };
          return (
            <Text style={[styles.specValueText, isRTL && styles.specValueTextRTL]}>
              {parts.map((p) => `• ${capFirst(p)}`).join('\n')}
            </Text>
          );
        }
      }

      // Make "Size options" easier to scan (e.g. "50g (...) / 250g (...)" -> bullets)
      if (nlabel === normalizeForCompare('Size options')) {
        const parts = dedupeList(
          txt
            .split('/')
            .map((s) => s.trim())
            .filter(Boolean)
        );
        if (parts.length > 1) {
          return (
            <Text style={[styles.specValueText, isRTL && styles.specValueTextRTL]}>
              {parts.map((p) => `• ${p}`).join('\n')}
            </Text>
          );
        }
      }

      return <Text style={[styles.specValueText, isRTL && styles.specValueTextRTL]}>{txt}</Text>;
    };

    return (
      <View style={styles.section}>
        <SectionHeader icon="information-circle" title={t('product.productDetails')} isRTL={isRTL} />
        <View style={styles.specList}>
          {rows.map((row, idx) => (
            <View
              key={row.label + idx}
              style={[
                styles.specItem,
                isRTL && styles.specItemRTL,
                idx === rows.length - 1 ? styles.specItemLast : null,
              ]}
            >
              <Text style={[styles.specLabel, isRTL && styles.specLabelRTL]} numberOfLines={2}>
                {prettifySpecLabel(row.label)}
              </Text>
              <View style={[styles.specValueContainer, isRTL && styles.specValueContainerRTL]}>
                {renderSpecValue(row.label, row.value)}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderListSection = (title, items, options = {}) => {
    if (!items || items.length === 0) return null;
    const body = (
      <View style={styles.listContainer}>
        {items.map((item, idx) => (
          <View key={idx} style={[styles.listItem, isRTL && styles.listItemRTL]}>
            <Text style={[styles.listBullet, isRTL && styles.listBulletRTL]}>•</Text>
            <Text style={[styles.listText, isRTL && styles.textRTL]}>{asText(item)}</Text>
          </View>
        ))}
      </View>
    );
    if (options?.collapsible) {
      return (
        <CollapsibleSection
          title={title}
          icon={options.icon}
          iconColor={options.iconColor}
          defaultOpen={!!options.defaultOpen}
          isRTL={isRTL}
        >
          {body}
        </CollapsibleSection>
      );
    }
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
        {body}
      </View>
    );
  };

  const renderKeyValueSection = (title, obj) => {
    if (!obj || typeof obj !== 'object') return null;
    const entries = Object.entries(obj).filter(([k, v]) => asText(v).trim().length > 0);
    if (!entries.length) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
        <View style={styles.specList}>
          {entries.map(([k, v], idx) => (
            <View key={k + idx} style={[styles.specItem, isRTL && styles.specItemRTL]}>
              <Text style={[styles.specLabel, isRTL && styles.specLabelRTL]}>{asText(k)}</Text>
              <Text style={[styles.specValueText, isRTL && styles.specValueRTL]}>{asText(v)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStepsSection = (title, steps, options = {}) => {
    if (!steps || steps.length === 0) return null;
    const body = (
      <View style={styles.listContainer}>
        {steps.map((s, idx) => (
          <View key={`${idx}-${s.title}`} style={[styles.listItem, isRTL && styles.listItemRTL]}>
            <Text style={[styles.listBullet, isRTL && styles.listBulletRTL]}>{idx + 1}.</Text>
            <Text style={[styles.listText, isRTL && styles.textRTL]}>
              {s.title ? `${s.title}: ` : ''}
              {s.body}
            </Text>
          </View>
        ))}
      </View>
    );
    if (options?.collapsible) {
      return (
        <CollapsibleSection
          title={title}
          icon={options.icon}
          iconColor={options.iconColor}
          defaultOpen={!!options.defaultOpen}
          isRTL={isRTL}
        >
          {body}
        </CollapsibleSection>
      );
    }
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
        {body}
      </View>
    );
  };

  const renderIngredientsSection = (title, items, options = {}) => {
    if (!items || items.length === 0) return null;
    const body = (
      <View style={styles.listContainer}>
        {items.map((it, idx) => (
          <View key={`${idx}-${it.name}`} style={[styles.listItem, isRTL && styles.listItemRTL]}>
            <Text style={[styles.listBullet, isRTL && styles.listBulletRTL]}>•</Text>
            <Text style={[styles.listText, isRTL && styles.textRTL]}>
              <Text style={{ fontWeight: '700', color: colors.label }}>{it.name}</Text>
              {it.description ? ` — ${it.description}` : ''}
            </Text>
          </View>
        ))}
      </View>
    );
    if (options?.collapsible) {
      return (
        <CollapsibleSection
          title={title}
          icon={options.icon}
          iconColor={options.iconColor}
          defaultOpen={!!options.defaultOpen}
          isRTL={isRTL}
        >
          {body}
        </CollapsibleSection>
      );
    }
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
        {body}
      </View>
    );
  };

  // NOTE: buildExtraProductDetails() was replaced by website-first rendering inside renderSpecs()
  // to ensure cleanser (and other products) show the same ordered fields as the website.

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ProductDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={[styles.errorText, isRTL && styles.textRTL]}>{t('productScreen.notFound')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, isRTL && styles.textRTL]}>{t('productScreen.goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isWishlisted = !!(product?.id && isFavorite(product.id));
  const bespokeContent = product?.bespokeContent || null;
  const sizeOptions = (product?.variants || []).filter((variant) => variant && variant.size);
  const hasVariantChoice = Boolean(
    sizeOptions.length > 0 ||
    (product?.colorVariants && product.colorVariants.length > 0) ||
    product?.hasVariants
  );
  // The footer offers the choice only when there is one to make. A single-size
  // product would just be repeating its own label back at the shopper.
  const colorOptions = product?.colorVariants || [];
  const footerOptions = [
    ...(colorOptions.length > 1
      ? colorOptions.map((color) => ({
          kind: 'color',
          value: color.value,
          label: color.label || color.value,
          hex: color.hex,
          current: selectedColor,
          disabled: false,
          onSelect: handleColorChange,
        }))
      : []),
    ...(sizeOptions.length > 1
      ? sizeOptions.map((variant) => ({
          kind: 'size',
          value: variant.size,
          label: variant.size,
          hex: null,
          current: selectedSize,
          disabled: !variant.available,
          onSelect: handleSizeChange,
        }))
      : []),
  ];
  const priceView = resolvePriceView(product, { user, selectedSize, selectedColor });
  const priceLabel = priceView.kind === 'discounted' ? discountLabelFor(priceView, t) : null;
  const showFooterPrice = priceView.kind === 'single' || priceView.kind === 'discounted';

  /**
   * What this tap will cost, beside the button that makes it.
   *
   * It used to print the unit price and sit there unchanged while the stepper
   * counted up, so a shopper adding five read 300 and was charged 1,500. The
   * stepper drives the cart's quantity once the item is in the bag and a local
   * one before that, so the total follows whichever the stepper is showing, and
   * the unit price stays visible above it rather than disappearing into a
   * multiplication the shopper has to trust.
   */
  const renderFooterPrice = () => {
    if (!showFooterPrice) return null;
    const inBag = isInCart(product.id, selectedColor, selectedSize);
    const count = inBag ? getItemQuantity(product.id, selectedColor, selectedSize) : quantity;
    const each = Number(priceView.price) || 0;
    return (
      <View style={styles.footerPriceWrap}>
        {count > 1 ? (
          <Text style={styles.footerPriceEach}>
            {t('product.pricePerUnit', { count, price: formatAed(each) })}
          </Text>
        ) : null}
        <Text style={styles.footerPrice}>{formatAed(each * Math.max(1, count))}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* One floating bar, the same object as on every other screen: it sits
          over the gallery, steps aside on the way down and comes back on the
          way up. The product name joins it once the gallery is gone, so there
          is still an answer to "what am I looking at" further down the page. */}
      <Animated.View
        style={[styles.headerBar, { top: headerTop, transform: [{ translateY: headerTranslateY }] }]}
        pointerEvents="box-none"
      >
        <View style={[styles.headerButtons, isRTL && styles.headerButtonsRTL]}>
          <TouchableOpacity
            style={styles.headerButton}
            hitSlop={HEADER_HIT_SLOP}
            onPress={() => {
              haptics.lightTap();
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel={t('productScreen.goBack')}
          >
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={colors.label} />
          </TouchableOpacity>

          <Animated.Text
            style={[
              styles.headerTitle,
              isRTL && styles.textRTL,
              { opacity: scrollY.interpolate({ inputRange: TITLE_FADE_IN, outputRange: [0, 1], extrapolate: 'clamp' }) },
            ]}
            numberOfLines={1}
          >
            {asText(getLocalizedProductName(product, locale) || product.name)}
          </Animated.Text>

          <View style={[styles.headerRightButtons, isRTL && styles.headerRightButtonsRTL]}>
            {/* This screen already refetches on `locale`, so English and Russian
                swap in place without losing the reader's position. */}
            <LocaleSwitchButton />

            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={HEADER_HIT_SLOP}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel={t('product.share')}
            >
              <Ionicons name="share-outline" size={20} color={colors.label} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              hitSlop={HEADER_HIT_SLOP}
              onPress={handleWishlistToggle}
              accessibilityRole="button"
              accessibilityLabel={isWishlisted ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
              accessibilityState={{ selected: isWishlisted }}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={20}
                color={isWishlisted ? colors.accent : colors.label}
              />
            </TouchableOpacity>
          </View>
        </View>

      </Animated.View>

      {/* Product Content */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: (footerHeight || 96) + (insets.bottom || 12) + 16,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (e) => onHeaderScroll(e.nativeEvent.contentOffset.y),
          }
        )}
      >
        {/* Image Gallery */}
        {(() => {
          const hasMultipleImages = galleryImages.length > 1;
          // Use "contain" for all products so images fit within the container without cropping
          const imageFit = 'contain';
          
          if (galleryImages.length === 0) {
            return (
              <View style={styles.imageContainer}>
                <View style={styles.heroImagePlaceholder}>
                  <Text style={styles.heroPlaceholderText}>
                    {product.name?.charAt(0) || 'G'}
                  </Text>
                </View>
              </View>
            );
          }
          
          if (!hasMultipleImages) {
            return (
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => openLightbox(0)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={t('product.a11y.openImageViewer')}
                  style={{ flex: 1 }}
                >
                  <Image
                    source={galleryImages[0]}
                    style={styles.heroImage}
                    contentFit={imageFit}
                    transition={300}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              </View>
            );
          }
          
          return (
            <View style={styles.imageContainer}>
              <FlatList
                ref={galleryRef}
                data={galleryImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                keyExtractor={(item, index) => `gallery-${index}`}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setActiveImageIndex(newIndex);
                }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openLightbox(index)}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={t('product.a11y.openImage', { current: index + 1, total: galleryImages.length })}
                  >
                    <Image
                      source={item}
                      style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT, backgroundColor: colors.card }}
                      contentFit={imageFit}
                      transition={300}
                      cachePolicy="memory-disk"
                    />
                  </TouchableOpacity>
                )}
              />
              {/* A counter rather than dots. Products now carry up to ten claim
                  slides, at which point dots are an unreadable smear that says
                  neither where you are nor how many are left. */}
              <View style={styles.galleryCounter} pointerEvents="none">
                <Text style={styles.galleryCounterText}>
                  {`${activeImageIndex + 1} / ${galleryImages.length}`}
                </Text>
              </View>
            </View>
          );
        })()}

        {/* Product Info */}
        <Animated.View style={[styles.contentContainer, { opacity: contentFade, transform: [{ translateY: contentLift }] }]}>
          <View style={[styles.productInfo, shadow.card]}>
            <Text style={[styles.category, isRTL && styles.textRTL]}>
              {(() => {
                const canon = normalizeCategoryCanonical(product.category) || asText(product.category);
                const key = getCategoryTranslationKey(canon);
                return key ? t(key) : canon;
              })()}
            </Text>
            <Text style={[styles.productName, isRTL && styles.textRTL]}>{asText(getLocalizedProductName(product, locale) || product.name)}</Text>

            {/* Review summary: honest stars+count when real reviews exist,
                otherwise a subtle "Be the first to review" link. */}
            {(() => {
              if (!reviewAggregate) return null;
              const { averageRating, reviewCount } = reviewAggregate;
              if (reviewCount > 0 && averageRating != null) {
                const rounded = Math.round(averageRating);
                return (
                  <TouchableOpacity
                    onPress={scrollToReviews}
                    activeOpacity={0.6}
                    style={[styles.reviewSummary, isRTL && styles.reviewSummaryRTL]}
                    accessibilityRole="button"
                    accessibilityLabel={t('product.a11y.reviewSummary', {
                      rating: averageRating.toFixed(1),
                      count: reviewCount,
                    })}
                  >
                    <View style={[styles.reviewStarsRow, isRTL && styles.reviewStarsRowRTL]}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Ionicons
                          key={i}
                          name={i <= rounded ? 'star' : 'star-outline'}
                          size={14}
                          color={i <= rounded ? '#FBBF24' : colors.separatorStrong}
                          style={styles.reviewStarIcon}
                        />
                      ))}
                    </View>
                    <Text style={[styles.reviewSummaryText, isRTL && styles.textRTL]}>
                      {averageRating.toFixed(1)} ({reviewCount})
                    </Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  onPress={scrollToReviews}
                  activeOpacity={0.6}
                  style={[styles.reviewSummary, isRTL && styles.reviewSummaryRTL]}
                  accessibilityRole="button"
                  accessibilityLabel={t('product.beTheFirstToReview')}
                >
                  <Text style={[styles.reviewSummaryLink, isRTL && styles.textRTL]}>
                    {t('product.beTheFirstToReview')}
                  </Text>
                  <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={14}
                    color={colors.accent}
                    style={{ marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }}
                  />
                </TouchableOpacity>
              );
            })()}

            {/* Enhanced Size and Stock Info from Server */}
            {(product.size || product.hasVariants || (product.variants && product.variants.length > 0)) && (
              <View style={[styles.sizeInfoContainer, isRTL && styles.sizeInfoContainerRTL]}>
                <Text style={styles.sizeInfo}>
                  {product.variants && product.variants.length > 0
                    ? t('product.sizesAvailable', { count: product.variants.length })
                    : product.hasVariants 
                      ? t('product.multipleSizesAvailable')
                      : t('product.sizeLine', { size: getLocalizedProductSize(product, locale) })}
                </Text>
                {(product.stock || product.inStock) && (
                  <Text style={styles.stockInfo}>{t('product.inStock')}</Text>
                )}
              </View>
            )}
              
              {/* Price. `resolvePriceView` is the single decision, shared with
                  the catalogue, favourites and the shop list, so the same
                  product cannot show two different numbers in two places. */}
              <View style={styles.priceBlock}>
                {priceView.kind === 'login' ? (
                  <Text style={[styles.loginToSeePriceText, isRTL && styles.textRTL]}>
                    {t('product.loginToSeePrice')}
                  </Text>
                ) : priceView.kind === 'onRequest' ? (
                  <Text style={styles.priceOnRequestLabel}>{t('product.priceOnRequest')}</Text>
                ) : priceView.kind === 'discounted' ? (
                  <View>
                    <Text style={[styles.originalPrice, isRTL && styles.textRTL]}>
                      {formatAed(priceView.originalPrice)}
                    </Text>
                    <View style={[styles.discountRow, isRTL && styles.discountRowRTL]}>
                      <Text style={[styles.discountedPrice, isRTL && styles.textRTL]}>
                        {formatAed(priceView.price)}
                      </Text>
                      {priceLabel ? (
                        <View style={styles.discountBadge}>
                          <Text style={[styles.discountBadgeText, isRTL && styles.textRTL]}>{priceLabel}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.price}>{formatAed(priceView.price)}</Text>
                )}
              </View>

            {/* VAT-inclusive disclosure — matches web PDP. Only where an
                actual number is on screen. */}
            {(priceView.kind === 'single' || priceView.kind === 'discounted') && (
              <Text style={[styles.vatNote, isRTL && styles.textRTL]}>
                {PDP_COPY.vatIncluded}
              </Text>
            )}
          </View>

          {/* Size and colour sit directly under the price, because they set it.
              They used to follow the editorial hero, a card tall enough that a
              shopper could reach the buy button having never seen there was a
              choice — and be sold the default. */}
          {hasVariantChoice && (
            <View>
              <ProductVariantSelector
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={handleSizeChange}
                onColorChange={handleColorChange}
              />
            </View>
          )}

          {/* The website's opening: headline, the promise in four lines, and the
              figures behind it. Quick facts are the fallback for products with
              no bespoke page, and would only repeat the hero beside one. */}
          {bespokeContent ? (
            <BespokeHero content={bespokeContent} isRTL={isRTL} />
          ) : (
            <ProductQuickFactsCard facts={product?.quickFacts} />
          )}

          {/* Product Video */}
          {(() => {
            const productId = String(product.productNumber || product.id || id);
            const videoUrl = getProductVideoUrl(productId, product);
            if (!videoUrl) return null;
            return <ProductVideo videoUrl={videoUrl} />;
          })()}

          {/* Product Documentation */}
          {(() => {
            const productId = String(product.productNumber || product.id || id);
            const docs = getProductDocs(productId, product);
            if (!docs.length) return null;
            return (
              <View style={styles.section}>
                <SectionHeader icon="document-attach" title={t('product.documentation')} isRTL={isRTL} />
                {docs.map((doc, index) => (
                  <TouchableOpacity
                    key={`doc-${index}`}
                    style={[styles.docLink, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => handleOpenProductGuide(doc)}
                    accessibilityRole="button"
                    accessibilityLabel={t('productGuide.openDocument', {
                      title: doc.isBrochure ? (t('product.brochure') || doc.title) : doc.title,
                    })}
                  >
                    <Ionicons name="document-text-outline" size={20} color={colors.blue} />
                    <Text style={[styles.docLinkText, isRTL && { textAlign: 'right' }]} numberOfLines={2}>
                      {doc.isBrochure ? (t('product.brochure') || doc.title) : doc.title}
                    </Text>
                    <Ionicons name="open-outline" size={16} color={colors.secondaryLabel} />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}

          {/* Product content. Where the website has written a bespoke page, the
              API sends that copy and it is shown instead of the generic fields:
              the two say the same things, but the bespoke version says them with
              the checked figures and the sourcing. The generic path stays for
              the handful of products without one. */}
          {bespokeContent ? (
            <BespokeContent content={bespokeContent} isRTL={isRTL} />
          ) : isBeautyBoxProduct(product) ? (
            <BeautyBoxDetails product={product} styles={styles} />
          ) : (
            <>
              {(() => {
                const fullText = asText(
                  formatDescription(asText(getLocalizedProductDescription(product, locale) || product.description))
                );
                if (!fullText || !fullText.trim()) return null;
                const isLong = fullText.length > 500;
                const visible = isLong && !showFullDescription
                  ? fullText.substring(0, 500).trimEnd() + '…'
                  : fullText;
                return (
                  <View style={styles.section}>
                    <SectionHeader icon="document-text" title={t('product.about')} isRTL={isRTL} />
                    <View style={styles.descriptionContainer}>
                      <Text style={[styles.description, isRTL && styles.textRTL]}>
                        {visible}
                      </Text>
                      {isLong && (
                        <TouchableOpacity
                          style={[styles.readMoreButton, isRTL && { alignSelf: 'flex-end' }]}
                          onPress={() => {
                            haptics.lightTap();
                            setShowFullDescription((v) => !v);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                        >
                          <Text style={styles.readMoreText}>
                            {showFullDescription ? PDP_COPY.showLess : PDP_COPY.readMore}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })()}

              {/* Required website-like sections (deduped + formatted) */}
              {renderSpecs()}

              {(() => {
                const benefits = dedupeList([
                  ...asStringList(product?.benefits),
                  ...asStringList(product?.keyBenefits),
                  ...(() => {
                    const parsed = parseMaybeJSON(product?.keyFeatures);
                    if (!Array.isArray(parsed)) return [];
                    return parsed
                      .map((x) => {
                        if (!x) return '';
                        if (typeof x === 'string') return x;
                        const t = asText(x.title || '').trim();
                        const d = asText(x.description || '').trim();
                        return `${t}${t && d ? ' — ' : ''}${d}`.trim();
                      })
                      .filter(Boolean);
                  })(),
                ]);
                const filteredBenefits = filterListForLocale(benefits, locale);
                const benefitsOpts = { collapsible: true, defaultOpen: true, icon: 'sparkles-outline', iconColor: colors.accent };

                if (filteredBenefits.length === 1 && filteredBenefits[0].length > 200 && !filteredBenefits[0].includes(' — ')) {
                  return renderInfoSection(t('product.benefits'), filteredBenefits[0], benefitsOpts);
                }
                return renderListSection(t('product.benefits'), filteredBenefits, benefitsOpts);
              })()}

              {(() => {
                const steps = toHowToSteps(product?.howToUse);
                const howToText = pickField(product, ['howToUse', 'how_to_use', 'application', 'usage']);
                const fallbackDirections = pickField(product, ['directions']);
                const directionsOpts = { collapsible: true, defaultOpen: false, icon: 'list-outline', iconColor: colors.teal };

                // If we have explicit how-to content, we keep it under "Directions"
                // and treat `product.directions` as an extra "Note" (matches website behavior for many products).
                if (steps.length) return renderStepsSection(t('product.directions'), steps, directionsOpts);
                if (howToText) return renderInfoSection(t('product.directions'), howToText, directionsOpts);

                // If no how-to content exists, fall back to `directions` as actual directions.
                return renderInfoSection(t('product.directions'), fallbackDirections, directionsOpts);
              })()}

              {(() => {
                // Clinics come for the composition, so the collapsed header has
                // to say there is something worth opening.
                const ingredients = toIngredients(product?.ingredients || product?.keyIngredients);
                const title = ingredients.length
                  ? `${t('product.keyIngredients')} (${ingredients.length})`
                  : t('product.keyIngredients');
                return renderIngredientsSection(title, ingredients, {
                  collapsible: true,
                  defaultOpen: false,
                  icon: 'leaf-outline',
                  iconColor: colors.green,
                });
              })()}

              {(() => {
                // Prefer backend-driven `product.note` (added to mobile API),
                // then fall back to legacy fields if needed. Avoid using `directions` as Note.
                const noteBody =
                  pickField(product, ['note']) ||
                  pickField(product, ['notes', 'warning', 'caution']);
                return noteBody
                  ? renderInfoSection(t('product.note'), noteBody, {
                      variant: 'note',
                      collapsible: true,
                      defaultOpen: false,
                      icon: 'information-circle-outline',
                      iconColor: colors.secondaryLabel,
                    })
                  : null;
              })()}
            </>
          )}

          {/* Trust Badges - between content and reviews (mirrors web PDP placement) */}
          <TrustBadges />

          {/* Customer Reviews */}
          <View ref={reviewsWrapperRef} collapsable={false}>
            <ProductReviews productId={product.id} />
          </View>

          {/* Cross-sell last. These used to sit above the benefits, directions
              and ingredients, offering a second product before the shopper had
              finished reading about the first. Bundles skip it: a beauty box is
              already a combination. */}
          {!isBeautyBoxProduct(product) && (
            <>
              <PerfectCombinationCard product={product} user={user} styles={styles} />
              <RecommendedRoutineCard
                routine={product?.routine}
                currentProductId={product?.productNumber || product?.id}
                isRTL={isRTL}
              />
            </>
          )}
        </Animated.View>
      </Animated.ScrollView>

      {/* Fixed Bottom Button */}
      <View
        style={[styles.bottomBar, { bottom: insets.bottom || 12 }]}
        onLayout={(e) => {
          const h = e?.nativeEvent?.layout?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h > 0) setFooterHeight(h);
        }}
      >
        {/* The choice itself, not a shortcut to it. The options sit beside the
            buy button so the thing being bought can be changed where it is
            being bought, and the price on the right follows the tap. */}
        {footerOptions.length > 0 ? (
          <View style={[styles.footerSelection, isRTL && styles.footerSelectionRTL]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.footerOptionsScroll}
              contentContainerStyle={[styles.footerOptions, isRTL && styles.rowRTL]}
            >
              {footerOptions.map((option) => {
                const selected = option.value === option.current;
                return (
                  <TouchableOpacity
                    key={`${option.kind}-${option.value}`}
                    onPress={() => option.onSelect(option.value)}
                    disabled={option.disabled}
                    activeOpacity={0.75}
                    style={[
                      styles.footerOption,
                      selected && styles.footerOptionSelected,
                      option.disabled && styles.footerOptionDisabled,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: option.disabled }}
                    accessibilityLabel={option.label}
                  >
                    {selected && (
                      <View style={styles.footerOptionCheck}>
                        <Ionicons name="checkmark" size={10} color={colors.white} />
                      </View>
                    )}
                    {option.hex ? (
                      <View style={[styles.footerSwatch, { backgroundColor: option.hex }]} />
                    ) : null}
                    <Text
                      style={[
                        styles.footerOptionText,
                        selected && styles.footerOptionTextSelected,
                        option.disabled && styles.footerOptionTextDisabled,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {renderFooterPrice()}
          </View>
        ) : showFooterPrice ? (
          // No options to choose, but there is still a number worth showing
          // beside the button, and it has to move when the stepper does.
          <View style={[styles.footerSelection, isRTL && styles.footerSelectionRTL]}>
            <View />
            {renderFooterPrice()}
          </View>
        ) : null}
        {product.isPriceOnRequest ? (
          <TouchableOpacity
            style={[styles.requestQuoteBottomButton, isRTL && styles.addToBagButtonRTL]}
            onPress={() => {
              const productName = getLocalizedProductName(product, locale) || product.name || '';
              const message = (t('product.requestQuoteMessage') || "Hi, I'm interested in {name}. Could you please provide pricing information?").replace('{name}', productName);
              openWhatsApp(message);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="logo-whatsapp"
              size={20}
              color={colors.white}
              style={[styles.buttonIcon, isRTL && styles.buttonIconRTL]}
            />
            <Text style={[styles.addToBagText, isRTL && styles.textRTL]}>
              {t('product.requestQuote')}
            </Text>
          </TouchableOpacity>
        ) : (() => {
          const inBagForSelection = isInCart(product.id, selectedColor, selectedSize);
          const qtyForSelection = getItemQuantity(product.id, selectedColor, selectedSize);
          const disabled = isOutOfStock;
          const buttonLabel = disabled
            ? PDP_COPY.outOfStock
            : !user
              ? t('shop.loginToBuy')
              : inBagForSelection
              ? t('product.inBag', { count: qtyForSelection })
              : t('product.addToBag');
          return (
            <View style={[styles.bottomRow, isRTL && styles.bottomRowRTL]}>
              {/* Quantity stepper — web PDP parity. Hidden when OOS. */}
              {!disabled && user && (
                <View
                  style={[styles.qtyStepper, isRTL && styles.qtyStepperRTL]}
                  accessibilityLabel={PDP_COPY.quantity}
                >
                  <TouchableOpacity
                    style={[
                      styles.qtyBtn,
                      !inBagForSelection && quantity <= 1 && styles.qtyBtnDisabled,
                    ]}
                    onPress={() => {
                      if (inBagForSelection) {
                        haptics.selectionTick();
                        decrementCartItem(product.id, selectedColor, selectedSize);
                        return;
                      }
                      decrementQty();
                    }}
                    disabled={!inBagForSelection && quantity <= 1}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('shop.decreaseQuantity')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={!inBagForSelection && quantity <= 1 ? colors.tertiary : colors.label}
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>
                    {inBagForSelection ? qtyForSelection : quantity}
                  </Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={inBagForSelection ? handleAddToBag : incrementQty}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('shop.increaseQuantity')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="add" size={18} color={colors.label} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.addToBagButton,
                  styles.addToBagButtonFlex,
                  isRTL && styles.addToBagButtonRTL,
                  inBagForSelection && !disabled && styles.inCartButton,
                  disabled && styles.addToBagButtonDisabled,
                ]}
                onPress={inBagForSelection ? handleViewBagFromToast : handleAddToBag}
                disabled={disabled}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
              >
                <Ionicons
                  name={disabled ? 'alert-circle' : inBagForSelection ? 'checkmark' : 'bag'}
                  size={20}
                  color={colors.white}
                  style={[styles.buttonIcon, isRTL && styles.buttonIconRTL]}
                />
                <Text style={[styles.addToBagText, isRTL && styles.textRTL]}>
                  {buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}
        </View>

        {/* Toast — non-blocking add-to-bag (and OOS) feedback */}
        <Toast
          visible={toastVisible}
          message={toastMessage}
          actionLabel={!isOutOfStock ? PDP_COPY.viewBag : null}
          onAction={!isOutOfStock ? handleViewBagFromToast : null}
          onHide={() => setToastVisible(false)}
          bottomOffset={(footerHeight || 96) + (insets.bottom || 12) + 12}
          isRTL={isRTL}
          icon={isOutOfStock ? 'alert-circle' : 'checkmark-circle'}
          iconColor={isOutOfStock ? colors.orange : colors.green}
        />

        {/* Full-screen image gallery (Lightbox) */}
        <ImageLightbox
          visible={lightboxOpen}
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 16,
    color: colors.secondaryLabel,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.groupedBg,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.label,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.cta,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // The same floating pill the rest of the app uses: inset, rounded, on its own
  // hairline and shadow, with the gallery passing underneath it.
  headerBar: {
    position: 'absolute',
    start: 12,
    end: 12,
    zIndex: 20,
    height: HEADER_PILL_HEIGHT,
    paddingHorizontal: 6,
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    ...shadow.card,
  },
  headerTitle: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.label,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerButtonsRTL: {
    flexDirection: 'row-reverse',
  },
  headerRightButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  headerRightButtonsRTL: {
    flexDirection: 'row-reverse',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
    backgroundColor: colors.card,
    position: 'relative',
  },
  // A pill in the corner of the stage. Not a bar across the bottom: the
  // packshots are pale, so it needs its own contrast rather than borrowing it.
  galleryCounter: {
    position: 'absolute',
    bottom: 12,
    end: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.cta,
  },
  galleryCounterText: {
    ...T.badgeMedium,
    color: colors.white,
    letterSpacing: 0.4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.subtleBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.accent,
  },
  contentContainer: {
    backgroundColor: colors.groupedBg,
    paddingHorizontal: 16,
    paddingTop: 16,
    // Clearance for the floating bar is on the scroll view, measured from the
    // bar itself; a second allowance here would double it.
  },
  productInfo: {
    ...surfaces.card,
    padding: 18,
    marginBottom: 14,
  },
  category: {
    ...T.eyebrow,
    marginBottom: 8,
  },
  // The website sets product names in its display serif. Arabic falls back to
  // the system face via `textRTL`, which clears the family.
  productName: {
    ...T.serifTitle,
    fontSize: 28,
    lineHeight: 33,
    marginBottom: 12,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  reviewSummaryRTL: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  reviewStarsRowRTL: {
    flexDirection: 'row-reverse',
    marginRight: 0,
    marginLeft: 6,
  },
  reviewStarIcon: {
    marginRight: 1,
  },
  reviewSummaryText: {
    ...T.captionSmall,
    color: colors.label,
    fontWeight: '600',
  },
  reviewSummaryLink: {
    ...T.captionSmall,
    color: colors.accent,
    fontWeight: '600',
  },
  price: {
    ...T.priceLarge,
    color: colors.accent,
    marginBottom: 8,
  },
  priceBlock: {
    marginBottom: 8,
  },
  vatNote: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 2,
    marginBottom: 4,
    fontWeight: '500',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  discountRowRTL: {
    flexDirection: 'row-reverse',
  },
  discountBadge: {
    backgroundColor: tint(colors.green),
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  discountBadgeText: {
    ...T.badgeMedium,
    color: colors.greenDeep,
    letterSpacing: 0.2,
  },
  size: {
    fontSize: 16,
    color: colors.mutedText,
    fontWeight: '500',
  },
  // Bands, not cards. The website runs its product copy as full-width blocks
  // divided by a rule; boxing each one made the page read as a stack of
  // widgets. The cream page now shows through and the hairline does the
  // dividing, which is also why the three call sites that added `shadow.card`
  // had to drop it: a shadow with no panel under it is just a smudge.
  section: {
    paddingVertical: 24,
    marginBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  sectionTitle: {
    ...T.serifHeading,
    marginBottom: 16,
  },
  // iOS Settings–style icon-tile section header (used on card sections).
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  beautyBoxPriceLineWrap: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.subtleBg,
  },
  beautyBoxPriceLine: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.label,
    lineHeight: 22,
  },
  beautyBoxTitleRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beautyBoxTitleHeart: {
    fontSize: 16,
  },
  beautyBoxTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.label,
  },
  beautyBoxKitTitle: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: colors.label,
  },
  beautyBoxKitList: {
    marginTop: 12,
    gap: 14,
  },
  beautyBoxKitItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.subtleBg,
  },
  beautyBoxKitHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.label,
    marginBottom: 8,
    lineHeight: 20,
  },
  beautyBoxKitBody: {
    fontSize: 13,
    color: colors.secondaryLabel,
    lineHeight: 19,
  },
  descriptionContainer: {
    backgroundColor: 'transparent',
  },
  noteContainer: {
    backgroundColor: tint(colors.green),
    borderRadius: 12,
    padding: 14,
  },
  description: {
    ...T.body,
    color: colors.label,
  },
  noteText: {
    color: colors.greenDeep,
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  // Rating styles removed (rating section not used)
  featureList: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 20,
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.label,
    marginBottom: 8,
  },
  detailGrid: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContainer: {
    backgroundColor: 'transparent',
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listItemRTL: {
    flexDirection: 'row-reverse',
  },
  listBullet: {
    fontSize: 18,
    color: colors.accent,
    lineHeight: 22,
  },
  listBulletRTL: {
    textAlign: 'right',
  },
  listText: {
    ...T.bodySmall,
    flex: 1,
    color: colors.label,
  },
  specList: {
    backgroundColor: 'transparent',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  specItemRTL: {
    flexDirection: 'row-reverse',
  },
  specItemLast: {
    borderBottomWidth: 0,
  },
  specLabel: {
    ...T.label,
    width: 124,
    color: colors.secondaryLabel,
    lineHeight: 20,
  },
  specLabelRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  specValueContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  specValueContainerRTL: {
    alignItems: 'flex-end',
  },
  specValueText: {
    ...T.bodySmall,
    color: colors.label,
  },
  specValueTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  specValueRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
    // Cormorant has no Arabic glyphs, so naming it would leave Android
    // rendering tofu. Clearing the family here covers every serif heading on
    // the screen at once, and is a no-op for the sans text that also uses this.
    fontFamily: undefined,
  },
  // Perfect Combination
  pcOuter: {
    ...surfaces.card,
    padding: 18,
    marginBottom: 14,
  },
  pcHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  pcHeaderTitle: {
    ...T.body,
    fontWeight: '700',
    color: colors.label,
  },
  pcLoading: {
    fontSize: 14,
    color: colors.secondaryLabel,
    fontWeight: '600',
  },
  pcIntroText: {
    ...T.bodySmall,
    color: colors.label,
    lineHeight: 20,
    marginBottom: 14,
  },
  pcIntroBold: {
    fontWeight: '800',
    color: colors.label,
  },
  pcCard: {
    backgroundColor: 'transparent',
  },
  pcProductCard: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pcImageWrap: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  pcImage: {
    width: '100%',
    height: '100%',
  },
  pcImageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
  },
  pcProductName: {
    ...T.label,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 4,
  },
  pcProductSize: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    fontWeight: '600',
    marginBottom: 6,
  },
  pcPriceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  pcPriceMain: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
  pcPriceOld: {
    fontSize: 12,
    color: colors.secondaryLabel,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  pcLoginText: {
    fontSize: 12,
    color: colors.secondaryLabel,
    fontWeight: '600',
    marginBottom: 6,
  },
  pcPriceOnRequest: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.whatsappDeep,
    marginBottom: 6,
  },
  pcViewDetails: {
    fontSize: 12,
    color: colors.secondaryLabel,
    fontWeight: '600',
    marginBottom: 10,
  },
  pcAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cta,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pcAddBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  pcBenefitsCard: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 12,
  },
  pcBenefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pcBenefitsTitle: {
    ...T.label,
    fontWeight: '800',
    color: colors.label,
    flex: 1,
  },
  pcBenefitsList: {
    gap: 10,
  },
  pcBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pcBenefitCheck: {
    color: colors.accent,
    fontWeight: '900',
    marginTop: 1,
  },
  pcBenefitText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.secondaryLabel,
  },
  pcBenefitTextBold: {
    fontWeight: '800',
    color: colors.label,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.groupedBg,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.mutedText,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.label,
  },
  // The floating counterpart of the header: inset, rounded, on its own shadow,
  // with the page passing underneath rather than stopping at a welded edge.
  // `bottom` and the content's clearance are set inline from the safe area.
  bottomBar: {
    position: 'absolute',
    start: 12,
    end: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    ...shadow.card,
  },
  addToBagButton: {
    backgroundColor: colors.cta,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.cta(colors.cta),
  },
  addToBagButtonFlex: {
    flex: 1,
    minHeight: 52,
  },
  addToBagButtonDisabled: {
    backgroundColor: colors.placeholder,
    shadowColor: colors.shadowCast,
    shadowOpacity: 0.15,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // A thin line above the buy button: the size on the left as a control, the
  // price of that size on the right.
  footerSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  footerSelectionRTL: {
    flexDirection: 'row-reverse',
  },
  // Scrolls rather than wraps: most products offer two options, but the
  // needling cartridges offer five depths and must not push the price off.
  footerOptionsScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  footerOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 5,
    paddingEnd: 5,
  },
  footerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.fillSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separatorStrong,
  },
  footerOptionCheck: {
    position: 'absolute',
    top: -5,
    end: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
    zIndex: 2,
  },
  footerOptionSelected: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
  },
  footerOptionDisabled: {
    opacity: 0.4,
  },
  footerOptionText: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.mutedText,
  },
  footerOptionTextSelected: {
    color: colors.accent,
  },
  footerOptionTextDisabled: {
    textDecorationLine: 'line-through',
  },
  footerSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separatorStrong,
  },
  footerPriceWrap: {
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  footerPriceEach: {
    ...T.captionSmall,
    color: colors.mutedText,
  },
  footerPrice: {
    ...T.label,
    fontWeight: '700',
    color: colors.label,
    flexShrink: 1,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  bottomRowRTL: {
    flexDirection: 'row-reverse',
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fillSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 4,
    minHeight: 52,
  },
  qtyStepperRTL: {
    flexDirection: 'row-reverse',
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtnDisabled: {
    backgroundColor: colors.subtleBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.label,
    marginHorizontal: 4,
  },
  requestQuoteBottomButton: {
    backgroundColor: colors.whatsappDeep,
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.cta(colors.whatsappDeep),
  },
  priceOnRequestLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  loginToSeePriceText: {
    ...T.label,
    fontWeight: '700',
    color: colors.secondaryLabel,
    letterSpacing: 0.2,
  },
  addToBagButtonRTL: {
    flexDirection: 'row-reverse',
  },
  inCartButton: {
    backgroundColor: colors.greenDeep,
    shadowColor: colors.greenDeep,
    elevation: 6,
  },
  buttonIcon: {
    marginEnd: 8,
  },
  buttonIconRTL: {
    marginEnd: 0,
    marginStart: 8,
  },
  addToBagText: {
    ...T.buttonLarge,
  },
  sizeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  sizeInfoContainerRTL: {
    flexDirection: 'row-reverse',
  },
  sizeInfo: {
    ...T.labelSmall,
    fontWeight: '600',
    color: colors.mutedText,
    backgroundColor: colors.fillSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stockInfo: {
    ...T.captionSmall,
    color: colors.greenDeep,
    fontWeight: '700',
    backgroundColor: tint(colors.green),
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  originalPrice: {
    ...T.priceStrikethrough,
    color: colors.secondaryLabel,
  },
  discountedPrice: {
    ...T.priceDiscount,
    fontSize: 20,
  },
  // Beauty Boxes detail page pricing styles
  // Image Gallery - Pagination Dots
  // Video styles moved to videoStyles (ProductVideo component)
  // Documentation link rows (inside the documentation card)
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.subtleBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 10,
  },
  docLinkText: {
    flex: 1,
    fontSize: 14,
    color: colors.blue,
    fontWeight: '500',
  },
});

// Screen-level error boundary: a render crash here shows a recoverable
// error screen instead of taking down the whole navigation stack.
export default withErrorBoundary(ProductDetailScreen, { screenName: 'ProductDetail' });
