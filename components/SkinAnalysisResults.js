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
  Animated,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CollapsibleHeader, { useCollapsibleHeader } from './CollapsibleHeader';
import { fetchProducts } from '../services/api';
import { getRecommendations } from '../utils/skinRecommendations';
import { getLocalizedProductName } from '../utils/productLocalization';
import { getPricingDisplay, formatAed } from '../utils/pricingDisplay';
import AUTH_CONFIG from '../config/auth';
import T from '../utils/typography';
import { colors, tint, shadow, surfaces } from '../utils/theme';

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

function ScoreBar({ label, value, inverted = false, icon, isRTL = false }) {
  // inverted: true means lower value = better (blemishes, wrinkles, etc.)
  const displayValue = inverted ? 100 - value : value;
  const color = displayValue >= 70 ? '#16A34A' : displayValue >= 45 ? '#F59E0B' : '#dc2626';

  return (
    <View style={styles.scoreRow}>
      <View style={[styles.scoreLabelRow, isRTL && styles.scoreLabelRowRTL]}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.scoreLabel, isRTL && styles.textRTL]}>{label}</Text>
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
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
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
    if (!user) {
      router.push({
        pathname: '/auth/login',
        params: { returnTo: '/skin-analysis-camera' },
      });
      return;
    }
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
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('skinAnalysis.yourResults')}
        scrollY={scrollY}
        onBack={onBack || (() => router.back())}
        isRTL={isRTL}
      />

      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingTop: headerHeight + 8, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
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
                  <Ionicons name="alert-circle" size={14} color={colors.brand} />
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
            isRTL={isRTL}
          />
          <ScoreBar
            label={t('skinAnalysis.wrinkles')}
            value={result.wrinkles}
            inverted
            icon="resize-outline"
            isRTL={isRTL}
          />
          <ScoreBar
            label={t('skinAnalysis.pigmentation')}
            value={result.pigmentation}
            inverted
            icon="ellipse-outline"
            isRTL={isRTL}
          />
          <ScoreBar
            label={t('skinAnalysis.pores')}
            value={result.pores}
            inverted
            icon="scan-outline"
            isRTL={isRTL}
          />
          <ScoreBar
            label={t('skinAnalysis.firmness')}
            value={result.firmness}
            inverted={false}
            icon="shield-outline"
            isRTL={isRTL}
          />
          <ScoreBar
            label={t('skinAnalysis.hydration')}
            value={result.hydration}
            inverted={false}
            icon="water-outline"
            isRTL={isRTL}
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
              const pricing = getPricingDisplay(product);
              const price = pricing.displayPrice;
              const imageUri = product.image ? `${ASSET_ORIGIN}${product.image}` : null;
              const isAdded = addedProducts.has(product.id);

              return (
                <View style={styles.recCard} key={`rec-${product.id || idx}`}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.recImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.recImage, styles.recImagePlaceholder]}>
                      <Ionicons name="leaf-outline" size={24} color={colors.tertiary} />
                    </View>
                  )}
                  <View style={styles.recInfo}>
                    <Text style={[styles.recName, isRTL && styles.textRTL]} numberOfLines={2}>{name}</Text>
                    {!user ? (
                      <Text style={styles.recPriceOnRequest}>{t('product.loginToSeePrice')}</Text>
                    ) : pricing.isPriceOnRequest ? (
                      <Text style={styles.recPriceOnRequest}>{t('product.priceOnRequest')}</Text>
                    ) : (
                      <Text style={styles.recPrice}>{formatAed(price)}</Text>
                    )}
                    <View style={styles.recActions}>
                      {pricing.isPriceOnRequest ? (
                        <TouchableOpacity
                          style={styles.recQuoteBtn}
                          onPress={() => {
                            const msg = encodeURIComponent(
                              t('product.requestQuoteMessage', { name })
                            );
                            Linking.openURL(`https://wa.me/971585487665?text=${msg}`);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="logo-whatsapp" size={14} color="#fff" />
                          <Text style={styles.recAddText}>{t('product.requestQuote')}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.recAddBtn, isAdded && styles.recAddBtnAdded]}
                          onPress={() => handleAddToBag(product)}
                          disabled={isAdded}
                          activeOpacity={0.8}
                        >
                          <Ionicons name={isAdded ? 'checkmark' : 'bag-add-outline'} size={14} color="#fff" />
                          <Text style={styles.recAddText}>
                            {isAdded ? t('chat.added') : !user ? t('shop.loginToBuy') : t('chat.addToBag')}
                          </Text>
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
            {t('skinAnalysis.browseByConcernTitle')}
          </Text>
          <Text style={[styles.concernCtaDesc, isRTL && styles.textRTL]}>
            {t('skinAnalysis.browseByConcernDesc')}
          </Text>
          <View style={[styles.concernCtaBtnRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.concernCtaBtnText}>
              {t('skinAnalysis.browseByConcernButton')}
            </Text>
            <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.quizBtn} onPress={() => router.push('/skin-analysis')} activeOpacity={0.85}>
            <Ionicons name="clipboard-outline" size={18} color={colors.brand} />
            <Text style={styles.quizBtnText}>{t('skinAnalysis.startQuiz')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retakeBtn} onPress={onReset} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={18} color={colors.secondaryLabel} />
            <Text style={styles.retakeBtnText}>{t('skinAnalysis.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
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
  overallMax: { ...T.label, color: '#9CA3AF', marginTop: -4 },
  overallLabel: { ...T.bodySmall, fontWeight: '700', color: '#374151', lineHeight: undefined },

  // Concerns
  concernsCard: {
    backgroundColor: tint(colors.brand, '0F'),
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: { ...T.price, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
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
  concernChipText: { ...T.labelSmall, color: '#dc2626' },

  // Score bars
  scoresCard: {
    ...surfaces.card,
    ...shadow.card,
    padding: 16,
    gap: 14,
  },
  scoreRow: { gap: 6 },
  scoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabelRowRTL: {
    flexDirection: 'row-reverse',
  },
  scoreLabel: { ...T.labelSmall, color: '#374151', flex: 1 },
  scoreValue: { ...T.labelSmall, fontWeight: '800' },
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
    ...surfaces.card,
    ...shadow.card,
    padding: 12,
    marginBottom: 12,
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

  // Concern CTA
  concernCta: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: tint(colors.brand, '0F'),
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
  quizBtnText: { ...T.buttonSmall, fontWeight: '700', color: '#dc2626' },
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
  retakeBtnText: { ...T.buttonSmall, fontWeight: '700', color: '#374151' },
});
