/**
 * Brand Screen - Native (replaces WebView)
 * Displays GENOSYS brand information with videos and product images.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH - 40) * (9 / 16);

export default function BrandScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

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
    { id: 'brand-intro', title: sectionLabels.brandIntro, youtubeId: 'GENOSYS_BRAND_VIDEO' },
    { id: 'pro-treatment', title: sectionLabels.proTreatment, youtubeId: 'GENOSYS_PRO_VIDEO' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.brand') || 'Brand'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../assets/splash-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{brandTitle}</Text>
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{sectionLabels.about}</Text>
          <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{brandDescription}</Text>
        </View>

        {/* Mission Section */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{sectionLabels.mission}</Text>
          <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{brandMission}</Text>
        </View>

        {/* Key Technologies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{sectionLabels.technologies}</Text>
          {keyTechnologies.map((tech, index) => (
            <View key={index} style={[styles.techCard, isRTL && styles.techCardRTL]}>
              <View style={styles.techIcon}>
                <Ionicons name="flask" size={22} color="#dc2626" />
              </View>
              <View style={styles.techContent}>
                <Text style={[styles.techTitle, isRTL && styles.textRTL]}>{tech.title}</Text>
                <Text style={[styles.techDesc, isRTL && styles.textRTL]}>{tech.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Brand Videos */}
        <View style={[styles.section, styles.sectionAlt]}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{sectionLabels.videos}</Text>
          
          {/* Video 1 - Brand Introduction */}
          <View style={styles.videoCard}>
            <Text style={[styles.videoTitle, isRTL && styles.textRTL]}>{sectionLabels.brandIntro}</Text>
            <View style={styles.videoWrapper}>
              <WebView
                source={{ uri: 'https://www.youtube.com/embed/JNjh1CHANNEL1?autoplay=0&rel=0' }}
                style={styles.videoPlayer}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction
                javaScriptEnabled
              />
            </View>
          </View>

          {/* Video 2 - Professional Treatment */}
          <View style={styles.videoCard}>
            <Text style={[styles.videoTitle, isRTL && styles.textRTL]}>{sectionLabels.proTreatment}</Text>
            <View style={styles.videoWrapper}>
              <WebView
                source={{ uri: 'https://www.youtube.com/embed/JNjh1CHANNEL2?autoplay=0&rel=0' }}
                style={styles.videoPlayer}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction
                javaScriptEnabled
              />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isRTL && styles.textRTL]}>
            {locale === 'ar' ? 'جينوسيس الشرق الأوسط FZ-LLC' : locale === 'ru' ? 'GENOSYS Middle East FZ-LLC' : 'GENOSYS Middle East FZ-LLC'}
          </Text>
          <Text style={[styles.footerSub, isRTL && styles.textRTL]}>
            {locale === 'ar' ? 'الموزع الرسمي في الإمارات' : locale === 'ru' ? 'Официальный дистрибьютор в ОАЭ' : 'Official Distributor in the UAE'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginHorizontal: 8 },
  scrollView: { flex: 1 },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center', backgroundColor: '#FAFAFA' },
  logo: { width: 240, height: 72, marginBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 16, letterSpacing: -0.3 },
  badgeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FECACA' },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#dc2626' },
  badgeGreen: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  badgeGreenText: { color: '#16a34a' },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionAlt: { backgroundColor: '#FAFAFA' },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 14, letterSpacing: -0.4 },
  paragraph: { fontSize: 16, color: '#374151', lineHeight: 24 },

  // Technology Cards
  techCard: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#F3F4F6' },
  techCardRTL: { flexDirection: 'row-reverse' },
  techIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  techContent: { flex: 1 },
  techTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  techDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  // Videos
  videoCard: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  videoTitle: { fontSize: 16, fontWeight: '600', color: '#111827', padding: 14, paddingBottom: 0 },
  videoWrapper: { height: VIDEO_HEIGHT, margin: 14, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
  videoPlayer: { flex: 1 },

  // Footer
  footer: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center', backgroundColor: '#F8F9FA' },
  footerText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  footerSub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
