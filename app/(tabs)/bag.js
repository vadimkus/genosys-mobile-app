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
import { router } from 'expo-router';
import { isBeautyBoxProduct, isHydroCoolMask, isUserDiscountExcludedProduct, getCanonicalUnitPrice, hasFixedPriceOverride, isDeviceProduct } from '../../utils/productRules';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getCategoryTranslationKey, normalizeCategoryCanonical } from '../../utils/productLocalization';
import AUTH_CONFIG from '../../config/auth';

export default function BagScreen() {
  const { user } = useAuth();
  const { t, locale } = useLocalization();
  const { 
    items, 
    getTotalItems, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getCartSummary,
    selectedEmirate,
    getAvailableEmirates,
    reloadShippingRates,
    isLoading
  } = useCart();
  
  const [footerHeight, setFooterHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerCollapsed, setFooterCollapsed] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  const cartSummary = getCartSummary();
  const emirates = getAvailableEmirates();
  const paidItemCount = getTotalItems();

  const isPromoItem = (item) => item?.isPromotionItem === true || item?.selectedSize === '__PROMO__';
  const promoSubtotal = Number(cartSummary.subtotal) || 0;
  const promoTier =
    promoSubtotal >= 700 ? 'twoMasks'
      : promoSubtotal >= 500 ? 'collagen'
        : 'none';
  const promo500Met = promoSubtotal >= 500;
  const promo700Met = promoSubtotal >= 700;

  const headerTranslateY = useMemo(() => {
    const h = Math.max(1, headerHeight);
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

  const deliveryEtaText =
    String(selectedEmirate || '').trim().toLowerCase() === 'dubai'
      ? t('checkout.deliveryEtaDubai')
      : t('checkout.deliveryEtaOther');
  const deliveryCostText = cartSummary.hasFreeShipping ? t('common.free') : `${safeShipping.toFixed(2)} AED`;

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

  const originalSubtotal = (() => {
    if (!Number.isFinite(discountPct) || discountPct <= 0 || discountPct >= 100) return null;
    const multiplier = 1 - discountPct / 100;
    if (multiplier <= 0) return null;
    const sum = items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0;
      const explicitOriginal = Number(item.product?.originalPrice);
      const base = Number(item.product?.displayPrice ?? item.product?.price ?? 0) || 0;
      // Discount-excluded products (Beauty Boxes, Hydro Cool Mask): ignore user discount
      if (isUserDiscountExcludedProduct(item.product)) {
        // Canonical-price products should always use canonical/base price (e.g. Hydro Cool, Devices)
        if (isHydroCoolMask(item.product) || isDeviceProduct(item.product) || hasFixedPriceOverride(item.product)) {
          return acc + getCanonicalUnitPrice(item.product) * qty;
        }
        return acc + base * qty;
      }
      const orig = Number.isFinite(explicitOriginal) && explicitOriginal > 0
        ? explicitOriginal
        : (base / multiplier);
      return acc + (Number.isFinite(orig) ? orig : base) * qty;
    }, 0);
    return Number.isFinite(sum) ? sum : null;
  })();

  const discountAmount = originalSubtotal && originalSubtotal > safeSubtotal
    ? Math.max(0, originalSubtotal - safeSubtotal)
    : 0;

  // Refresh DB-driven shipping rates when opening bag
  useEffect(() => {
    reloadShippingRates?.();
  }, []);

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    updateQuantity(item.product.id, newQuantity, item.selectedColor, item.selectedSize);
  };

  const handleRemoveItem = (item) => {
    removeItem(item.product.id, item.selectedColor, item.selectedSize);
  };

  const handleCheckout = () => {
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
      const imageUrl = item.product.image ? `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${item.product.image}` : null;
      const rawSizeLabel = item.selectedSize || item.product?.size || '';
      const sizeLabel = rawSizeLabel === '__PROMO__' ? (item.product?.size || '') : rawSizeLabel;
      const promo = isPromoItem(item);

      return (
        <View key={itemKey} style={styles.cartItem}>
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

          <View style={styles.itemDetails}>
            <TouchableOpacity onPress={() => (promo ? null : router.push(`/product/${item.product.id}`))} disabled={promo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {getLocalizedProductName(item.product, locale) || item.product.name}
              </Text>
            </TouchableOpacity>
            <Text style={styles.itemCategory}>
              {(() => {
                const canon = normalizeCategoryCanonical(item.product.category) || item.product.category;
                const key = getCategoryTranslationKey(canon);
                return key ? t(key) : canon;
              })()}
            </Text>

            {/* Variants Display */}
            {!promo && (item.selectedSize || item.selectedColor) && (
              <View style={styles.variantsContainer}>
                {item.selectedSize && (
                  <Text style={styles.variantText}>
                    {t('common.size')}: {item.selectedSize}
                  </Text>
                )}
                {item.selectedColor && (
                  <Text style={styles.variantText}>
                    {t('common.color')}: {item.selectedColor}
                  </Text>
                )}
              </View>
            )}

            {/* Price with Discount Display */}
            {promo ? (
              <View style={styles.itemPriceContainer}>
                <Text style={styles.itemOriginalPrice}>{(Number(item.product?.originalPrice) || 0).toFixed(2)} AED</Text>
                <Text style={styles.itemDiscountLabel}>{t('bag.discount100')}</Text>
                <Text style={styles.promoTag}>{t('bag.promotionTag')}</Text>
              </View>
            ) : (
              (() => {
                const pct = Number(user?.discountPercentage);
                const hasUserDiscount = Number.isFinite(pct) && pct > 0 && pct < 100;
                const isHydro = isHydroCoolMask(item.product);
                const isFixed = hasFixedPriceOverride(item.product);
                const isDevice = isDeviceProduct(item.product);
                const base = (isHydro || isDevice || isFixed)
                  ? getCanonicalUnitPrice(item.product)
                  : Number(item.product?.displayPrice || item.product?.price || 0);
                const original = Number(item.product?.originalPrice);
                const isBeautyBox = isBeautyBoxProduct(item.product);

                // Beauty Boxes: show bundle discount (15%) explicitly, ignore user discount
                if (isBeautyBox && Number.isFinite(base) && base > 0) {
                  const fullPrice = (Number.isFinite(original) && original > base)
                    ? original
                    : (base / 0.85); // bundle is 15% off

                  return (
                    <View style={styles.itemPriceContainer}>
                      <Text style={styles.itemOriginalPrice}>{fullPrice.toFixed(2)} AED</Text>
                      <Text style={styles.itemBundleLabel}>{t('bag.bundleDiscount15')}</Text>
                      <Text style={styles.itemDiscountedPrice}>{base.toFixed(2)} AED</Text>
                    </View>
                  );
                }

                // Hydro Cool Mask / Devices / Fixed: ignore any user discount; keep base price as-is
                if (isHydro || isDevice || isFixed) {
                  return <Text style={styles.itemPrice}>{(Number.isFinite(base) ? base : 0).toFixed(2)} AED</Text>;
                }

                const discounted = !isBeautyBox && hasUserDiscount && Number.isFinite(original) && original > 0
                  ? original * (1 - pct / 100)
                  : base;

                if (Number.isFinite(original) && original > 0 && Number.isFinite(discounted) && discounted > 0 && original !== discounted) {
                  const pctFromPrices = original ? Math.round((1 - discounted / original) * 100) : null;
                  const pctLabel =
                    (Number.isFinite(pctFromPrices) && pctFromPrices > 0 && pctFromPrices < 100 && pctFromPrices) ||
                    (hasUserDiscount ? Math.round(pct) : null);
                  return (
                    <View style={styles.itemPriceContainer}>
                      <Text style={styles.itemOriginalPrice}>{original.toFixed(2)} AED</Text>
                      {pctLabel ? <Text style={styles.itemDiscountLabel}>{pctLabel}% OFF</Text> : null}
                      <Text style={styles.itemDiscountedPrice}>{discounted.toFixed(2)} AED</Text>
                    </View>
                  );
                }

                return <Text style={styles.itemPrice}>{(Number.isFinite(base) ? base : 0).toFixed(2)} AED</Text>;
              })()
            )}
          </View>

          {promo ? (
            <View style={styles.itemRightActions}>
              <Text style={styles.promoQtyRight}>Qty {item.quantity || 1}</Text>
              <Text style={styles.promoItemPriceRight}>{t('common.free')}</Text>
            </View>
          ) : (
            <View style={styles.itemRightActions}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(item, -1)}
                  disabled={item.quantity <= 1}
                >
                  <Ionicons name="remove" size={16} color="#000000" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(item, 1)}>
                  <Ionicons name="add" size={16} color="#000000" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item)}>
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [getCategoryTranslationKey, handleQuantityChange, handleRemoveItem, isPromoItem, locale, t, user]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
                <Text style={styles.backText}>{t('tabs.home')}</Text>
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
          <Ionicons name="bag-outline" size={64} color="#D1D1D6" />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
                <Text style={styles.backText}>{t('tabs.home')}</Text>
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.title}>{t('bag.title')}</Text>
                <Text style={styles.subtitle}>{t('bag.selectedProducts')}</Text>
              </View>
              
              <View style={styles.headerRight} />
            </View>
          </View>
        </SafeAreaView>
        
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="bag-outline" size={64} color="#D1D1D6" />
          </View>
          <Text style={styles.emptyTitle}>{t('bag.emptyTitle')}</Text>
          <Text style={styles.emptyText}>
            {t('bag.emptyText')}
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Text style={styles.shopButtonText}>{t('bag.startShopping')}</Text>
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
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#1D1D1F" />
                <Text style={styles.backText}>{t('tabs.home')}</Text>
              </TouchableOpacity>

              <View pointerEvents="none" style={styles.headerCenterAbsolute}>
                <Text style={styles.titleInline}>
                  {t('bag.header', {
                    count: paidItemCount,
                    label: paidItemCount === 1 ? t('bag.item') : t('bag.items'),
                  })}
                </Text>
              </View>

              <TouchableOpacity onPress={handleClearBag} style={styles.clearButton}>
                <Text style={styles.clearText}>{t('bag.clear')}</Text>
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
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <Ionicons name="gift-outline" size={18} color="#E74C3C" />
                  <Text style={styles.sectionTitle}>{t('bag.freeMaskPromotion')}</Text>
                </View>
                <Text style={styles.sectionSubtle}>{t('bag.promoValidUntil', { date: '01/01/2026' })}</Text>
              </View>

              <ProgressCard
                leftText={t('bag.promoSpendAed', { amount: 500 })}
                rightText={promo500Met ? '✓' : t('bag.promoRemainingAed', { amount: promo500Remaining.toFixed(2) })}
                rightTextMet={promo500Met}
                progress={promo500Progress}
                met={promo500Met}
                style={styles.progressCard}
              >
                <View style={styles.rewardRow}>
                  <Image source={{ uri: promoCollagenImage }} style={styles.rewardImage} resizeMode="cover" />
                  <Text style={styles.rewardText}>{t('bag.promoReward1')}</Text>
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
                <View style={styles.rewardRow}>
                  <View style={styles.rewardImagesRow}>
                    <Image source={{ uri: promoSeaAlgaeImage }} style={styles.rewardImageSmall} resizeMode="cover" />
                    <Image source={{ uri: promoCollagenImage }} style={styles.rewardImageSmall} resizeMode="cover" />
                  </View>
                  <Text style={styles.rewardText}>{t('bag.promoReward2')}</Text>
                </View>
              </ProgressCard>
            </View>

            {/* Free Delivery (Progress UI) */}
            <View style={styles.sectionCard}>
              <ProgressCard
                headerLeft={
                  <View style={styles.sectionTitleLeft}>
                    <Ionicons name="car-outline" size={18} color="#E74C3C" />
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
              {Number.isFinite(discountPct) && discountPct > 0 && discountAmount > 0.01 ? (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('bag.subtotalBeforeDiscount')}</Text>
                    <Text style={[styles.summaryValue, styles.summaryOriginalValue]}>
                      {Number(originalSubtotal).toFixed(2)} AED
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      {t('bag.discountLabel')}{' '}
                      <Text style={styles.discountPctGreen}>{`(${discountPct}% OFF)`}</Text>
                    </Text>
                    <Text style={styles.summaryDiscountValue}>-{discountAmount.toFixed(2)} AED</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{t('checkout.subtotal')}</Text>
                    <Text style={styles.summaryValue}>{safeSubtotal.toFixed(2)} AED</Text>
                  </View>
                </>
              ) : (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('checkout.subtotal')}</Text>
                  <Text style={styles.summaryValue}>{safeSubtotal.toFixed(2)} AED</Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('checkout.shippingTo', { emirate: selectedEmirate })}</Text>
                <Text style={[styles.summaryValue, cartSummary.hasFreeShipping && styles.freeText]}>
                  {cartSummary.hasFreeShipping ? t('common.free') : `${safeShipping.toFixed(2)} AED`}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('checkout.vatIncluded')}</Text>
                <Text style={styles.summaryValue}>{safeVat.toFixed(2)} AED</Text>
              </View>

              <View style={styles.divider} />
            </>
          }
          always={
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {t('bag.totalLine', {
                  count: cartSummary.itemCount,
                  label: cartSummary.itemCount === 1 ? t('bag.item') : t('bag.items'),
                })}
              </Text>
              <Text style={styles.totalAmount}>{safeTotal.toFixed(2)} AED</Text>
            </View>
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
  backText: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '400',
    marginLeft: 4,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.4,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 2,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '400',
    textAlign: 'center',
  },
  promoHeaderBlock: {
    marginTop: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 2,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  promoLine: {
    flex: 1,
    fontSize: 12,
    color: '#3C3C43',
  },
  promoApplied: {
    marginTop: 8,
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '700',
  },
  clearText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  sectionSubtle: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '700',
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
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
  },
  progressRightTextMet: {
    color: '#34C759',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '600',
  },
  deliveryHintText: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  
  // Emirates Selection
  emirateSelector: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emirateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emirateIcon: {
    marginRight: 12,
  },
  emirateInfo: {
    flex: 1,
  },
  deliveryInfoLine: {
    marginTop: 4,
    fontSize: 12,
    color: '#86868B',
    fontWeight: '600',
  },
  deliveryCostValue: {
    color: '#1D1D1F',
    fontWeight: '800',
  },
  emirateLabel: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 2,
  },
  emirateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  
  // Free Shipping Banner
  freeShippingBanner: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  freeShippingText: {
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '600',
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
  itemImageContainer: {
    width: 80,
    height: 96,
    marginRight: 16,
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
  },
  itemImageSize: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
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
    color: '#E74C3C',
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemRightActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemCategory: {
    fontSize: 14,
    color: '#86868B',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  promoItemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#27AE60',
    marginBottom: 12,
  },
  promoItemPriceRight: {
    fontSize: 16,
    fontWeight: '900',
    color: '#27AE60',
  },
  promoQtyRight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  promoTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#27AE60',
    marginTop: 2,
  },
  
  // Variants Display
  variantsContainer: {
    marginBottom: 8,
  },
  variantText: {
    fontSize: 12,
    color: '#86868B',
    marginBottom: 2,
  },
  
  // Enhanced Price Display
  itemPriceContainer: {
    marginBottom: 12,
  },
  itemOriginalPrice: {
    fontSize: 14,
    color: '#86868B',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  itemDiscountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
  },
  itemBundleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27AE60',
    marginTop: 2,
    marginBottom: 2,
  },
  itemDiscountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27AE60',
    marginTop: 2,
    marginBottom: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
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
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
    paddingRight: 40,
  },
  footerChevronBtn: {
    position: 'absolute',
    right: 0,
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
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  summaryOriginalValue: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
    fontWeight: '500',
  },
  summaryDiscountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E74C3C',
  },
  discountPctGreen: {
    color: '#27AE60',
    fontWeight: '700',
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
    fontSize: 16,
    color: '#86868B',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  checkoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Emirates Selection Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  modalCloseButton: {
    padding: 4,
  },
  emirateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedEmirateOption: {
    backgroundColor: '#E74C3C10',
  },
  emirateOptionContent: {
    flex: 1,
  },
  emirateOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  selectedEmirateText: {
    color: '#E74C3C',
  },
  emirateShippingCost: {
    fontSize: 14,
    color: '#86868B',
  },
});
