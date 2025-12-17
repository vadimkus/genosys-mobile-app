import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useCart } from '../../contexts/CartContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { fetchProductById } from '../../services/api';
import { isBeautyBoxProduct } from '../../utils/productRules';
import { getLocalizedProductName } from '../../utils/productLocalization';
import { asText } from '../../utils/productDetailUtils';
import AUTH_CONFIG from '../../config/auth';

function getProductIdForCombo(p) {
  return String(p?.productNumber || p?.id || '').trim();
}

function getRecommendedProductId(currentId) {
  const idStr = String(currentId || '').trim();
  if (!idStr) return null;

  // Mirror website logic (cosmetics-website/components/product/ProductRecommendation.tsx)
  const map = {
    '22': '32',
    '32': '22',
    '20': '30',
    '30': '20',
    '21': '31',
    '31': '21',
    '49': '37',
    '37': '49',
    '4': '1',
    '5': '1',
    '6': '1',
    '7': '1',
    '8': '1',
    '9': '1',
    '15': '30',
    '19': '27',
    '18': '29',
    '29': '18',
    '10': '16',
    '25': '38',
    '33': '17',
    '17': '24',
    '24': '17',
    '44': '43',
    '43': '44',
    '45': '43',
    '46': '44',
  };
  return map[idStr] || null;
}

function splitStrong(htmlLike) {
  const input = String(htmlLike || '');
  if (!input) return [];
  const parts = input.split(/(<strong>|<\/strong>)/g).filter(Boolean);
  const out = [];
  let bold = false;
  for (const p of parts) {
    if (p === '<strong>') {
      bold = true;
      continue;
    }
    if (p === '</strong>') {
      bold = false;
      continue;
    }
    out.push({ text: p, bold });
  }
  return out;
}

function getPerfectCombinationCopy(t, currentId, recId, currentName, recName) {
  const params = { currentName, recommendedName: recName };

  const make = (introKey, benefitKeyPrefix, benefitVariant = null) => {
    const intro = t(`product.${introKey}`, params);
    const benefits = [];
    for (let i = 1; i <= 4; i++) {
      const titleKey = benefitVariant?.[i]?.title || `${benefitKeyPrefix}Benefit${i}Title`;
      const textKey = benefitVariant?.[i]?.text || `${benefitKeyPrefix}Benefit${i}Text`;
      benefits.push({
        title: t(`product.${titleKey}`, params),
        text: t(`product.${textKey}`, params),
      });
    }
    return { intro, benefits };
  };

  const c = String(currentId || '').trim();
  const r = String(recId || '').trim();

  if (c === '22' && r === '32') return make('pc22Intro', 'pc22');
  if (c === '32' && r === '22') return make('pc32Intro', 'pc32');
  if (c === '20' && r === '30') return make('pc20Intro', 'pc20');
  if (c === '30' && r === '20') return make('pc30Intro', 'pc30');
  if (c === '21' && r === '31') return make('pc21Intro', 'pc21');
  if (c === '31' && r === '21') return make('pc31Intro', 'pc31');
  if (c === '49' && r === '37') return make('pc49Intro', 'pc49');
  if (c === '37' && r === '49') return make('pc37Intro', 'pc37');
  if (c === '4' && r === '1') return make('pc4Intro', 'pc4');
  if (c === '5' && r === '1') return make('pc5Intro', 'pc5');
  if (c === '6' && r === '1') return make('pc6Intro', 'pc6');
  if (c === '7' && r === '1') return make('pc7Intro', 'pc7');
  if (c === '8' && r === '1') return make('pc8Intro', 'pc8');
  if (c === '9' && r === '1') return make('pc9Intro', 'pc9');
  if (c === '15' && r === '30') return make('pc15Intro', 'pc15');
  if (c === '19' && r === '27') return make('pc19Intro', 'pc19');
  if (c === '18' && r === '29') return make('pc18Intro', 'pc18');
  if (c === '29' && r === '18') return make('pc29Intro', 'pc29');
  if (c === '10' && r === '16') return make('pc10Intro', 'pc10');
  if (c === '25' && r === '38') return make('pc25Intro', 'pc25');
  if (c === '33' && r === '17') return make('pc33Intro', 'pc33');

  // Eye care serum + cream combination (17 + 24 or 24 + 17)
  if ((c === '17' && r === '24') || (c === '24' && r === '17')) {
    const isSerumFirst = c === '17';
    return make('pc24Intro', 'pc24', {
      2: {
        title: 'pc24Benefit2TitleSerumFirst',
        text: isSerumFirst ? 'pc24Benefit2TextSerumFirst' : 'pc24Benefit2TextCreamFirst',
      },
      3: {
        title: 'pc24Benefit3Title',
        text: isSerumFirst ? 'pc24Benefit3TextSerumFirst' : 'pc24Benefit3TextCreamFirst',
      },
    });
  }

  // Hair care shampoo + tonic combination (44 + 43 or 43 + 44)
  if ((c === '44' && r === '43') || (c === '43' && r === '44')) {
    const isShampooFirst = c === '44';
    return make('pc44Intro', 'pc44', {
      2: {
        title: isShampooFirst ? 'pc44Benefit2TitleShampooFirst' : 'pc44Benefit2TitleTonicFirst',
        text: isShampooFirst ? 'pc44Benefit2TextShampooFirst' : 'pc44Benefit2TextTonicFirst',
      },
      3: {
        title: isShampooFirst ? 'pc44Benefit3TitleShampooFirst' : 'pc44Benefit3TitleTonicFirst',
        text: isShampooFirst ? 'pc44Benefit3TextShampooFirst' : 'pc44Benefit3TextTonicFirst',
      },
    });
  }

  if (c === '45' && r === '43') return make('pc45Intro', 'pc45');
  if (c === '46' && r === '44') return make('pc46Intro', 'pc46');

  return make('pcDefaultIntro', 'pcDefault');
}

