import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
  FlatList,
  Linking,
  findNodeHandle,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { setAudioModeAsync } from 'expo-audio';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { fetchProductById } from '../../services/api';
import { getJson } from '../../services/httpClient';
import ProductVariantSelector from '../../components/ProductVariantSelector';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct, isUserDiscountExcludedProduct } from '../../utils/productRules';
import { isBeautyBoxProduct } from '../../utils/productRules';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductDescription, getLocalizedProductSize } from '../../utils/productLocalization';
import BeautyBoxDetails from '../../components/product/BeautyBoxDetails';
import PerfectCombinationCard from '../../components/product/PerfectCombinationCard';
import ProductReviews from '../../components/product/ProductReviews';
import TrustBadges from '../../components/product/TrustBadges';
import CollapsibleSection from '../../components/product/CollapsibleSection';
import ImageLightbox from '../../components/product/ImageLightbox';
import Toast from '../../components/Toast';
import { ProductDetailSkeleton } from '../../components/SkeletonLoader';
import * as haptics from '../../utils/haptics';
import { createLogger } from '../../utils/logger';
import AUTH_CONFIG from '../../config/auth';
import { getProductImages, getProductVideoUrl, getProductDocs } from '../../data/productConfig';
import {
  formatPrice,
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
  deriveDiscountFromBadges,
} from '../../utils/productDetailUtils';
import { getCategoryTranslationKey, normalizeCategoryCanonical } from '../../utils/productLocalization';
import { getPricingDisplay, formatAed } from '../../utils/pricingDisplay';
import T from '../../utils/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Product detail hero image height
const HEADER_HEIGHT = 320;

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
function ProductVideo({ videoUrl, thumbnailUrl, isRTL }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const player = useVideoPlayer({ uri: videoUrl }, (p) => {
    p.loop = false;
    p.muted = false;
  });

  useEffect(() => {
    if (!player) return undefined;
    const sub = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'error') {
        log.error('Video playback error', error?.message || 'unknown');
        setVideoError(true);
      }
    });
    return () => sub.remove();
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

  return (
    <View style={videoStyles.section}>
      <View style={videoStyles.container}>
        {!isPlaying ? (
          <TouchableOpacity
            style={videoStyles.thumbnailWrapper}
            activeOpacity={0.8}
            onPress={handlePlay}
          >
            {thumbnailUrl ? (
              <Image
                source={thumbnailUrl}
                style={videoStyles.thumbnail}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={videoStyles.thumbnailPlaceholder} />
            )}
            <View style={videoStyles.playOverlay}>
              <View style={videoStyles.playButton}>
                <Ionicons name="play" size={32} color="#ffffff" style={{ marginLeft: 3 }} />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <VideoView
            player={player}
            style={videoStyles.player}
            contentFit="contain"
            nativeControls
          />
        )}
      </View>
    </View>
  );
}

