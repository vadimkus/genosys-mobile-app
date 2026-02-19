/**
 * Partners Screen - Native (fetches from API)
 * Data is loaded dynamically from /api/mobile/partners.
 * When a new partner is added on the website, it appears here automatically.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import AUTH_CONFIG from '../config/auth';
import * as haptics from '../utils/haptics';
import { createLogger } from '../utils/logger';

const log = createLogger('Partners');

const THEME_COLORS = {
  emerald: '#10b981',
  pink: '#ec4899',
  blue: '#3b82f6',
  purple: '#8b5cf6',
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
  const [expandedId, setExpandedId] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const l = (en, ar, ru) => (locale === 'ar' ? ar : locale === 'ru' ? ru : en);

  const fetchPartners = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const res = await fetch(`${baseUrl}/api/mobile/partners`, {
        headers: {
          'x-api-key': AUTH_CONFIG.API_KEY,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
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
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  }, []);

  const handleDirections = useCallback((url) => {
    haptics.lightTap();
    Linking.openURL(url);
  }, []);

  const handleWebsite = useCallback((url) => {
    haptics.lightTap();
    Linking.openURL(url);
  }, []);

  const getIcon = (type) => TYPE_ICONS[type] || 'sparkles';

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

      {/* Loading State */}
      {loading && (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.stateText}>{l('Loading partners...', 'جارٍ تحميل الشركاء...', 'Загрузка партнёров...')}</Text>
        </View>
      )}

      {/* Error State */}
      {!loading && error && (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline" size={48} color="#9CA3AF" />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPartners()} activeOpacity={0.7}>
            <Text style={styles.retryBtnText}>{l('Retry', 'إعادة المحاولة', 'Повторить')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!loading && !error && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchPartners(true)} tintColor="#dc2626" />
          }
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <Ionicons name="business" size={48} color="#dc2626" />
            <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
              {l('Our Partners', 'شركاؤنا', 'Наши партнёры')}
            </Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
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
              const color = THEME_COLORS[partner.theme] || '#dc2626';
              const isExpanded = expandedId === partner.id;
              const { displayName, branch } = parsePartnerName(partner.name);

              return (
                <TouchableOpacity
                  key={partner.id}
                  style={[
                    styles.partnerCard,
                    isExpanded && { borderColor: color, borderWidth: 1.5, backgroundColor: `${color}06` },
                  ]}
                  onPress={() => handleToggle(partner.id)}
                  activeOpacity={0.7}
                >
                  {/* Main Row */}
                  <View style={[styles.partnerRow, isRTL && styles.partnerRowRTL]}>
                    <View style={[styles.partnerIcon, { backgroundColor: `${color}15` }]}>
                      <Ionicons name={getIcon(partner.type)} size={22} color={color} />
                    </View>
                    <View style={styles.partnerContent}>
                      <Text style={[styles.partnerName, isRTL && styles.textRTL, isExpanded && { color }]}>{displayName}</Text>
                      {branch ? <Text style={[styles.partnerBranch, isRTL && styles.textRTL]}>{branch}</Text> : null}
                      <Text style={[styles.partnerType, isRTL && styles.textRTL]}>{partner.type}</Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : (isRTL ? 'chevron-back' : 'chevron-forward')}
                      size={16}
                      color={isExpanded ? color : '#D1D5DB'}
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
                        <Ionicons name="location" size={16} color="#6B7280" />
                        <Text style={[styles.detailText, isRTL && styles.textRTL]}>{partner.location}</Text>
                      </View>

                      {/* Phone */}
                      {partner.phone && (
                        <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
                          <Ionicons name="call" size={16} color="#6B7280" />
                          <Text style={[styles.detailText, { writingDirection: 'ltr', textAlign: 'left' }]}>{partner.phone}</Text>
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
                        {partner.phone && (
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: `${color}15` }]}
                            onPress={() => handleCall(partner.phone)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="call" size={16} color={color} />
                            <Text style={[styles.actionBtnText, { color }]}>{l('Call', 'اتصل', 'Позвонить')}</Text>
                          </TouchableOpacity>
                        )}
                        {partner.directions && (
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#dbeafe' }]}
                            onPress={() => handleDirections(partner.directions)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="navigate" size={16} color="#2563eb" />
                            <Text style={[styles.actionBtnText, { color: '#2563eb' }]}>{l('Directions', 'الاتجاهات', 'Маршрут')}</Text>
                          </TouchableOpacity>
                        )}
                        {partner.website && (
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#f3f4f6' }]}
                            onPress={() => handleWebsite(partner.website)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="globe" size={16} color="#4B5563" />
                            <Text style={[styles.actionBtnText, { color: '#4B5563' }]}>{l('Website', 'الموقع', 'Сайт')}</Text>
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
      )}
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

  // Loading / Error states
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  stateText: { fontSize: 15, color: '#6B7280', marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: '#dc2626', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center', backgroundColor: '#FAFAFA' },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center', marginTop: 12, marginBottom: 8, letterSpacing: -0.4 },
  heroSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },

  // Section
  section: { paddingHorizontal: 16, paddingVertical: 16 },

  // Partner Cards
  partnerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  partnerRow: { flexDirection: 'row', alignItems: 'center' },
  partnerRowRTL: { flexDirection: 'row-reverse' },
  partnerIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  partnerContent: { flex: 1 },
  partnerName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 1 },
  partnerBranch: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 2 },
  partnerType: { fontSize: 12, color: '#9CA3AF' },

  // Expanded
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB' },
  descriptionText: { fontSize: 13, color: '#4B5563', lineHeight: 19, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  detailRowRTL: { flexDirection: 'row-reverse' },
  detailText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 },

  // Action buttons
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  actionRowRTL: { flexDirection: 'row-reverse' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  // CTA
  ctaSection: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center', backgroundColor: '#FEF2F2', marginHorizontal: 16, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  ctaDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dc2626', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  ctaBtnRTL: { flexDirection: 'row-reverse' },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
