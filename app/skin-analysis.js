/**
 * AI Skin Analysis Screen
 * Multi-step quiz wizard with camera analysis option.
 * Step 1: Skin Type  |  Step 2: Age Group  |  Step 3: Concerns  |  Step 4: Usage
 * Then: Results with personalized product recommendations.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as haptics from '../utils/haptics';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getLocalizedProductName } from '../utils/productLocalization';
import AUTH_CONFIG from '../config/auth';
import { createLogger } from '../utils/logger';
import T from '../utils/typography';

const log = createLogger('SkinAnalysis');

const ASSET_ORIGIN = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';

const TOTAL_STEPS = 4;

const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
const AGE_GROUPS = ['Under 25', '25-35', '35-45', '45-55', '55+'];
const CONCERNS = ['Acne', 'Wrinkles', 'Dark Spots', 'Dryness', 'Sensitivity', 'Pores', 'Redness', 'Dullness'];
const USAGE_OPTIONS = ['Professional', 'At-Home', 'Both'];

const SKIN_TYPE_ICONS = { Normal: 'happy-outline', Dry: 'water-outline', Oily: 'sunny-outline', Combination: 'contrast-outline', Sensitive: 'heart-outline' };
const CONCERN_ICONS = { Acne: 'alert-circle-outline', Wrinkles: 'resize-outline', 'Dark Spots': 'ellipse-outline', Dryness: 'water-outline', Sensitivity: 'shield-outline', Pores: 'scan-outline', Redness: 'flame-outline', Dullness: 'moon-outline' };

export default function SkinAnalysisScreen() {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const { addItem } = useCart();

  const [step, setStep] = useState(0); // 0 = landing, 1-4 = quiz steps, 5 = results
  const [skinType, setSkinType] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [usage, setUsage] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedProducts, setAddedProducts] = useState(new Set());
  const [apiError, setApiError] = useState(null);

  const progress = step > 0 && step <= TOTAL_STEPS ? step / TOTAL_STEPS : 0;

  const canProceed = () => {
    if (step === 1) return !!skinType;
    if (step === 2) return !!ageGroup;
    if (step === 3) return concerns.length > 0;
    if (step === 4) return !!usage;
    return false;
  };

  const handleNext = async () => {
    haptics.lightTap();
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else if (step === TOTAL_STEPS) {
      setLoading(true);
      setApiError(null);
      setStep(5);
      try {
        // Call the website API for recommendations
        const baseUrl = (AUTH_CONFIG.API_BASE_URL || 'https://genosys.ae/api/mobile').replace('/api/mobile', '');
        const params = new URLSearchParams({
          skinType,
          ageGroup,
          targetConcerns: concerns.join(','),
        });
        const res = await fetch(`${baseUrl}/api/skin-recommendations?${params.toString()}`, {
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // API returns an array of product objects directly
        const mapped = (Array.isArray(data) ? data : []).map((p) => ({
          product: p,
          score: p.score || 0,
        }));
        setResults(mapped);
      } catch (err) {
        log.warn('Skin recommendations API failed, using empty results:', err.message);
        setApiError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else if (step === 1) setStep(0);
    else router.back();
  };

  const handleReset = () => {
    setSkinType('');
    setAgeGroup('');
    setConcerns([]);
    setUsage('');
    setResults([]);
    setStep(0);
  };

  const toggleConcern = (c) => {
    haptics.lightTap();
    setConcerns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleAddToBag = async (product) => {
    if (!product || addedProducts.has(product.id) || product.isPriceOnRequest) return;
    try {
      await addItem(product, 1, '', '');
      setAddedProducts((prev) => new Set([...prev, product.id]));
      setTimeout(() => {
        setAddedProducts((prev) => { const n = new Set(prev); n.delete(product.id); return n; });
      }, 2000);
    } catch { /* silent */ }
  };

  const getSkinTypeKey = (val) => `skinType${val}`;
  const getAgeKey = (val) => {
    const map = { 'Under 25': 'ageUnder25', '25-35': 'age25to35', '35-45': 'age35to45', '45-55': 'age45to55', '55+': 'age55plus' };
    return map[val] || val;
  };
  const getConcernKey = (val) => `concern${val.replace(/\s+/g, '')}`;
  const getUsageKey = (val) => `usage${val.replace(/-/g, '')}`;

  // Landing screen
  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('skinAnalysis.title')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.landingContent}>
          <View style={styles.landingIcon}>
            <Ionicons name="sparkles" size={48} color="#dc2626" />
          </View>
          <Text style={[styles.landingTitle, isRTL && styles.textCenter]}>
            {t('skinAnalysis.title')}
          </Text>
          <Text style={[styles.landingSubtitle, isRTL && styles.textCenter]}>
            {t('skinAnalysis.subtitle')}
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setStep(1)}
            activeOpacity={0.85}
          >
            <Ionicons name="clipboard-outline" size={20} color="#fff" />
            <Text style={styles.startButtonText}>{t('skinAnalysis.startQuiz')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => router.push('/skin-analysis-camera')}
            activeOpacity={0.85}
          >
            <Ionicons name="camera-outline" size={20} color="#dc2626" />
            <Text style={styles.cameraButtonText}>{t('skinAnalysis.startCamera')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Results screen
  if (step === 5) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={handleReset} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('skinAnalysis.yourResults')}</Text>
          <View style={styles.backBtn} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>{t('skinAnalysis.analyzing')}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
            {/* Profile summary */}
            <View style={styles.profileSummary}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('skinAnalysis.skinType')}:</Text>
                <Text style={styles.profileValue}>{t(`skinAnalysis.${getSkinTypeKey(skinType)}`)}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('skinAnalysis.ageGroup')}:</Text>
                <Text style={styles.profileValue}>{t(`skinAnalysis.${getAgeKey(ageGroup)}`)}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('skinAnalysis.concerns')}:</Text>
                <Text style={styles.profileValue}>
                  {concerns.map((c) => t(`skinAnalysis.${getConcernKey(c)}`)).join(', ')}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t('skinAnalysis.usage')}:</Text>
                <Text style={styles.profileValue}>{t(`skinAnalysis.${getUsageKey(usage)}`)}</Text>
              </View>
            </View>

            {/* Recommendations */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('skinAnalysis.recommendedProducts')}
            </Text>

            {apiError ? (
              <View style={styles.errorBox}>
                <Ionicons name="cloud-offline-outline" size={28} color="#dc2626" />
                <Text style={styles.errorText}>Could not load recommendations. Please check your connection and try again.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={handleReset} activeOpacity={0.85}>
                  <Ionicons name="refresh" size={16} color="#fff" />
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : results.length === 0 ? (
              <Text style={styles.noResults}>{t('skinAnalysis.noResults')}</Text>
            ) : (
              results.map(({ product, score }, idx) => {
                const name = getLocalizedProductName(product, locale) || product.name || '';
                const price = product.displayPrice ?? product.price ?? 0;
                const rawImg = product.image || '';
                const imageUri = rawImg
                  ? (rawImg.startsWith('http') ? rawImg : `${ASSET_ORIGIN}${rawImg}`)
                  : null;
                const isAdded = addedProducts.has(product.id);

                return (
                  <View style={styles.recCard} key={`rec-${product.id || idx}`}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.recImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.recImage, styles.recImagePlaceholder]}>
                        <Ionicons name="leaf-outline" size={24} color="#D1D5DB" />
                      </View>
                    )}
                    <View style={styles.recInfo}>
                      <Text style={[styles.recName, isRTL && styles.textRTL]} numberOfLines={2}>{name}</Text>
                      {product.isPriceOnRequest ? (
                        <Text style={styles.recPriceOnRequest}>{t('product.priceOnRequest') || 'Price on Request'}</Text>
                      ) : (
                        <Text style={styles.recPrice}>AED {Number(price).toFixed(2)}</Text>
                      )}
                      <View style={styles.recActions}>
                        {product.isPriceOnRequest ? (
                          <TouchableOpacity
                            style={styles.recQuoteBtn}
                            onPress={() => {
                              const msg = encodeURIComponent(
                                (t('product.requestQuoteMessage') || "Hi, I'm interested in {name}. Could you please provide pricing information?").replace('{name}', name)
                              );
                              Linking.openURL(`https://wa.me/971585487665?text=${msg}`);
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="logo-whatsapp" size={14} color="#fff" />
                            <Text style={styles.recAddText}>{t('product.requestQuote') || 'Request Quote'}</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.recAddBtn, isAdded && styles.recAddBtnAdded]}
                            onPress={() => handleAddToBag(product)}
                            disabled={isAdded}
                            activeOpacity={0.8}
                          >
                            <Ionicons name={isAdded ? 'checkmark' : 'bag-add-outline'} size={14} color="#fff" />
                            <Text style={styles.recAddText}>{isAdded ? t('chat.added') : t('chat.addToBag')}</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.recViewBtn}
                          onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.recViewText}>{t('chat.viewProduct')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            {/* Browse by Skin Concern CTA */}
            <TouchableOpacity
              style={styles.concernCta}
              onPress={() => router.push('/skin-concerns')}
              activeOpacity={0.85}
            >
              <Text style={styles.concernCtaIcon}>🌿</Text>
              <Text style={[styles.concernCtaTitle, isRTL && styles.textRTL]}>
                {locale === 'ar' ? 'استكشفي حسب مشكلة البشرة' : locale === 'ru' ? 'Подберите по проблеме кожи' : 'Browse by Skin Concern'}
              </Text>
              <Text style={[styles.concernCtaDesc, isRTL && styles.textRTL]}>
                {locale === 'ar'
                  ? 'منتجات مختارة وروتين يومي لكل مشكلة'
                  : locale === 'ru'
                  ? 'Подобранные продукты и ежедневный уход для каждой проблемы'
                  : 'Curated products & daily routines for every concern'}
              </Text>
              <View style={[styles.concernCtaBtnRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <Text style={styles.concernCtaBtnText}>
                  {locale === 'ar' ? 'اكتشفي' : locale === 'ru' ? 'Смотреть' : 'Explore'}
                </Text>
                <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={16} color="#fff" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.85}>
              <Ionicons name="refresh" size={18} color="#dc2626" />
              <Text style={styles.resetButtonText}>{t('skinAnalysis.tryAgain')}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // Quiz steps 1-4
  const stepTitles = [
    '',
    t('skinAnalysis.selectSkinType'),
    t('skinAnalysis.selectAgeGroup'),
    t('skinAnalysis.selectConcerns'),
    t('skinAnalysis.selectUsage'),
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('skinAnalysis.step', { current: step, total: TOTAL_STEPS })}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, isRTL && styles.textCenter]}>{stepTitles[step]}</Text>

        {/* Step 1: Skin Type */}
        {step === 1 && (
          <View style={styles.optionsGrid}>
            {SKIN_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionCard, skinType === type && styles.optionCardSelected]}
                onPress={() => setSkinType(type)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={SKIN_TYPE_ICONS[type] || 'ellipse-outline'}
                  size={28}
                  color={skinType === type ? '#dc2626' : '#6B7280'}
                />
                <Text style={[styles.optionLabel, skinType === type && styles.optionLabelSelected]}>
                  {t(`skinAnalysis.skinType${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Age Group */}
        {step === 2 && (
          <View style={styles.optionsGrid}>
            {AGE_GROUPS.map((age) => (
              <TouchableOpacity
                key={age}
                style={[styles.optionCard, ageGroup === age && styles.optionCardSelected]}
                onPress={() => setAgeGroup(age)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="person-outline"
                  size={28}
                  color={ageGroup === age ? '#dc2626' : '#6B7280'}
                />
                <Text style={[styles.optionLabel, ageGroup === age && styles.optionLabelSelected]}>
                  {t(`skinAnalysis.${getAgeKey(age)}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3: Concerns (multi-select chips) */}
        {step === 3 && (
          <View style={styles.chipsContainer}>
            {CONCERNS.map((concern) => {
              const selected = concerns.includes(concern);
              return (
                <TouchableOpacity
                  key={concern}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleConcern(concern)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={CONCERN_ICONS[concern] || 'ellipse-outline'}
                    size={16}
                    color={selected ? '#fff' : '#6B7280'}
                  />
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {t(`skinAnalysis.${getConcernKey(concern)}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 4: Usage */}
        {step === 4 && (
          <View style={styles.optionsGrid}>
            {USAGE_OPTIONS.map((opt) => {
              const icons = { Professional: 'medkit-outline', 'At-Home': 'home-outline', Both: 'layers-outline' };
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionCard, usage === opt && styles.optionCardSelected]}
                  onPress={() => setUsage(opt)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={icons[opt] || 'ellipse-outline'}
                    size={28}
                    color={usage === opt ? '#dc2626' : '#6B7280'}
                  />
                  <Text style={[styles.optionLabel, usage === opt && styles.optionLabelSelected]}>
                    {t(`skinAnalysis.${getUsageKey(opt)}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {step === TOTAL_STEPS ? t('skinAnalysis.getResults') : t('skinAnalysis.next')}
          </Text>
          <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...T.navTitle, fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1, textAlign: 'center' },

  // Progress bar
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#dc2626',
    borderRadius: 2,
  },

  // Landing
  landingContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  landingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  landingTitle: {
    ...T.pageTitle,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  landingSubtitle: {
    ...T.bodySmall,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  startButtonText: { ...T.button, fontWeight: '700' },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  cameraButtonText: { ...T.button, fontWeight: '700', color: '#dc2626' },

  // Quiz steps
  stepContent: { padding: 24 },
  stepTitle: { ...T.sectionTitle, color: '#1F2937', marginBottom: 24 },
  textCenter: { textAlign: 'center' },
  textRTL: { textAlign: 'right' },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#FEF2F2',
  },
  optionLabel: {
    ...T.label,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  optionLabelSelected: { color: '#dc2626' },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  chipText: { ...T.label, color: '#374151' },
  chipTextSelected: { color: '#ffffff' },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonDisabled: { backgroundColor: '#D1D5DB' },
  nextButtonText: { ...T.button, fontWeight: '700' },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { ...T.bodySmall, color: '#6B7280', lineHeight: undefined },

  // Results
  resultsContent: { padding: 16, paddingBottom: 40 },
  profileSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  profileLabel: { ...T.labelSmall, color: '#6B7280' },
  profileValue: { ...T.labelSmall, fontWeight: '700', color: '#1F2937', maxWidth: '60%', textAlign: 'right' },
  sectionTitle: { ...T.sectionTitleSmall, fontWeight: '800', color: '#1F2937', marginBottom: 16 },
  noResults: { ...T.label, fontWeight: '400', color: '#6B7280', textAlign: 'center', marginTop: 20 },

  // Recommendation card
  recCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  recImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#F3F4F6' },
  recImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  recInfo: { flex: 1, marginStart: 12 },
  recName: { ...T.label, color: '#1F2937', lineHeight: 20 },
  recPrice: { ...T.label, fontWeight: '800', color: '#dc2626', marginTop: 4 },
  recActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  recAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recAddBtnAdded: { backgroundColor: '#16A34A' },
  recQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  recPriceOnRequest: { ...T.labelSmall, fontWeight: '700', color: '#25D366', marginTop: 2 },
  recAddText: { ...T.captionSmall, fontWeight: '700', color: '#fff' },
  recViewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  recViewText: { ...T.captionSmall, fontWeight: '600', color: '#374151' },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  errorText: { ...T.label, fontWeight: '400', color: '#991B1B', textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryBtnText: { ...T.buttonSmall, fontWeight: '700' },

  concernCta: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF5F5',
    padding: 20,
    alignItems: 'center',
  },
  concernCtaIcon: { fontSize: 28, marginBottom: 8 },
  concernCtaTitle: { ...T.navTitle, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  concernCtaDesc: { ...T.caption, textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  concernCtaBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  concernCtaBtnText: { ...T.buttonSmall, fontWeight: '700' },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  resetButtonText: { ...T.bodySmall, fontWeight: '700', color: '#dc2626', lineHeight: undefined },
});
