import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { fetchProductById } from '../../services/api';
import ProductVariantSelector from '../../components/ProductVariantSelector';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct } from '../../utils/productRules';
import { isBeautyBoxProduct } from '../../utils/productRules';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductDescription, getLocalizedProductSize } from '../../utils/productLocalization';
import BeautyBoxDetails from '../../components/product/BeautyBoxDetails';
import PerfectCombinationCard from '../../components/product/PerfectCombinationCard';
import ProductReviews from '../../components/product/ProductReviews';
// TrustBadges removed from product pages
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
 */
function ProductVideo({ videoUrl, thumbnailUrl, isRTL }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handlePlay = async () => {
    // Enable audio playback even when the iOS silent switch is on
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
    } catch (e) {
      log.warn('Audio mode set failed', e?.message || e);
    }
    setIsPlaying(true);
    // Small delay so the Video component mounts before we call play
    setTimeout(async () => {
      try {
        if (videoRef.current) {
          await videoRef.current.playAsync();
        }
      } catch (e) {
        log.error('Video play error', e?.message || e);
      }
    }, 300);
  };

  if (videoError) {
    return null; // Hide section if video fails to load
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
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={videoStyles.player}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isLooping={false}
            onError={(error) => {
              log.error('Video playback error', error);
              setVideoError(true);
            }}
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
  const { addItem, isInCart, getItemQuantity } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;
  const galleryRef = useRef(null);

  useEffect(() => {
    loadProduct();
  }, [id]);


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
    if (product && !product.isPriceOnRequest) {
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

      addItem(productForCart, 1, selectedColor, selectedSize);
      haptics.success();
      
      const safeName = getLocalizedProductName(product, locale) || product.name;
      let message = t('product.addedToBagMessage', { name: safeName });
      if (selectedSize) {
        message += `\n${t('common.size')}: ${selectedSize}`;
      }
      if (selectedColor) {
        message += `\n${t('common.color')}: ${selectedColor}`;
      }
      
      Alert.alert(
        t('product.addedToBagTitle'),
        message,
        [
          { text: t('product.continueShopping'), style: 'default' },
          { text: t('product.viewBag'), style: 'default', onPress: async () => { await AsyncStorage.setItem('@genosys_nav_bag_source', JSON.stringify({ pathname: '/product/[id]', params: { id } })).catch(() => {}); router.push('/(tabs)/bag'); } }
        ]
      );
    }
  };

  const handleSizeChange = (size) => {
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

  const handleColorChange = (color) => {
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
    const url = `${AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae'}/products/${product.id}`;
    const message = `${asText(getLocalizedProductName(product, locale) || product.name)}\n${formatPrice(product.displayPrice || product.price)} AED\n${url}`;
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
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
        <View style={[styles.descriptionContainer, isNote && styles.noteContainer]}>
          <Text style={[styles.description, isNote && styles.noteText, isRTL && styles.textRTL]}>{text}</Text>
        </View>
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

  const renderListSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
        <View style={styles.listContainer}>
          {items.map((item, idx) => (
            <View key={idx} style={[styles.listItem, isRTL && styles.listItemRTL]}>
              <Text style={[styles.listBullet, isRTL && styles.listBulletRTL]}>•</Text>
              <Text style={[styles.listText, isRTL && styles.textRTL]}>{asText(item)}</Text>
            </View>
          ))}
        </View>
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

  const renderStepsSection = (title, steps) => {
    if (!steps || steps.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
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
      </View>
    );
  };

  const renderIngredientsSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
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
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
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
      </View>

      {/* Product Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Image Gallery */}
        {(() => {
          const productId = String(product.productNumber || product.id || id);
          const galleryImages = getProductImages(productId, product);
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
                <Image
                  source={galleryImages[0]}
                  style={styles.heroImage}
                  contentFit={imageFit}
                  transition={300}
                  cachePolicy="memory-disk"
                />
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
                  renderItem={({ item }) => (
                    <Image
                      source={item}
                      style={{ width: SCREEN_WIDTH, height: HEADER_HEIGHT, backgroundColor: '#ffffff' }}
                      contentFit={imageFit}
                      transition={300}
                      cachePolicy="memory-disk"
                    />
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
              {product.isPriceOnRequest ? (
                <View style={styles.priceBlock}>
                  <Text style={styles.priceOnRequestLabel}>{t('product.priceOnRequest') || 'Price on Request'}</Text>
                </View>
              ) : product.category === 'Beauty Boxes' || (product.name && product.name.toLowerCase().includes('beauty box')) ? (
                // Special pricing display for Beauty Boxes on detail page
                <View style={styles.beautyBoxDetailPricing}>
                  <Text style={styles.beautyBoxDetailFullPrice}>
                    {t('product.fullPrice', { price: formatPrice(product.originalPrice || product.displayPrice || product.price || 0) })}
                  </Text>
                  <View style={[styles.beautyBoxDetailDiscountRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={styles.beautyBoxDetailDiscount}>{t('product.bundleDiscount')}</Text>
                    <Text style={[styles.beautyBoxDetailFinalPrice, isRTL && { textAlign: 'left' }]}>
                      {t('product.finalPrice', { price: formatPrice(product.displayPrice || product.price || 0) })}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.priceBlock}>
                  {(() => {
                    // Canonical-price / no-user-discount products: show canonical/base price only.
                    if (hasFixedPriceOverride(product) || isHydroCoolMask(product) || isDeviceProduct(product)) {
                      return <Text style={styles.price}>{`${formatPrice(getCanonicalUnitPrice(product))} AED`}</Text>;
                    }

                    const base = Number(getSelectedUnitPrice() || 0);
                    const userPct = Number(user?.discountPercentage);
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
                            <Text style={[styles.discountBadgeText, isRTL && styles.textRTL]}>{`${Math.round(effectivePct)}% OFF`}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })()}
                </View>
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
              {renderInfoSection(t('product.about'), getDisplayDescription())}

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

                if (filteredBenefits.length === 1 && filteredBenefits[0].length > 200 && !filteredBenefits[0].includes(' — ')) {
                  return renderInfoSection(t('product.benefits'), filteredBenefits[0]);
                }
                return renderListSection(t('product.benefits'), filteredBenefits);
              })()}

              {(() => {
                const steps = toHowToSteps(product?.howToUse);
                const howToText = pickField(product, ['howToUse', 'how_to_use', 'application', 'usage']);
                const fallbackDirections = pickField(product, ['directions']);

                // If we have explicit how-to content, we keep it under "Directions"
                // and treat `product.directions` as an extra "Note" (matches website behavior for many products).
                if (steps.length) return renderStepsSection(t('product.directions'), steps);
                if (howToText) return renderInfoSection(t('product.directions'), howToText);

                // If no how-to content exists, fall back to `directions` as actual directions.
                return renderInfoSection(t('product.directions'), fallbackDirections);
              })()}

              {renderIngredientsSection(t('product.keyIngredients'), toIngredients(product?.ingredients || product?.keyIngredients))}

              {(() => {
                // Prefer backend-driven `product.note` (added to mobile API),
                // then fall back to legacy fields if needed. Avoid using `directions` as Note.
                const noteBody =
                  pickField(product, ['note']) ||
                  pickField(product, ['notes', 'warning', 'caution']);
                return noteBody ? renderInfoSection(t('product.note'), noteBody, { variant: 'note' }) : null;
              })()}
            </>
          )}

          {/* Customer Reviews */}
          <ProductReviews productId={product.id} />
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
              {t('product.requestQuote') || 'Request Quote'}
            </Text>
          </TouchableOpacity>
        ) : (() => {
          const inBagForSelection = isInCart(product.id, selectedColor, selectedSize);
          const qtyForSelection = getItemQuantity(product.id, selectedColor, selectedSize);
          return (
            <TouchableOpacity
              style={[styles.addToBagButton, isRTL && styles.addToBagButtonRTL, inBagForSelection && styles.inCartButton]}
              onPress={handleAddToBag}
            >
          <Ionicons 
                name={inBagForSelection ? "checkmark" : "bag"} 
            size={20} 
            color="#ffffff" 
            style={[styles.buttonIcon, isRTL && styles.buttonIconRTL]}
          />
            <Text style={[styles.addToBagText, isRTL && styles.textRTL]}>
                {inBagForSelection ? t('product.inBag', { count: qtyForSelection }) : t('product.addToBag')}
            </Text>
          </TouchableOpacity>
          );
        })()}
        </View>
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
  price: {
    ...T.priceLarge,
    marginBottom: 8,
  },
  priceBlock: {
    marginBottom: 8,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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