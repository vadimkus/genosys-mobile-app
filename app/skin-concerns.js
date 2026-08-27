/**
 * Skin Concerns - interactive face map ("Tap where it bothers you").
 * Zone taps and quick chips navigate to the native concern-detail screen.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import ConcernFaceMap from '../components/ConcernFaceMap';
import * as haptics from '../utils/haptics';
import { colors } from '../utils/theme';

const SIDE_PADDING = 20;

export const CONCERNS = [
  {
    slug: 'sun-protection',
    icon: '☀️',
    short: { en: 'Sun Protection', ar: 'الحماية من الشمس', ru: 'Защита от солнца' },
    en: { h1: 'Sun Protection for UAE Climate', heroShort: 'Professional-grade Korean sunscreens and BB cushions with SPF - lightweight, non-greasy formulas designed for the intense UAE sun.' },
    ar: { h1: 'الحماية من الشمس لمناخ الإمارات', heroShort: 'واقيات شمس كورية احترافية وكوشن BB مع SPF - تركيبات خفيفة وغير دهنية مصممة لشمس الإمارات الحارقة.' },
    ru: { h1: 'Защита от солнца для климата ОАЭ', heroShort: 'Профессиональные корейские солнцезащитные средства и BB-кушоны с SPF - лёгкие нежирные формулы для интенсивного солнца ОАЭ.' },
  },
  {
    slug: 'acne-treatment',
    icon: '💆',
    short: { en: 'Acne & Blemish', ar: 'حب الشباب', ru: 'Акне' },
    en: { h1: 'Acne & Blemish Treatment', heroShort: 'Clinically proven toner, serum & cream that control breakouts without damaging your skin barrier.' },
    ar: { h1: 'علاج حب الشباب والبثور', heroShort: 'تونر وسيروم وكريم مثبتون سريرياً يتحكمون في البثور دون الإضرار بحاجز البشرة.' },
    ru: { h1: 'Лечение акне и высыпаний', heroShort: 'Клинически доказанные тоник, сыворотка и крем - контролируют высыпания, не повреждая барьер кожи.' },
  },
  {
    slug: 'pigmentation',
    icon: '✨',
    short: { en: 'Pigmentation', ar: 'التصبغات', ru: 'Пигментация' },
    en: { h1: 'Pigmentation & Brightening', heroShort: 'Fade dark spots, even skin tone and restore radiance with vitamin C, niacinamide & arbutin.' },
    ar: { h1: 'علاج التصبغات وتفتيح البشرة', heroShort: 'تقليل البقع الداكنة وتوحيد لون البشرة واستعادة الإشراق بفيتامين سي والنياسيناميد.' },
    ru: { h1: 'Пигментация и осветление', heroShort: 'Уменьшение тёмных пятен, выравнивание тона и сияние с витамином С, ниацинамидом и арбутином.' },
  },
  {
    slug: 'scars-treatment',
    icon: '🧬',
    short: { en: 'Scars & Repair', ar: 'الندبات', ru: 'Рубцы' },
    en: { h1: 'Scar Treatment & Skin Repair', heroShort: 'EGF repair creams & microneedling serums - rebuild collagen and smooth scar tissue.' },
    ar: { h1: 'علاج الندبات وإصلاح البشرة', heroShort: 'كريمات إصلاح EGF وسيرومات الوخز بالإبر - إعادة بناء الكولاجين وتنعيم أنسجة الندبات.' },
    ru: { h1: 'Лечение рубцов и восстановление', heroShort: 'Кремы с EGF и сыворотки для микронидлинга - восстановление коллагена и разглаживание рубцов.' },
  },
  {
    slug: 'hair-loss',
    icon: '💇',
    short: { en: 'Hair & Scalp', ar: 'الشعر وفروة الرأس', ru: 'Волосы' },
    en: { h1: 'Hair Loss & Scalp Care', heroShort: 'HR3 MATRIX shampoo, tonic & solution that reactivate follicles and reduce hair loss.' },
    ar: { h1: 'علاج تساقط الشعر وفروة الرأس', heroShort: 'شامبو وتونيك ومحلول HR3 MATRIX يعيدون تنشيط البصيلات ويقللون تساقط الشعر.' },
    ru: { h1: 'Выпадение волос и уход за кожей головы', heroShort: 'Шампунь, тоник и раствор HR3 MATRIX - реактивация фолликулов и уменьшение выпадения волос.' },
  },
  {
    slug: 'anti-aging',
    icon: '⏳',
    short: { en: 'Anti-Aging', ar: 'مكافحة الشيخوخة', ru: 'Антивозрастной' },
    en: { h1: 'Anti-Aging & Wrinkle Treatment', heroShort: 'Reduce fine lines, rebuild collagen and restore firmness with EGF, peptides & growth factors.' },
    ar: { h1: 'مكافحة الشيخوخة وعلاج التجاعيد', heroShort: 'تقليل الخطوط الدقيقة وإعادة بناء الكولاجين واستعادة المرونة مع EGF والبيبتيدات.' },
    ru: { h1: 'Антивозрастной уход и морщины', heroShort: 'Уменьшение морщин, восстановление коллагена и упругости с EGF, пептидами и факторами роста.' },
  },
  {
    slug: 'hydration',
    icon: '💧',
    short: { en: 'Hydration', ar: 'الترطيب', ru: 'Увлажнение' },
    en: { h1: 'Hydrating Skincare for Dry Climate', heroShort: 'Hyaluronic acid serums & barrier-lock creams - Korean hydration tech for UAE dehydration.' },
    ar: { h1: 'ترطيب البشرة للمناخ الجاف', heroShort: 'سيرومات حمض الهيالورونيك وكريمات حماية الحاجز - تقنية ترطيب كورية لجفاف الإمارات.' },
    ru: { h1: 'Увлажнение для сухого климата', heroShort: 'Сыворотки с гиалуроновой кислотой и барьерные кремы - корейское увлажнение для климата ОАЭ.' },
  },
  {
    slug: 'sensitivity',
    icon: '🌿',
    short: { en: 'Sensitive Skin', ar: 'البشرة الحساسة', ru: 'Чувствительная кожа' },
    en: { h1: 'Sensitive Skin & Soothing Care', heroShort: 'Soothing serums, barrier creams & calming care for UAE temperature shock and hard water.' },
    ar: { h1: 'البشرة الحساسة والعلاج المهدئ', heroShort: 'سيرومات مهدئة وكريمات حاجز البشرة للصدمة الحرارية والمياه العسرة في الإمارات.' },
    ru: { h1: 'Чувствительная кожа и бережный уход', heroShort: 'Успокаивающие сыворотки и барьерные кремы для температурного шока и жёсткой воды ОАЭ.' },
  },
];

export default function SkinConcernsScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { onScroll, headerHeight, translateY: headerTranslateY } = useCollapsibleHeader({ hideOnScroll: true });
  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'); };

  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const handleConcernPress = (concern) => {
    haptics.lightTap();
    router.push({ pathname: '/concern-detail', params: { slug: concern.slug } });
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY}
        title={t('categories.skinConcern')}
        onBack={onBack}
        isRTL={isRTL}
      />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 8 }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
        {/* Interactive face map - tap a zone (or a quick chip) to jump to its concern.
            The map includes a chip cloud for all concerns; no separate grid needed. */}
        <ConcernFaceMap
          concerns={CONCERNS}
          locale={locale}
          isRTL={isRTL}
          onSelectConcern={handleConcernPress}
        />

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIDE_PADDING,
  },
});
