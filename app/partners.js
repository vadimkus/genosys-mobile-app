/**
 * Partners Screen - Native (fetches from API)
 * Data is loaded dynamically from /api/mobile/partners.
 * When a new partner is added on the website, it appears here automatically.
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import AppFooter from '../components/AppFooter';
import { useLocalization } from '../contexts/LocalizationContext';
import AUTH_CONFIG from '../config/auth';
import { getJson } from '../services/httpClient';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, surfaces, tint } from '../utils/theme';
import { createLogger } from '../utils/logger';

const log = createLogger('Partners');

const THEME_COLORS = {
  emerald: colors.green,
  pink: '#ec4899',
  blue: colors.blue,
  purple: colors.purple,
};

const TYPE_ICONS = {
  'Beauty & Aesthetic Center': 'sparkles',
  'Facial Care & Massage Studio': 'hand-left',
  'Aesthetic Medical Clinic': 'medkit',
  'Ladies Beauty Salon': 'flower',
  'Elite Beauty Center': 'diamond',
  'Specialized Facial Treatment Salon': 'hand-left',
  'Comprehensive Beauty Salon': 'color-palette',
  'Beauty Lounge': 'rose',
  'Multispeciality Medical Center': 'medical',
  'Premium Aesthetic Clinic': 'fitness',
  'Luxury Aesthetic Clinic': 'star',
  'Luxury Beauty Salon': 'diamond',
  'Aesthetic Medical Center': 'pulse',
  'Hair & Beauty Salon': 'cut',
  'Korean Skincare Online Store': 'globe',
  'Medical Aesthetic Clinic': 'medkit',
  'Beauty Salon': 'sparkles',
  'Spa & Wellness Center': 'water',
  'Healing and Wellness Center': 'leaf',
  'Nail Salon': 'color-palette',
  'Holistic Health & Wellness Clinic': 'heart',
  'European Spa & Wellness Center': 'water',
  'Body Correction Center': 'body',
  'Ladies Beauty Salon and Body Academy': 'fitness',
};

/**
 * Parse a partner name into display name + branch.
 * e.g. "UNIQUE PERSONA, DUBAI MARINA" → { name: "UNIQUE PERSONA", branch: "Dubai Marina" }
 */
