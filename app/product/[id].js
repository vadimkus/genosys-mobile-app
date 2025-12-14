import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProductById } from '../../services/api';
import ProductVariantSelector from '../../components/ProductVariantSelector';
import { getCanonicalUnitPrice, hasFixedPriceOverride, isHydroCoolMask, isDeviceProduct } from '../../utils/productRules';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getLocalizedProductDescription } from '../../utils/productLocalization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

// Safely format price values that may come as strings from the API
const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return num.toFixed(2);
  }
  return value ?? '—';
};

// Coerce any incoming value to a displayable string
const asText = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join('\n');
  if (typeof value === 'object') return Object.values(value || {}).join('\n');
  return String(value);
};

const normalizeForCompare = (value) => {
  return asText(value)
    .replace(/\s+/g, ' ')
    .replace(/[\u2022•·]/g, ' ')
    .trim()
    .toLowerCase();
};

const dedupeList = (arr = []) => {
  const seen = new Set();
  const out = [];
  arr.forEach((raw) => {
    const val = asText(raw).trim();
    if (!val) return;
    const key = val.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(val);
    }
  });
  return out;
};

// Helper to pick the first non-empty field from possible API keys
const pickField = (product, keys) => {
  if (!product) return '';
  for (const key of keys) {
    const value = product[key];
    const text = asText(value);
    if (text.trim().length > 0) return text;
  }
  return '';
};

// Try to parse JSON strings (arrays/objects); fall back to raw value
const parseMaybeJSON = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value.trim());
    } catch {
      return value;
    }
  }
  return value;
};

const asStringList = (value) => {
  const parsed = parseMaybeJSON(value);
  if (Array.isArray(parsed)) return dedupeList(parsed.map(asText));
  const txt = asText(parsed).trim();
  if (!txt) return [];
  if (txt.includes('\n')) {
    return dedupeList(
      txt
        .split('\n')
        .map((s) => s.replace(/^\s*[-*•]\s*/, '').trim())
        .filter(Boolean)
    );
  }
  return [txt];
};

const asKeyValueObject = (value) => {
  const parsed = parseMaybeJSON(value);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  return null;
};

