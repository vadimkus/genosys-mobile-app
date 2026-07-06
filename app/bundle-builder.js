/**
 * Bundle Builder Screen - Native (replaces WebView)
 * "Build Your Set" — 8-step skincare routine builder with tiered discounts.
 * Fetches products from /api/mobile/bundle-builder and adds to cart.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  FlatList,
  Animated,
  PanResponder,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, tint, shadow, surfaces } from '../utils/theme';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AUTH_CONFIG from '../config/auth';
import { getJson } from '../services/httpClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../utils/logger';
import { formatAed } from '../utils/pricingDisplay';

const log = createLogger('BundleBuilder');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const DISCOUNT_TIERS = [
  { minItems: 2, discount: 5 },
  { minItems: 3, discount: 10 },
  { minItems: 4, discount: 15 },
  { minItems: 5, discount: 20 },
];

function getDiscountForCount(count) {
  let discount = 0;
  for (const tier of DISCOUNT_TIERS) {
    if (count >= tier.minItems) discount = tier.discount;
  }
  return discount;
}

function getNextTier(count) {
  for (const tier of DISCOUNT_TIERS) {
    if (count < tier.minItems) return tier;
  }
  return null;
}

function getBundleRetailPrice(product) {
  const variants = (Array.isArray(product?.variants) ? product.variants : []).filter((variant) =>
    String(variant?.size || '').trim() || String(variant?.color || '').trim()
  );
  const explicitSize = String(product?.size || '').trim();
  const selectedVariant =
    (explicitSize && variants.find((variant) => String(variant?.size || '').trim() === explicitSize)) ||
    variants.find((variant) => variant?.isDefault) ||
    variants.find((variant) => variant?.available !== false) ||
    variants[0];
  const variantPrice = Number(selectedVariant?.price);

  // Bundle Builder must use the actual selectable retail price, not
  // pricing.basePrice/originalPrice from regular product discount contracts.
  if (Number.isFinite(variantPrice) && variantPrice > 0) return variantPrice;

  return Number(product?.displayPrice || product?.price || 0) || 0;
}

export default function BundleBuilderScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const { user } = useAuth();
  const { addBundleItems } = useCart();
  const isRTL = dir === 'rtl';
  const stepsScrollRef = useRef(null);
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState({}); // { [productId]: { product, stepId } }
  const [showSummary, setShowSummary] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState(false);

  // Animated values for swipable summary sheet
  const summaryTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Open / close summary with spring animation
  const openSummary = useCallback(() => {
    setShowSummary(true);
    Animated.spring(summaryTranslateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, []);
  const closeSummary = useCallback(() => {
    Animated.timing(summaryTranslateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(() => {
      setShowSummary(false);
    });
  }, []);

  // PanResponder for summary sheet drag-to-dismiss
  const summaryPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) summaryTranslateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) {
          closeSummary();
        } else {
          Animated.spring(summaryTranslateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
        }
      },
    })
  ).current;

  // Toggle footer expand/collapse with swipe
  const footerPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -30 || g.vy < -0.3) {
          // Swiped up → expand
          haptics.lightTap();
          setFooterExpanded(true);
        } else if (g.dy > 30 || g.vy > 0.3) {
          // Swiped down → collapse
          haptics.lightTap();
          setFooterExpanded(false);
        }
      },
    })
  ).current;

  // Fetch bundle data
  const fetchBundleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const data = await getJson(`${baseUrl}/api/mobile/bundle-builder`, {
        headers: {
          locale: locale || 'en',
          userId: user?.id,
        },
      });

      setSteps(data.steps || []);
    } catch (err) {
      log.warn('Failed to fetch bundle data:', err.message);
      setError(l('Failed to load products', 'فشل تحميل المنتجات', 'Не удалось загрузить товары'));
    } finally {
      setLoading(false);
    }
  }, [locale, user?.id]);

  useEffect(() => {
    fetchBundleData();
  }, [fetchBundleData]);

  // Selection helpers
  const selectedArray = Object.values(selectedItems);
  const itemCount = selectedArray.length;
  const discountPercent = getDiscountForCount(itemCount);
  const nextTier = getNextTier(itemCount);

  // Bundle pricing: bundle discount ONLY on retail price — NO VIP/user discount stacking
  const retailTotal = selectedArray.reduce((sum, item) => sum + getBundleRetailPrice(item.product), 0);
  const discountAmount = Math.round((retailTotal * discountPercent) / 100 * 100) / 100;
  const total = Math.round((retailTotal - discountAmount) * 100) / 100;
  const totalSaved = discountAmount;

  const toggleProduct = (product, stepId) => {
    haptics.lightTap();
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = { product, stepId };
      }
      return next;
    });
  };

  const isSelected = (productId) => !!selectedItems[productId];

  const getStepSelectionCount = (stepId) => {
    return selectedArray.filter(i => i.stepId === stepId).length;
  };

  const goToStep = (index) => {
    haptics.lightTap();
    setCurrentStep(index);
    // Scroll step indicator into view
    stepsScrollRef.current?.scrollToIndex?.({ index, animated: true, viewPosition: 0.5 });
  };

  const handleAddToCart = async () => {
    if (itemCount < 2) {
      Alert.alert(
        l('Minimum 2 Products', 'الحد الأدنى ٢ منتجات', 'Минимум 2 товара'),
        l('Add at least 2 products to get a bundle discount.', 'أضف منتجين على الأقل للحصول على خصم.', 'Добавьте минимум 2 товара для скидки.'),
      );
      return;
    }

    haptics.success();

    // Add selected products as one batch so the bundle tier is reconciled after
    // all items are present. Adding one-by-one can temporarily strip bundle flags.
    const bundleProducts = selectedArray.map(({ product }) => {
      // Bundle discount applied to retail price only
      const retailPrice = getBundleRetailPrice(product);

      // Build a cart-compatible product object
      return {
        ...product,
        id: product.id,
        productNumber: product.productNumber,
        name: product.name,
        price: retailPrice,
        displayPrice: retailPrice,
        originalPrice: null,
        bundleRetailPrice: retailPrice,
        image: product.image,
        category: product.category,
        size: product.size,
        variants: Array.isArray(product.variants) ? product.variants : [],
        pricing: product.pricing || null,
        inStock: true,
        fromBundle: true,
        bundleDiscountPercent: discountPercent,
      };
    });
    addBundleItems(bundleProducts, discountPercent);

    // Clear selection
    setSelectedItems({});

    // Navigate to bag
    await AsyncStorage.setItem('@genosys_nav_bag_source', JSON.stringify({ pathname: '/bundle-builder' })).catch(() => {});
    router.push('/(tabs)/bag');
  };

  const currentStepData = steps[currentStep];

  // Render product card
  const renderProductCard = ({ item: product }) => {
    const selected = isSelected(product.id);
    // No VIP discount shown in bundle builder — only retail price displayed

    return (
      <TouchableOpacity
        style={[styles.productCard, selected && styles.productCardSelected]}
        onPress={() => toggleProduct(product, currentStepData?.id)}
        activeOpacity={0.7}
      >
        {/* Selection indicator */}
        {selected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}

        {/* Product image */}
        <View style={styles.productImageWrap}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <Ionicons name="image-outline" size={32} color="#D1D5DB" />
          )}
        </View>

        {/* Product info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, isRTL && styles.textRTL]} numberOfLines={2}>{product.name}</Text>
          {product.description ? (
            <Text style={[styles.productDesc, isRTL && styles.textRTL]} numberOfLines={2}>{product.description}</Text>
          ) : null}
          {product.size ? <Text style={styles.productSize}>{product.size}</Text> : null}

          {/* Price — retail only, no VIP in bundle builder */}
          {user ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceMain}>
                {formatAed(getBundleRetailPrice(product))}
              </Text>
            </View>
          ) : (
            <Text style={styles.loginToSee}>{t('product.loginToSeePrice')}</Text>
          )}
        </View>

        {/* Add button */}
        <TouchableOpacity
          style={[styles.addBtn, selected && styles.addBtnSelected]}
          onPress={() => toggleProduct(product, currentStepData?.id)}
          activeOpacity={0.7}
        >
          <Ionicons name={selected ? 'checkmark' : 'add'} size={18} color={selected ? '#fff' : '#dc2626'} />
          <Text style={[styles.addBtnText, selected && styles.addBtnTextSelected]}>
            {selected ? l('Added', 'تم الإضافة', 'Добавлено') : l('Add', 'أضف', 'Добавить')}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // --- RENDER ---

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{l('Build Your Set', 'ابنِ مجموعتك', 'Собери свой набор')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>{l('Loading products...', 'جاري تحميل المنتجات...', 'Загрузка товаров...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{l('Build Your Set', 'ابنِ مجموعتك', 'Собери свой набор')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.loadingWrap}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchBundleData} activeOpacity={0.7}>
            <Text style={styles.retryBtnText}>{l('Try Again', 'حاول مجدداً', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{l('Build Your Set', 'ابنِ مجموعتك', 'Собери свой набор')}</Text>
        {itemCount > 0 ? (
          <TouchableOpacity onPress={() => showSummary ? closeSummary() : openSummary()} style={styles.cartBadgeBtn} activeOpacity={0.7}>
            <Ionicons name="bag-outline" size={22} color="#dc2626" />
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{itemCount}</Text></View>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      {/* Discount Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min((itemCount / 5) * 100, 100)}%` }]} />
          {/* Tier markers */}
          {DISCOUNT_TIERS.map((tier) => (
            <View key={tier.minItems} style={[styles.tierMarker, { left: `${(tier.minItems / 5) * 100}%` }]}>
              <View style={[styles.tierDot, itemCount >= tier.minItems && styles.tierDotActive]} />
            </View>
          ))}
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>0</Text>
          {DISCOUNT_TIERS.map((tier) => (
            <Text key={tier.minItems} style={[styles.progressLabel, itemCount >= tier.minItems && styles.progressLabelActive]}>
              {tier.minItems}={tier.discount}%
            </Text>
          ))}
        </View>
        {nextTier && itemCount > 0 && (
          <Text style={styles.nextTierHint}>
            {l(
              `Add ${nextTier.minItems - itemCount} more for ${nextTier.discount}% off!`,
              `أضف ${nextTier.minItems - itemCount} منتج لخصم ${nextTier.discount}%!`,
              `Ещё ${nextTier.minItems - itemCount} для скидки ${nextTier.discount}%!`
            )}
          </Text>
        )}
        {discountPercent > 0 && (
          <View style={styles.discountActiveBadge}>
            <Ionicons name="pricetag" size={14} color="#16a34a" />
            <Text style={styles.discountActiveText}>{discountPercent}% {l('Bundle Discount', 'خصم المجموعة', 'Скидка набора')}</Text>
          </View>
        )}
      </View>

      {/* Step Indicator */}
      <FlatList
        ref={stepsScrollRef}
        data={steps}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stepIndicator}
        contentContainerStyle={styles.stepIndicatorContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item: step, index }) => {
          const isActive = index === currentStep;
          const selCount = getStepSelectionCount(step.id);
          return (
            <TouchableOpacity
              style={[styles.stepPill, isActive && styles.stepPillActive]}
              onPress={() => goToStep(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepEmoji}>{step.icon}</Text>
              <Text style={[styles.stepPillText, isActive && styles.stepPillTextActive]} numberOfLines={1}>
                {step.name}
              </Text>
              {step.required && !selCount && (
                <View style={styles.requiredDot} />
              )}
              {selCount > 0 && (
                <View style={styles.stepCountBadge}>
                  <Text style={styles.stepCountText}>{selCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Step Header */}
      {currentStepData && (
        <View style={styles.stepHeader}>
          <Text style={styles.stepHeaderEmoji}>{currentStepData.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.stepHeaderRow}>
              <Text style={[styles.stepHeaderTitle, isRTL && styles.textRTL]}>{currentStepData.name}</Text>
              {currentStepData.required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredBadgeText}>{l('Required', 'مطلوب', 'Обязательно')}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.stepHeaderDesc, isRTL && styles.textRTL]}>{currentStepData.description}</Text>
          </View>
        </View>
      )}

      {/* Product Grid */}
      {currentStepData && (
        <FlatList
          data={currentStepData.products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderProductCard}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.productRow}
          ListEmptyComponent={
            <View style={styles.emptyStep}>
              <Ionicons name="cube-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyStepText}>{l('No products in this category', 'لا منتجات في هذه الفئة', 'Нет товаров в этой категории')}</Text>
            </View>
          }
        />
      )}

      {/* Swipable Bottom Bar */}
      <View style={styles.bottomBar} {...footerPan.panHandlers}>
        {/* Chevron toggle */}
        <TouchableOpacity
          style={styles.footerChevron}
          onPress={() => { haptics.lightTap(); setFooterExpanded(v => !v); }}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 20, right: 20 }}
        >
          <View style={styles.footerHandle} />
          <Ionicons name={footerExpanded ? 'chevron-down' : 'chevron-up'} size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Expanded pricing breakdown — bundle discount only */}
        {footerExpanded && user && itemCount > 0 && (
          <View style={styles.footerPricing}>
            {/* Retail Price (before bundle discount) */}
            {discountPercent > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{l('Retail Price', 'السعر الأصلي', 'Розничная цена')}</Text>
                <Text style={[styles.pricingValue, { textDecorationLine: 'line-through', color: '#9CA3AF' }]}>{retailTotal.toFixed(2)} AED</Text>
              </View>
            )}
            {/* Bundle Discount */}
            {discountPercent > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabelGreen}>{l('Bundle Discount', 'خصم المجموعة', 'Скидка набора')} ({discountPercent}%)</Text>
                <Text style={styles.pricingValueGreen}>-{discountAmount.toFixed(2)} AED</Text>
              </View>
            )}
            <View style={[styles.pricingRow, styles.pricingRowTotal]}>
              <Text style={styles.pricingTotalLabel}>{l('Total', 'الإجمالي', 'Итого')}</Text>
              <Text style={styles.pricingTotalValue}>{total.toFixed(2)} AED</Text>
            </View>
            {/* You Save badge */}
            {totalSaved > 0.5 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabelGreen}>{l('You Save', 'توفر', 'Вы экономите')}</Text>
                <Text style={styles.pricingValueGreen}>{totalSaved.toFixed(2)} AED</Text>
              </View>
            )}
          </View>
        )}

        {/* Navigation arrows */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentStep === 0 && styles.navBtnDisabled]}
            disabled={currentStep === 0}
            onPress={() => goToStep(currentStep - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={currentStep === 0 ? '#D1D5DB' : '#374151'} />
            <Text style={[styles.navBtnText, currentStep === 0 && styles.navBtnTextDisabled]}>{l('Previous', 'السابق', 'Назад')}</Text>
          </TouchableOpacity>

          {/* Center: total */}
          <TouchableOpacity style={styles.navCenter} onPress={() => itemCount > 0 ? openSummary() : null} activeOpacity={0.7}>
            {user && itemCount > 0 ? (
              <>
                {discountPercent > 0 && (
                  <Text style={styles.navDiscount}>-{discountPercent}%</Text>
                )}
                <Text style={styles.navTotal}>{Math.round(total)} AED</Text>
              </>
            ) : (
              <Text style={styles.navItems}>{itemCount} {l('items', 'منتجات', 'товаров')}</Text>
            )}
          </TouchableOpacity>

          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => goToStep(currentStep + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnText}>
                {currentStepData?.required && getStepSelectionCount(currentStepData.id) === 0
                  ? l('Skip', 'تخطّ', 'Пропустить')
                  : l('Next', 'التالي', 'Далее')}
              </Text>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color="#374151" />
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtn} />
          )}
        </View>

        {/* Add to cart button */}
        {itemCount >= 2 && user && (
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} activeOpacity={0.8}>
            <Ionicons name="bag-add" size={20} color="#fff" />
            <Text style={styles.addToCartText}>
              {l('Add Bundle to Cart', 'أضف المجموعة للسلة', 'Добавить набор в корзину')}
              {discountPercent > 0 ? ` (${t('product.discountPercent', { percent: discountPercent })})` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Swipable Summary Overlay */}
      {showSummary && (
        <View style={styles.summaryOverlay}>
          <TouchableOpacity style={styles.summaryBackdrop} onPress={closeSummary} activeOpacity={1} />
          <Animated.View
            style={[styles.summarySheet, { transform: [{ translateY: summaryTranslateY }] }]}
            {...summaryPan.panHandlers}
          >
            <View style={styles.summaryHandle} />
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>{l('Your Bundle', 'مجموعتك', 'Ваш набор')} ({itemCount})</Text>
              <TouchableOpacity onPress={closeSummary}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
            </View>

            <ScrollView style={styles.summaryScroll} showsVerticalScrollIndicator={false}>
              {selectedArray.map(({ product, stepId }) => {
                const step = steps.find(s => s.id === stepId);
                return (
                  <View key={product.id} style={styles.summaryItem}>
                    <View style={styles.summaryImageWrap}>
                      <Image source={{ uri: product.image }} style={styles.summaryItemImage} contentFit="contain" cachePolicy="memory-disk" />
                      {product.size ? <Text style={styles.summaryImageSize}>{product.size}</Text> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summaryItemName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.summaryItemStep}>{step?.icon} {step?.name}</Text>
                    </View>
                    <Text style={styles.summaryItemPrice}>{formatAed(getBundleRetailPrice(product))}</Text>
                    <TouchableOpacity onPress={() => toggleProduct(product, stepId)} style={styles.summaryRemoveBtn}>
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Pricing breakdown — bundle discount only */}
            {user && (
              <View style={styles.summaryPricing}>
                {/* Retail Price */}
                {discountPercent > 0 && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>{l('Retail Price', 'السعر الأصلي', 'Розничная цена')}</Text>
                    <Text style={[styles.pricingValue, { textDecorationLine: 'line-through', color: '#9CA3AF' }]}>{retailTotal.toFixed(2)} AED</Text>
                  </View>
                )}
                {/* Bundle Discount */}
                {discountPercent > 0 && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabelGreen}>{l('Bundle Discount', 'خصم المجموعة', 'Скидка набора')} ({discountPercent}%)</Text>
                    <Text style={styles.pricingValueGreen}>-{discountAmount.toFixed(2)} AED</Text>
                  </View>
                )}
                <View style={[styles.pricingRow, styles.pricingRowTotal]}>
                  <Text style={styles.pricingTotalLabel}>{l('Total', 'الإجمالي', 'Итого')}</Text>
                  <Text style={styles.pricingTotalValue}>{total.toFixed(2)} AED</Text>
                </View>
                {totalSaved > 0.5 && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabelGreen}>{l('You Save', 'توفر', 'Вы экономите')}</Text>
                    <Text style={styles.pricingValueGreen}>{totalSaved.toFixed(2)} AED</Text>
                  </View>
                )}
              </View>
            )}

            {/* Clear all */}
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={() => { haptics.mediumTap(); setSelectedItems({}); closeSummary(); }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={styles.clearAllText}>{l('Clear All', 'مسح الكل', 'Очистить всё')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },

  // Header
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...T.navTitle, flex: 1, fontWeight: '700', color: colors.label, textAlign: 'center' },
  cartBadgeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#dc2626', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { ...T.badge, color: '#fff' },

  // Progress bar
  progressSection: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, position: 'relative', overflow: 'visible' },
  progressFill: { height: 6, backgroundColor: '#dc2626', borderRadius: 3 },
  tierMarker: { position: 'absolute', top: -3, alignItems: 'center', marginLeft: -4 },
  tierDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#fff' },
  tierDotActive: { backgroundColor: '#16a34a' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 2 },
  progressLabel: { ...T.badge, color: '#9CA3AF' },
  progressLabelActive: { color: '#16a34a', fontWeight: '700' },
  nextTierHint: { ...T.captionSmall, color: '#dc2626', fontWeight: '600', textAlign: 'center', marginTop: 6 },
  discountActiveBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6, backgroundColor: '#F0FDF4', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, alignSelf: 'center' },
  discountActiveText: { ...T.badgeMedium, color: '#16a34a' },

  // Step indicator
  stepIndicator: { backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator, height: 52 },
  stepIndicatorContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 10 },
  stepPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#F3F4F6', height: 32 },
  stepPillActive: { backgroundColor: '#FEF2F2', borderColor: '#dc2626' },
  stepEmoji: { fontSize: 14 },
  stepPillText: { ...T.captionTiny, fontWeight: '600', color: '#6B7280' },
  stepPillTextActive: { color: '#dc2626' },
  requiredDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#dc2626' },
  stepCountBadge: { backgroundColor: '#16a34a', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  stepCountText: { ...T.badge, color: '#fff' },

  // Step header
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
  stepHeaderEmoji: { fontSize: 28 },
  stepHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepHeaderTitle: { ...T.sectionTitleSmall, color: '#111827' },
  stepHeaderDesc: { ...T.caption, color: '#6B7280', marginTop: 2 },
  requiredBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  requiredBadgeText: { ...T.captionTiny, fontWeight: '600', color: '#dc2626' },

  // Product grid
  productGrid: { paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 200 },
  productRow: { gap: 12, marginBottom: 12 },
  productCard: {
    width: CARD_WIDTH, ...surfaces.card, ...shadow.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'transparent', overflow: 'hidden',
  },
  productCardSelected: { borderColor: colors.brand, backgroundColor: tint(colors.brand, '0A') },
  selectedBadge: {
    position: 'absolute', top: 8, right: 8, zIndex: 10,
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#dc2626',
    alignItems: 'center', justifyContent: 'center',
  },
  // Square tile (matches product cards): square studio photos fill edge-to-edge,
  // wide photos letterbox invisibly on the white background.
  productImageWrap: { height: CARD_WIDTH, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  productImage: { width: '100%', height: '100%' },
  productInfo: { paddingHorizontal: 10, paddingVertical: 8 },
  productName: { ...T.captionSmall, fontWeight: '600', color: '#374151', lineHeight: 16, minHeight: 32 },
  productDesc: { ...T.badge, fontWeight: '400', color: '#6B7280', lineHeight: 14, marginTop: 2 },
  productSize: { ...T.captionTiny, color: '#9CA3AF', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  priceOriginal: { ...T.captionTiny, color: '#9CA3AF', textDecorationLine: 'line-through' },
  priceMain: { ...T.label, fontWeight: '700', color: '#111827' },
  priceDiscounted: { color: '#16a34a' },
  loginToSee: { ...T.captionTiny, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginHorizontal: 10, marginBottom: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#dc2626' },
  addBtnSelected: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  addBtnText: { ...T.caption, fontWeight: '600', color: '#dc2626' },
  addBtnTextSelected: { color: '#fff' },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator, paddingBottom: 34, paddingTop: 0, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 8 },
  footerChevron: { alignItems: 'center', paddingTop: 6, paddingBottom: 4 },
  footerHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 2 },
  footerPricing: { paddingHorizontal: 4, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', marginBottom: 4 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 4, minWidth: 80 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { ...T.buttonSmall, color: '#374151' },
  navBtnTextDisabled: { color: '#D1D5DB' },
  navCenter: { alignItems: 'center' },
  navDiscount: { ...T.captionTiny, fontWeight: '700', color: '#16a34a' },
  navTotal: { ...T.price, color: '#111827' },
  navItems: { ...T.caption, fontWeight: '600', color: '#6B7280' },

  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  addToCartText: { ...T.button, fontWeight: '700', color: '#fff' },

  // Summary overlay
  summaryOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  summaryBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  summarySheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', paddingBottom: 34 },
  summaryHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 10 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  summaryTitle: { ...T.sectionTitleSmall, color: '#111827' },
  summaryScroll: { paddingHorizontal: 20, maxHeight: 280 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  summaryImageWrap: { alignItems: 'center' },
  summaryItemImage: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F9FAFB' },
  summaryImageSize: { ...T.badge, fontWeight: '500', color: '#9CA3AF', marginTop: 2, fontSize: 9 },
  summaryItemName: { ...T.labelSmall, color: '#374151' },
  summaryItemStep: { ...T.captionTiny, color: '#9CA3AF', marginTop: 2 },
  summaryItemPrice: { ...T.label, fontWeight: '700', color: '#111827' },
  summaryRemoveBtn: { padding: 4 },

  // Pricing
  summaryPricing: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  pricingLabel: { ...T.summaryLabel, color: '#6B7280' },
  pricingValue: { ...T.summaryValue, color: '#374151' },
  pricingLabelPurple: { ...T.summaryLabel, color: '#7c3aed', fontWeight: '600' },
  pricingValuePurple: { ...T.summaryValue, fontWeight: '700', color: '#7c3aed' },
  pricingLabelGreen: { ...T.summaryLabel, color: '#16a34a', fontWeight: '600' },
  pricingValueGreen: { ...T.summaryValue, fontWeight: '700', color: '#16a34a' },
  pricingRowTotal: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4 },
  pricingTotalLabel: { ...T.totalLabel, color: '#111827', fontSize: 16 },
  pricingTotalValue: { ...T.totalValue, fontWeight: '800', color: '#dc2626', fontSize: 18 },

  clearAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  clearAllText: { ...T.buttonSmall, color: '#EF4444' },

  // Empty & loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { ...T.bodySmall, marginTop: 12, color: '#6B7280', lineHeight: undefined },
  errorText: { ...T.label, fontSize: 16, color: '#374151', marginTop: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: '#dc2626', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  retryBtnText: { ...T.buttonSmall, color: '#fff', fontSize: 15 },
  emptyStep: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStepText: { ...T.caption, color: '#9CA3AF', marginTop: 8, fontSize: 14 },

  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
