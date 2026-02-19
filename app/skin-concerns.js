/**
 * Skin Concerns — native grid of concern cards.
 * Each card opens the concern detail page on the website in a WebView.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import * as haptics from '../utils/haptics';
import AUTH_CONFIG from '../config/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const SIDE_PADDING = 20;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - SIDE_PADDING * 2 - CARD_GAP) / 2);

const CONCERNS = [
  {
    slug: 'sun-protection',
    icon: '☀️',
    en: { h1: 'Sun Protection for UAE Climate', heroShort: 'Professional-grade Korean sunscreens and BB cushions with SPF — lightweight, non-greasy formulas designed for the intense UAE sun.' },
    ar: { h1: 'الحماية من الشمس لمناخ الإمارات', heroShort: 'واقيات شمس كورية احترافية وكوشن BB مع SPF — تركيبات خفيفة وغير دهنية مصممة لشمس الإمارات الحارقة.' },
    ru: { h1: 'Защита от солнца для климата ОАЭ', heroShort: 'Профессиональные корейские солнцезащитные средства и BB-кушоны с SPF — лёгкие нежирные формулы для интенсивного солнца ОАЭ.' },
  },
  {
    slug: 'acne-treatment',
    icon: '🔬',
    en: { h1: 'Acne & Blemish Treatment', heroShort: 'Clinically proven toner, serum & cream that control breakouts without damaging your skin barrier.' },
    ar: { h1: 'علاج حب الشباب والبثور', heroShort: 'تونر وسيروم وكريم مثبتون سريرياً يتحكمون في البثور دون الإضرار بحاجز البشرة.' },
    ru: { h1: 'Лечение акне и высыпаний', heroShort: 'Клинически доказанные тоник, сыворотка и крем — контролируют высыпания, не повреждая барьер кожи.' },
  },
  {
    slug: 'pigmentation',
    icon: '✨',
    en: { h1: 'Pigmentation & Brightening', heroShort: 'Fade dark spots, even skin tone and restore radiance with vitamin C, niacinamide & arbutin.' },
    ar: { h1: 'علاج التصبغات وتفتيح البشرة', heroShort: 'تقليل البقع الداكنة وتوحيد لون البشرة واستعادة الإشراق بفيتامين سي والنياسيناميد.' },
    ru: { h1: 'Пигментация и осветление', heroShort: 'Уменьшение тёмных пятен, выравнивание тона и сияние с витамином С, ниацинамидом и арбутином.' },
  },
  {
    slug: 'scars-treatment',
    icon: '🩹',
    en: { h1: 'Scar Treatment & Skin Repair', heroShort: 'EGF repair creams & microneedling serums — rebuild collagen and smooth scar tissue.' },
    ar: { h1: 'علاج الندبات وإصلاح البشرة', heroShort: 'كريمات إصلاح EGF وسيرومات الوخز بالإبر — إعادة بناء الكولاجين وتنعيم أنسجة الندبات.' },
    ru: { h1: 'Лечение рубцов и восстановление', heroShort: 'Кремы с EGF и сыворотки для микронидлинга — восстановление коллагена и разглаживание рубцов.' },
  },
  {
    slug: 'hair-loss',
    icon: '💇',
    en: { h1: 'Hair Loss & Scalp Care', heroShort: 'HR3 MATRIX shampoo, tonic & solution that reactivate follicles and reduce hair loss.' },
    ar: { h1: 'علاج تساقط الشعر وفروة الرأس', heroShort: 'شامبو وتونيك ومحلول HR3 MATRIX يعيدون تنشيط البصيلات ويقللون تساقط الشعر.' },
    ru: { h1: 'Выпадение волос и уход за кожей головы', heroShort: 'Шампунь, тоник и раствор HR3 MATRIX — реактивация фолликулов и уменьшение выпадения волос.' },
  },
  {
    slug: 'anti-aging',
    icon: '⏳',
    en: { h1: 'Anti-Aging & Wrinkle Treatment', heroShort: 'Reduce fine lines, rebuild collagen and restore firmness with EGF, peptides & growth factors.' },
    ar: { h1: 'مكافحة الشيخوخة وعلاج التجاعيد', heroShort: 'تقليل الخطوط الدقيقة وإعادة بناء الكولاجين واستعادة المرونة مع EGF والبيبتيدات.' },
    ru: { h1: 'Антивозрастной уход и морщины', heroShort: 'Уменьшение морщин, восстановление коллагена и упругости с EGF, пептидами и факторами роста.' },
  },
  {
    slug: 'hydration',
    icon: '💧',
    en: { h1: 'Hydrating Skincare for Dry Climate', heroShort: 'Hyaluronic acid serums & barrier-lock creams — Korean hydration tech for UAE dehydration.' },
    ar: { h1: 'ترطيب البشرة للمناخ الجاف', heroShort: 'سيرومات حمض الهيالورونيك وكريمات حماية الحاجز — تقنية ترطيب كورية لجفاف الإمارات.' },
    ru: { h1: 'Увлажнение для сухого климата', heroShort: 'Сыворотки с гиалуроновой кислотой и барьерные кремы — корейское увлажнение для климата ОАЭ.' },
  },
  {
    slug: 'sensitivity',
    icon: '🌿',
    en: { h1: 'Sensitive Skin & Soothing Care', heroShort: 'Soothing serums, barrier creams & calming care for UAE temperature shock and hard water.' },
    ar: { h1: 'البشرة الحساسة والعلاج المهدئ', heroShort: 'سيرومات مهدئة وكريمات حاجز البشرة للصدمة الحرارية والمياه العسرة في الإمارات.' },
    ru: { h1: 'Чувствительная кожа и бережный уход', heroShort: 'Успокаивающие сыворотки и барьерные кремы для температурного шока и жёсткой воды ОАЭ.' },
  },
];

export default function SkinConcernsScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const title = locale === 'ar' ? 'اختاري مشكلة بشرتك'
    : locale === 'ru' ? 'Выберите проблему кожи'
    : 'Choose Your Skin Concern';

  const subtitle = locale === 'ar' ? 'منتجات وبروتوكولات مخصصة لكل مشكلة'
    : locale === 'ru' ? 'Персональные продукты и протоколы для каждой проблемы'
    : 'Personalized products & protocols for every concern';

  const exploreLabel = locale === 'ar' ? 'اكتشف' : locale === 'ru' ? 'Подробнее' : 'Explore';

  const handleConcernPress = (concern) => {
    haptics.lightTap();
    const prefix = locale === 'en' ? '' : `/${locale}`;
    const url = `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${prefix}/products/concern/${concern.slug}`;
    const localeData = concern[locale] || concern.en;
    router.push({ pathname: '/webview', params: { url, title: localeData.h1 } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>
          {t('categories.skinConcern') || 'Skin Concern'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={[styles.pageTitle, isRTL && styles.textRTL]}>{title}</Text>
          <Text style={[styles.pageSubtitle, isRTL && styles.textRTL]}>{subtitle}</Text>
        </View>

        {/* Concern cards grid */}
        <View style={[styles.grid, isRTL && styles.gridRTL]}>
          {CONCERNS.map((concern) => {
            const data = concern[locale] || concern.en;
            return (
              <TouchableOpacity
                key={concern.slug}
                style={styles.card}
                onPress={() => handleConcernPress(concern)}
                activeOpacity={0.85}
              >
                <Text style={styles.cardIcon}>{concern.icon}</Text>
                <Text style={[styles.cardTitle, isRTL && styles.textRTL]} numberOfLines={2}>
                  {data.h1}
                </Text>
                {data.heroShort ? (
                  <Text style={[styles.cardDescription, isRTL && styles.textRTL]} numberOfLines={3}>
                    {data.heroShort}
                  </Text>
                ) : null}
                <View style={[styles.exploreRow, isRTL && styles.exploreRowRTL]}>
                  <Text style={styles.exploreText}>{exploreLabel}</Text>
                  <Ionicons
                    name={isRTL ? 'arrow-back' : 'arrow-forward'}
                    size={14}
                    color="#dc2626"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIDE_PADDING,
  },
  titleSection: {
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#86868B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridRTL: {
    flexDirection: 'row-reverse',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 16,
    marginBottom: CARD_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#86868B',
    lineHeight: 17,
    marginBottom: 10,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  exploreRowRTL: {
    flexDirection: 'row-reverse',
  },
  exploreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