function parsePartnerName(fullName) {
  const commaIdx = fullName.indexOf(',');
  if (commaIdx === -1) return { displayName: fullName, branch: '' };
  const name = fullName.substring(0, commaIdx).trim();
  const branch = fullName.substring(commaIdx + 1).trim();
  // Title-case the branch
  const titleBranch = branch
    .split(' ')
    .map((w) => {
      if (w.length <= 2) return w; // Keep short words like "by", "Al" etc
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
  return { displayName: name, branch: titleBranch };
}

export default function PartnersScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
  const [expandedId, setExpandedId] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const l = (en, ar, ru) => (locale === 'ar' ? ar : locale === 'ru' ? ru : en);

  // Subtle entrance motion (matches order/about screens) — runs once content is ready.
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    if (!loading && !error) {
      fade.setValue(0);
      lift.setValue(12);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [loading, error, fade, lift]);

  const fetchPartners = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const data = await getJson(`${baseUrl}/api/mobile/partners`);
      setPartners(data.partners || []);
    } catch (err) {
      log.warn('Failed to fetch partners:', err.message);
      setError(l('Failed to load partners', 'فشل تحميل الشركاء', 'Не удалось загрузить партнёров'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleToggle = useCallback((id) => {
    haptics.lightTap();
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleCall = useCallback((phone) => {
    haptics.mediumTap();
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() => {});
  }, []);

  const handleDirections = useCallback((url) => {
    haptics.lightTap();
    Linking.openURL(url).catch(() => {});
  }, []);

  const handleWebsite = useCallback((url) => {
    haptics.lightTap();
    Linking.openURL(url).catch(() => {});
  }, []);

  const getIcon = (type) => TYPE_ICONS[type] || 'sparkles';

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('navigation.partners') || 'Partners'}
        scrollY={(!loading && !error) ? scrollY : null}
        onBack={onBack}
        onRefresh={() => fetchPartners(true)}
        isRTL={isRTL}
      />

      {/* Loading State */}
      {loading && (
        <View style={[styles.centerState, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.stateText}>{l('Loading partners...', 'جارٍ تحميل الشركاء...', 'Загрузка партнёров...')}</Text>
        </View>
      )}

      {/* Error State */}
      {!loading && error && (
        <View style={[styles.centerState, { paddingTop: headerHeight }]}>
          <Ionicons name="cloud-offline" size={48} color={colors.tertiary} />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, shadow.cta(colors.cta)]} onPress={() => fetchPartners()} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>{l('Retry', 'إعادة المحاولة', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!loading && !error && (
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPartners(true)} tintColor={colors.accent} progressViewOffset={headerHeight} />
          }
        >
          <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
            {/* Hero */}
            <View style={styles.heroSection}>
              <View style={[surfaces.iconTile, styles.heroTile, { backgroundColor: colors.cta }]}>
                <Ionicons name="business" size={24} color={colors.white} />
              </View>
              <Text style={[styles.heroTitle, isRTL && styles.textRTLCenter]}>
                {l('Our Partners', 'شركاؤنا', 'Наши партнёры')}
              </Text>
              <Text style={[styles.heroSubtitle, isRTL && styles.textRTLCenter]}>
                {l(
                  `${partners.length} premium salons, clinics and spas across the UAE offering GENOSYS treatments`,
                  `${partners.length} صالون ومركز تجميل وسبا فاخر في جميع أنحاء الإمارات يقدمون علاجات جينوسيس`,
                  `${partners.length} премиальных салонов, клиник и спа по всем ОАЭ, предлагающих процедуры GENOSYS`
                )}
              </Text>
            </View>

            {/* Partners List */}
            <View style={styles.section}>
              {partners.map((partner) => {
                const color = THEME_COLORS[partner.theme] || colors.accent;
                const isExpanded = expandedId === partner.id;
                const { displayName, branch } = parsePartnerName(partner.name);

                return (
                  <TouchableOpacity
                    key={partner.id}
                    style={[styles.partnerCard, shadow.card, isExpanded && { borderColor: color }]}
                    onPress={() => handleToggle(partner.id)}
                    activeOpacity={0.7}
                  >
                    {/* Main Row */}
                    <View style={[styles.partnerRow, isRTL && styles.rowRTL]}>
                      <View style={[surfaces.iconTile, styles.partnerTile, { backgroundColor: color }]}>
                        <Ionicons name={getIcon(partner.type)} size={20} color={colors.white} />
                      </View>
                      <View style={styles.partnerContent}>
                        <Text style={[styles.partnerName, isRTL && styles.textRTL, isExpanded && { color }]}>{displayName}</Text>
                        {branch ? <Text style={[styles.partnerBranch, isRTL && styles.textRTL]}>{branch}</Text> : null}
                        <Text style={[styles.partnerType, isRTL && styles.textRTL]}>{partner.type}</Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : (isRTL ? 'chevron-back' : 'chevron-forward')}
                        size={16}
                        color={isExpanded ? color : colors.tertiary}
                      />
                    </View>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <View style={styles.expandedSection}>
                        {/* Description */}
                        {partner.description ? (
                          <Text style={[styles.descriptionText, isRTL && styles.textRTL]}>{partner.description}</Text>
                        ) : null}

                        {/* Location */}
                        <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                          <Ionicons name="location-outline" size={16} color={colors.secondaryLabel} />
                          <Text style={[styles.detailText, isRTL && styles.textRTL]}>{partner.location}</Text>
                        </View>

                        {/* Phone */}
                        {partner.phone && (
                          <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                            <Ionicons name="call-outline" size={16} color={colors.secondaryLabel} />
                            <Text style={[styles.detailText, styles.valueLTR]}>{partner.phone}</Text>
                          </View>
                        )}

                        {/* Action Buttons */}
                        <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
                          {partner.phone && (
                            <TouchableOpacity
                              style={[styles.actionBtn, { backgroundColor: tint(color) }]}
                              onPress={() => handleCall(partner.phone)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="call" size={16} color={color} />
                              <Text style={[styles.actionBtnText, { color }]}>{l('Call', 'اتصل', 'Позвонить')}</Text>
                            </TouchableOpacity>
                          )}
                          {partner.directions && (
                            <TouchableOpacity
                              style={[styles.actionBtn, { backgroundColor: tint(colors.blue) }]}
                              onPress={() => handleDirections(partner.directions)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="navigate" size={16} color={colors.blue} />
                              <Text style={[styles.actionBtnText, { color: colors.blue }]}>{l('Directions', 'الاتجاهات', 'Маршрут')}</Text>
                            </TouchableOpacity>
                          )}
                          {partner.website && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.actionBtnNeutral]}
                              onPress={() => handleWebsite(partner.website)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="globe" size={16} color={colors.secondaryLabel} />
                              <Text style={[styles.actionBtnText, { color: colors.secondaryLabel }]}>{l('Website', 'الموقع', 'Сайт')}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Become a Partner CTA */}
            <View style={[styles.ctaCard, shadow.card]}>
              <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
                <View style={[surfaces.iconTile, { backgroundColor: colors.cta }]}>
                  <Ionicons name="people" size={17} color={colors.white} />
                </View>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {l('Interested in Becoming a Partner?', 'هل ترغب في أن تصبح شريكاً؟', 'Хотите стать партнёром?')}
                </Text>
              </View>
              <Text style={[styles.ctaDesc, isRTL && styles.textRTL]}>
                {l('Join our network of premium beauty professionals across the UAE',
                   'انضم إلى شبكتنا من محترفي التجميل المميزين في الإمارات',
                   'Присоединяйтесь к нашей сети премиальных специалистов красоты в ОАЭ')}
              </Text>
              <TouchableOpacity
                style={[styles.ctaBtn, shadow.cta(colors.cta), isRTL && styles.rowRTL]}
                onPress={() => Linking.openURL('mailto:sales@genosys.ae?subject=Partnership%20Inquiry').catch(() => {})}
                activeOpacity={0.85}
              >
                <Ionicons name="mail" size={18} color={colors.white} />
                <Text style={styles.ctaBtnText}>
                  {l('Contact Us', 'تواصل معنا', 'Свяжитесь с нами')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer — shared brand block */}
            <AppFooter style={{ paddingBottom: 8 }} />
          </Animated.View>
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Loading / Error states
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  stateText: { ...T.bodySmall, color: colors.secondaryLabel, marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: colors.cta, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  retryBtnText: { ...T.buttonSmall, fontSize: 15, fontWeight: '700' },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, alignItems: 'center' },
  heroTile: { width: 56, height: 56, borderRadius: 16, marginBottom: 14 },
  heroTitle: { ...T.pageTitle, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { ...T.subtitle, color: colors.secondaryLabel, textAlign: 'center', lineHeight: 21 },

  // Section
  section: { paddingHorizontal: 16, paddingTop: 4 },

  // Partner Cards
  partnerCard: {
    ...surfaces.card,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerTile: { width: 44, height: 44, borderRadius: 12 },
  partnerContent: { flex: 1, minWidth: 0 },
  partnerName: { ...T.label, fontSize: 15, fontWeight: '700', color: colors.label, marginBottom: 1 },
  partnerBranch: { ...T.caption, fontWeight: '600', color: colors.label, marginBottom: 2 },
  partnerType: { ...T.captionSmall, color: colors.secondaryLabel },

  // Expanded
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
  descriptionText: { ...T.caption, color: colors.label, lineHeight: 19, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  detailRowRTL: { flexDirection: 'row-reverse' },
  detailText: { ...T.caption, flex: 1, color: colors.label, lineHeight: 18 },

  // Action buttons
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  actionRowRTL: { flexDirection: 'row-reverse' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  actionBtnNeutral: { backgroundColor: colors.fillSecondary },
  actionBtnText: { ...T.caption, fontWeight: '700' },

  // CTA
  ctaCard: { ...surfaces.card, marginHorizontal: 16, marginTop: 6, padding: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { ...T.body, flex: 1, fontWeight: '700', color: colors.label },
  ctaDesc: { ...T.caption, color: colors.secondaryLabel, lineHeight: 20, marginBottom: 16 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cta,
    paddingVertical: 15,
    borderRadius: 14,
  },
  ctaBtnText: { ...T.button, fontWeight: '700' },

  // RTL
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
  valueLTR: { writingDirection: 'ltr', textAlign: 'left' },
});
