import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleFooter from '../../components/CollapsibleFooter';
import ProgressCard from '../../components/ProgressCard';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isBeautyBoxProduct, isHydroCoolMask, isUserDiscountExcludedProduct, getCanonicalUnitPrice, hasFixedPriceOverride, isDeviceProduct } from '../../utils/productRules';
import { useLocalization } from '../../contexts/LocalizationContext';
import { formatEmirateLabel } from '../../utils/emirateUtils';
import { getLocalizedProductName, getCategoryTranslationKey, normalizeCategoryCanonical } from '../../utils/productLocalization';
import AUTH_CONFIG from '../../config/auth';
import { computeWaterfallBreakdown } from '../../utils/cartUtils';
import { mediumTap } from '../../utils/haptics';
import T from '../../utils/typography';

export default function BagScreen() {
  const { user } = useAuth();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const [navSource, setNavSource] = useState(null);
  const { 
    items, 
    getTotalItems, 
    updateQuantity, 
    removeItem, 
    updateColor,
    updateSize,
    clearCart, 
    getCartSummary,
    selectedEmirate,
    reloadShippingRates,
    isLoading
  } = useCart();
  
  const [footerHeight, setFooterHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerCollapsed, setFooterCollapsed] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const src = await AsyncStorage.getItem('@genosys_nav_bag_source');
          if (!cancelled && src) setNavSource(src);
        } catch {
          // ignore
        }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const handleHeaderBack = useCallback(() => {
    AsyncStorage.removeItem('@genosys_nav_bag_source').catch(() => {});
    if (navSource) {
      try {
        const parsed = JSON.parse(navSource);
        router.push(parsed);
      } catch {
        router.push(navSource);
      }
      setNavSource(null);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/shop');
    }
  }, [navSource]);

  const EMPTY_UNI_IMAGE = 'https://genosys.ae/_next/image?url=%2Fimages%2Favatar%2Funi.png&w=512&q=75';

  const cartSummary = getCartSummary();
  const paidItemCount = getTotalItems();

  const isPromoItem = (item) => item?.isPromotionItem === true || item?.selectedSize === '__PROMO__';
  const promoSubtotal = Number(cartSummary.subtotal) || 0;
  const promo500Met = promoSubtotal >= 500;
  const promo700Met = promoSubtotal >= 700;

  const headerTranslateY = useMemo(() => {
    const h = headerHeight || 100;
    return scrollY.interpolate({
      inputRange: [0, h],
      outputRange: [0, -h],
      extrapolate: 'clamp',
    });
  }, [scrollY, headerHeight]);

  const scrollPaddingTop = Math.max(headerHeight, 160);

  // Discount display in summary (e.g. user has 50% off)
  const discountPct = Number(user?.discountPercentage);
  const safeSubtotal = Number(cartSummary.subtotal) || 0;
  const safeShipping = Number(cartSummary.shippingCost) || 0;
  const safeVat = Number(cartSummary.vatAmount) || 0;
  const safeTotal = Number(cartSummary.total) || 0;

  // Progress bars (UI only)
  const promo500Remaining = Math.max(0, 500 - promoSubtotal);
  const promo700Remaining = Math.max(0, 700 - promoSubtotal);
  const promo500Progress = Math.max(0, Math.min(1, promoSubtotal / 500));
  const promo700Progress = Math.max(0, Math.min(1, promoSubtotal / 700));
  const freeShippingThreshold = Number(cartSummary?.freeShippingThreshold) || 1000;
  const freeDeliveryRemaining = Math.max(0, freeShippingThreshold - promoSubtotal);
  const freeDeliveryProgress = Math.max(0, Math.min(1, promoSubtotal / freeShippingThreshold));

  const promoCollagenImage = `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}/images/in.png`;
  const promoSeaAlgaeImage = `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}/images/SEA.jpg`;

  // Waterfall breakdown for order summary
  const waterfall = computeWaterfallBreakdown(items, user);

  // Refresh DB-driven shipping rates when opening bag
  useEffect(() => {
    reloadShippingRates?.();
  }, []);

  const handleQuantityChange = useCallback((item, change) => {
    const newQuantity = item.quantity + change;
    updateQuantity(item.product.id, newQuantity, item.selectedColor, item.selectedSize);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((item) => {
    removeItem(item.product.id, item.selectedColor, item.selectedSize);
  }, [removeItem]);

  const handleCheckout = () => {
    mediumTap();
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

    if (items.length === 0) {
      Alert.alert(t('bag.emptyCartTitle'), t('bag.emptyCartMessage'));
      return;
    }

    // Navigate to checkout page
    router.push('/checkout');
  };

  const handleClearBag = () => {
    Alert.alert(
      t('bag.clearBagTitle'),
      t('bag.clearBagMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('bag.clear'), style: 'destructive', onPress: clearCart }
      ]
    );
  };

  const keyExtractor = useCallback(
    (item) => `${item.product.id}-${item.selectedColor}-${item.selectedSize}`,
    []
  );

  const renderCartItem = useCallback(
    ({ item }) => {
      const itemKey = `${item.product.id}-${item.selectedColor}-${item.selectedSize}`;
      const rawImage = item.product.image || '';
      const imageUrl = rawImage
        ? (rawImage.startsWith('http') ? rawImage : `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${rawImage}`)
        : null;
      const rawSizeLabel = item.selectedSize || item.product?.size || '';
      const sizeLabel = rawSizeLabel === '__PROMO__' ? (item.product?.size || '') : rawSizeLabel;
      const promo = isPromoItem(item);

      return (
        <View key={itemKey} style={[styles.cartItem, isRTL && styles.cartItemRTL]}>
          <TouchableOpacity
            style={styles.itemImageContainer}
            onPress={() => (promo ? null : router.push(`/product/${item.product.id}`))}
            disabled={promo}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="cover" />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Text style={styles.placeholderText}>{item.product.name?.charAt(0) || 'G'}</Text>
              </View>
            )}
            {!!sizeLabel && (
              <Text style={styles.itemImageSize} numberOfLines={1}>
                {sizeLabel}
              </Text>
            )}
          </TouchableOpacity>

          <View style={[styles.itemDetails, isRTL && styles.itemDetailsRTL]}>
            <TouchableOpacity onPress={() => (promo ? null : router.push(`/product/${item.product.id}`))} disabled={promo}>
              <Text style={[styles.itemName, isRTL && styles.itemNameRTL]} numberOfLines={2}>
                {getLocalizedProductName(item.product, locale) || item.product.name}
              </Text>
            </TouchableOpacity>
            {!promo && (
              <Text style={[styles.itemCategory, isRTL && styles.itemCategoryRTL]}>
                {(() => {
                  const canon = normalizeCategoryCanonical(item.product.category) || item.product.category;
                  const key = getCategoryTranslationKey(canon);
                  return key ? t(key) : canon;
                })()}
              </Text>
            )}

            {/* Color Selector */}
            {!promo && (() => {
              const cv = item.product?.colorVariants || [];
              if (cv.length <= 0) {
                if (item.selectedColor) {
                  return (
                    <View style={[styles.variantsContainer, isRTL && styles.variantsContainerRTL]}>
                      <Text style={[styles.variantText, isRTL && styles.variantTextRTL]}>
                        {t('common.color')}: {item.selectedColor}
                      </Text>
                    </View>
                  );
                }
                return null;
              }
              return (
                <View style={styles.variantSelectorWrap}>
                  <Text style={[styles.variantSelectorLabel, isRTL && styles.variantTextRTL]}>{t('common.color')}:</Text>
                  <View style={[styles.variantChipsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    {cv.map((c) => {
                      const sel = (item.selectedColor || '') === c.value;
                      return (
                        <TouchableOpacity
                          key={c.value}
                          style={[styles.variantChip, sel && styles.variantChipSelected]}
                          onPress={() => { mediumTap(); updateColor(item.product.id, c.value, item.selectedColor, item.selectedSize); }}
                        >
                          <Text style={[styles.variantChipText, sel && styles.variantChipTextSelected]}>{c.label || c.value}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })()}

            {/* Size Selector */}
            {!promo && (() => {
              const variants = item.product?.variants;
              if (!Array.isArray(variants)) return null;
              const sizes = variants.filter(v => v?.size && v.size !== 'default' && v.available !== false);
              const uniqueSizes = sizes.reduce((acc, v) => {
                if (!acc.find(s => s.size === v.size)) acc.push(v);
                return acc;
              }, []);
              if (uniqueSizes.length <= 1) return null;
              const currentSize = item.selectedSize || '';
              return (
                <View style={styles.variantSelectorWrap}>
                  <Text style={[styles.variantSelectorLabel, isRTL && styles.variantTextRTL]}>{t('product.size') || 'Size'}:</Text>
                  <View style={[styles.variantChipsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    {uniqueSizes.map((v) => {
                      const sel = currentSize === v.size;
                      return (
                        <TouchableOpacity
                          key={v.size}
                          style={[styles.variantChip, sel && styles.variantChipSizeSelected]}
                          onPress={() => { mediumTap(); updateSize(item.product.id, v.size, item.selectedSize, item.selectedColor); }}
                        >
                          <Text style={[styles.variantChipText, sel && styles.variantChipTextSizeSelected]}>{v.size}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })()}

            {/* Price with Discount Display */}
            {promo ? (
              <View style={[styles.itemPriceContainer, isRTL && styles.itemPriceContainerRTL]}>
                <Text style={[styles.itemOriginalPrice, isRTL && styles.itemOriginalPriceRTL]}>{(Number(item.product?.originalPrice) || 0).toFixed(2)} AED</Text>
                <Text style={[styles.itemDiscountLabel, isRTL && styles.itemDiscountLabelRTL]}>{t('bag.discount100')}</Text>
              </View>
            ) : (
              (() => {
                const pct = Number(user?.discountPercentage);
                const hasUserDiscount = Number.isFinite(pct) && pct > 0 && pct < 100;
                const isHydro = isHydroCoolMask(item.product);
                const isFixed = hasFixedPriceOverride(item.product);
                const isDevice = isDeviceProduct(item.product);
                const selectedSize = String(item?.selectedSize || '').trim();
                const selectedVariant = selectedSize && Array.isArray(item?.product?.variants)
                  ? item.product.variants.find((v) => String(v?.size || '').trim() === selectedSize)
                  : null;
                const variantPrice = Number(selectedVariant?.price);
                const hasVariantPrice = selectedSize && Number.isFinite(variantPrice) && variantPrice > 0;

                const base = (isHydro || isDevice || isFixed)
                  ? getCanonicalUnitPrice(item.product)
                  : (hasVariantPrice ? variantPrice : Number(item.product?.displayPrice || item.product?.price || 0));

                // IMPORTANT: if we're using a selected variant price, product.originalPrice may correspond to another size.
                // Do not apply user-discount math from a mismatched originalPrice; rely on variant price directly.
                const original = hasVariantPrice ? Number(selectedVariant?.originalPrice) : Number(item.product?.originalPrice);
                const isBeautyBox = isBeautyBoxProduct(item.product);
                const isBundleItem = item?.fromBundle === true || item?.product?.fromBundle === true;
                const bundlePct = Number(item?.bundleDiscountPercent || item?.product?.bundleDiscountPercent) || 0;

                // "Build Your Set" bundle items: bundle discount ONLY (no VIP)
                if (isBundleItem && bundlePct > 0 && Number.isFinite(base) && base > 0) {
                  const retailPrice = (Number.isFinite(original) && original > base) ? original : base / (1 - bundlePct / 100);
                  const discountLabel = `${bundlePct}%`;
                  return (
                    <View style={[styles.itemPriceContainer, isRTL && styles.itemPriceContainerRTL]}>
                      <View style={styles.itemPriceRow}>
                        <Text style={styles.itemOriginalPrice}>{retailPrice.toFixed(2)} AED</Text>
                        <Text style={styles.itemBundleLabel}>{discountLabel} {t('bag.bundleOff') || 'OFF'}</Text>
                      </View>
                      <Text style={styles.itemDiscountedPrice}>{base.toFixed(2)} AED</Text>
                    </View>
                  );
                }

                // Beauty Boxes: show bundle discount (15%) explicitly, ignore user discount
                if (isBeautyBox && Number.isFinite(base) && base > 0) {
                  const fullPrice = (Number.isFinite(original) && original > base)
                    ? original
                    : (base / 0.85);

                  return (
                    <View style={[styles.itemPriceContainer, isRTL && styles.itemPriceContainerRTL]}>
                      <View style={styles.itemPriceRow}>
                        <Text style={styles.itemOriginalPrice}>{fullPrice.toFixed(2)} AED</Text>
                        <Text style={styles.itemBundleLabel}>{t('bag.bundleDiscount15')}</Text>
                      </View>
                      <Text style={styles.itemDiscountedPrice}>{base.toFixed(2)} AED</Text>
                    </View>
                  );
                }

                // Hydro Cool Mask / Devices / Fixed: ignore any user discount; keep base price as-is
                if (isHydro || isDevice || isFixed) {
                  return <Text style={[styles.itemPrice, isRTL && styles.itemPriceRTL]}>{(Number.isFinite(base) ? base : 0).toFixed(2)} AED</Text>;
                }

                // Use server-provided originalPrice or the product's base price (retail) for strikethrough display.
                // Never reverse-engineer original by dividing displayPrice — that wrongly inflates when the
                // server returned undiscounted pricing (e.g. concern-detail API with no user context).
                const storedOriginal = Number(item.product?.originalPrice);
                const productBasePrice = Number(item.product?.price);
                const originalForDisplay = (() => {
                  const fromVariant = Number(original);
                  if (Number.isFinite(fromVariant) && fromVariant > base) return fromVariant;
                  if (Number.isFinite(storedOriginal) && storedOriginal > base) return storedOriginal;
                  if (hasUserDiscount && Number.isFinite(productBasePrice) && productBasePrice > base + 0.01) return productBasePrice;
                  return null;
                })();

                const discountedForDisplay = (() => {
                  if (!hasUserDiscount || !originalForDisplay) return base;
                  // If base already looks discounted (< original), keep it.
                  if (base < originalForDisplay - 0.01) return base;
                  // Otherwise compute discounted from original.
                  return originalForDisplay * (1 - pct / 100);
                })();

                if (
                  !isBeautyBox &&
                  hasUserDiscount &&
                  Number.isFinite(originalForDisplay) &&
                  originalForDisplay > 0 &&
                  Number.isFinite(discountedForDisplay) &&
                  discountedForDisplay > 0 &&
                  originalForDisplay > discountedForDisplay + 0.01
                ) {
                  const pctLabel = Math.round(pct);
                  return (
                    <View style={[styles.itemPriceContainer, isRTL && styles.itemPriceContainerRTL]}>
                      <View style={styles.itemPriceRow}>
                        <Text style={styles.itemOriginalPrice}>{originalForDisplay.toFixed(2)} AED</Text>
                        {pctLabel ? <Text style={styles.itemDiscountLabel}>{pctLabel}% {t('bag.off')}</Text> : null}
                      </View>
                      <Text style={styles.itemDiscountedPrice}>{discountedForDisplay.toFixed(2)} AED</Text>
                    </View>
                  );
                }

                return <Text style={styles.itemPrice}>{(Number.isFinite(base) ? base : 0).toFixed(2)} AED</Text>;
              })()
            )}
          </View>

          {promo ? (
            <View style={[styles.itemRightActions, isRTL && styles.itemRightActionsRTL]}>
              <Text style={[styles.promoQtyRight, isRTL && styles.promoQtyRightRTL]}>{t('bag.qty')} {item.quantity || 1}</Text>
              <Text style={[styles.promoItemPriceRight, isRTL && styles.promoItemPriceRightRTL]}>{t('common.free')}</Text>
              <Text style={[styles.promoTag, isRTL && styles.promoTagRTL]}>{t('bag.promotionTag')}</Text>
            </View>
          ) : (
            <View style={[styles.itemRightActions, isRTL && styles.itemRightActionsRTL]}>
              <View style={[styles.quantityContainer, isRTL && styles.quantityContainerRTL]}>
                <TouchableOpacity
                  style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(item, -1)}
                  disabled={item.quantity <= 1}
                >
                  <Ionicons name="remove" size={16} color="#000000" />
                </TouchableOpacity>

                <Text style={[styles.quantityText, isRTL && styles.quantityTextRTL]}>{item.quantity}</Text>

                <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(item, 1)}>
                  <Ionicons name="add" size={16} color="#000000" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item)}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [handleQuantityChange, handleRemoveItem, updateColor, updateSize, locale, t, user, isRTL]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
              <TouchableOpacity 
                style={[styles.backButton, isRTL && styles.backButtonRTL]}
                onPress={handleHeaderBack}
              >
                <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.title}>{t('bag.title')}</Text>
                <Text style={styles.subtitle}>{t('bag.loading')}</Text>
              </View>
              
              <View style={styles.headerRight} />
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Image source={{ uri: EMPTY_UNI_IMAGE }} style={styles.emptyUniImage} resizeMode="contain" />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
              <TouchableOpacity 
                style={[styles.backButton, isRTL && styles.backButtonRTL]}
                onPress={handleHeaderBack}
              >
                <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.title}>{t('bag.title')}</Text>
                <Text style={styles.subtitle}>{t('bag.selectedProducts')}</Text>
              </View>
              
              <View style={styles.headerRight} />
            </View>
          </View>
        </SafeAreaView>
        
        <View style={[styles.emptyContainer, styles.emptyContainerTop]}>
          <View style={styles.iconContainer}>
            <Image source={{ uri: EMPTY_UNI_IMAGE }} style={styles.emptyUniImage} resizeMode="contain" />
          </View>
          <Text style={[styles.emptyTitle, isRTL && styles.emptyTitleRTL]}>{t('bag.emptyTitle')}</Text>
          <Text style={[styles.emptyText, isRTL && styles.emptyTextRTL]}>
            {t('bag.emptyText')}
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Text style={[styles.shopButtonText, isRTL && styles.shopButtonTextRTL]}>{t('bag.startShopping')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Collapsible header: slides up as the user scrolls to free vertical space */}
      <Animated.View
        style={[styles.headerWrapper, { transform: [{ translateY: headerTranslateY }] }]}
        onLayout={(e) => {
          const h = e?.nativeEvent?.layout?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h > 0) setHeaderHeight(h);
        }}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
              <TouchableOpacity 
                style={[styles.backButton, isRTL && styles.backButtonRTL]}
                onPress={handleHeaderBack}
              >
                <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
              </TouchableOpacity>

              <View pointerEvents="none" style={styles.headerCenterAbsolute}>
                <Text style={[styles.titleInline, isRTL && styles.titleInlineRTL]}>
                  {t('bag.header', {
                    count: paidItemCount,
                    label: paidItemCount === 1 ? t('bag.item') : t('bag.items'),
                  })}
                </Text>
              </View>

              <TouchableOpacity onPress={handleClearBag} style={[styles.clearButton, isRTL && styles.clearButtonRTL]}>
                <Text style={[styles.clearText, isRTL && styles.clearTextRTL]}>{t('bag.clear')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
      
      {/* Items List - Animated FlatList (better perf than map in ScrollView) */}
      <Animated.FlatList
        style={styles.itemsList}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: scrollPaddingTop + 12 },
          { paddingBottom: Math.max(footerHeight + 24, 240) },
        ]}
        ListFooterComponent={
          <>
            {/* Free Mask Promotion (Progress UI) */}
            <View style={[styles.sectionCard, isRTL && styles.sectionCardRTL]}>
              <View style={[styles.sectionTitleRow, isRTL && styles.sectionTitleRowRTL]}>
                <View style={[styles.sectionTitleLeft, isRTL && styles.sectionTitleLeftRTL]}>
                  <Ionicons name="gift-outline" size={18} color="#dc2626" />
                  <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{t('bag.freeMaskPromotion')}</Text>
                </View>
              </View>

              <ProgressCard
                leftText={t('bag.promoSpendAed', { amount: 500 })}
                rightText={promo500Met ? '✓' : t('bag.promoRemainingAed', { amount: promo500Remaining.toFixed(2) })}
                rightTextMet={promo500Met}
                progress={promo500Progress}
                met={promo500Met}
                style={styles.progressCard}
              >
                <View style={[styles.rewardRow, isRTL && styles.rewardRowRTL]}>
                  <Image source={{ uri: promoCollagenImage }} style={styles.rewardImage} resizeMode="cover" />
                  <Text style={[styles.rewardText, isRTL && styles.rewardTextRTL]}>{t('bag.promoReward1')}</Text>
                </View>
              </ProgressCard>

              <ProgressCard
                leftText={t('bag.promoSpendAed', { amount: 700 })}
                rightText={promo700Met ? '✓' : t('bag.promoRemainingAed', { amount: promo700Remaining.toFixed(2) })}
                rightTextMet={promo700Met}
                progress={promo700Progress}
                met={promo700Met}
                style={styles.progressCard}
              >
                <View style={[styles.rewardRow, isRTL && styles.rewardRowRTL]}>
                  <View style={[styles.rewardImagesRow, isRTL && styles.rewardImagesRowRTL]}>
                    <Image source={{ uri: promoSeaAlgaeImage }} style={styles.rewardImageSmall} resizeMode="cover" />
                    <Image source={{ uri: promoCollagenImage }} style={styles.rewardImageSmall} resizeMode="cover" />
                  </View>
                  <Text style={[styles.rewardText, isRTL && styles.rewardTextRTL]}>{t('bag.promoReward2')}</Text>
                </View>
              </ProgressCard>
            </View>

            {/* Free Delivery (Progress UI) */}
            <View style={styles.sectionCard}>
              <ProgressCard
                headerLeft={
                  <View style={styles.sectionTitleLeft}>
                    <Ionicons name="car-outline" size={18} color="#dc2626" />
                    <Text style={styles.sectionTitle}>{t('bag.freeDeliveryTitle')}</Text>
                  </View>
                }
                headerRight={
                  cartSummary.hasFreeShipping ? (
                    <View style={styles.progressRightRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                      <Text style={[styles.progressRightText, styles.progressRightTextMet]}>{t('common.free')}</Text>
                    </View>
                  ) : (
                    <Text style={styles.progressRightText}>{t('bag.promoRemainingAed', { amount: freeDeliveryRemaining.toFixed(2) })}</Text>
                  )
                }
                progress={freeDeliveryProgress}
                met={!!cartSummary.hasFreeShipping}
                style={styles.progressCard}
              >
                <Text style={styles.deliveryHintText}>{t('bag.freeDeliveryHint', { amount: freeShippingThreshold })}</Text>
              </ProgressCard>
            </View>
          </>
        }
      />

      {/* Checkout Footer - Fixed at bottom */}
      <View
        style={styles.checkoutFooter}
        onLayout={(e) => {
          const h = e?.nativeEvent?.layout?.height;
          if (typeof h === 'number' && Number.isFinite(h) && h > 0) {
            setFooterHeight(h);
          }
        }}
      >
        <SafeAreaView edges={['bottom']}>
        <CollapsibleFooter
          collapsed={footerCollapsed}
          onToggle={() => setFooterCollapsed((v) => !v)}
          // Keep current Bag chevron behavior (collapsed shows chevron-up)
          chevronCollapsedName="chevron-up"
          chevronExpandedName="chevron-down"
          contentStyle={styles.summaryContainer}
          chevronButtonStyle={styles.footerChevronBtn}
          details={
            <>
              {/* Waterfall Discount Breakdown */}
              {waterfall.hasAnyDiscount ? (
                <>
                  {/* Retail Price (strikethrough) */}
                  <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                    <Text style={[styles.summaryLabel, isRTL && styles.summaryLabelRTL]}>
                      {t('checkout.retailPrice')} ({cartSummary.itemCount} {cartSummary.itemCount === 1 ? t('checkout.item') : t('checkout.items')})
                    </Text>
                    <Text style={[styles.summaryValue, styles.summaryOriginalValue, styles.summaryValueStrikethrough, isRTL && styles.summaryValueRTL]}>
                      {waterfall.retailTotal.toFixed(2)} AED
                    </Text>
                  </View>

                  {/* VIP / User Discount */}
                  {waterfall.hasUserDiscount && (
                    <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                      <Text style={[styles.summaryLabelDiscount, isRTL && styles.summaryLabelRTL]}>
                        {t('checkout.yourDiscount')}{waterfall.userDiscountPct > 0 ? ` (${Math.round(waterfall.userDiscountPct)}%)` : ''}
                      </Text>
                      <Text style={[styles.summaryValueDiscountPurple, isRTL && styles.summaryValueRTL]}>
                        -{waterfall.userDiscountTotal.toFixed(2)} AED
                      </Text>
                    </View>
                  )}

                  {/* Intermediate Subtotal (only when both VIP + Bundle) */}
                  {waterfall.hasUserDiscount && waterfall.hasBundleDiscount && (
                    <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                      <Text style={[styles.summaryLabelIntermediate, isRTL && styles.summaryLabelRTL]}>
                        {t('checkout.intermediateSubtotal')}
                      </Text>
                      <Text style={[styles.summaryValueIntermediate, isRTL && styles.summaryValueRTL]}>
                        {waterfall.afterVipSubtotal.toFixed(2)} AED
                      </Text>
                    </View>
                  )}

                  {/* Bundle Discount */}
                  {waterfall.hasBundleDiscount && (
                    <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                      <Text style={[styles.summaryLabelBundle, isRTL && styles.summaryLabelRTL]}>
                        {t('checkout.bundleDiscount')}{waterfall.bundleDiscountPct > 0 ? ` (${Math.round(waterfall.bundleDiscountPct)}%)` : ''}
                      </Text>
                      <Text style={[styles.summaryValueBundle, isRTL && styles.summaryValueRTL]}>
                        -{waterfall.bundleDiscountTotal.toFixed(2)} AED
                      </Text>
                    </View>
                  )}

                  {/* Net Subtotal */}
                  <View style={styles.waterfallDivider} />
                  <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                    <Text style={[styles.summaryLabelBold, isRTL && styles.summaryLabelRTL]}>
                      {t('checkout.netSubtotal')}
                    </Text>
                    <Text style={[styles.summaryValueBold, isRTL && styles.summaryValueRTL]}>
                      {safeSubtotal.toFixed(2)} AED
                    </Text>
                  </View>
                </>
              ) : (
                <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                  <Text style={[styles.summaryLabel, isRTL && styles.summaryLabelRTL]}>{t('checkout.subtotal')}</Text>
                  <Text style={[styles.summaryValue, isRTL && styles.summaryValueRTL]}>{safeSubtotal.toFixed(2)} AED</Text>
                </View>
              )}

              {/* Shipping */}
              <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                <Text style={[styles.summaryLabel, isRTL && styles.summaryLabelRTL]}>
                  {t('checkout.shippingTo', { emirate: formatEmirateLabel(t, selectedEmirate) })}
                </Text>
                <Text style={[styles.summaryValue, isRTL && styles.summaryValueRTL, cartSummary.hasFreeShipping && styles.freeText]}>
                  {cartSummary.hasFreeShipping ? t('common.free') : `${safeShipping.toFixed(2)} AED`}
                </Text>
              </View>

              {/* Free Shipping banner */}
              {cartSummary.hasFreeShipping && (
                <View style={styles.freeShippingBannerGreen}>
                  <Ionicons name="checkmark-circle" size={14} color="#27AE60" style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }} />
                  <Text style={[styles.freeShippingTextGreen, isRTL && styles.summaryLabelRTL]}>
                    {t('checkout.freeShippingApplied')}
                  </Text>
                </View>
              )}

              {/* VAT */}
              <View style={[styles.summaryRow, isRTL && styles.summaryRowRTL]}>
                <Text style={[styles.summaryLabel, isRTL && styles.summaryLabelRTL]}>{t('checkout.vatIncluded')}</Text>
                <Text style={[styles.summaryValue, isRTL && styles.summaryValueRTL]}>{safeVat.toFixed(2)} AED</Text>
              </View>
              <Text style={[styles.vatNoteRed, isRTL && styles.summaryLabelRTL]}>
                {t('checkout.allPricesVatInclusive')}
              </Text>

              <View style={styles.divider} />
            </>
          }
          always={
            <>
              <View style={[styles.totalRow, isRTL && styles.totalRowRTL]}>
                <Text style={[styles.totalLabel, isRTL && styles.totalLabelRTL]}>
                  {t('bag.totalLine', {
                    count: cartSummary.itemCount,
                    label: cartSummary.itemCount === 1 ? t('bag.item') : t('bag.items'),
                  })}
                </Text>
                <Text style={[styles.totalAmount, isRTL && styles.totalAmountRTL]}>{safeTotal.toFixed(2)} AED</Text>
              </View>

              {/* You Saved banner (after total) */}
              {waterfall.hasAnyDiscount && waterfall.totalSaved > 0 && (
                <View style={styles.youSavedBanner}>
                  <Text style={styles.youSavedText}>
                    🎉 {t('checkout.youSaved')}: AED {waterfall.totalSaved.toFixed(2)}
                  </Text>
                </View>
              )}
            </>
          }
        />
        
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>{t('bag.proceedToCheckout')}</Text>
        </TouchableOpacity>
        </SafeAreaView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    backgroundColor: '#ffffff',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 8,
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerCenterAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInline: {
    ...T.sectionTitle,
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  clearButton: {
    paddingVertical: 8,
    paddingLeft: 8,
  },
  title: {
    ...T.sectionTitle,
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    ...T.caption,
    fontSize: 14,
    textAlign: 'center',
  },
  clearText: {
    ...T.button,
    color: '#dc2626',
  },
  // Layout Sections
  itemsList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    // paddingBottom is computed dynamically from the footer height (see ScrollView contentContainerStyle)
  },

  // New sections (Promotion + Free Delivery)
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    ...T.sectionTitleSmall,
  },
  progressCard: {
    marginBottom: 12,
  },
  progressRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressRightText: {
    ...T.label,
    fontWeight: '700',
    color: '#6B7280',
  },
  progressRightTextMet: {
    color: '#34C759',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  rewardImagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardImage: {
    width: 64,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  rewardImageSmall: {
    width: 46,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  rewardText: {
    ...T.body,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: undefined,
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  deliveryHintText: {
    ...T.label,
    color: '#6B7280',
    marginTop: 2,
  },
  
  
  // Free Shipping Banner (green, inside waterfall)
  freeShippingBannerGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  freeShippingTextGreen: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#27AE60',
  },
  vatNoteRed: {
    ...T.captionTiny,
    color: '#dc2626',
    paddingVertical: 2,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cartItemRTL: {
    flexDirection: 'row-reverse',
  },
  itemImageContainer: {
    width: 80,
    height: 96,
    marginEnd: 16,
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
  },
  itemImageSize: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 6,
    textAlign: 'center',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#dc2626',
  },
  itemDetails: {
    flex: 1,
    marginEnd: 12,
  },
  itemRightActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemName: {
    ...T.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: 18,
    marginBottom: 4,
  },
  itemCategory: {
    ...T.caption,
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    ...T.price,
    marginBottom: 12,
  },
  promoItemPriceRight: {
    ...T.price,
    fontWeight: '900',
    color: '#27AE60',
  },
  promoQtyRight: {
    ...T.captionSmall,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  promoTag: {
    ...T.captionTiny,
    fontWeight: '800',
    color: '#27AE60',
    marginTop: 4,
    textAlign: 'right',
  },
  
  // Variants Display
  variantsContainer: {
    marginBottom: 8,
  },
  variantText: {
    ...T.captionSmall,
    marginBottom: 2,
  },
  variantSelectorWrap: {
    marginBottom: 6,
  },
  variantSelectorLabel: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 3,
  },
  variantChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  variantChip: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    backgroundColor: '#ffffff',
  },
  variantChipSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#FFF5F5',
  },
  variantChipSizeSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  variantChipText: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#374151',
  },
  variantChipTextSelected: {
    color: '#dc2626',
    fontWeight: '700',
  },
  variantChipTextSizeSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  
  // Enhanced Price Display
  itemPriceContainer: {
    marginBottom: 12,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  itemOriginalPrice: {
    ...T.priceStrikethrough,
  },
  itemDiscountedPrice: {
    ...T.priceDiscount,
  },
  itemBundleLabel: {
    ...T.captionTiny,
    fontWeight: '700',
    color: '#27AE60',
  },
  itemDiscountLabel: {
    ...T.captionTiny,
    fontWeight: '700',
    color: '#27AE60',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    ...T.body,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: undefined,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContainerTop: {
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyUniImage: {
    width: 240,
    height: 240,
  },
  emptyTitle: {
    ...T.sectionTitle,
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    ...T.body,
    color: '#86868B',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    ...T.button,
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  
  // Enhanced Summary
  summaryContainer: {
    marginTop: 4,
    marginBottom: 16,
    position: 'relative',
    paddingEnd: 40,
  },
  footerChevronBtn: {
    position: 'absolute',
    end: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    ...T.summaryLabel,
    color: '#86868B',
  },
  summaryValue: {
    ...T.summaryValue,
  },
  summaryOriginalValue: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
    fontWeight: '500',
  },
  // Waterfall discount breakdown styles
  summaryValueStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  summaryLabelDiscount: {
    ...T.summaryValue,
    color: '#7C3AED',
  },
  summaryValueDiscountPurple: {
    ...T.summaryValue,
    color: '#7C3AED',
  },
  summaryLabelIntermediate: {
    ...T.captionSmall,
    color: '#9CA3AF',
  },
  summaryValueIntermediate: {
    ...T.captionSmall,
    color: '#9CA3AF',
  },
  summaryLabelBundle: {
    ...T.summaryValue,
    color: '#16A34A',
  },
  summaryValueBundle: {
    ...T.summaryValue,
    color: '#16A34A',
  },
  waterfallDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  summaryLabelBold: {
    ...T.summaryValue,
    fontWeight: '700',
  },
  summaryValueBold: {
    ...T.summaryValue,
    fontWeight: '700',
  },
  youSavedBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
    alignItems: 'center',
  },
  youSavedText: {
    ...T.captionSmall,
    fontWeight: '700',
    color: '#15803D',
  },
  freeText: {
    color: '#34C759',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    ...T.totalLabel,
    fontSize: 16,
    color: '#86868B',
    fontWeight: '500',
  },
  totalAmount: {
    ...T.totalValue,
  },
  checkoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    ...T.button,
  },
  

  // RTL Support Styles
  itemDetailsRTL: {
    alignItems: 'flex-end',
  },
  itemNameRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  itemCategoryRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  variantsContainerRTL: {
    alignItems: 'flex-end',
  },
  variantTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  itemPriceContainerRTL: {
    alignItems: 'flex-end',
  },
  itemOriginalPriceRTL: {
    textAlign: 'right',
  },
  itemDiscountLabelRTL: {
    textAlign: 'right',
  },
  itemBundleLabelRTL: {
    textAlign: 'right',
  },
  itemDiscountedPriceRTL: {
    textAlign: 'right',
  },
  promoTagRTL: {
    textAlign: 'right',
  },
  itemPriceRTL: {
    textAlign: 'right',
  },
  itemRightActionsRTL: {
    alignItems: 'flex-start',
  },
  quantityContainerRTL: {
    flexDirection: 'row-reverse',
  },
  quantityTextRTL: {
    textAlign: 'center',
  },
  promoQtyRightRTL: {
    textAlign: 'left',
  },
  promoItemPriceRightRTL: {
    textAlign: 'left',
  },
  headerTopRTL: {
    flexDirection: 'row-reverse',
  },
  backButtonRTL: {
    flexDirection: 'row-reverse',
  },
  titleInlineRTL: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  clearButtonRTL: {
    alignItems: 'flex-start',
  },
  clearTextRTL: {
    textAlign: 'left',
  },
  sectionCardRTL: {
    // Important: keep children stretched full-width; use per-row RTL styles instead.
    alignItems: 'stretch',
  },
  sectionTitleRowRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitleLeftRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
    marginLeft: 0,
    marginRight: 8,
  },
  // Empty state RTL
  emptyTitleRTL: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  emptyTextRTL: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  shopButtonTextRTL: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  rewardRowRTL: {
    flexDirection: 'row-reverse',
  },
  rewardImagesRowRTL: {
    flexDirection: 'row-reverse',
  },
  rewardTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  // Footer RTL support
  summaryRowRTL: {
    flexDirection: 'row-reverse',
  },
  summaryLabelRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryValueRTL: {
    textAlign: 'left',
  },
  totalRowRTL: {
    flexDirection: 'row-reverse',
  },
  totalLabelRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  totalAmountRTL: {
    textAlign: 'left',
  },
});
