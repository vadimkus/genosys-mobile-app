/**
 * Skin Analysis Results Component
 * Displays analysis scores as visual bars, detected concerns,
 * and product recommendations.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { fetchProducts } from '../services/api';
import { getRecommendations } from '../utils/skinRecommendations';
import { getLocalizedProductName } from '../utils/productLocalization';
import AUTH_CONFIG from '../config/auth';

const ASSET_ORIGIN = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';

// Map concern names to skin profile fields
function buildProfileFromConcerns(concerns) {
  const profile = {
    skinType: '',
    ageGroup: '',
    concerns: [],
    usage: 'Both',
  };

  for (const c of concerns) {
    const lower = c.toLowerCase();
    if (lower.includes('acne')) profile.concerns.push('Acne');
    else if (lower.includes('wrinkle')) profile.concerns.push('Wrinkles');
    else if (lower.includes('dark spot')) profile.concerns.push('Dark Spots');
    else if (lower.includes('dry')) profile.concerns.push('Dryness');
    else if (lower.includes('red')) profile.concerns.push('Redness');
    else if (lower.includes('pore')) profile.concerns.push('Pores');
    else if (lower.includes('sensit')) profile.concerns.push('Sensitivity');
    else if (lower.includes('dull')) profile.concerns.push('Dullness');
  }

  return profile;
}

function ScoreBar({ label, value, inverted = false, icon }) {
  // inverted: true means lower value = better (blemishes, wrinkles, etc.)
  const displayValue = inverted ? 100 - value : value;
  const color = displayValue >= 70 ? '#16A34A' : displayValue >= 45 ? '#F59E0B' : '#dc2626';

  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLabelRow}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={[styles.scoreValue, { color }]}>{Math.round(displayValue)}/100</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${displayValue}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function SkinAnalysisResults({ result, onReset, onBack }) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const { addItem } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [addedProducts, setAddedProducts] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const products = await fetchProducts(user, { locale });
        if (products?.length && result?.concerns) {
          const profile = buildProfileFromConcerns(result.concerns);
          const recs = getRecommendations(products, profile, 8);
          setRecommendations(recs);
        }
      } catch { /* silent */ }
    })();
  }, [result]);

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

  const overallColor = result.overall >= 70 ? '#16A34A' : result.overall >= 45 ? '#F59E0B' : '#dc2626';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={onBack || (() => router.back())} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('skinAnalysis.yourResults')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Score */}
        <View style={styles.overallCard}>
          <View style={[styles.overallCircle, { borderColor: overallColor }]}>
            <Text style={[styles.overallScore, { color: overallColor }]}>{Math.round(result.overall)}</Text>
            <Text style={styles.overallMax}>/100</Text>
          </View>
          <Text style={styles.overallLabel}>{t('skinAnalysis.overallScore')}</Text>
        </View>

        {/* Detected Concerns */}
        {result.concerns && result.concerns.length > 0 && result.concerns[0] !== 'None detected' && (
          <View style={styles.concernsCard}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('skinAnalysis.concerns')}
            </Text>
            <View style={styles.concernChips}>
              {result.concerns.map((concern, idx) => (
                <View key={idx} style={styles.concernChip}>
                  <Ionicons name="alert-circle" size={14} color="#dc2626" />
                  <Text style={styles.concernChipText}>{concern}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Score Bars */}
        <View style={styles.scoresCard}>
          <ScoreBar
            label={t('skinAnalysis.blemishes')}
            value={result.blemishes}
            inverted
            icon="alert-circle-outline"
          />
          <ScoreBar
            label={t('skinAnalysis.wrinkles')}
            value={result.wrinkles}
            inverted
            icon="resize-outline"
          />
          <ScoreBar
            label={t('skinAnalysis.pigmentation')}
            value={result.pigmentation}
            inverted
            icon="ellipse-outline"
          />
          <ScoreBar
            label={t('skinAnalysis.pores')}
            value={result.pores}
            inverted
            icon="scan-outline"
          />
          <ScoreBar
            label={t('skinAnalysis.firmness')}
            value={result.firmness}
            inverted={false}
            icon="shield-outline"
          />
          <ScoreBar
            label={t('skinAnalysis.hydration')}
            value={result.hydration}
            inverted={false}
            icon="water-outline"
          />
        </View>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL, { marginTop: 24 }]}>
              {t('skinAnalysis.recommendedProducts')}
            </Text>
            {recommendations.map(({ product }, idx) => {
              const name = getLocalizedProductName(product, locale) || product.name || '';
              const price = product.displayPrice ?? product.price ?? 0;
              const imageUri = product.image ? `${ASSET_ORIGIN}${product.image}` : null;
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
            })}
          </>
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

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.quizBtn} onPress={() => router.push('/skin-analysis')} activeOpacity={0.85}>
            <Ionicons name="clipboard-outline" size={18} color="#dc2626" />
            <Text style={styles.quizBtnText}>{t('skinAnalysis.startQuiz')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retakeBtn} onPress={onReset} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={18} color="#374151" />
            <Text style={styles.retakeBtnText}>{t('skinAnalysis.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1F2937' },
  content: { padding: 16, paddingBottom: 40 },
  textRTL: { textAlign: 'right' },

  // Overall score
  overallCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  overallCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  overallScore: { fontSize: 36, fontWeight: '900' },
  overallMax: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginTop: -4 },
  overallLabel: { fontSize: 15, fontWeight: '700', color: '#374151' },

  // Concerns
  concernsCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  concernChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  concernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  concernChipText: { fontSize: 13, fontWeight: '600', color: '#dc2626' },

  // Score bars
  scoresCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  scoreRow: { gap: 6 },
  scoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151' },
  scoreValue: { fontSize: 13, fontWeight: '800' },
  barBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },

  // Recommendations
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
  recName: { fontSize: 14, fontWeight: '600', color: '#1F2937', lineHeight: 20 },
  recPrice: { fontSize: 14, fontWeight: '800', color: '#dc2626', marginTop: 4 },
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
  recPriceOnRequest: { fontSize: 13, fontWeight: '700', color: '#25D366', marginTop: 2 },
  recAddText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  recViewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  recViewText: { fontSize: 12, fontWeight: '600', color: '#374151' },

  // Concern CTA
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
  concernCtaTitle: { fontSize: 17, fontWeight: '700', color: '#1D1D1F', marginBottom: 4, textAlign: 'center' },
  concernCtaDesc: { fontSize: 13, color: '#86868B', textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  concernCtaBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  concernCtaBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  quizBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  quizBtnText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  retakeBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
});
