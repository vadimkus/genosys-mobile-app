/**
 * Locations Screen - Native (replaces WebView)
 * Displays delivery locations across UAE with shipping costs and delivery times.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import { useLocalization } from '../contexts/LocalizationContext';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, surfaces } from '../utils/theme';

export default function LocationsScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
  const [selectedSlug, setSelectedSlug] = useState(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  // Subtle entrance motion (matches order/about screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const handleSelectLocation = useCallback((slug) => {
    haptics.lightTap();
    setSelectedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'); };

  const locations = [
    {
      slug: 'dubai',
      name: l('Dubai', 'دبي', 'Дубай'),
      desc: l('Same-day delivery within 1–2 hours via Careem/QuipQup', 'توصيل في نفس اليوم خلال ١-٢ ساعة عبر كريم', 'Доставка в тот же день за 1–2 часа через Careem'),
      shipping: l('45 AED', '٤٥ د.إ', '45 AED'),
      delivery: l('1–2 hours', '١-٢ ساعة', '1–2 часа'),
      icon: 'business',
      color: colors.brand,
    },
    {
      slug: 'abu-dhabi',
      name: l('Abu Dhabi & Al Ain', 'أبو ظبي والعين', 'Абу-Даби и Аль-Айн'),
      desc: l('Next-day delivery across Abu Dhabi emirate', 'التوصيل في اليوم التالي في إمارة أبو ظبي', 'Доставка на следующий день по эмирату Абу-Даби'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'flag',
      color: colors.blue,
    },
    {
      slug: 'sharjah',
      name: l('Sharjah', 'الشارقة', 'Шарджа'),
      desc: l('Fast delivery to all areas in Sharjah', 'توصيل سريع إلى جميع مناطق الشارقة', 'Быстрая доставка по всей Шардже'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'location',
      color: colors.greenDeep,
    },
    {
      slug: 'rak',
      name: l('Ras Al Khaimah', 'رأس الخيمة', 'Рас-эль-Хайма'),
      desc: l('Delivery across RAK emirate', 'التوصيل في إمارة رأس الخيمة', 'Доставка по эмирату Рас-эль-Хайма'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'compass',
      color: colors.orange,
    },
    {
      slug: 'ajman',
      name: l('Ajman', 'عجمان', 'Аджман'),
      desc: l('Delivery to all areas in Ajman', 'التوصيل إلى جميع مناطق عجمان', 'Доставка по всему Аджману'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'navigate',
      color: colors.purple,
    },
    {
      slug: 'fujairah',
      name: l('Fujairah', 'الفجيرة', 'Фуджейра'),
      desc: l('Delivery across Fujairah emirate', 'التوصيل في إمارة الفجيرة', 'Доставка по эمирату Фуджейра'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'earth',
      color: colors.teal,
    },
    {
      slug: 'uaq',
      name: l('Umm Al Quwain', 'أم القيوين', 'Умм-эль-Кайвайн'),
      desc: l('Delivery to Umm Al Quwain', 'التوصيل إلى أم القيوين', 'Доставка в Умм-эль-Кайвайн'),
      shipping: l('70 AED', '٧٠ د.إ', '70 AED'),
      delivery: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      icon: 'pin',
      color: colors.green,
    },
  ];

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('navigation.locations') || 'Locations'}
        scrollY={scrollY}
        onBack={onBack}
        isRTL={isRTL}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Hero */}
          <View style={styles.heroSection}>
            <Text style={styles.heroEmoji}>🇦🇪</Text>
            <Text style={[styles.heroTitle, isRTL && styles.textRTLCenter]}>
              {l('We Deliver Across the UAE', 'نوصل في جميع أنحاء الإمارات', 'Доставляем по всем ОАЭ')}
            </Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTLCenter]}>
              {l('Premium skincare delivered to your door in all 7 emirates',
                 'العناية الفاخرة بالبشرة توصل إلى باب منزلك في الإمارات السبع',
                 'Премиальная косметика с доставкой до двери во все 7 эмиратов')}
            </Text>
          </View>

          {/* Free Shipping Note */}
          <View style={[styles.freeShipBanner, isRTL && styles.rowRTL]}>
            <Ionicons name="gift" size={18} color={colors.greenDeep} />
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
                  style={[styles.locationCard, shadow.card, isSelected && { borderColor: loc.color }]}
                  onPress={() => handleSelectLocation(loc.slug)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.locationHeader, isRTL && styles.rowRTL]}>
                    <View style={[surfaces.iconTile, styles.locationTile, { backgroundColor: loc.color }]}>
                      <Ionicons name={isSelected ? 'checkmark' : loc.icon} size={18} color={colors.white} />
                    </View>
                    <View style={styles.locationInfo}>
                      <Text style={[styles.locationName, isRTL && styles.textRTL, isSelected && { color: loc.color }]}>{loc.name}</Text>
                      <Text style={[styles.locationDesc, isRTL && styles.textRTL]}>{loc.desc}</Text>
                    </View>
                  </View>
                  <View style={styles.hairline} />
                  <View style={[styles.locationMeta, isRTL && styles.locationMetaRTL]}>
                    <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                      <Ionicons name="time-outline" size={14} color={colors.secondaryLabel} />
                      <Text style={styles.metaText}>{loc.delivery}</Text>
                    </View>
                    <View style={[styles.metaItem, isRTL && styles.metaItemRTL]}>
                      <Ionicons name="card-outline" size={14} color={colors.secondaryLabel} />
                      <Text style={styles.metaText}>{loc.shipping}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Office Location */}
          <View style={styles.officeSection}>
            <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
              <View style={[surfaces.iconTile, { backgroundColor: colors.teal }]}>
                <Ionicons name="business" size={17} color={colors.white} />
              </View>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {l('Our Office', 'مكتبنا', 'Наш офис')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.officeCard, shadow.card, isRTL && styles.rowRTL]}
              onPress={() => Linking.openURL('https://maps.google.com/?q=Cordoba+Residence+E02+Dubai+UAE')}
              activeOpacity={0.7}
            >
              <View style={[surfaces.iconTile, styles.officeTile, { backgroundColor: colors.teal }]}>
                <Ionicons name="map" size={20} color={colors.white} />
              </View>
              <View style={styles.officeInfo}>
                <Text style={[styles.officeAddress, isRTL && styles.textRTL]}>Cordoba Residence, Villa E02</Text>
                <Text style={[styles.officeCity, isRTL && styles.textRTL]}>Dubai, UAE</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.tertiary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, alignItems: 'center' },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { ...T.pageTitle, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { ...T.subtitle, color: colors.secondaryLabel, textAlign: 'center', lineHeight: 21 },

  // Free Ship Banner (tinted inline highlight)
  freeShipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: 'rgba(22, 163, 74, 0.10)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  freeShipText: { ...T.labelSmall, fontWeight: '700', color: colors.greenDeep, flexShrink: 1 },

  // Section
  section: { paddingHorizontal: 16, paddingTop: 18 },

  // Location Cards
  locationCard: {
    ...surfaces.card,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationTile: { width: 40, height: 40, borderRadius: 11 },
  locationInfo: { flex: 1, minWidth: 0 },
  locationName: { ...T.label, fontSize: 16, fontWeight: '700', color: colors.label, marginBottom: 3 },
  locationDesc: { ...T.caption, color: colors.secondaryLabel, lineHeight: 18 },
  hairline: { ...surfaces.hairline, marginVertical: 12 },
  locationMeta: { flexDirection: 'row', gap: 20 },
  locationMetaRTL: { flexDirection: 'row-reverse' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItemRTL: { flexDirection: 'row-reverse' },
  metaText: { ...T.caption, fontWeight: '600', color: colors.label },

  // Office
  officeSection: { paddingHorizontal: 16, paddingTop: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { ...T.body, fontWeight: '700', color: colors.label },
  officeCard: { ...surfaces.card, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  officeTile: { width: 44, height: 44, borderRadius: 12 },
  officeInfo: { flex: 1, minWidth: 0 },
  officeAddress: { ...T.label, fontSize: 15, fontWeight: '600', color: colors.label },
  officeCity: { ...T.caption, color: colors.secondaryLabel, marginTop: 2 },

  // RTL
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
});
