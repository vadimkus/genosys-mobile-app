/**
 * Partners Screen - Native (replaces WebView)
 * Displays partner salons and distributors.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';

export default function PartnersScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  const partners = [
    {
      name: 'Tips & Toes',
      type: l('Salon & Spa Chain', 'سلسلة صالونات وسبا', 'Сеть салонов и спа'),
      location: l('Dubai, Abu Dhabi, Sharjah', 'دبي، أبو ظبي، الشارقة', 'Дубай, Абу-Даби, Шарджа'),
      icon: 'sparkles',
      color: '#dc2626',
    },
    {
      name: 'Pastels Salon',
      type: l('Premium Beauty Salon', 'صالون تجميل فاخر', 'Премиальный салон красоты'),
      location: l('Dubai', 'دبي', 'Дубай'),
      icon: 'flower',
      color: '#ec4899',
    },
    {
      name: 'Mirrors Beauty Lounge',
      type: l('Beauty Lounge', 'صالة تجميل', 'Салон красоты'),
      location: l('Dubai', 'دبي', 'Дубай'),
      icon: 'diamond',
      color: '#8b5cf6',
    },
    {
      name: 'The Nail Spa',
      type: l('Nail & Beauty Spa', 'سبا أظافر وتجميل', 'Спа для ногтей и красоты'),
      location: l('Dubai, Abu Dhabi', 'دبي، أبو ظبي', 'Дубай, Абу-Даби'),
      icon: 'color-palette',
      color: '#f59e0b',
    },
    {
      name: 'Azur Spa',
      type: l('Wellness & Spa', 'صحة وسبا', 'Велнес и спа'),
      location: l('Dubai', 'دبي', 'Дубай'),
      icon: 'water',
      color: '#06b6d4',
    },
    {
      name: 'N.Bar',
      type: l('Beauty Bar', 'بار تجميل', 'Бьюти-бар'),
      location: l('Dubai', 'دبي', 'Дубай'),
      icon: 'star',
      color: '#10b981',
    },
    {
      name: 'Boudoir Salon',
      type: l('Luxury Salon', 'صالون فاخر', 'Люкс-салон'),
      location: l('Abu Dhabi', 'أبو ظبي', 'Абу-Даби'),
      icon: 'rose',
      color: '#e11d48',
    },
    {
      name: 'Sisters Beauty Lounge',
      type: l('Beauty Lounge Chain', 'سلسلة صالات تجميل', 'Сеть салонов красоты'),
      location: l('Dubai, Sharjah, Ajman', 'دبي، الشارقة، عجمان', 'Дубай, Шарджа, Аджман'),
      icon: 'heart',
      color: '#f43f5e',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.partners') || 'Partners'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Ionicons name="business" size={48} color="#dc2626" />
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
            {l('Our Partners', 'شركاؤنا', 'Наши партнёры')}
          </Text>
          <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
            {l('Premium salons and spas across the UAE offering GENOSYS treatments',
               'صالونات وسبا فاخرة في جميع أنحاء الإمارات تقدم علاجات جينوسيس',
               'Премиальные салоны и спа по всем ОАЭ, предлагающие процедуры GENOSYS')}
          </Text>
        </View>

        {/* Partners List */}
        <View style={styles.section}>
          {partners.map((partner, index) => (
            <View key={index} style={[styles.partnerCard, isRTL && styles.partnerCardRTL]}>
              <View style={[styles.partnerIcon, { backgroundColor: `${partner.color}15` }]}>
                <Ionicons name={partner.icon} size={24} color={partner.color} />
              </View>
              <View style={styles.partnerContent}>
                <Text style={[styles.partnerName, isRTL && styles.textRTL]}>{partner.name}</Text>
                <Text style={[styles.partnerType, isRTL && styles.textRTL]}>{partner.type}</Text>
                <View style={[styles.locationRow, isRTL && styles.locationRowRTL]}>
                  <Ionicons name="location" size={12} color="#9CA3AF" />
                  <Text style={[styles.partnerLocation, isRTL && styles.textRTL]}>{partner.location}</Text>
                </View>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color="#D1D5DB" />
            </View>
          ))}
        </View>

        {/* Become a Partner CTA */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, isRTL && styles.textRTL]}>
            {l('Interested in Becoming a Partner?', 'هل ترغب في أن تصبح شريكاً؟', 'Хотите стать партнёром?')}
          </Text>
          <Text style={[styles.ctaDesc, isRTL && styles.textRTL]}>
            {l('Join our network of premium beauty professionals across the UAE',
               'انضم إلى شبكتنا من محترفي التجميل المميزين في الإمارات',
               'Присоединяйтесь к нашей сети премиальных специалистов красоты в ОАЭ')}
          </Text>
          <TouchableOpacity
            style={[styles.ctaBtn, isRTL && styles.ctaBtnRTL]}
            onPress={() => Linking.openURL('mailto:sales@genosys.ae?subject=Partnership%20Inquiry')}
            activeOpacity={0.7}
          >
            <Ionicons name="mail" size={18} color="#ffffff" />
            <Text style={styles.ctaBtnText}>
              {l('Contact Us', 'تواصل معنا', 'Свяжитесь с нами')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
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
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center', marginTop: 12, marginBottom: 8, letterSpacing: -0.4 },
  heroSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },

  // Section
  section: { paddingHorizontal: 20, paddingVertical: 20 },

  // Partner Cards
  partnerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  partnerCardRTL: { flexDirection: 'row-reverse' },
  partnerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  partnerContent: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  partnerType: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationRowRTL: { flexDirection: 'row-reverse' },
  partnerLocation: { fontSize: 12, color: '#9CA3AF' },

  // CTA
  ctaSection: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center', backgroundColor: '#FEF2F2', marginHorizontal: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  ctaDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dc2626', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  ctaBtnRTL: { flexDirection: 'row-reverse' },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