export default function PerfectCombinationCard({ product, user, styles }) {
  const { t, locale } = useLocalization();
  const { addItem, isInCart, getItemQuantity } = useCart();

  const [recommendedProduct, setRecommendedProduct] = useState(null);
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  const currentId = useMemo(() => getProductIdForCombo(product), [product?.id, product?.productNumber]);
  const recId = useMemo(() => {
    const backendSuggested = product?.recommendedProductId || product?.recommended_product_id || null;
    return backendSuggested ? String(backendSuggested) : getRecommendedProductId(currentId);
  }, [currentId, product?.recommendedProductId, product?.recommended_product_id]);

  useEffect(() => {
    (async () => {
      try {
        if (!product || isBeautyBoxProduct(product)) {
          setRecommendedProduct(null);
          return;
        }
        if (!recId) {
          setRecommendedProduct(null);
          return;
        }
        setRecommendedLoading(true);
        const rec = await fetchProductById(recId, user, { locale });
        setRecommendedProduct(rec || null);
      } finally {
        setRecommendedLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, product?.productNumber, locale, user?.id, recId]);

  // Hooks must be called unconditionally (before any returns).
  const recommendedProductId = useMemo(() => {
    const pid = recommendedProduct?.id ?? recommendedProduct?.productNumber ?? null;
    return pid != null ? String(pid) : null;
  }, [recommendedProduct?.id, recommendedProduct?.productNumber]);

  const recommendedName = useMemo(() => {
    if (!recommendedProduct) return '';
    return asText(getLocalizedProductName(recommendedProduct, locale) || recommendedProduct.name).trim();
  }, [recommendedProduct, locale]);

  const handleOpenRecommended = useCallback(() => {
    if (!recommendedProductId) return;
    router.push({ pathname: '/product/[id]', params: { id: recommendedProductId } });
  }, [recommendedProductId]);

  const defaultRecSize = useMemo(() => {
    const variants = recommendedProduct?.variants;
    if (!Array.isArray(variants) || variants.length === 0) return '';
    const v =
      variants.find((x) => x?.isDefault) ||
      variants.find((x) => x?.available) ||
      variants[0];
    const s = String(v?.size || '').trim();
    return s;
  }, [recommendedProduct?.variants]);

  const inBagForRec = useMemo(() => {
    if (!recommendedProduct?.id) return false;
    // Use default variant size if the product has variants; otherwise treat as simple product.
    const sizeKey = defaultRecSize || '';
    return isInCart(recommendedProduct.id, '', sizeKey);
  }, [isInCart, recommendedProduct?.id, defaultRecSize]);

  const recQty = useMemo(() => {
    if (!recommendedProduct?.id) return 0;
    const sizeKey = defaultRecSize || '';
    return getItemQuantity(recommendedProduct.id, '', sizeKey);
  }, [getItemQuantity, recommendedProduct?.id, defaultRecSize]);

  const handleAddRecommendedToBag = useCallback(() => {
    if (!recommendedProduct) return;
    try {
      // If recommended product has variants, add the default variant to keep cart keys consistent.
      addItem(recommendedProduct, 1, '', defaultRecSize || '');
      Alert.alert(
        t('product.addedToBagTitle') || 'Added to bag',
        `${recommendedName || 'Item'} has been added to your bag`,
        [
          { text: t('product.continueShopping') || t('common.ok') || 'OK', style: 'default' },
          { text: t('product.viewBag') || 'View bag', style: 'default', onPress: () => router.push('/(tabs)/bag') },
        ]
      );
    } catch (e) {
      Alert.alert(t('common.error') || 'Error', 'Failed to add to bag');
    }
  }, [addItem, recommendedProduct, recommendedName, t, defaultRecSize]);

  if (!product || isBeautyBoxProduct(product)) return null;
  if (!recId) return null;

  if (recommendedLoading) {
    return (
      <View style={styles.pcOuter}>
        <Text style={styles.pcLoading}>{t('common.loadingRecommendation')}</Text>
      </View>
    );
  }

  if (!recommendedProduct) return null;

  const currentName = asText(getLocalizedProductName(product, locale) || product.name).trim();
  const recName = recommendedName;
  const { intro, benefits } = getPerfectCombinationCopy(t, currentId, recId, currentName, recName);

  const canSeePrices = user?.canSeePrices !== false;
  const recBase = Number(recommendedProduct?.displayPrice ?? recommendedProduct?.price ?? 0) || 0;
  const recOrig = Number(recommendedProduct?.originalPrice ?? 0) || 0;
  const recHasDiscount = Number.isFinite(recOrig) && recOrig > recBase && recOrig > 0;

  const imageUri = recommendedProduct?.image
    ? `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${recommendedProduct.image}`
    : null;
  const introParts = splitStrong(intro);

  return (
    <View style={styles.pcOuter}>
      <View style={styles.pcHeaderRow}>
        <Ionicons name="sparkles" size={18} color="#E74C3C" />
        <Text style={styles.pcHeaderTitle}>{t('product.perfectCombination')}</Text>
      </View>

      {!!introParts.length ? (
        <Text style={styles.pcIntroText}>
          {introParts.map((p, idx) => (
            <Text key={`${idx}-${p.text.slice(0, 10)}`} style={p.bold ? styles.pcIntroBold : null}>
              {p.text}
            </Text>
          ))}
        </Text>
      ) : null}

      <View style={styles.pcCard}>
        <View style={styles.pcProductCard}>
          <TouchableOpacity onPress={handleOpenRecommended} activeOpacity={0.9}>
          <View style={styles.pcImageWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.pcImage} resizeMode="cover" />
            ) : (
              <View style={styles.pcImageFallback} />
            )}
          </View>

          <Text style={styles.pcProductName} numberOfLines={2}>
            {recName}
          </Text>

          {recommendedProduct?.size ? (
            <Text style={styles.pcProductSize} numberOfLines={1}>
              {t('product.size')}: {asText(recommendedProduct.size)}
            </Text>
          ) : null}

          {canSeePrices ? (
            <View style={styles.pcPriceRow}>
              <Text style={styles.pcPriceMain}>{recBase.toFixed(2)} AED</Text>
              {recHasDiscount ? <Text style={styles.pcPriceOld}>{recOrig.toFixed(2)} AED</Text> : null}
            </View>
          ) : (
            <Text style={styles.pcLoginText}>{t('product.loginToSeePrice')}</Text>
          )}

          <Text style={styles.pcViewDetails}>{t('product.clickToViewDetails')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pcAddBtn, inBagForRec ? { backgroundColor: '#27AE60' } : null]}
            onPress={handleAddRecommendedToBag}
            activeOpacity={0.9}
          >
            <Ionicons name={inBagForRec ? 'checkmark' : 'bag-add'} size={16} color="#ffffff" />
            <Text style={styles.pcAddBtnText}>
              {inBagForRec ? t('product.inBag', { count: recQty || 1 }) : t('product.addToBag')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pcBenefitsCard}>
          <View style={styles.pcBenefitsHeader}>
            <Ionicons name="sparkles" size={14} color="#E74C3C" />
            <Text style={styles.pcBenefitsTitle}>{t('product.whyCombineTheseProducts')}</Text>
          </View>
          <View style={styles.pcBenefitsList}>
            {benefits.map((b, idx) => (
              <View key={`${idx}-${b.title}`} style={styles.pcBenefitRow}>
                <Text style={styles.pcBenefitCheck}>✓</Text>
                <Text style={styles.pcBenefitText}>
                  <Text style={styles.pcBenefitTextBold}>{b.title}</Text> {b.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}


