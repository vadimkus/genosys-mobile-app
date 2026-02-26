/**
 * Locations Screen - Native (replaces WebView)
 * Displays delivery locations across UAE with shipping costs and delivery times.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';

export default function LocationsScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const [selectedSlug, setSelectedSlug] = useState(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  const handleSelectLocation = useCallback((slug) => {
    haptics.lightTap();
    setSelectedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const locations = [
    {
      slug: 'dubai',
      name: l('Dubai', 'دبي', 'Дубай'),
      desc: l('Same-day delivery within 1–2 hours via Careem/QuipQup', 'توصيل في نفس اليوم خلال ١-٢ ساعة عبر كريم', 'Доставка в тот же день за 1–2 часа через Careem'),
      shipping: l('45 AED', '٤٥ د.إ', '45 AED'),
      delivery: l('1–2 hours', '١-٢ ساعة', '1–2 часа'),
      icon: 'business',
      color: '#dc2626',
    },
    {
      slug: 'abu-dhabi',
      name: l('Abu Dhabi & Al Ain', 'أبو ظبي والعين', 'Абу-Даби и Аль-Айн'),
      desc: l('Next-day delivery across Abu Dhabi emirate', 'التوصيل في اليوم التالي في إمارة أبو ظبي', 'Доставка на следующий день по эмирату Абу-Даби'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'flag',
      color: '#2563eb',
    },
    {
      slug: 'sharjah',
      name: l('Sharjah', 'الشارقة', 'Шарджа'),
      desc: l('Fast delivery to all areas in Sharjah', 'توصيل سريع إلى جميع مناطق الشارقة', 'Быстрая доставка по всей Шардже'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'location',
      color: '#16a34a',
    },
    {
      slug: 'rak',
      name: l('Ras Al Khaimah', 'رأس الخيمة', 'Рас-эль-Хайма'),
      desc: l('Delivery across RAK emirate', 'التوصيل في إمارة رأس الخيمة', 'Доставка по эмирату Рас-эль-Хайма'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'compass',
      color: '#f59e0b',
    },
    {
      slug: 'ajman',
      name: l('Ajman', 'عجمان', 'Аджман'),
      desc: l('Delivery to all areas in Ajman', 'التوصيل إلى جميع مناطق عجمان', 'Доставка по всему Аджману'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'navigate',
      color: '#8b5cf6',
    },
    {
      slug: 'fujairah',
      name: l('Fujairah', 'الفجيرة', 'Фуджейра'),
      desc: l('Delivery across Fujairah emirate', 'التوصيل في إمارة الفجيرة', 'Доставка по эмирату Фуджейра'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'earth',
      color: '#06b6d4',
    },
    {
      slug: 'uaq',
      name: l('Umm Al Quwain', 'أم القيوين', 'Умм-эль-Кайвайн'),
      desc: l('Delivery to Umm Al Quwain', 'التوصيل إلى أم القيوين', 'Доставка в Умм-эль-Кайвайн'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'pin',
      color: '#10b981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.locations') || 'Locations'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🇦🇪</Text>
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
            {l('We Deliver Across the UAE', 'نوصل في جميع أنحاء الإمارات', 'Доставляем по всем ОАЭ')}
          </Text>
          <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
            {l('Premium skincare delivered to your door in all 7 emirates',
               'العناية الفاخرة بالبشرة توصل إلى باب منزلك في الإمارات السبع',
               'Премиальная косметика с доставкой до двери во все 7 эмиратов')}
          </Text>
        </View>

        {/* Free Shipping Note */}
        <View style={styles.freeShipBanner}>
          <Ionicons name="gift" size={20} color="#16a34a" />
          <Text style={[styles.freeShipText, isRTL && styles.textRTL]}>
            {l('FREE shipping on orders above 1,000 AED', 'شحن مجاني للطلبات فوق ١٬٠٠٠ د.إ', 'БЕСПЛАТНАЯ доставка при заказе от 1 000 AED')}
          </Text>
        </View>

        {/* Locations */}
        <View style={styles.section}>
          {locations.map((loc) => {
            const isSelected = selectedSlug === loc.slug;
            return (
              <TouchableOpacity
                key={loc.slug}
                style={[
                  styles.locationCard,
                  isSelected && { borderColor: loc.color, borderWidth: 2, backgroundColor: `${loc.color}08` },
                ]}
                onPress={() => handleSelectLocation(loc.slug)}
                activeOpacity={0.8}
              >
                <View style={[styles.locationHeader, isRTL && styles.locationHeaderRTL]}>
                  <View style={[styles.locationIcon, { backgroundColor: isSelected ? `${loc.color}25` : `${loc.color}15` }]}>
                    <Ionicons name={isSelected ? 'checkmark-circle' : loc.icon} size={22} color={loc.color} />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, isRTL && styles.textRTL, isSelected && { color: loc.color }]}>{loc.name}</Text>
                    <Text style={[styles.locationDesc, isRTL && styles.textRTL]}>{loc.desc}</Text>
                  </View>
                </View>
                <View style={[styles.locationMeta, isRTL && styles.locationMetaRTL]}>
                  <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                    <Ionicons name="time" size={14} color={isSelected ? loc.color : '#6B7280'} />
                    <Text style={[styles.metaText, isSelected && { color: loc.color, fontWeight: '700' }]}>{loc.delivery}</Text>
                  </View>
                  <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                    <Ionicons name="card" size={14} color={isSelected ? loc.color : '#6B7280'} />
                    <Text style={[styles.metaText, isSelected && { color: loc.color, fontWeight: '700' }]}>{loc.shipping}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Office Location */}
        <View style={styles.officeSection}>
          <Text style={[styles.officeTitle, isRTL && styles.textRTL]}>
            {l('Our Office', 'مكتبنا', 'Наш офис')}
          </Text>
          <TouchableOpacity
            style={[styles.officeCard, isRTL && styles.officeCardRTL]}
            onPress={() => Linking.openURL('https://maps.google.com/?q=Cordoba+Residence+E02+Dubai+UAE')}
            activeOpacity={0.7}
          >
            <View style={styles.officeIcon}>
              <Ionicons name="map" size={24} color="#dc2626" />
            </View>
            <View style={styles.officeInfo}>
              <Text style={[styles.officeAddress, isRTL && styles.textRTL]}>Cordoba Residence, Villa E02</Text>
              <Text style={[styles.officeCity, isRTL && styles.textRTL]}>Dubai, UAE</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#9CA3AF" />
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
  headerTitle: { ...T.navTitle, flex: 1, color: '#1F2937', textAlign: 'center', marginHorizontal: 8 },
  scrollView: { flex: 1 },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center', backgroundColor: '#FAFAFA' },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { ...T.sectionTitle, fontSize: 22, color: '#000', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { ...T.caption, color: '#6B7280', textAlign: 'center', lineHeight: 20, fontSize: 14 },

  // Free Ship Banner
  freeShipBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 16, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  freeShipText: { ...T.caption, fontWeight: '600', color: '#16a34a' },

  // Section
  section: { paddingHorizontal: 20, paddingVertical: 20 },

  // Location Cards
  locationCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  locationHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  locationHeaderRTL: { flexDirection: 'row-reverse' },
  locationIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  locationInfo: { flex: 1 },
  locationName: { ...T.navTitle, fontWeight: '700', color: '#111827', marginBottom: 4 },
  locationDesc: { ...T.caption, color: '#6B7280', lineHeight: 18 },
  locationMeta: { flexDirection: 'row', gap: 20, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  locationMetaRTL: { flexDirection: 'row-reverse' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItemRTL: { flexDirection: 'row-reverse' },
  metaText: { ...T.caption, fontWeight: '600', color: '#4B5563' },

  // Office
  officeSection: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#F9FAFB' },
  officeTitle: { ...T.sectionTitle, color: '#000', marginBottom: 14 },
  officeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  officeCardRTL: { flexDirection: 'row-reverse' },
  officeIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  officeInfo: { flex: 1 },
  officeAddress: { ...T.bodySmall, fontWeight: '600', color: '#111827', lineHeight: undefined },
  officeCity: { ...T.caption, color: '#6B7280', marginTop: 2 },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
