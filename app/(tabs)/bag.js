import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { isBeautyBoxProduct, isHydroCoolMask, isUserDiscountExcludedProduct, getCanonicalUnitPrice, hasFixedPriceOverride, isDeviceProduct } from '../../utils/productRules';
import { useLocalization } from '../../contexts/LocalizationContext';
import { getLocalizedProductName, getCategoryTranslationKey } from '../../utils/productLocalization';

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
    setSelectedEmirate,
    getAvailableEmirates,
    reloadShippingRates,
    isLoading
  } = useCart();
  
  const [showEmirateModal, setShowEmirateModal] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

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
        'Login Required',
        'Please login to proceed with checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/auth/login') }
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

  const handleEmirateSelect = (emirate) => {
    setSelectedEmirate(emirate.name);
    setShowEmirateModal(false);
  };

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

            <View style={styles.promoHeaderBlock}>
              <Text style={styles.promoTitle}>{t('bag.freeMaskPromotion')}</Text>
              <View style={styles.promoRow}>
                <Text style={styles.promoLine}>{t('bag.promo500')}</Text>
                <Ionicons
                  name={promo500Met ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={promo500Met ? '#27AE60' : '#C7C7CC'}
                />
              </View>
              <View style={styles.promoRow}>
                <Text style={styles.promoLine}>{t('bag.promo700')}</Text>
                <Ionicons
                  name={promo700Met ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={promo700Met ? '#27AE60' : '#C7C7CC'}
                />
              </View>
              {promoTier !== 'none' ? (
                <Text style={styles.promoApplied}>
                  {promoTier === 'twoMasks'
                    ? t('bag.promoApplied2')
                    : t('bag.promoApplied1')}
                </Text>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
      
      {/* Items List - Scrollable content with proper bottom padding */}
      <Animated.ScrollView 
        style={styles.itemsList} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={[
          styles.scrollContent,
          // Ensure scroll content starts below the collapsing header.
          { paddingTop: scrollPaddingTop + 12 },
          // Ensure last item can scroll above the fixed checkout footer on all devices.
          { paddingBottom: Math.max(footerHeight + 24, 240) },
        ]}
      >
        {/* Emirates Selection */}
        <TouchableOpacity 
          style={styles.emirateSelector}
          onPress={() => setShowEmirateModal(true)}
        >
          <View style={styles.emirateSelectorContent}>
            <View style={styles.emirateIcon}>
              <Ionicons name="location-outline" size={20} color="#E74C3C" />
            </View>
            <View style={styles.emirateInfo}>
              <Text style={styles.emirateLabel}>{t('bag.deliveryTo')}</Text>
              <Text style={styles.emirateValue}>{selectedEmirate}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#86868B" />
          </View>
        </TouchableOpacity>

        {/* Free Shipping Banner */}
        {cartSummary.amountForFreeShipping > 0 && (
          <View style={styles.freeShippingBanner}>
            <Text style={styles.freeShippingText}>
              Add {cartSummary.amountForFreeShipping.toFixed(2)} AED more for FREE shipping!
            </Text>
          </View>
        )}

        {/* Cart Items */}
        {items.map((item, index) => {
          const itemKey = `${item.product.id}-${item.selectedColor}-${item.selectedSize}`;
          const imageUrl = item.product.image ? `https://genosys.ae${item.product.image}` : null;
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
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Text style={styles.placeholderText}>
                      {item.product.name?.charAt(0) || 'G'}
                    </Text>
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
                  <Text style={styles.itemName} numberOfLines={2}>{getLocalizedProductName(item.product, locale) || item.product.name}</Text>
                </TouchableOpacity>
                <Text style={styles.itemCategory}>
                  {getCategoryTranslationKey(item.product.category) ? t(getCategoryTranslationKey(item.product.category)) : item.product.category}
                </Text>
                
                {/* Variants Display */}
                {!promo && (item.selectedSize || item.selectedColor) && (
                  <View style={styles.variantsContainer}>
                    {item.selectedSize && (
                      <Text style={styles.variantText}>Size: {item.selectedSize}</Text>
                    )}
                    {item.selectedColor && (
                      <Text style={styles.variantText}>Color: {item.selectedColor}</Text>
                    )}
                  </View>
                )}

                {/* Price with Discount Display */}
                {promo ? (
                  <View style={styles.itemPriceContainer}>
                    <Text style={styles.itemOriginalPrice}>
                      {(Number(item.product?.originalPrice) || 0).toFixed(2)} AED
                    </Text>
                    <Text style={styles.itemDiscountLabel}>{t('bag.discount100')}</Text>
                    <Text style={styles.promoTag}>{t('bag.promotionTag')}</Text>
                  </View>
                ) : (() => {
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

                  // Hydro Cool Mask: ignore any user discount; keep base price as-is
                  if (isHydro || isDevice || isFixed) {
                    return (
                      <Text style={styles.itemPrice}>{(Number.isFinite(base) ? base : 0).toFixed(2)} AED</Text>
                    );
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
                    {pctLabel ? (
                      <Text style={styles.itemDiscountLabel}>{pctLabel}% OFF</Text>
                    ) : null}
                    <Text style={styles.itemDiscountedPrice}>{discounted.toFixed(2)} AED</Text>
                  </View>
                    );
                  }

                  return (
                    <Text style={styles.itemPrice}>{(Number.isFinite(base) ? base : 0).toFixed(2)} AED</Text>
                  );
                })()}
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
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item, 1)}
                    >
                      <Ionicons name="add" size={16} color="#000000" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

      </Animated.ScrollView>

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
        <View style={styles.summaryContainer}>
          {Number.isFinite(discountPct) && discountPct > 0 && discountAmount > 0.01 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('bag.subtotalBeforeDiscount')}</Text>
                <Text style={[styles.summaryValue, styles.summaryOriginalValue]}>
                  {Number(originalSubtotal).toFixed(2)} AED
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Discount{' '}
                  <Text style={styles.discountPctGreen}>{`(${discountPct}% OFF)`}</Text>
                </Text>
                <Text style={styles.summaryDiscountValue}>
                  -{discountAmount.toFixed(2)} AED
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('checkout.subtotal')}</Text>
                <Text style={styles.summaryValue}>{safeSubtotal.toFixed(2)} AED</Text>
              </View>
            </>
          )}
          
          {!(Number.isFinite(discountPct) && discountPct > 0 && discountAmount > 0.01) && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.subtotal')}</Text>
              <Text style={styles.summaryValue}>{safeSubtotal.toFixed(2)} AED</Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping to {selectedEmirate}</Text>
            <Text style={[styles.summaryValue, cartSummary.hasFreeShipping && styles.freeText]}>
              {cartSummary.hasFreeShipping ? 'FREE' : `${safeShipping.toFixed(2)} AED`}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('bag.vatIncluded')}</Text>
            <Text style={styles.summaryValue}>{safeVat.toFixed(2)} AED</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total ({cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'})</Text>
            <Text style={styles.totalAmount}>{safeTotal.toFixed(2)} AED</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>{t('bag.proceedToCheckout')}</Text>
        </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Emirates Selection Modal */}
      <Modal
        visible={showEmirateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('bag.selectEmirate')}</Text>
            <TouchableOpacity 
              onPress={() => setShowEmirateModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#1D1D1F" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={emirates}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.emirateOption,
                  selectedEmirate === item.name && styles.selectedEmirateOption
                ]}
                onPress={() => handleEmirateSelect(item)}
              >
                <View style={styles.emirateOptionContent}>
                  <Text style={[
                    styles.emirateOptionName,
                    selectedEmirate === item.name && styles.selectedEmirateText
                  ]}>
                    {item.name}
                  </Text>
                  <Text style={styles.emirateShippingCost}>
                    {item.shippingCost === 0 ? 'FREE shipping' : `${item.shippingCost} AED shipping`}
                  </Text>
                </View>
                {selectedEmirate === item.name && (
                  <Ionicons name="checkmark" size={20} color="#E74C3C" />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
