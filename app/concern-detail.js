/**
 * Concern Detail — fully native concern page.
 * Replaces the previous WebView approach.
 * Receives `slug` param from skin-concerns.js or deep links.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { useCart } from '../contexts/CartContext';
import { fetchConcernDetail } from '../services/api';
import ProductGridItem from '../components/ProductGridItem';
import * as haptics from '../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalizedProductName } from '../utils/productLocalization';
import T from '../utils/typography';
import { computeWaterfallBreakdown } from '../utils/cartUtils';
import { getPricingDisplay, formatAed } from '../utils/pricingDisplay';
import { useAuth } from '../contexts/AuthContext';
import AUTH_CONFIG from '../config/auth';
import { CONCERNS } from './skin-concerns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const SIDE_PADDING = 16;
const PRODUCT_CARD_WIDTH = Math.floor((SCREEN_WIDTH - SIDE_PADDING * 2 - GRID_GAP) / 2);

export default function ConcernDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const { items: cartItems, addItem, removeItem, clearCart, getCartSummary } = useCart();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoutineSteps, setExpandedRoutineSteps] = useState({});
  const [expandedFaq, setExpandedFaq] = useState({});
  const [justAddedIds, setJustAddedIds] = useState({});
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [stickyExpanded, setStickyExpanded] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchConcernDetail(slug, { locale, user });
      if (result) {
        setData(result);
      } else {
        Alert.alert(
          locale === 'ar' ? 'خطأ' : locale === 'ru' ? 'Ошибка' : 'Error',
          locale === 'ar' ? 'لم يتم العثور على الصفحة' : locale === 'ru' ? 'Страница не найдена' : 'Page not found'
        );
        router.back();
      }
    } catch {
      Alert.alert(
        locale === 'ar' ? 'خطأ' : locale === 'ru' ? 'Ошибка' : 'Error',
        locale === 'ar' ? 'فشل تحميل البيانات' : locale === 'ru' ? 'Не удалось загрузить' : 'Failed to load data'
      );
      router.back();
    } finally {
      setLoading(false);
    }
  }, [slug, locale, user?.id]);

  useEffect(() => {
    if (slug) loadData();
  }, [slug, locale, user?.id]);

  const toggleRoutineStep = (sectionIdx, stepIdx) => {
    const key = `${sectionIdx}-${stepIdx}`;
    setExpandedRoutineSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (idx) => {
    setExpandedFaq(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    Animated.timing(toastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 1600);
  }, [toastOpacity]);

  const handleProtocolDownload = () => {
    if (!data?.protocolPdf?.url) return;
    haptics.lightTap();
    const baseUrl = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';
    Linking.openURL(`${baseUrl}${data.protocolPdf.url}`);
  };

  const handleProductPress = (productId) => {
    haptics.lightTap();
    router.push(`/product/${productId}`);
  };

  const handleRelatedPress = (relatedSlug) => {
    haptics.lightTap();
    router.push({ pathname: '/concern-detail', params: { slug: relatedSlug } });
  };

  const productLookup = React.useMemo(() => {
    if (!data?.products) return {};
    const map = {};
    data.products.forEach((p) => {
      map[String(p.id)] = p;
      if (p.productNumber) map[String(p.productNumber)] = p;
    });
    return map;
  }, [data?.products]);

  const isProductInCart = useCallback((productId) => {
    if (!productId) return false;
    return cartItems.some(item => String(item.product?.id) === productId && !item.isPromotionItem);
  }, [cartItems]);

  const findCartItem = useCallback((productId) => {
    if (!productId) return null;
    return cartItems.find(item => String(item.product?.id) === productId && !item.isPromotionItem) || null;
  }, [cartItems]);

  const handleChipPress = useCallback((routeId) => {
    if (!routeId) return;
    if (!user) {
      router.push({
        pathname: '/auth/login',
        params: { returnTo: `/concern-detail?slug=${encodeURIComponent(String(slug || ''))}` },
      });
      return;
    }
    const fullProduct = productLookup[routeId];
    if (!fullProduct || fullProduct.isPriceOnRequest) {
      router.push(`/product/${routeId}`);
      return;
    }
    const cartId = String(fullProduct.id);
    haptics.lightTap();
    const existingCartItem = findCartItem(cartId);
    if (existingCartItem) {
      removeItem(cartId, existingCartItem.selectedColor || '', existingCartItem.selectedSize || '');
      showToast(locale === 'ar' ? 'تمت الإزالة من الحقيبة' : locale === 'ru' ? 'Удалено из корзины' : 'Removed from bag');
    } else {
      addItem(fullProduct, 1, '', '');
      setJustAddedIds((prev) => ({ ...prev, [routeId]: true }));
      setTimeout(() => setJustAddedIds((prev) => ({ ...prev, [routeId]: false })), 1200);
      showToast(locale === 'ar' ? 'تمت الإضافة إلى الحقيبة' : locale === 'ru' ? 'Добавлено في корзину' : 'Added to bag');
    }
  }, [productLookup, addItem, removeItem, findCartItem, showToast, locale, router, slug, user]);

  const handleChipLongPress = useCallback((productId) => {
    if (!productId) return;
    haptics.lightTap();
    router.push(`/product/${productId}`);
  }, [router]);

  // --- Loading skeleton ---
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>
            {locale === 'ar' ? 'جارٍ التحميل...' : locale === 'ru' ? 'Загрузка...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const { seo, why, protocolPdf, routine, products, faq, relatedConcerns, icon: apiIcon } = data;
  const localConcern = CONCERNS.find(c => c.slug === slug);
  const icon = localConcern?.icon || apiIcon;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]} numberOfLines={1}>
          {seo?.h1 || ''}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          {icon ? <Text style={styles.heroIcon}>{icon}</Text> : null}
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{seo?.h1 || ''}</Text>
          {seo?.heroShort ? (
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>{seo.heroShort}</Text>
          ) : null}
        </View>

        {/* Why Section — collapsible */}
        {why && why.items?.length > 0 ? (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.collapsibleHeader, isRTL && styles.collapsibleHeaderRTL]}
              onPress={() => { haptics.lightTap(); setWhyExpanded(prev => !prev); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1, marginRight: 8 }, isRTL && styles.textRTL]}>{why.title}</Text>
              <Ionicons name={whyExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#1D1D1F" />
            </TouchableOpacity>
            {whyExpanded && (
              <View style={[styles.whyGrid, isRTL && { flexDirection: 'row-reverse' }]}>
                {why.items.map((item, i) => (
                  <View key={i} style={styles.whyCard}>
                    <Text style={styles.whyIcon}>{item.icon}</Text>
                    <Text style={[styles.whyLabel, isRTL && styles.textRTL]}>{item.label}</Text>
                    <Text style={[styles.whyDetail, isRTL && styles.textRTL]}>{item.detail}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* Documentation — collapsible */}
        {protocolPdf ? (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.collapsibleHeader, isRTL && styles.collapsibleHeaderRTL]}
              onPress={() => { haptics.lightTap(); setDocsExpanded(prev => !prev); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1, marginRight: 8 }, isRTL && styles.textRTL]}>
                {locale === 'ar' ? 'الوثائق' : locale === 'ru' ? 'Документация' : 'Documentation'}
              </Text>
              <Ionicons name={docsExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#1D1D1F" />
            </TouchableOpacity>
            {docsExpanded && (
              <TouchableOpacity style={styles.pdfCard} onPress={handleProtocolDownload} activeOpacity={0.85}>
                <View style={[styles.pdfRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={styles.pdfIconBox}>
                    <Ionicons name="document-text-outline" size={22} color="#92400E" />
                  </View>
                  <View style={styles.pdfContent}>
                    <View style={[styles.pdfTitleRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Text style={[styles.pdfTitle, isRTL && styles.textRTL]} numberOfLines={1}>{protocolPdf.title}</Text>
                      <View style={styles.pdfBadge}><Text style={styles.pdfBadgeText}>PDF</Text></View>
                    </View>
                    <Text style={[styles.pdfDesc, isRTL && styles.textRTL]} numberOfLines={2}>{protocolPdf.description}</Text>
                  </View>
                  <View style={styles.pdfDownload}>
                    <Text style={styles.pdfSize}>{protocolPdf.fileSize}</Text>
                    <Ionicons name="download-outline" size={18} color="#92400E" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Routine */}
        {routine && routine.length > 0 ? (
          <View style={styles.section}>
            {routine.map((section, si) => (
              <View key={si} style={si > 0 ? { marginTop: 24 } : null}>
                <Text style={[styles.routineSectionTitle, isRTL && styles.textRTL]}>{section.title}</Text>
                <Text style={[styles.routineSubtitle, isRTL && styles.textRTL]}>{section.subtitle}</Text>
                {section.steps.map((step) => {
                  const key = `${si}-${step.step}`;
                  const isExpanded = !!expandedRoutineSteps[key];
                  return (
                    <View key={step.step} style={[styles.routineStep, isExpanded && styles.routineStepExpanded]}>
                      <Pressable onPress={() => toggleRoutineStep(si, step.step)}>
                        <View style={[styles.routineStepHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                          <View style={[styles.stepNumber, isExpanded && styles.stepNumberActive]}>
                            <Text style={[styles.stepNumberText, isExpanded && styles.stepNumberTextActive]}>{step.step}</Text>
                          </View>
                          <View style={styles.stepTitleWrap}>
                            <Text style={[styles.stepTitle, isRTL && styles.textRTL, isExpanded && styles.stepTitleActive]}>{step.title}</Text>
                            <Text style={[styles.stepDuration, isRTL && styles.textRTL]}>({step.duration})</Text>
                          </View>
                          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={isExpanded ? '#dc2626' : '#999'} />
                        </View>
                      </Pressable>
                      {isExpanded ? (
                        <View style={styles.stepBody}>
                          <Text style={[styles.stepDetail, isRTL && styles.textRTL]}>{step.detail}</Text>
                          {step.products?.length > 0 ? (
                            <View style={[styles.stepProducts, isRTL && { flexDirection: 'row-reverse' }]}>
                              {step.products.map((p, pi) => {
                                const idMatch = p.url?.match(/\/products\/(\d+)/);
                                const productId = idMatch ? idMatch[1] : null;
                                const matchedProduct = productId ? productLookup[productId] : null;
                                const cartId = matchedProduct ? String(matchedProduct.id) : null;
                                const chipInCart = productId && (justAddedIds[productId] || (cartId && isProductInCart(cartId)));
                                const rawNum = parseFloat(String(p.price).replace(/[^0-9.]/g, ''));
                                const fallbackUnit = Number.isFinite(rawNum) ? rawNum : 0;
                                const pricing = matchedProduct ? getPricingDisplay(matchedProduct) : null;
                                const retailUnit = Number(pricing?.originalPrice || pricing?.basePrice || fallbackUnit) || 0;
                                const finalUnit = Number(pricing?.displayPrice ?? fallbackUnit) || 0;
                                const hasDisc = retailUnit > finalUnit + 0.01;
                                return (
                                  <TouchableOpacity
                                    key={pi}
                                    style={[styles.stepProductChip, chipInCart && styles.stepProductChipInCart]}
                                    onPress={() => handleChipPress(productId)}
                                    onLongPress={() => handleChipLongPress(productId)}
                                    delayLongPress={500}
                                    activeOpacity={0.7}
                                  >
                                    {chipInCart ? (
                                      <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                                    ) : null}
                                    <Text style={[styles.stepProductName, chipInCart && styles.stepProductNameInCart]}>{p.name}</Text>
                                    {!user ? (
                                      <Text style={[styles.stepProductPrice, chipInCart && styles.stepProductPriceInCart]}>
                                        {t('product.loginToSeePrice')}
                                      </Text>
                                    ) : hasDisc ? (
                                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={[styles.stepProductPrice, { textDecorationLine: 'line-through', fontSize: 10, color: '#9CA3AF' }]}>{retailUnit.toFixed(0)}</Text>
                                        <Text style={[styles.stepProductPrice, chipInCart ? styles.stepProductPriceInCart : { color: '#dc2626' }]}>{formatAed(finalUnit)}</Text>
                                      </View>
                                    ) : (
                                      <Text style={[styles.stepProductPrice, chipInCart && styles.stepProductPriceInCart]}>
                                        {pricing ? formatAed(finalUnit) : p.price}
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}

        {/* Products Grid — collapsible */}
        {products && products.length > 0 ? (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.collapsibleHeader, isRTL && styles.collapsibleHeaderRTL]}
              onPress={() => { haptics.lightTap(); setProductsExpanded(prev => !prev); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1, marginRight: 8 }, isRTL && styles.textRTL]}>
                {locale === 'ar' ? `المنتجات الموصى بها (${products.length})` : locale === 'ru' ? `Рекомендуемые продукты (${products.length})` : `Recommended Products (${products.length})`}
              </Text>
              <Ionicons
                name={productsExpanded ? 'chevron-up' : 'chevron-down'}
                size={22}
                color="#1D1D1F"
              />
            </TouchableOpacity>
            {productsExpanded && (
              <View style={[styles.productsGrid, isRTL && { flexDirection: 'row-reverse' }]}>
                {products.map((product) => {
                  const pid = String(product.id);
                  const inCart = isProductInCart(pid);
                  const justAdded = justAddedIds[pid];
                  const isOnRequest = product.isPriceOnRequest;
                  return (
                    <View key={product.id} style={{ width: PRODUCT_CARD_WIDTH, marginBottom: GRID_GAP }}>
                      <ProductGridItem
                        product={product}
                        inCart={inCart}
                        justAdded={justAdded}
                        onAddToCart={isOnRequest ? undefined : () => {
                          haptics.lightTap();
                          if (inCart) {
                            const ci = findCartItem(pid);
                            if (ci) removeItem(pid, ci.selectedColor || '', ci.selectedSize || '');
                            showToast(locale === 'ar' ? 'تمت الإزالة من الحقيبة' : locale === 'ru' ? 'Удалено из корзины' : 'Removed from bag');
                          } else {
                            if (!user) {
                              router.push({
                                pathname: '/auth/login',
                                params: { returnTo: `/concern-detail?slug=${encodeURIComponent(String(slug || ''))}` },
                              });
                              return;
                            }
                            addItem(product, 1, '', '');
                            setJustAddedIds(prev => ({ ...prev, [pid]: true }));
                            setTimeout(() => setJustAddedIds(prev => ({ ...prev, [pid]: false })), 1200);
                            showToast(locale === 'ar' ? 'تمت الإضافة إلى الحقيبة' : locale === 'ru' ? 'Добавлено в корзину' : 'Added to bag');
                          }
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        {/* Start Your Routine CTA */}
        <View style={styles.ctaBlock}>
          <Text style={[styles.ctaTitle, isRTL && styles.textRTL]}>
            {locale === 'ar' ? 'ابدأي روتينك اليوم' : locale === 'ru' ? 'Начните уход сегодня' : 'Start Your Routine Today'}
          </Text>
          <Text style={[styles.ctaSubtitle, isRTL && styles.textRTL]}>
            {locale === 'ar'
              ? 'اضغطي على المنتجات في الروتين أعلاه لإضافتها إلى حقيبتك'
              : locale === 'ru'
                ? 'Нажимайте на продукты в рутине выше, чтобы добавить их в корзину'
                : 'Tap products in the routine above to add them to your bag'}
          </Text>
          <View style={[styles.ctaButtons, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[styles.ctaBtnPrimary, cartItems.length === 0 && styles.ctaBtnDisabled]}
              onPress={async () => { haptics.mediumTap(); await AsyncStorage.setItem('@genosys_nav_bag_source', JSON.stringify({ pathname: '/concern-detail', params: { slug } })).catch(() => {}); router.push('/(tabs)/bag'); }}
              activeOpacity={0.85}
              disabled={cartItems.length === 0}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnPrimaryText}>
                {locale === 'ar' ? 'عرض الحقيبة' : locale === 'ru' ? 'Перейти в корзину' : 'View Bag'}
                {cartItems.length > 0 ? ` (${cartItems.length})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaBtnSecondary}
              onPress={() => { haptics.lightTap(); router.push('/skin-analysis'); }}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnSecondaryText}>
                {locale === 'ar' ? '✨ تحليل البشرة بالذكاء الاصطناعي' : locale === 'ru' ? '✨ AI-анализ кожи' : '✨ AI Skin Analysis'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        {faq && faq.length > 0 ? (
          <View style={styles.faqSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {locale === 'ar' ? 'الأسئلة الشائعة' : locale === 'ru' ? 'Часто задаваемые вопросы' : 'Frequently Asked Questions'}
            </Text>
            {faq.map((item, i) => {
              const isOpen = !!expandedFaq[i];
              return (
                <Pressable key={i} onPress={() => toggleFaq(i)} style={[styles.faqItem, isOpen && styles.faqItemOpen]}>
                  <View style={[styles.faqHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.faqQuestion, isRTL && styles.textRTL, { flex: 1 }]}>{item.question}</Text>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={isOpen ? '#dc2626' : '#999'} />
                  </View>
                  {isOpen ? (
                    <Text style={[styles.faqAnswer, isRTL && styles.textRTL]}>{item.answer}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* All Skin Concerns (horizontal scroll, excluding current) */}
        {CONCERNS.filter(c => c.slug !== slug).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {locale === 'ar' ? 'مشاكل بشرة أخرى' : locale === 'ru' ? 'Другие проблемы кожи' : 'Explore Other Skin Concerns'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.relatedScroll, isRTL && { flexDirection: 'row-reverse' }]}>
              {CONCERNS.filter(c => c.slug !== slug).map((c) => {
                const loc = c[locale] || c.en;
                return (
                  <TouchableOpacity key={c.slug} style={styles.relatedCard} onPress={() => handleRelatedPress(c.slug)} activeOpacity={0.85}>
                    <Text style={styles.relatedIcon}>{c.icon}</Text>
                    <Text style={[styles.relatedTitle, isRTL && styles.textRTL]} numberOfLines={2}>{loc.h1}</Text>
                    <Text style={[styles.relatedDesc, isRTL && styles.textRTL]} numberOfLines={2}>{loc.heroShort}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* SEO intro text hidden — only relevant for web crawlers, not native app */}

        <View style={{ height: user && cartItems.length > 0 ? 120 : 40 }} />
      </ScrollView>

      {/* Sticky Bottom Bar — expandable, visible when cart has items */}
      {user && cartItems.length > 0 && (() => {
        const summary = getCartSummary();
        return (
          <View style={styles.stickyBar}>
            {/* Chevron handle */}
            <TouchableOpacity
              style={styles.stickyChevron}
              onPress={() => { haptics.lightTap(); setStickyExpanded(v => !v); }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 20, right: 20 }}
            >
              <View style={styles.stickyHandle} />
              <Ionicons name={stickyExpanded ? 'chevron-down' : 'chevron-up'} size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Expanded: item list + pricing */}
            {stickyExpanded && (() => {
              const nonPromoItems = cartItems.filter(i => !i.isPromotionItem);
              const breakdown = computeWaterfallBreakdown(nonPromoItems, user);
              const rows = nonPromoItems.map((item, idx) => {
                const name = getLocalizedProductName(item.product, locale) || item.product?.name || '';
                const qty = item.quantity || 1;
                const pricing = getPricingDisplay(item.product, {
                  selectedSize: item.selectedSize,
                  selectedColor: item.selectedColor,
                });
                const isBundleItem = item?.fromBundle === true || item.product?.fromBundle === true;
                const bundlePct = Number(item?.bundleDiscountPercent || item.product?.bundleDiscountPercent) || 0;
                const retailUnit = isBundleItem
                  ? (Number(item.product?.originalPrice || pricing.basePrice || pricing.displayPrice) || 0)
                  : (Number(pricing.originalPrice || pricing.basePrice || pricing.displayPrice) || 0);
                const finalUnit = isBundleItem && bundlePct > 0
                  ? Math.round(retailUnit * (1 - bundlePct / 100) * 100) / 100
                  : Number(pricing.displayPrice || 0);
                const showStrike = retailUnit > finalUnit + 0.01;
                const pid = String(item.product?.id);
                return (
                  <View key={`${pid}-${idx}`} style={[styles.stickyItemRow, isRTL && styles.stickyItemRowRTL]}>
                    <TouchableOpacity
                      onPress={() => { haptics.lightTap(); removeItem(pid, item.selectedColor || '', item.selectedSize || ''); showToast(locale === 'ar' ? 'تمت الإزالة' : locale === 'ru' ? 'Удалено' : 'Removed'); }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.stickyRemoveBtn}
                    >
                      <Ionicons name="close-circle" size={16} color="#D1D5DB" />
                    </TouchableOpacity>
                    <Text style={[styles.stickyItemName, isRTL && styles.textRTL]} numberOfLines={1}>{name}{qty > 1 ? ` ×${qty}` : ''}</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      {showStrike && (
                        <Text style={styles.stickyItemOriginalPrice}>{formatAed(retailUnit * qty)}</Text>
                      )}
                      <Text style={[styles.stickyItemPrice, showStrike && { color: '#dc2626' }]}>{formatAed(finalUnit * qty)}</Text>
                    </View>
                  </View>
                );
              });
              const discountAmount = Number(breakdown.userDiscountTotal) || 0;
              const showDiscountRow = discountAmount > 0.5;
              return (
                <View style={styles.stickyDetails}>
                  {rows}
                  {nonPromoItems.length > 1 && (
                    <TouchableOpacity
                      onPress={() => { haptics.lightTap(); clearCart(); showToast(locale === 'ar' ? 'تم مسح الحقيبة' : locale === 'ru' ? 'Корзина очищена' : 'Bag cleared'); }}
                      style={[styles.stickyClearAll, isRTL && { alignSelf: 'flex-end' }]}
                      hitSlop={{ top: 6, bottom: 6, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={13} color="#9CA3AF" />
                      <Text style={styles.stickyClearAllText}>
                        {locale === 'ar' ? 'مسح الكل' : locale === 'ru' ? 'Очистить' : 'Clear all'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.stickyDivider} />
                  {showDiscountRow && (
                    <>
                      <View style={[styles.stickyPricingRow, isRTL && styles.stickyPricingRowRTL]}>
                        <Text style={[styles.stickyPricingLabel, isRTL && styles.textRTL, { color: '#86868B', fontWeight: '500' }]}>
                          {locale === 'ar' ? 'السعر الأصلي' : locale === 'ru' ? 'Полная цена' : 'Retail Price'}
                        </Text>
                        <Text style={[styles.stickyItemOriginalPrice, { fontSize: 14 }]}>{formatAed(breakdown.retailTotal)}</Text>
                      </View>
                      <View style={[styles.stickyPricingRow, isRTL && styles.stickyPricingRowRTL]}>
                        <Text style={[styles.stickyPricingLabel, isRTL && styles.textRTL, { color: '#16a34a', fontWeight: '600' }]}>
                          {locale === 'ar' ? `خصم ${breakdown.userDiscountPct}%` : locale === 'ru' ? `Скидка ${breakdown.userDiscountPct}%` : `${breakdown.userDiscountPct}% Discount`}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a' }}>-{formatAed(discountAmount)}</Text>
                      </View>
                    </>
                  )}
                  <View style={[styles.stickyPricingRow, isRTL && styles.stickyPricingRowRTL]}>
                    <Text style={[styles.stickyPricingLabel, isRTL && styles.textRTL]}>
                      {locale === 'ar' ? 'المجموع الفرعي' : locale === 'ru' ? 'Промежуточный итог' : 'Subtotal'}
                    </Text>
                    <Text style={styles.stickyPricingValue}>{formatAed(summary.subtotal)}</Text>
                  </View>
                  {summary.amountForFreeShipping > 0 && (
                    <Text style={[styles.stickyFreeShipping, isRTL && styles.textRTL]}>
                      {locale === 'ar'
                        ? `أضف ${summary.amountForFreeShipping.toFixed(0)} د.إ للشحن المجاني`
                        : locale === 'ru'
                          ? `Ещё ${summary.amountForFreeShipping.toFixed(0)} AED до бесплатной доставки`
                          : `Add ${summary.amountForFreeShipping.toFixed(0)} AED for free shipping`}
                    </Text>
                  )}
                  {summary.hasFreeShipping && (
                    <Text style={[styles.stickyFreeShippingDone, isRTL && styles.textRTL]}>
                      {locale === 'ar' ? '✓ شحن مجاني' : locale === 'ru' ? '✓ Бесплатная доставка' : '✓ Free shipping'}
                    </Text>
                  )}
                </View>
              );
            })()}

            {/* Collapsed summary row + View Bag button */}
            <View style={[styles.stickyRow, isRTL && styles.stickyRowRTL]}>
              <View style={[styles.stickyInfo, isRTL && styles.stickyInfoRTL]}>
                <Ionicons name="bag-handle" size={20} color="#dc2626" />
                <Text style={styles.stickyCount}>
                  {cartItems.length} {cartItems.length === 1
                    ? (locale === 'ar' ? 'منتج' : locale === 'ru' ? 'товар' : 'item')
                    : (locale === 'ar' ? 'منتجات' : locale === 'ru' ? 'товаров' : 'items')}
                  {user ? ` · ${Number(summary.subtotal).toFixed(0)} AED` : ''}
                </Text>
              </View>
              <TouchableOpacity style={styles.stickyBtn} onPress={async () => { haptics.mediumTap(); await AsyncStorage.setItem('@genosys_nav_bag_source', JSON.stringify({ pathname: '/concern-detail', params: { slug } })).catch(() => {}); router.push('/(tabs)/bag'); }} activeOpacity={0.85}>
                <Text style={styles.stickyBtnText}>
                  {locale === 'ar' ? 'عرض الحقيبة' : locale === 'ru' ? 'Корзина' : 'View Bag'}
                </Text>
                <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })()}

      {/* Toast */}
      {toastMessage ? (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
          <Ionicons name="bag-check-outline" size={16} color="#fff" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...T.navTitle, flex: 1, textAlign: 'center' },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...T.subtitle, marginTop: 12 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIDE_PADDING },

  // Hero
  hero: { paddingTop: 24, paddingBottom: 20, alignItems: 'center' },
  heroIcon: { fontSize: 40, marginBottom: 12 },
  heroTitle: { ...T.pageTitle, letterSpacing: -0.3, textAlign: 'center', lineHeight: 30 },
  heroSubtitle: { ...T.subtitle, textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 8 },

  // Sections
  section: { marginTop: 20, marginBottom: 8 },
  sectionTitle: { ...T.sectionTitleSmall, marginBottom: 12 },
  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 8 },
  collapsibleHeaderRTL: { flexDirection: 'row-reverse' },

  // Why
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  whyCard: { width: (SCREEN_WIDTH - SIDE_PADDING * 2 - 10) / 2, backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#F0F0F0', padding: 14, marginBottom: 10, alignItems: 'center' },
  whyIcon: { fontSize: 26, marginBottom: 8 },
  whyLabel: { ...T.labelSmall, textAlign: 'center', marginBottom: 4 },
  whyDetail: { ...T.captionTiny, textAlign: 'center', lineHeight: 16 },

  // Protocol PDF
  pdfCard: { marginTop: 16, marginBottom: 8, backgroundColor: '#FFFBEB', borderRadius: 16, borderWidth: 1, borderColor: '#FDE68A', padding: 16 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pdfIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  pdfContent: { flex: 1 },
  pdfTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  pdfTitle: { ...T.label, flex: 1 },
  pdfBadge: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  pdfBadgeText: { ...T.badge, fontWeight: '600', color: '#92400E' },
  pdfDesc: { ...T.captionSmall, lineHeight: 17 },
  pdfDownload: { alignItems: 'center', gap: 4 },
  pdfSize: { ...T.badge, fontWeight: '400', color: '#92400E' },

  // Routine
  routineSectionTitle: { ...T.sectionTitle, marginBottom: 4 },
  routineSubtitle: { ...T.caption, marginBottom: 12 },
  routineStep: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', marginBottom: 8, overflow: 'hidden' },
  routineStepExpanded: { borderColor: '#FECACA' },
  routineStepHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1D1D1F', justifyContent: 'center', alignItems: 'center' },
  stepNumberActive: { backgroundColor: '#dc2626' },
  stepNumberText: { ...T.badgeMedium },
  stepNumberTextActive: { color: '#fff' },
  stepTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  stepTitle: { ...T.label, fontSize: 15 },
  stepTitleActive: { color: '#dc2626' },
  stepDuration: { ...T.caption },
  stepBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  stepDetail: { ...T.caption, color: '#555', lineHeight: 20, marginBottom: 10 },
  stepProducts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepProductChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  stepProductChipInCart: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  stepProductName: { ...T.captionSmall, fontWeight: '600', color: '#1D1D1F' },
  stepProductNameInCart: { color: '#15803D' },
  stepProductPrice: { ...T.captionSmall },
  stepProductPriceInCart: { color: '#16a34a' },

  // Products grid
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // FAQ
  faqSection: { marginTop: 24, marginBottom: 8, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginHorizontal: -SIDE_PADDING, paddingHorizontal: SIDE_PADDING },
  faqItem: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', marginBottom: 8, overflow: 'hidden' },
  faqItemOpen: { borderColor: '#FECACA' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  faqQuestion: { ...T.faqQuestion, fontWeight: '600', lineHeight: 20 },
  faqAnswer: { ...T.faqAnswer, fontSize: 13, paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },

  // Related concerns
  relatedScroll: { gap: 10, paddingRight: 16 },
  relatedCard: { width: 180, backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#F0F0F0', padding: 14 },
  relatedIcon: { fontSize: 28, marginBottom: 8 },
  relatedTitle: { ...T.label, marginBottom: 4, lineHeight: 19 },
  relatedDesc: { ...T.captionTiny, lineHeight: 16 },

  // Bottom CTA Block
  ctaBlock: {
    marginTop: 28,
    marginBottom: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: -SIDE_PADDING,
    paddingHorizontal: SIDE_PADDING + 4,
    alignItems: 'center',
  },
  ctaTitle: {
    ...T.sectionTitle,
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    ...T.caption,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  ctaBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 14,
  },
  ctaBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  ctaBtnPrimaryText: {
    ...T.buttonSmall,
    fontWeight: '700',
    fontSize: 15,
  },
  ctaBtnSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
  },
  ctaBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
  },

  // Sticky Bottom Bar (expandable)
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  stickyChevron: { alignItems: 'center', paddingTop: 6, paddingBottom: 2 },
  stickyHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 2 },
  stickyDetails: { paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', marginBottom: 6 },
  stickyClearAll: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingVertical: 2, marginTop: 4 },
  stickyClearAllText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  stickyRemoveBtn: { marginRight: 8 },
  stickyItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  stickyItemRowRTL: { flexDirection: 'row-reverse' },
  stickyItemName: { ...T.caption, color: '#374151', flex: 1, marginRight: 12 },
  stickyItemPrice: { ...T.labelSmall },
  stickyItemOriginalPrice: { ...T.priceStrikethrough, fontSize: 11 },
  stickyDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginVertical: 6 },
  stickyPricingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  stickyPricingRowRTL: { flexDirection: 'row-reverse' },
  stickyPricingLabel: { ...T.label },
  stickyPricingValue: { ...T.summaryValue, fontWeight: '700' },
  stickyFreeShipping: { ...T.captionSmall, color: '#D97706', marginTop: 4 },
  stickyFreeShippingDone: { ...T.captionSmall, fontWeight: '600', color: '#059669', marginTop: 4 },
  stickyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  stickyRowRTL: { flexDirection: 'row-reverse' },
  stickyInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  stickyInfoRTL: { flexDirection: 'row-reverse' },
  stickyCount: { ...T.label },
  stickyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  stickyBtnText: { ...T.buttonSmall },

  // Toast
  toast: { position: 'absolute', bottom: 48, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.82)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  toastText: { ...T.label, color: '#fff' },

  // RTL
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
