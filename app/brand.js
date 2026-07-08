/**
 * Brand Screen - Native (replaces WebView)
 * Displays GENOSYS brand information with videos and product images.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import AppFooter from '../components/AppFooter';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, surfaces, tint } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BrandScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const brandTitle = locale === 'ar' ? 'GENOSYS — نظام إعادة ولادة الجينات'
    : locale === 'ru' ? 'GENOSYS — Система генетического возрождения'
    : 'GENOSYS — Gene Re-Birth System';

  const brandDescription = locale === 'ar'
    ? 'جينوسيس هي علامة تجارية كورية متخصصة في مستحضرات العناية بالبشرة المهنية. تجمع منتجاتنا بين أحدث التقنيات الحيوية وأبحاث الجلد المتقدمة لتقديم حلول فعالة للعناية بالبشرة.'
    : locale === 'ru'
    ? 'GENOSYS — корейский бренд профессиональной дерматокосметики. Наши продукты сочетают новейшие биотехнологии и передовые исследования кожи для эффективного ухода.'
    : 'GENOSYS is a Korean professional dermacosmetics brand. Our products combine cutting-edge biotechnology and advanced skin research to deliver effective skincare solutions.';

  const brandMission = locale === 'ar'
    ? 'مهمتنا هي تقديم حلول متقدمة للعناية بالبشرة تعزز الجمال الطبيعي من خلال العلم والابتكار. نحن ملتزمون بأعلى معايير الجودة والسلامة.'
    : locale === 'ru'
    ? 'Наша миссия — предоставлять передовые решения по уходу за кожей, которые усиливают естественную красоту через науку и инновации. Мы привержены высочайшим стандартам качества и безопасности.'
    : 'Our mission is to provide advanced skincare solutions that enhance natural beauty through science and innovation. We are committed to the highest standards of quality and safety.';

  const keyTechnologies = locale === 'ar'
    ? [
        { title: 'تقنية الخلايا الجذعية', desc: 'تنشيط تجديد البشرة على المستوى الخلوي' },
        { title: 'تقنية الببتيد', desc: 'ببتيدات متقدمة لمكافحة الشيخوخة وتجديد البشرة' },
        { title: 'نظام النمو الحيوي', desc: 'عوامل نمو طبيعية لإصلاح البشرة وتجديدها' },
      ]
    : locale === 'ru'
    ? [
        { title: 'Технология стволовых клеток', desc: 'Активация обновления кожи на клеточном уровне' },
        { title: 'Пептидная технология', desc: 'Передовые пептиды для борьбы со старением и восстановления кожи' },
        { title: 'Система Bio Growth', desc: 'Природные факторы роста для восстановления и регенерации кожи' },
      ]
    : [
        { title: 'Stem Cell Technology', desc: 'Activating skin renewal at the cellular level' },
        { title: 'Peptide Technology', desc: 'Advanced peptides for anti-aging and skin restoration' },
        { title: 'Bio Growth System', desc: 'Natural growth factors for skin repair and regeneration' },
      ];

  const sectionLabels = {
    about: locale === 'ar' ? 'عن العلامة التجارية' : locale === 'ru' ? 'О бренде' : 'About the Brand',
    mission: locale === 'ar' ? 'مهمتنا' : locale === 'ru' ? 'Наша миссия' : 'Our Mission',
    technologies: locale === 'ar' ? 'التقنيات الرئيسية' : locale === 'ru' ? 'Ключевые технологии' : 'Key Technologies',
    videos: locale === 'ar' ? 'فيديوهات العلامة التجارية' : locale === 'ru' ? 'Видео бренда' : 'Brand Videos',
    brandIntro: locale === 'ar' ? 'تعرف على جينوسيس' : locale === 'ru' ? 'Знакомство с GENOSYS' : 'Meet GENOSYS',
    proTreatment: locale === 'ar' ? 'العلاج المهني' : locale === 'ru' ? 'Профессиональная процедура' : 'Professional Treatment',
    madeInKorea: locale === 'ar' ? 'صنع في كوريا 🇰🇷' : locale === 'ru' ? 'Сделано в Корее 🇰🇷' : 'Made in Korea 🇰🇷',
    certifiedUAE: locale === 'ar' ? 'معتمد في الإمارات 🇦🇪' : locale === 'ru' ? 'Сертифицировано в ОАЭ 🇦🇪' : 'Certified in UAE 🇦🇪',
  };

  const videos = [
    { id: 'brand-intro', title: sectionLabels.brandIntro, youtubeId: '4L9xZc7wAjI' },
    { id: 'pro-treatment', title: sectionLabels.proTreatment, youtubeId: 'v-i6CHJfWIg' },
  ];

  const openVideo = useCallback((youtubeId) => {
    haptics.lightTap();
    Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`).catch(() => {});
  }, []);

  const SectionHeader = ({ icon, tileColor, title }) => (
    <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
      <View style={[surfaces.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
    </View>
  );

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={t('navigation.brand') || 'Brand'} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 12 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image
              source={require('../assets/genosys-logo-gray.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.heroTitle, isRTL && styles.textRTLCenter]}>{brandTitle}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sectionLabels.madeInKorea}</Text>
              </View>
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={[styles.badgeText, styles.badgeGreenText]}>{sectionLabels.certifiedUAE}</Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader icon="information-circle" tileColor={colors.blue} title={sectionLabels.about} />
            <Text style={[styles.paragraph, styles.paragraphLast, isRTL && styles.textRTL]}>{brandDescription}</Text>
          </View>

          {/* Mission Section */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader icon="flag" tileColor={colors.brand} title={sectionLabels.mission} />
            <Text style={[styles.paragraph, styles.paragraphLast, isRTL && styles.textRTL]}>{brandMission}</Text>
          </View>

          {/* Key Technologies */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader icon="flask" tileColor={colors.purple} title={sectionLabels.technologies} />
            {keyTechnologies.map((tech, index) => (
              <View
                key={index}
                style={[styles.techRow, isRTL && styles.rowRTL, index === keyTechnologies.length - 1 && styles.techRowLast]}
              >
                <View style={styles.techIcon}>
                  <Ionicons name="flask" size={18} color={colors.purple} />
                </View>
                <View style={styles.techContent}>
                  <Text style={[styles.techTitle, isRTL && styles.textRTL]}>{tech.title}</Text>
                  <Text style={[styles.techDesc, isRTL && styles.textRTL]}>{tech.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Brand Videos */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader icon="videocam" tileColor={colors.indigo} title={sectionLabels.videos} />
            {videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoItem}
                onPress={() => openVideo(video.youtubeId)}
                activeOpacity={0.85}
              >
                <Text style={[styles.videoTitle, isRTL && styles.textRTL]}>{video.title}</Text>
                <View style={styles.videoWrapper}>
                  <Image
                    source={{ uri: `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={30} color="#ffffff" style={{ marginLeft: 3 }} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Product Showcase */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader
              icon="cube"
              tileColor={colors.teal}
              title={locale === 'ar' ? 'مجموعة المنتجات المهنية' : locale === 'ru' ? 'Профессиональная линейка продуктов' : 'Professional Product Line'}
            />
            <View style={styles.productImageWrap}>
              <Image
                source={{ uri: 'https://genosys.ae/images/genosys-products.jpg' }}
                style={styles.productImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.productCaption, isRTL && styles.textRTL]}>
              {locale === 'ar'
                ? 'مجموعة منتجات جينوسيس المهنية للعناية بالبشرة — منتجات مختبرة طبيًا'
                : locale === 'ru'
                ? 'Профессиональная линейка средств GENOSYS — дерматологически протестированные продукты'
                : 'GENOSYS Professional Skincare Line — Dermatologically Tested Products'}
            </Text>
          </View>

          {/* Footer — shared brand block */}
          <AppFooter style={{ paddingBottom: 16 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Hero
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: { width: 240, height: 72, marginBottom: 16 },
  heroTitle: { ...T.sectionTitle, textAlign: 'center', marginBottom: 16 },
  badgeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    backgroundColor: tint(colors.brand),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { ...T.caption, fontWeight: '700', color: colors.brand },
  badgeGreen: { backgroundColor: tint(colors.greenDeep) },
  badgeGreenText: { color: colors.greenDeep },

  // Cards
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  sectionTitle: { ...T.body, fontWeight: '700', color: colors.label, flex: 1 },

  paragraph: { ...T.body, marginBottom: 12, lineHeight: 23 },
  paragraphLast: { marginBottom: 0 },

  // Technology rows
  techRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  techRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  techIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: tint(colors.purple),
    alignItems: 'center',
    justifyContent: 'center',
  },
  techContent: { flex: 1, minWidth: 0 },
  techTitle: { ...T.label, fontSize: 15, fontWeight: '700', color: colors.label, marginBottom: 3 },
  techDesc: { ...T.bodySmall, color: colors.secondaryLabel, lineHeight: 20 },

  // Videos
  videoItem: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  videoTitle: { ...T.label, fontSize: 15, color: colors.label, marginBottom: 10 },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  videoThumbnail: { width: '100%', height: '100%' },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: tint(colors.brand, 'E6'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Product showcase
  productImageWrap: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: SCREEN_WIDTH * 0.6, backgroundColor: '#ffffff' },
  productCaption: { ...T.caption, color: colors.secondaryLabel, textAlign: 'center', paddingTop: 12, lineHeight: 18 },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
});