const VIDEO_HEIGHT = Math.round((SCREEN_WIDTH - 40) * 9 / 16);

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
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    height: VIDEO_HEIGHT,
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
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
  const [condensedHeader, setCondensedHeader] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const PDP_COPY = getPdpCopy(locale);

  // Conservative OOS detection: only treat as out-of-stock when an explicit
  // signal exists. Missing/undefined stock info should not block checkout.
  const isOutOfStock = !!product && (
    product.status === 'out_of_stock'
    || product.outOfStock === true
    || product.available === false
    || product.stock === 0
  );

  // Hoisted so the inline gallery and the full-screen Lightbox share the same
  // image array (avoids re-computing or getting out of sync).
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const productId = String(product.productNumber || product.id || id);
    return getProductImages(productId, product) || [];
  }, [product, id]);
  const { addItem, isInCart, getItemQuantity } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;
  const galleryRef = useRef(null);
  const scrollRef = useRef(null);
  const reviewsWrapperRef = useRef(null);

  const discountLabel = useCallback(
    (percent) => t('product.discountPercent', { percent: Math.round(Number(percent) || 0) }),
    [t]
  );

  const localizeDiscountLabel = useCallback(
    (label) => {
      const match = String(label || '').trim().match(/^(\d+(?:\.\d+)?)%\s*OFF$/i);
      return match ? discountLabel(Number(match[1])) : label;
    },
    [discountLabel]
  );
  const condensedHeaderRef = useRef(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

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

  const scrollToReviews = useCallback(() => {
    haptics.lightTap();
    const scrollable = scrollRef.current;
    const target = reviewsWrapperRef.current;
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

  const loadProduct = async () => {
    try {
      log.debug('Loading product', { id: String(id) });
      
      // Use enhanced fetchProductById with user context
      const enhancedProduct = await fetchProductById(id, user, { locale });
      
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
          // Use first available color variant
          setSelectedColor(enhancedProduct.colorVariants[0].value);
        }

        if (user && enhancedProduct.originalPrice && enhancedProduct.originalPrice !== (enhancedProduct.displayPrice || enhancedProduct.price)) {
          log.debug('User discount applied server-side');
        }
          } else {
            Alert.alert(t('product.error'), t('product.productNotFound'));
            router.back();
      }
    } catch (error) {
      log.error('Error loading product', error?.message || error);
      Alert.alert(t('product.error'), t('product.failedToLoad'));
      router.back();
    } finally {
      setLoading(false);
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
    addItem(productForCart, qty, selectedColor, selectedSize);
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
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('product.productDetails')}</Text>
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
              <Text style={[styles.specValue, isRTL && styles.specValueRTL]}>{asText(v)}</Text>
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
              <Text style={{ fontWeight: '700', color: '#1D1D1F' }}>{it.name}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed header bar (not overlapping image) */}
      <View style={styles.headerBar}>
        <View style={[styles.headerButtons, isRTL && styles.headerButtonsRTL]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              haptics.lightTap();
              router.back();
            }}
          >
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color="#1D1D1F" />
          </TouchableOpacity>

          <View style={[styles.headerRightButtons, isRTL && styles.headerRightButtonsRTL]}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#1D1D1F" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerButton} onPress={handleWishlistToggle}>
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={20}
                color={isWishlisted ? '#dc2626' : '#1D1D1F'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticky mini header – fades in once the hero image scrolls out of view.
            Shows the product name, selected-unit price and a compact bag button so
            the user can add to bag without scrolling back up. */}
        <Animated.View
          pointerEvents={condensedHeader ? 'auto' : 'none'}
          style={[
            styles.miniHeaderOverlay,
            {
              opacity: scrollY.interpolate({
                inputRange: [200, 280],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [200, 280],
                    outputRange: [-8, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.miniHeaderRow, isRTL && styles.miniHeaderRowRTL]}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                haptics.lightTap();
                router.back();
              }}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Ionicons
                name={isRTL ? 'chevron-forward' : 'chevron-back'}
                size={20}
                color="#1D1D1F"
              />
            </TouchableOpacity>
            <View style={styles.miniHeaderTextWrap}>
              <Text
                style={[styles.miniHeaderName, isRTL && styles.textRTL]}
                numberOfLines={1}
              >
                {asText(getLocalizedProductName(product, locale) || product.name)}
              </Text>
              {(() => {
                if (!user) return null;
                const unit = getSelectedPricingDisplay().displayPrice;
                if (!unit) return null;
                return (
                  <Text style={[styles.miniHeaderPrice, isRTL && styles.textRTL]} numberOfLines={1}>
                    {formatPrice(unit)} AED
                  </Text>
                );
              })()}
            </View>
            <TouchableOpacity
              onPress={handleAddToBag}
              style={styles.miniHeaderBagButton}
              accessibilityRole="button"
              accessibilityLabel={t('product.addToBag') || 'Add to bag'}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isInCart(product.id, selectedColor, selectedSize) ? 'checkmark' : 'bag'}
                size={16}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Product Content */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (e) => {
              const y = e.nativeEvent.contentOffset.y;
              const shouldCondense = y > 240;
              if (shouldCondense !== condensedHeaderRef.current) {
                condensedHeaderRef.current = shouldCondense;
                setCondensedHeader(shouldCondense);
              }
            },
          }
        )}
      >
        {/* Image Gallery */}
        {(() => {
          const hasMultipleImages = galleryImages.length > 1;
          const isBox = isBeautyBoxProduct(product);
          // Use "contain" for all products so images fit within the container without cropping
          const imageFit = 'contain';
          
          if (galleryImages.length === 0) {
            return (
              <View style={[styles.imageContainer, isBox && styles.imageContainerBeautyBox]}>
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
              <View style={[styles.imageContainer, isBox && styles.imageContainerBeautyBox]}>
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
            <>
              <View style={[styles.imageContainer, isBox && styles.imageContainerBeautyBox]}>
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
                        style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT, backgroundColor: '#ffffff' }}
                        contentFit={imageFit}
                        transition={300}
                        cachePolicy="memory-disk"
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
              {/* Pagination Dots – outside image container to avoid overlap */}
              {galleryImages.length > 1 && (
                <View style={styles.paginationDots}>
                  {galleryImages.map((_, index) => (
                    <View
                      key={`dot-${index}`}
                      style={[
                        styles.dot,
                        activeImageIndex === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          );
        })()}

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <View style={styles.productInfo}>
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
                          color={i <= rounded ? '#FBBF24' : '#D1D5DB'}
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
                    {t('product.beTheFirstToReview') || 'Be the first to review'}
                  </Text>
                  <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={14}
                    color="#dc2626"
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
              
              {/* Enhanced Pricing with Beauty Boxes Special Display */}
              {!user ? (
                <View style={styles.priceBlock}>
                  <Text style={[styles.loginToSeePriceText, isRTL && styles.textRTL]}>
                    {t('product.loginToSeePrice')}
                  </Text>
                </View>
              ) : product.isPriceOnRequest ? (
                <View style={styles.priceBlock}>
                  <Text style={styles.priceOnRequestLabel}>{t('product.priceOnRequest')}</Text>
                </View>
              ) : product.category === 'Beauty Boxes' || (product.name && product.name.toLowerCase().includes('beauty box')) ? (
                // Special pricing display for Beauty Boxes on detail page
                <View style={styles.beautyBoxDetailPricing}>
                  <Text style={styles.beautyBoxDetailFullPrice}>
                    {t('product.fullPrice', { price: formatPrice(getSelectedPricingDisplay().originalPrice || getSelectedPricingDisplay().displayPrice || 0) })}
                  </Text>
                  <View style={[styles.beautyBoxDetailDiscountRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={styles.beautyBoxDetailDiscount}>{t('product.bundleDiscount')}</Text>
                    <Text style={[styles.beautyBoxDetailFinalPrice, isRTL && { textAlign: 'left' }]}>
                      {t('product.finalPrice', { price: formatPrice(getSelectedPricingDisplay().displayPrice || 0) })}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.priceBlock}>
                  {(() => {
                    const pricing = getSelectedPricingDisplay();
                    if (pricing.hasContract) {
                      const base = Number(pricing.displayPrice || 0);
                      const original = Number(pricing.originalPrice || 0);
                      const hasDiscount = original > base + 0.01;
                      const label = localizeDiscountLabel(pricing.discountLabel) ||
                        (pricing.discountPercentage > 0 ? discountLabel(pricing.discountPercentage) : null);

                      if (!hasDiscount) {
                        return <Text style={styles.price}>{formatAed(base)}</Text>;
                      }

                      return (
                        <View>
                          <Text style={[styles.originalPrice, isRTL && styles.textRTL]}>{formatAed(original)}</Text>
                          <View style={[styles.discountRow, isRTL && styles.discountRowRTL]}>
                            <Text style={[styles.discountedPrice, isRTL && styles.textRTL]}>{formatAed(base)}</Text>
                            {label ? (
                              <View style={styles.discountBadge}>
                                <Text style={[styles.discountBadgeText, isRTL && styles.textRTL]}>{label}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      );
                    }

                    // Canonical-price / no-user-discount products: show canonical/base price only.
                    if (isUserDiscountExcludedProduct(product) || hasFixedPriceOverride(product)) {
                      return <Text style={styles.price}>{`${formatPrice(getCanonicalUnitPrice(product))} AED`}</Text>;
                    }

                    const base = Number(getSelectedUnitPrice() || 0);
                    const userPct = user?.discountType ? Number(user?.discountPercentage) : 0;
                    const derived = deriveDiscountFromBadges(product);
                    const serverOrig = Number(product?.originalPrice);
                    const serverBase = Number(product?.displayPrice ?? product?.price);
                    const serverHasDiscount =
                      Number.isFinite(serverOrig) &&
                      Number.isFinite(serverBase) &&
                      serverOrig > 0 &&
                      serverOrig > serverBase;

                    const pctFromServer =
                      serverHasDiscount && serverOrig
                        ? Math.round((1 - serverBase / serverOrig) * 100)
                        : null;

                    const pct =
                      (Number.isFinite(pctFromServer) && pctFromServer > 0 && pctFromServer < 100 && pctFromServer) ||
                      (Number.isFinite(derived?.percent) && derived.percent) ||
                      (Number.isFinite(userPct) && userPct > 0 && userPct < 100 && userPct) ||
                      null;

                    // If backend provided originalPrice/discount, treat base as already discounted.
                    // Otherwise, if user has a discount %, show computed before/after as a fallback.
                    const showDiscount =
                      (serverHasDiscount && Number.isFinite(pct) && pct > 0) ||
                      (!serverHasDiscount && Number.isFinite(userPct) && userPct > 0 && userPct < 100);

                    if (!showDiscount) {
                      return <Text style={styles.price}>{`${formatPrice(base)} AED`}</Text>;
                    }

                    const effectivePct = pct || userPct;
                    const discounted = serverHasDiscount ? base : base * (1 - effectivePct / 100);
                    const original = serverHasDiscount ? base / (1 - effectivePct / 100) : base;

                    return (
                      <View>
                        <Text style={[styles.originalPrice, isRTL && styles.textRTL]}>{formatPrice(original)} AED</Text>
                        <View style={[styles.discountRow, isRTL && styles.discountRowRTL]}>
                          <Text style={[styles.discountedPrice, isRTL && styles.textRTL]}>{formatPrice(discounted)} AED</Text>
                          <View style={styles.discountBadge}>
                            <Text style={[styles.discountBadgeText, isRTL && styles.textRTL]}>{discountLabel(effectivePct)}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              )}

            {/* VAT-inclusive disclosure — matches web PDP. Hidden for
                price-on-request and beauty-box bundles which render
                their own pricing treatment above. */}
            {user && !product.isPriceOnRequest && !(product.category === 'Beauty Boxes' || (product.name && product.name.toLowerCase().includes('beauty box'))) && (
              <Text style={[styles.vatNote, isRTL && styles.textRTL]}>
                {PDP_COPY.vatIncluded}
              </Text>
            )}
          </View>

            {/* Enhanced Product Variant Selector */}
            {((product.variants && product.variants.length > 0) || 
              (product.colorVariants && product.colorVariants.length > 0) ||
              product.hasVariants) && (
              <ProductVariantSelector
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={handleSizeChange}
                onColorChange={handleColorChange}
              />
            )}

          {/* Product Video */}
          {(() => {
            const productId = String(product.productNumber || product.id || id);
            const videoUrl = getProductVideoUrl(productId, product);
            if (!videoUrl) return null;
            const thumbnailUrl = product.image
              ? `https://genosys.ae${product.image}`
              : null;
            return (
              <ProductVideo
                videoUrl={videoUrl}
                thumbnailUrl={thumbnailUrl}
                isRTL={isRTL}
              />
            );
          })()}

          {/* Product Documentation */}
          {(() => {
            const productId = String(product.productNumber || product.id || id);
            const docs = getProductDocs(productId, product);
            if (!docs.length) return null;
            return (
              <View style={styles.docsSection}>
                <Text style={[styles.docsSectionTitle, isRTL && styles.textRTL]}>
                  {t('product.documentation') || 'Documentation'}
                </Text>
                {docs.map((doc, index) => (
                  <TouchableOpacity
                    key={`doc-${index}`}
                    style={[styles.docLink, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => Linking.openURL(doc.url)}
                  >
                    <Ionicons name="document-text-outline" size={20} color="#007AFF" />
                    <Text style={[styles.docLinkText, isRTL && { textAlign: 'right' }]} numberOfLines={2}>
                      {doc.title}
                    </Text>
                    <Ionicons name="open-outline" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}

          {/* Product content sections from API */}
          {isBeautyBoxProduct(product) ? (
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
                    <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                      {t('product.about')}
                    </Text>
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

              <PerfectCombinationCard product={product} user={user} styles={styles} />

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
                const benefitsOpts = { collapsible: true, defaultOpen: true, icon: 'sparkles-outline', iconColor: '#dc2626' };

                if (filteredBenefits.length === 1 && filteredBenefits[0].length > 200 && !filteredBenefits[0].includes(' — ')) {
                  return renderInfoSection(t('product.benefits'), filteredBenefits[0], benefitsOpts);
                }
                return renderListSection(t('product.benefits'), filteredBenefits, benefitsOpts);
              })()}

              {(() => {
                const steps = toHowToSteps(product?.howToUse);
                const howToText = pickField(product, ['howToUse', 'how_to_use', 'application', 'usage']);
                const fallbackDirections = pickField(product, ['directions']);
                const directionsOpts = { collapsible: true, defaultOpen: false, icon: 'list-outline', iconColor: '#2563EB' };

                // If we have explicit how-to content, we keep it under "Directions"
                // and treat `product.directions` as an extra "Note" (matches website behavior for many products).
                if (steps.length) return renderStepsSection(t('product.directions'), steps, directionsOpts);
                if (howToText) return renderInfoSection(t('product.directions'), howToText, directionsOpts);

                // If no how-to content exists, fall back to `directions` as actual directions.
                return renderInfoSection(t('product.directions'), fallbackDirections, directionsOpts);
              })()}

              {renderIngredientsSection(
                t('product.keyIngredients'),
                toIngredients(product?.ingredients || product?.keyIngredients),
                { collapsible: true, defaultOpen: false, icon: 'leaf-outline', iconColor: '#16A34A' }
              )}

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
                      iconColor: '#86868B',
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
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
        {product.isPriceOnRequest ? (
          <TouchableOpacity
            style={[styles.requestQuoteBottomButton, isRTL && styles.addToBagButtonRTL]}
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
              size={20}
              color="#ffffff"
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
                    style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                    onPress={decrementQty}
                    disabled={quantity <= 1}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('shop.decreaseQuantity')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="remove" size={18} color={quantity <= 1 ? '#C7C7CC' : '#1D1D1F'} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={incrementQty}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={t('shop.increaseQuantity')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="add" size={18} color="#1D1D1F" />
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
                onPress={handleAddToBag}
                disabled={disabled}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
              >
                <Ionicons
                  name={disabled ? 'alert-circle' : inBagForSelection ? 'checkmark' : 'bag'}
                  size={20}
                  color="#ffffff"
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
          bottomOffset={110}
          isRTL={isRTL}
          icon={isOutOfStock ? 'alert-circle' : 'checkmark-circle'}
          iconColor={isOutOfStock ? '#F59E0B' : '#22C55E'}
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
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    ...T.body,
    marginTop: 16,
    color: '#86868B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#1D1D1F',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  miniHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  miniHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  miniHeaderRowRTL: {
    flexDirection: 'row-reverse',
  },
  miniHeaderTextWrap: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  miniHeaderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.1,
  },
  miniHeaderPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#86868B',
    marginTop: 1,
  },
  miniHeaderBagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
    backgroundColor: '#ffffff',
  },
  imageContainerBeautyBox: {
    height: HEADER_HEIGHT + 20,
    backgroundColor: '#ffffff',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#dc2626',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Space for bottom button
  },
  productInfo: {
    marginBottom: 32,
  },
  category: {
    ...T.label,
    letterSpacing: 0.5,
    color: '#dc2626',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  productName: {
    ...T.pageTitleLarge,
    lineHeight: 34,
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
    color: '#374151',
    fontWeight: '600',
  },
  reviewSummaryLink: {
    ...T.captionSmall,
    color: '#dc2626',
    fontWeight: '600',
  },
  price: {
    ...T.priceLarge,
    marginBottom: 8,
  },
  priceBlock: {
    marginBottom: 8,
  },
  vatNote: {
    ...T.captionSmall,
    color: '#86868B',
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
    backgroundColor: '#27AE6020',
    borderColor: '#27AE60',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  discountBadgeText: {
    ...T.badgeMedium,
    color: '#27AE60',
    letterSpacing: 0.2,
  },
  size: {
    fontSize: 16,
    color: '#6E6E73',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...T.sectionTitle,
    fontWeight: '600',
    marginBottom: 16,
  },
  beautyBoxPriceLineWrap: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  beautyBoxPriceLine: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
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
    color: '#1D1D1F',
  },
  beautyBoxKitTitle: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  beautyBoxKitList: {
    marginTop: 12,
    gap: 14,
  },
  beautyBoxKitItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  beautyBoxKitHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 8,
    lineHeight: 20,
  },
  beautyBoxKitBody: {
    fontSize: 13,
    color: '#1D1D1F',
    lineHeight: 19,
  },
  descriptionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
  },
  noteContainer: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  description: {
    ...T.body,
    color: '#1D1D1F',
  },
  noteText: {
    color: '#14532D',
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  // Rating styles removed (rating section not used)
  featureList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
  },
  feature: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
    marginBottom: 8,
  },
  detailGrid: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
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
    color: '#dc2626',
    lineHeight: 22,
  },
  listBulletRTL: {
    textAlign: 'right',
  },
  listText: {
    ...T.bodySmall,
    flex: 1,
    color: '#1D1D1F',
  },
  specList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF0',
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
    color: '#6E6E73',
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
    color: '#1D1D1F',
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
  },
  // Perfect Combination
  pcOuter: {
    marginBottom: 32,
    borderTopWidth: 2,
    borderTopColor: '#E5E5EA',
    paddingTop: 18,
  },
  pcHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pcHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  pcLoading: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  pcIntroText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    marginBottom: 12,
  },
  pcIntroBold: {
    fontWeight: '800',
    color: '#111827',
  },
  pcCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FECACA', // red-200
    padding: 12,
  },
  pcProductCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCA5A5', // red-300
    padding: 12,
    marginBottom: 12,
  },
  pcImageWrap: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
  },
  pcImage: {
    width: '100%',
    height: '100%',
  },
  pcImageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  pcProductName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  pcProductSize: {
    fontSize: 12,
    color: '#6B7280',
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
    color: '#dc2626',
  },
  pcPriceOld: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  pcLoginText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  pcPriceOnRequest: {
    fontSize: 13,
    fontWeight: '700',
    color: '#25D366',
    marginBottom: 6,
  },
  pcViewDetails: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 10,
  },
  pcAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
  },
  pcAddBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  pcBenefitsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    padding: 12,
  },
  pcBenefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pcBenefitsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
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
    color: '#dc2626',
    fontWeight: '900',
    marginTop: 1,
  },
  pcBenefitText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#374151',
  },
  pcBenefitTextBold: {
    fontWeight: '800',
    color: '#111827',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6E6E73',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area for home indicator
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addToBagButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addToBagButtonFlex: {
    flex: 1,
    minHeight: 52,
  },
  addToBagButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
    shadowOpacity: 0.15,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomRowRTL: {
    flexDirection: 'row-reverse',
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyBtnDisabled: {
    backgroundColor: '#F9FAFB',
    shadowOpacity: 0,
    elevation: 0,
  },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
    marginHorizontal: 4,
  },
  requestQuoteBottomButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  priceOnRequestLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    letterSpacing: 0.3,
  },
  loginToSeePriceText: {
    ...T.label,
    fontWeight: '700',
    color: '#86868B',
    letterSpacing: 0.2,
  },
  addToBagButtonRTL: {
    flexDirection: 'row-reverse',
  },
  inCartButton: {
    backgroundColor: '#27AE60',
    shadowColor: '#27AE60',
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
    ...T.label,
    fontWeight: '400',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockInfo: {
    ...T.captionSmall,
    color: '#34C759',
    fontWeight: '600',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  originalPrice: {
    ...T.priceStrikethrough,
  },
  discountedPrice: {
    ...T.priceDiscount,
    fontSize: 20,
  },
  // Beauty Boxes detail page pricing styles
  beautyBoxDetailPricing: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#dc2626',
    marginVertical: 8,
  },
  beautyBoxDetailFullPrice: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 8,
  },
  beautyBoxDetailDiscountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 10,
  },
  beautyBoxDetailDiscount: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexShrink: 1,
  },
  beautyBoxDetailFinalPrice: {
    fontSize: 18,
    color: '#27AE60',
    fontWeight: 'bold',
    marginStart: 'auto',
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  // Image Gallery - Pagination Dots
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#1D1D1F',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Video styles moved to videoStyles (ProductVideo component)
  // Documentation Section
  docsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  docsSectionTitle: {
    ...T.body,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 10,
  },
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  docLinkText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});