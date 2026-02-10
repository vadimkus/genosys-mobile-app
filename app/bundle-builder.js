/**
 * Bundle Builder Screen - Native (replaces WebView)
 * "Build Your Set" — 8-step skincare routine builder with tiered discounts.
 * Fetches products from /api/mobile/bundle-builder and adds to cart.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { AUTH_CONFIG } from '../config/auth';

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

export default function BundleBuilderScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const { user } = useAuth();
  const { addItem } = useCart();
  const isRTL = dir === 'rtl';
  const stepsScrollRef = useRef(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedItems, setSelectedItems] = useState({}); // { [productId]: { product, stepId } }
  const [showSummary, setShowSummary] = useState(false);

  // Fetch bundle data
  const fetchBundleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const headers = {
        'x-api-key': AUTH_CONFIG.API_KEY,
        'x-locale': locale || 'en',
      };
      if (user?.id) headers['x-user-id'] = user.id;

      const res = await fetch(`${baseUrl}/api/mobile/bundle-builder`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setSteps(data.steps || []);
    } catch (err) {
      console.warn('Failed to fetch bundle data:', err.message);
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

  const subtotal = selectedArray.reduce((sum, item) => sum + (item.product.displayPrice || item.product.price), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100 * 100) / 100;
  const total = Math.round((subtotal - discountAmount) * 100) / 100;

  const toggleProduct = (product, stepId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(index);
    // Scroll step indicator into view
    stepsScrollRef.current?.scrollToIndex?.({ index, animated: true, viewPosition: 0.5 });
  };

  const handleAddToCart = () => {
    if (itemCount < 2) {
      Alert.alert(
        l('Minimum 2 Products', 'الحد الأدنى ٢ منتجات', 'Минимум 2 товара'),
        l('Add at least 2 products to get a bundle discount.', 'أضف منتجين على الأقل للحصول على خصم.', 'Добавьте минимум 2 товара для скидки.'),
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Add each selected product to cart
    selectedArray.forEach(({ product }) => {
      // Build a cart-compatible product object
      const cartProduct = {
        id: product.id,
        productNumber: product.productNumber,
        name: product.name,
        price: product.displayPrice || product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.image,
        category: product.category,
        size: product.size,
        variants: product.variants || [],
        inStock: true,
        fromBundle: true,
        bundleDiscountPercent: discountPercent,
      };
      addItem(cartProduct, 1, '', '');
    });

    // Clear selection
    setSelectedItems({});

    // Navigate to bag
    router.push('/(tabs)/bag');
  };

  const currentStepData = steps[currentStep];

  // Render product card
  const renderProductCard = ({ item: product }) => {
    const selected = isSelected(product.id);
    const hasUserDiscount = product.userDiscountPct > 0;

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
            <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <Ionicons name="image-outline" size={32} color="#D1D5DB" />
          )}
        </View>

        {/* Product info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, isRTL && styles.textRTL]} numberOfLines={2}>{product.name}</Text>
          {product.size ? <Text style={styles.productSize}>{product.size}</Text> : null}

          {/* Price */}
          {user ? (
            <View style={styles.priceRow}>
              {hasUserDiscount && (
                <Text style={styles.priceOriginal}>{Math.round(product.price)} AED</Text>
              )}
              <Text style={[styles.priceMain, hasUserDiscount && styles.priceDiscounted]}>
                {Math.round(product.displayPrice || product.price)} AED
              </Text>
            </View>
          ) : (
            <Text style={styles.loginToSee}>{l('Login to see price', 'سجل لرؤية السعر', 'Войдите для цены')}</Text>
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
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
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
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
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
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{l('Build Your Set', 'ابنِ مجموعتك', 'Собери свой набор')}</Text>
        {itemCount > 0 ? (
          <TouchableOpacity onPress={() => setShowSummary(!showSummary)} style={styles.cartBadgeBtn} activeOpacity={0.7}>
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

      {/* Navigation + Summary Bottom Bar */}
      <View style={styles.bottomBar}>
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
          <View style={styles.navCenter}>
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
          </View>

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
              {discountPercent > 0 ? ` (${discountPercent}% OFF)` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Overlay */}
      {showSummary && (
        <View style={styles.summaryOverlay}>
          <TouchableOpacity style={styles.summaryBackdrop} onPress={() => setShowSummary(false)} activeOpacity={1} />
          <View style={styles.summarySheet}>
            <View style={styles.summaryHandle} />
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>{l('Your Bundle', 'مجموعتك', 'Ваш набор')} ({itemCount})</Text>
              <TouchableOpacity onPress={() => setShowSummary(false)}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
            </View>

            <ScrollView style={styles.summaryScroll} showsVerticalScrollIndicator={false}>
              {selectedArray.map(({ product, stepId }) => {
                const step = steps.find(s => s.id === stepId);
                return (
                  <View key={product.id} style={styles.summaryItem}>
                    <Image source={{ uri: product.image }} style={styles.summaryItemImage} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summaryItemName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.summaryItemStep}>{step?.icon} {step?.name}</Text>
                    </View>
                    <Text style={styles.summaryItemPrice}>{Math.round(product.displayPrice || product.price)} AED</Text>
                    <TouchableOpacity onPress={() => toggleProduct(product, stepId)} style={styles.summaryRemoveBtn}>
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Pricing breakdown */}
            {user && (
              <View style={styles.summaryPricing}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>{l('Subtotal', 'المجموع الفرعي', 'Подытог')}</Text>
                  <Text style={styles.pricingValue}>{Math.round(subtotal)} AED</Text>
                </View>
                {discountPercent > 0 && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabelGreen}>{l('Bundle Discount', 'خصم المجموعة', 'Скидка набора')} ({discountPercent}%)</Text>
                    <Text style={styles.pricingValueGreen}>-{Math.round(discountAmount)} AED</Text>
                  </View>
                )}
                <View style={[styles.pricingRow, styles.pricingRowTotal]}>
                  <Text style={styles.pricingTotalLabel}>{l('Total', 'الإجمالي', 'Итого')}</Text>
                  <Text style={styles.pricingTotalValue}>{Math.round(total)} AED</Text>
                </View>
              </View>
            )}

            {/* Clear all */}
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSelectedItems({}); setShowSummary(false); }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={styles.clearAllText}>{l('Clear All', 'مسح الكل', 'Очистить всё')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  cartBadgeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#dc2626', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Progress bar
  progressSection: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FAFAFA', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, position: 'relative', overflow: 'visible' },
  progressFill: { height: 6, backgroundColor: '#dc2626', borderRadius: 3 },
  tierMarker: { position: 'absolute', top: -3, alignItems: 'center', marginLeft: -4 },
  tierDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#fff' },
  tierDotActive: { backgroundColor: '#16a34a' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 2 },
  progressLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
  progressLabelActive: { color: '#16a34a', fontWeight: '700' },
  nextTierHint: { fontSize: 12, color: '#dc2626', fontWeight: '600', textAlign: 'center', marginTop: 6 },
  discountActiveBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6, backgroundColor: '#F0FDF4', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, alignSelf: 'center' },
  discountActiveText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },

  // Step indicator
  stepIndicator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  stepIndicatorContent: { paddingHorizontal: 12, gap: 6, alignItems: 'center', paddingVertical: 8 },
  stepPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#F3F4F6' },
  stepPillActive: { backgroundColor: '#FEF2F2', borderColor: '#dc2626' },
  stepEmoji: { fontSize: 13 },
  stepPillText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  stepPillTextActive: { color: '#dc2626' },
  requiredDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#dc2626' },
  stepCountBadge: { backgroundColor: '#16a34a', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  stepCountText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // Step header
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  stepHeaderEmoji: { fontSize: 28 },
  stepHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  stepHeaderDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  requiredBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  requiredBadgeText: { fontSize: 11, fontWeight: '600', color: '#dc2626' },

  // Product grid
  productGrid: { paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 200 },
  productRow: { gap: 12, marginBottom: 12 },
  productCard: {
    width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#F3F4F6', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  productCardSelected: { borderColor: '#dc2626', backgroundColor: '#FFF5F5' },
  selectedBadge: {
    position: 'absolute', top: 8, right: 8, zIndex: 10,
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#dc2626',
    alignItems: 'center', justifyContent: 'center',
  },
  productImageWrap: { height: 130, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', padding: 8 },
  productImage: { width: '100%', height: '100%' },
  productInfo: { paddingHorizontal: 10, paddingVertical: 8 },
  productName: { fontSize: 12, fontWeight: '600', color: '#374151', lineHeight: 16, minHeight: 32 },
  productSize: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  priceOriginal: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },
  priceMain: { fontSize: 14, fontWeight: '700', color: '#111827' },
  priceDiscounted: { color: '#16a34a' },
  loginToSee: { fontSize: 11, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginHorizontal: 10, marginBottom: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#dc2626' },
  addBtnSelected: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#dc2626' },
  addBtnTextSelected: { color: '#fff' },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingBottom: 34, paddingTop: 8, paddingHorizontal: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 4, minWidth: 80 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  navBtnTextDisabled: { color: '#D1D5DB' },
  navCenter: { alignItems: 'center' },
  navDiscount: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  navTotal: { fontSize: 16, fontWeight: '700', color: '#111827' },
  navItems: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

  addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  addToCartText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Summary overlay
  summaryOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  summaryBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  summarySheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', paddingBottom: 34 },
  summaryHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 10 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  summaryScroll: { paddingHorizontal: 20, maxHeight: 280 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  summaryItemImage: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F9FAFB' },
  summaryItemName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  summaryItemStep: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  summaryItemPrice: { fontSize: 14, fontWeight: '700', color: '#111827' },
  summaryRemoveBtn: { padding: 4 },

  // Pricing
  summaryPricing: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  pricingLabel: { fontSize: 14, color: '#6B7280' },
  pricingValue: { fontSize: 14, fontWeight: '600', color: '#374151' },
  pricingLabelGreen: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
  pricingValueGreen: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  pricingRowTotal: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4 },
  pricingTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  pricingTotalValue: { fontSize: 18, fontWeight: '800', color: '#dc2626' },

  clearAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  clearAllText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },

  // Empty & loading
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6B7280' },
  errorText: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: '#dc2626', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  emptyStep: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStepText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },

  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
