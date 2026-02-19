/**
 * Concern Detail — fully native concern page.
 * Replaces the previous WebView approach.
 * Receives `slug` param from skin-concerns.js or deep links.
 */

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchConcernDetail } from '../services/api';
import ProductGridItem from '../components/ProductGridItem';
import * as haptics from '../utils/haptics';
import AUTH_CONFIG from '../config/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const SIDE_PADDING = 16;
const PRODUCT_CARD_WIDTH = Math.floor((SCREEN_WIDTH - SIDE_PADDING * 2 - GRID_GAP) / 2);

export default function ConcernDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoutineSteps, setExpandedRoutineSteps] = useState({});
  const [expandedFaq, setExpandedFaq] = useState({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchConcernDetail(slug, { locale });
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
  }, [slug, locale]);

  useEffect(() => {
    if (slug) loadData();
  }, [slug, locale]);

  const toggleRoutineStep = (sectionIdx, stepIdx) => {
    const key = `${sectionIdx}-${stepIdx}`;
    setExpandedRoutineSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (idx) => {
    setExpandedFaq(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

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

  const handleEssentialPress = (productId) => {
    haptics.lightTap();
    router.push(`/product/${productId}`);
  };

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

  const { seo, why, protocolPdf, routine, products, faq, relatedConcerns, routineEssentials, icon } = data;

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

        {/* Why Section */}
        {why && why.items?.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{why.title}</Text>
            <View style={[styles.whyGrid, isRTL && { flexDirection: 'row-reverse' }]}>
              {why.items.map((item, i) => (
                <View key={i} style={styles.whyCard}>
                  <Text style={styles.whyIcon}>{item.icon}</Text>
                  <Text style={[styles.whyLabel, isRTL && styles.textRTL]}>{item.label}</Text>
                  <Text style={[styles.whyDetail, isRTL && styles.textRTL]}>{item.detail}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Protocol PDF */}
        {protocolPdf ? (
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
                    <Pressable key={step.step} onPress={() => toggleRoutineStep(si, step.step)} style={[styles.routineStep, isExpanded && styles.routineStepExpanded]}>
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
                      {isExpanded ? (
                        <View style={styles.stepBody}>
                          <Text style={[styles.stepDetail, isRTL && styles.textRTL]}>{step.detail}</Text>
                          {step.products?.length > 0 ? (
                            <View style={[styles.stepProducts, isRTL && { flexDirection: 'row-reverse' }]}>
                              {step.products.map((p, pi) => {
                                const idMatch = p.url?.match(/\/products\/(\d+)/);
                                const productId = idMatch ? idMatch[1] : null;
                                return (
                                  <TouchableOpacity
                                    key={pi}
                                    style={styles.stepProductChip}
                                    onPress={() => productId && handleProductPress(productId)}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={styles.stepProductName}>{p.name}</Text>
                                    <Text style={styles.stepProductPrice}>{p.price}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {locale === 'ar' ? `المنتجات الموصى بها (${products.length})` : locale === 'ru' ? `Рекомендуемые продукты (${products.length})` : `Recommended Products (${products.length})`}
            </Text>
            <View style={[styles.productsGrid, isRTL && { flexDirection: 'row-reverse' }]}>
              {products.map((product) => (
                <View key={product.id} style={{ width: PRODUCT_CARD_WIDTH, marginBottom: GRID_GAP }}>
                  <ProductGridItem product={product} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Complete Your Routine */}
        {routineEssentials && routineEssentials.length > 0 ? (
          <View style={styles.essentialsSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL, { textAlign: 'center' }]}>
              {locale === 'ar' ? 'أكملي روتينك' : locale === 'ru' ? 'Дополните ваш уход' : 'Complete Your Routine'}
            </Text>
            <Text style={[styles.essentialsSubtitle, isRTL && styles.textRTL]}>
              {locale === 'ar' ? 'كل روتين فعّال يبدأ بقاعدة نظيفة وينتهي بحماية من الشمس' : locale === 'ru' ? 'Каждый уход начинается с очищения и заканчивается SPF-защитой' : 'Every effective routine starts with a clean base and ends with sun protection'}
            </Text>
            {routineEssentials.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.essentialCard, isRTL && { flexDirection: 'row-reverse' }]} onPress={() => handleEssentialPress(item.productId)} activeOpacity={0.85}>
                <Text style={styles.essentialIcon}>{item.icon}</Text>
                <View style={styles.essentialContent}>
                  <Text style={[styles.essentialName, isRTL && styles.textRTL]}>{item.name}</Text>
                  <Text style={[styles.essentialDesc, isRTL && styles.textRTL]}>{item.description}</Text>
                  <Text style={[styles.essentialPrice, isRTL && styles.textRTL]}>{item.price} →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

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

        {/* Related Concerns */}
        {relatedConcerns && relatedConcerns.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {locale === 'ar' ? 'مشاكل بشرة مشابهة' : locale === 'ru' ? 'Похожие проблемы кожи' : 'Related Skin Concerns'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.relatedScroll, isRTL && { flexDirection: 'row-reverse' }]}>
              {relatedConcerns.map((rc) => (
                <TouchableOpacity key={rc.slug} style={styles.relatedCard} onPress={() => handleRelatedPress(rc.slug)} activeOpacity={0.85}>
                  <Text style={styles.relatedIcon}>{rc.icon}</Text>
                  <Text style={[styles.relatedTitle, isRTL && styles.textRTL]} numberOfLines={2}>{rc.h1}</Text>
                  <Text style={[styles.relatedDesc, isRTL && styles.textRTL]} numberOfLines={2}>{rc.heroShort}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* SEO Intro text */}
        {seo?.intro ? (
          <View style={styles.section}>
            <Text style={[styles.introText, isRTL && styles.textRTL]}>{seo.intro}</Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E5E5EA' },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1D1D1F', textAlign: 'center' },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#86868B' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIDE_PADDING },

  // Hero
  hero: { paddingTop: 24, paddingBottom: 20, alignItems: 'center' },
  heroIcon: { fontSize: 40, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#1D1D1F', textAlign: 'center', letterSpacing: -0.3, lineHeight: 30 },
  heroSubtitle: { fontSize: 15, color: '#86868B', textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 8 },

  // Sections
  section: { marginTop: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1D1D1F', marginBottom: 12 },

  // Why
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  whyCard: { width: (SCREEN_WIDTH - SIDE_PADDING * 2 - 10) / 2, backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#F0F0F0', padding: 14, marginBottom: 10, alignItems: 'center' },
  whyIcon: { fontSize: 26, marginBottom: 8 },
  whyLabel: { fontSize: 13, fontWeight: '600', color: '#1D1D1F', textAlign: 'center', marginBottom: 4 },
  whyDetail: { fontSize: 11, color: '#86868B', textAlign: 'center', lineHeight: 16 },

  // Protocol PDF
  pdfCard: { marginTop: 16, marginBottom: 8, backgroundColor: '#FFFBEB', borderRadius: 16, borderWidth: 1, borderColor: '#FDE68A', padding: 16 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pdfIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center' },
  pdfContent: { flex: 1 },
  pdfTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  pdfTitle: { fontSize: 14, fontWeight: '600', color: '#1D1D1F', flex: 1 },
  pdfBadge: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  pdfBadgeText: { fontSize: 10, fontWeight: '600', color: '#92400E' },
  pdfDesc: { fontSize: 12, color: '#86868B', lineHeight: 17 },
  pdfDownload: { alignItems: 'center', gap: 4 },
  pdfSize: { fontSize: 10, color: '#92400E' },

  // Routine
  routineSectionTitle: { fontSize: 20, fontWeight: '700', color: '#1D1D1F', marginBottom: 4 },
  routineSubtitle: { fontSize: 13, color: '#86868B', marginBottom: 12 },
  routineStep: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', marginBottom: 8, overflow: 'hidden' },
  routineStepExpanded: { borderColor: '#FECACA' },
  routineStepHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1D1D1F', justifyContent: 'center', alignItems: 'center' },
  stepNumberActive: { backgroundColor: '#dc2626' },
  stepNumberText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepNumberTextActive: { color: '#fff' },
  stepTitleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  stepTitle: { fontSize: 15, fontWeight: '600', color: '#1D1D1F' },
  stepTitleActive: { color: '#dc2626' },
  stepDuration: { fontSize: 13, color: '#86868B' },
  stepBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  stepDetail: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 10 },
  stepProducts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepProductChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  stepProductName: { fontSize: 12, fontWeight: '600', color: '#1D1D1F' },
  stepProductPrice: { fontSize: 12, color: '#86868B' },

  // Products grid
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // Essentials
  essentialsSection: { marginTop: 24, marginBottom: 8, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginHorizontal: -SIDE_PADDING, paddingHorizontal: SIDE_PADDING },
  essentialsSubtitle: { fontSize: 13, color: '#86868B', textAlign: 'center', marginBottom: 16 },
  essentialCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#F0F0F0', padding: 14, marginBottom: 10 },
  essentialIcon: { fontSize: 26 },
  essentialContent: { flex: 1 },
  essentialName: { fontSize: 14, fontWeight: '600', color: '#1D1D1F', marginBottom: 3 },
  essentialDesc: { fontSize: 12, color: '#86868B', lineHeight: 17, marginBottom: 4 },
  essentialPrice: { fontSize: 12, fontWeight: '600', color: '#dc2626' },

  // FAQ
  faqSection: { marginTop: 24, marginBottom: 8, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginHorizontal: -SIDE_PADDING, paddingHorizontal: SIDE_PADDING },
  faqItem: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', marginBottom: 8, overflow: 'hidden' },
  faqItemOpen: { borderColor: '#FECACA' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#1D1D1F', lineHeight: 20 },
  faqAnswer: { paddingHorizontal: 14, paddingBottom: 14, fontSize: 13, color: '#555', lineHeight: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },

  // Related concerns
  relatedScroll: { gap: 10, paddingRight: 16 },
  relatedCard: { width: 180, backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#F0F0F0', padding: 14 },
  relatedIcon: { fontSize: 28, marginBottom: 8 },
  relatedTitle: { fontSize: 14, fontWeight: '600', color: '#1D1D1F', marginBottom: 4, lineHeight: 19 },
  relatedDesc: { fontSize: 11, color: '#86868B', lineHeight: 16 },

  // Intro
  introText: { fontSize: 13, color: '#86868B', lineHeight: 20 },

  // RTL
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