const toHowToSteps = (value) => {
  const parsed = parseMaybeJSON(value);
  if (!Array.isArray(parsed)) return [];

  const steps = parsed
    .map((x) => {
      if (!x) return null;
      if (typeof x === 'string') return { title: '', body: x };
      if (typeof x === 'object') {
        const title = asText(x.step || x.title || '').trim();
        const body = asText(x.instruction || x.description || x.body || '').trim();
        const fallback = asText(x).trim();
        return { title, body: body || (!title ? fallback : '') };
      }
      return { title: '', body: asText(x).trim() };
    })
    .filter(Boolean)
    .filter((s) => (s.title || s.body).trim().length > 0);

  const seen = new Set();
  const out = [];
  for (const s of steps) {
    const key = normalizeForCompare(s.body || s.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
};

const toIngredients = (value) => {
  const parsed = parseMaybeJSON(value);
  if (!parsed) return [];

  if (Array.isArray(parsed)) {
    const seen = new Set();
    const out = [];
    for (const item of parsed) {
      if (!item) continue;
      if (typeof item === 'string') {
        const name = item.trim();
        const key = normalizeForCompare(name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push({ name, description: '' });
        continue;
      }
      if (typeof item === 'object') {
        const name = asText(item.name || item.title || '').trim();
        const description = asText(item.description || item.details || '').trim();
        const fallback = asText(item).trim();
        const finalName = name || fallback;
        if (!finalName) continue;
        const key = normalizeForCompare(finalName);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push({ name: finalName, description });
      }
    }
    return out;
  }

  return asStringList(parsed).map((name) => ({ name, description: '' }));
};

const getArrayField = (product, keys) => {
  if (!product) return [];
  for (const key of keys) {
    const raw = product[key];
    const parsed = parseMaybeJSON(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.map(asText).filter((t) => t.trim().length > 0);
      if (cleaned.length) return dedupeList(cleaned);
    } else if (typeof parsed === 'string') {
      const t = parsed.trim();
      if (t.startsWith('[') && t.endsWith(']')) {
        try {
          const arr = JSON.parse(t);
          if (Array.isArray(arr)) {
            const cleaned = arr.map(asText).filter((v) => v.trim().length > 0);
            if (cleaned.length) return dedupeList(cleaned);
          }
        } catch {}
      }
      if (t.length) return [t];
    }
  }
  return [];
};

const getObjectField = (product, keys) => {
  if (!product) return null;
  for (const key of keys) {
    const parsed = parseMaybeJSON(product[key]);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  }
  return null;
};

const deriveDiscountFromBadges = (product) => {
  const badges = product?.badges || [];
  for (const badge of badges) {
    const text = (badge.text || '').toLowerCase();
    const match = text.match(/(\d+)\s*%/);
    if (match) {
      const pct = Number(match[1]);
      if (pct > 0 && pct < 100) {
        const base = Number(product?.displayPrice ?? product?.price ?? 0);
        if (Number.isFinite(base) && base > 0) {
          const original = base / (1 - pct / 100);
          return { percent: pct, original };
        }
        return { percent: pct, original: null };
      }
    }
  }
  return null;
};

const isBeautyBoxProduct = (product) => {
  const cat = String(product?.category || '').toLowerCase();
  const name = String(product?.name || '').toLowerCase();
  return cat === 'beauty boxes' || name.includes('beauty box');
};

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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { t, locale } = useLocalization();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addItem, isInCart, getItemQuantity } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      console.log('🔍 Loading enhanced product with ID:', id);
      
      // Use enhanced fetchProductById with user context
      const enhancedProduct = await fetchProductById(id, user, { locale });
      
      if (enhancedProduct) {
        setProduct(enhancedProduct);
        console.log('✅ Product loaded from database:', enhancedProduct.name);
        console.log('📋 Product data from server:', {
          hasVariants: enhancedProduct.variants?.length || 0,
          hasBadges: enhancedProduct.badges?.length || 0,
          calculatedPrice: enhancedProduct.displayPrice || enhancedProduct.price
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
          console.log('💰 User has discount applied server-side');
        }
          } else {
            Alert.alert(t('product.error'), t('product.productNotFound'));
            router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert(t('product.error'), t('product.failedToLoad'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBag = () => {
    if (product) {
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
      
      let message = `${getLocalizedProductName(product, locale) || product.name} has been added to your bag`;
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
          { text: t('product.viewBag'), style: 'default', onPress: () => router.push('/(tabs)/bag') }
        ]
      );
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    console.log(`📐 Size changed to ${size}`);
    
    // Find the selected variant for pricing display (enhanced API provides this)
    if (product.variants) {
      const selectedVariant = product.variants.find(v => v.size === size);
      if (selectedVariant) {
        console.log(`💰 Variant price: ${selectedVariant.price} AED`);
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
    console.log(`🎨 Color changed to ${color}`);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = async () => {
    if (!product) return;
    const url = `https://genosys.ae/products/${product.id}`;
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
      console.error('Failed to share product', error);
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

  const parseBeautyBoxDescription = (rawText) => {
    const text = asText(rawText || '').trim();
    if (!text) {
      return { description: '', pricingLine: '', title: '', items: [] };
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const idxPricing = lines.findIndex((l) => /^regular price:/i.test(l));
    const idxTitle = lines.findIndex((l) => /beauty box\s*:/i.test(l));
    const idxKit = lines.findIndex((l) => /^kit includes:?/i.test(l));

    const descriptionLines = (idxPricing > 0 ? lines.slice(0, idxPricing) : lines.slice(0, Math.min(lines.length, 3)));
    const description = descriptionLines.join('\n\n').trim();
    const pricingLine = idxPricing >= 0 ? lines[idxPricing] : '';
    const titleLine = idxTitle >= 0 ? lines[idxTitle] : '';
    const title = titleLine
      .replace(/^❤️\s*/i, '')
      .replace(/^beauty box\s*:\s*/i, '')
      .trim();

    const startItems = idxKit >= 0 ? idxKit + 1 : (idxTitle >= 0 ? idxTitle + 1 : (idxPricing >= 0 ? idxPricing + 1 : 0));
    const itemLines = startItems > 0 ? lines.slice(startItems) : [];

    const items = [];
    let current = null;

    const flush = () => {
      if (!current) return;
      const body = current.body.join('\n').trim();
      items.push({
        index: current.index,
        header: current.header.trim(),
        body,
      });
      current = null;
    };

    for (const l of itemLines) {
      const m = l.match(/^(\d+)\.\s*(.+)$/);
      if (m) {
        flush();
        current = { index: Number(m[1]), header: m[2], body: [] };
        continue;
      }
      if (!current) {
        // Ignore stray lines before first item
        continue;
      }
      current.body.push(l);
    }
    flush();

    return { description, pricingLine, title, items };
  };

  const renderBeautyBoxDetails = () => {
    if (!product) return null;
    const localizedDescription = getLocalizedProductDescription(product, locale) || product.description;
    const shouldParse = String(locale || 'en').toLowerCase().startsWith('en');
    const parsed = shouldParse ? parseBeautyBoxDescription(product.description) : null;
    const safeParsed = parsed || { description: '', pricingLine: '', title: '', items: [] };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('product.productDescription')}</Text>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{safeParsed.description || asText(localizedDescription)}</Text>
        </View>

        {safeParsed.pricingLine ? (
          <View style={styles.beautyBoxPriceLineWrap}>
            <Text style={styles.beautyBoxPriceLine}>{safeParsed.pricingLine}</Text>
          </View>
        ) : null}

        {Array.isArray(safeParsed.items) && safeParsed.items.length > 0 ? (
          <>
            {/* Show this block only when we actually have parsed kit items (EN parsing). */}
            <View style={styles.beautyBoxTitleRow}>
              <Text style={styles.beautyBoxTitleHeart}>❤️</Text>
              <Text style={styles.beautyBoxTitleText}>
                {`Beauty Box: ${(safeParsed.title || asText(getLocalizedProductName(product, locale) || product.name).replace(/beauty box/i, '').trim())}`}
              </Text>
            </View>

            <Text style={styles.beautyBoxKitTitle}>{t('product.kitIncludes')}</Text>

            <View style={styles.beautyBoxKitList}>
              {safeParsed.items.map((it) => (
                <View key={`${it.index}-${it.header}`} style={styles.beautyBoxKitItem}>
                  <Text style={styles.beautyBoxKitHeader}>{`${it.index}. ${it.header}`}</Text>
                  {it.body ? <Text style={styles.beautyBoxKitBody}>{it.body}</Text> : null}
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    );
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

  const renderInfoSection = (title, content) => {
    const text = asText(content);
    if (!text || text.trim().length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{text}</Text>
        </View>
      </View>
    );
  };

  const renderSpecs = () => {
    if (!product) return null;

    const productDetailsObj =
      asKeyValueObject(product?.productDetails) || getObjectField(product, ['productDetails']);

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
            <Text style={styles.specValueText}>
              {parts.map((p) => `• ${capFirst(p)}`).join('\n')}
            </Text>
          );
        }
      }

      return <Text style={styles.specValueText}>{txt}</Text>;
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('product.productDetails')}</Text>
        <View style={styles.specList}>
          {rows.map((row, idx) => (
            <View
              key={row.label + idx}
              style={[
                styles.specItem,
                idx === rows.length - 1 ? styles.specItemLast : null,
              ]}
            >
              <Text style={styles.specLabel}>{row.label}</Text>
              <View style={styles.specValueContainer}>{renderSpecValue(row.label, row.value)}</View>
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
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.listContainer}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listText}>{asText(item)}</Text>
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
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.specList}>
          {entries.map(([k, v], idx) => (
            <View key={k + idx} style={styles.specItem}>
              <Text style={styles.specLabel}>{asText(k)}</Text>
              <Text style={styles.specValue}>{asText(v)}</Text>
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
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.listContainer}>
          {steps.map((s, idx) => (
            <View key={`${idx}-${s.title}`} style={styles.listItem}>
              <Text style={styles.listBullet}>{idx + 1}.</Text>
              <Text style={styles.listText}>
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
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.listContainer}>
          {items.map((it, idx) => (
            <View key={`${idx}-${it.name}`} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listText}>
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
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.loadingText}>{t('productScreen.loadingDetails')}</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('productScreen.notFound')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{t('productScreen.goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
            <Ionicons name="chevron-back" size={22} color="#1D1D1F" />
        </TouchableOpacity>
        
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonMiddle]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#1D1D1F" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonLast]}
            onPress={handleWishlistToggle}
          >
            <Ionicons 
              name={isWishlisted ? "heart" : "heart-outline"} 
              size={22} 
              color={isWishlisted ? "#E74C3C" : "#1D1D1F"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Product Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: `https://www.genosys.ae${product.image}` }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroImagePlaceholder}>
              <Text style={styles.heroPlaceholderText}>
                {product.name?.charAt(0) || 'G'}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.category}>{asText(product.category)}</Text>
            <Text style={styles.productName}>{asText(getLocalizedProductName(product, locale) || product.name)}</Text>
            
            {/* Enhanced Size and Stock Info from Server */}
            {(product.size || product.hasVariants || (product.variants && product.variants.length > 0)) && (
              <View style={styles.sizeInfoContainer}>
                <Text style={styles.sizeInfo}>
                  {product.variants && product.variants.length > 0
                    ? t('product.sizesAvailable', { count: product.variants.length })
                    : product.hasVariants 
                      ? t('product.multipleSizesAvailable')
                      : t('product.sizeLine', { size: asText(product.size) })}
                </Text>
                {(product.stock || product.inStock) && (
                  <Text style={styles.stockInfo}>{t('product.inStock')}</Text>
                )}
              </View>
            )}
              
              {/* Enhanced Pricing with Beauty Boxes Special Display */}
              {product.category === 'Beauty Boxes' || (product.name && product.name.toLowerCase().includes('beauty box')) ? (
                // Special pricing display for Beauty Boxes on detail page
                <View style={styles.beautyBoxDetailPricing}>
                  <Text style={styles.beautyBoxDetailFullPrice}>
                    {t('product.fullPrice', { price: formatPrice(product.originalPrice || product.displayPrice || product.price || 0) })}
                  </Text>
                  <View style={styles.beautyBoxDetailDiscountRow}>
                    <Text style={styles.beautyBoxDetailDiscount}>{t('product.bundleDiscount')}</Text>
                    <Text style={styles.beautyBoxDetailFinalPrice}>
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
                        <Text style={styles.originalPrice}>{formatPrice(original)} AED</Text>
                        <View style={styles.discountRow}>
                          <Text style={styles.discountedPrice}>{formatPrice(discounted)} AED</Text>
                          <View style={styles.discountBadge}>
                            <Text style={styles.discountBadgeText}>{`${Math.round(effectivePct)}% OFF`}</Text>
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

          {/* Product content sections from API */}
          {isBeautyBoxProduct(product) ? (
            renderBeautyBoxDetails()
          ) : (
            <>
              {renderInfoSection(t('product.about'), getDisplayDescription())}

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

                if (benefits.length === 1 && benefits[0].length > 200 && !benefits[0].includes(' — ')) {
                  return renderInfoSection(t('product.benefits'), benefits[0]);
                }
                return renderListSection(t('product.benefits'), benefits);
              })()}

              {(() => {
                const steps = toHowToSteps(product?.howToUse);
                const directionsText = pickField(product, ['directions', 'application', 'how_to_use']);
                if (steps.length) return renderStepsSection(t('product.directions'), steps);
                return renderInfoSection(t('product.directions'), directionsText || pickField(product, ['usage']));
              })()}

              {renderIngredientsSection(t('product.keyIngredients'), toIngredients(product?.ingredients || product?.keyIngredients))}

              {renderInfoSection(t('product.note'), pickField(product, ['note', 'notes', 'warning', 'caution']))}

              {/* Optional helpful section */}
              {renderListSection(t('product.targetConcerns'), getArrayField(product, ['targetConcerns', 'concerns']))}
            </>
          )}

          {/* Rating Section removed (not needed for now) */}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
          <TouchableOpacity
          style={[styles.addToBagButton, isInCart(product.id) && styles.inCartButton]}
            onPress={handleAddToBag}
        >
          <Ionicons 
            name={isInCart(product.id) ? "checkmark" : "bag"} 
            size={20} 
            color="#ffffff" 
            style={styles.buttonIcon}
          />
            <Text style={styles.addToBagText}>
            {isInCart(product.id) ? t('product.inBag', { count: getItemQuantity(product.id) }) : t('product.addToBag')}
            </Text>
          </TouchableOpacity>
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
    marginTop: 16,
    fontSize: 16,
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
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonMiddle: {
    marginHorizontal: 16,
  },
  headerButtonLast: {
    marginLeft: 0,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
    backgroundColor: '#F5F5F7',
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
    color: '#E74C3C',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Space for bottom button
  },
  productInfo: {
    marginBottom: 32,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
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
  discountBadge: {
    backgroundColor: '#27AE6020',
    borderColor: '#27AE60',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  discountBadgeText: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
    letterSpacing: -0.3,
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
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
  listBullet: {
    fontSize: 18,
    color: '#E74C3C',
    lineHeight: 22,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#1D1D1F',
    lineHeight: 22,
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
  specItemLast: {
    borderBottomWidth: 0,
  },
  specLabel: {
    width: 110,
    fontSize: 14,
    color: '#6E6E73',
    fontWeight: '600',
    lineHeight: 20,
  },
  specValueContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  specValueText: {
    fontSize: 15,
    color: '#1D1D1F',
    lineHeight: 22,
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
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inCartButton: {
    backgroundColor: '#27AE60',
    shadowColor: '#27AE60',
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToBagText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sizeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  sizeInfo: {
    fontSize: 14,
    color: '#1D1D1F',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockInfo: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: '#86868B',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
  },
  // Beauty Boxes detail page pricing styles
  beautyBoxDetailPricing: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E74C3C',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beautyBoxDetailDiscount: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: 'bold',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  beautyBoxDetailFinalPrice: {
    fontSize: 18,
    color: '#27AE60',
    fontWeight: 'bold',
  },
});