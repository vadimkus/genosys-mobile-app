/**
 * FAQ Screen - Native (fetches from API)
 * Data is loaded dynamically from /api/mobile/faq on the website.
 * Grouped by category with section headers.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  TextInput,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import AppFooter from '../components/AppFooter';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import AUTH_CONFIG from '../config/auth';
import { getJson } from '../services/httpClient';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { createLogger } from '../utils/logger';
import { colors, shadow, surfaces, tint } from '../utils/theme';

const log = createLogger('FAQ');

// Enable LayoutAnimation on old-arch Android for smooth expand/collapse.
// On Fabric (new arch) the call is a no-op that logs a deprecation warning.
if (Platform.OS === 'android' && !global?.nativeFabricUIManager && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORY_ORDER = ['general', 'products', 'orders', 'shipping', 'app', 'account'];

const CATEGORY_LABELS = {
  general:  { en: 'About GENOSYS',     ar: 'عن GENOSYS',       ru: 'О GENOSYS',           icon: 'storefront', color: colors.accent },
  products: { en: 'Products',          ar: 'المنتجات',         ru: 'Продукты',            icon: 'sparkles',   color: colors.purple },
  orders:   { en: 'Orders & Payment',  ar: 'الطلبات والدفع',   ru: 'Заказы и оплата',     icon: 'card',       color: colors.indigo },
  shipping: { en: 'Shipping',          ar: 'الشحن',            ru: 'Доставка',            icon: 'car',        color: colors.teal },
  app:      { en: 'Mobile App',        ar: 'التطبيق',          ru: 'Приложение',          icon: 'phone-portrait', color: colors.blue },
  account:  { en: 'Account & Support', ar: 'الحساب والدعم',    ru: 'Аккаунт и поддержка', icon: 'person',     color: colors.green },
};

export default function FAQScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();

  const [faqData, setFaqData] = useState([]);
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedIds, setExpandedIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    if (loading) return;
    fade.setValue(0);
    lift.setValue(12);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [loading, fade, lift]);

  const getCategoryLabel = (cat) => {
    const meta = CATEGORY_LABELS[cat];
    if (!meta) return cat;
    return locale === 'ar' ? meta.ar : locale === 'ru' ? meta.ru : meta.en;
  };

  const fetchFAQ = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const baseUrl = AUTH_CONFIG.API_BASE_URL.replace('/api/mobile', '');
      const data = await getJson(`${baseUrl}/api/mobile/faq`, {
        headers: {
          locale: locale || 'en',
        },
      });

      setFaqData(data.items || []);
      setSubtitle(data.subtitle || '');
      setDescription(data.description || '');
    } catch (err) {
      log.warn('Failed to fetch FAQ:', err.message);
      setError(l('Failed to load FAQ', 'فشل تحميل الأسئلة الشائعة', 'Не удалось загрузить FAQ'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchFAQ();
  }, [fetchFAQ]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return faqData;
    const q = searchQuery.toLowerCase();
    return faqData.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [faqData, searchQuery]);

  const groupedFaqs = useMemo(() => {
    const groups = [];
    for (const cat of CATEGORY_ORDER) {
      const items = filteredData.filter((f) => (f.category || 'general') === cat);
      if (items.length > 0) groups.push({ category: cat, items });
    }
    const uncategorized = filteredData.filter(
      (f) => f.category && !CATEGORY_ORDER.includes(f.category)
    );
    if (uncategorized.length > 0) groups.push({ category: 'general', items: uncategorized });
    return groups;
  }, [filteredData]);

  const toggleItem = useCallback((id) => {
    haptics.lightTap();
    LayoutAnimation.easeInEaseOut();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const renderFormattedAnswer = (answer) => {
    const raw = String(answer || '');
    const cleaned = raw.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
    const lines = cleaned.replace(/\r\n/g, '\n').split('\n');
    const rows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = String(lines[i] ?? '').trim();
      if (!line) {
        if (rows.length && rows[rows.length - 1]?.type !== 'spacer') rows.push({ type: 'spacer', key: `sp-${i}` });
        continue;
      }
      const bullet = line.match(/^[-•]\s+(.*)$/);
      if (bullet) { rows.push({ type: 'bullet', key: `b-${i}`, text: bullet[1] }); continue; }
      const numbered = line.match(/^(\d+)\.\s+(.*)$/);
      if (numbered) { rows.push({ type: 'number', key: `n-${i}`, num: numbered[1], text: numbered[2] }); continue; }
      rows.push({ type: 'p', key: `p-${i}`, text: line });
    }

    return (
      <View style={styles.faqAnswerBody}>
        {rows.map((r) => {
          if (r.type === 'spacer') return <View key={r.key} style={{ height: 8 }} />;
          if (r.type === 'bullet') {
            return (
              <View key={r.key} style={[styles.answerRow, isRTL && styles.answerRowRTL]}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.answerText, isRTL && styles.textRTL]}>{r.text}</Text>
              </View>
            );
          }
          if (r.type === 'number') {
            return (
              <View key={r.key} style={[styles.answerRow, isRTL && styles.answerRowRTL]}>
                <Text style={[styles.numBullet, isRTL && styles.numBulletRTL]}>{r.num}.</Text>
                <Text style={[styles.answerText, isRTL && styles.textRTL]}>{r.text}</Text>
              </View>
            );
          }
          return <Text key={r.key} style={[styles.answerParagraph, isRTL && styles.textRTL]}>{r.text}</Text>;
        })}
      </View>
    );
  };

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/'); };
  const headerTitle = t('navigation.faq') || 'FAQ';

  if (loading) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader title={headerTitle} scrollY={null} onBack={onBack} isRTL={isRTL} />
        <View style={[styles.centered, { paddingTop: headerHeight }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            {l('Loading...', 'جارٍ التحميل...', 'Загрузка...')}
          </Text>
        </View>
      </View>
    );
  }

  if (error && faqData.length === 0) {
    return (
      <View style={styles.container}>
        <CollapsibleHeader title={headerTitle} scrollY={null} onBack={onBack} isRTL={isRTL} />
        <View style={[styles.centered, { paddingTop: headerHeight }]}>
          <Ionicons name="cloud-offline" size={48} color={colors.tertiary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, shadow.cta(colors.cta)]} onPress={() => fetchFAQ()} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>{l('Try Again', 'حاول مرة أخرى', 'Попробовать снова')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={headerTitle} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFAQ(true)}
            tintColor={colors.accent}
            progressViewOffset={headerHeight}
          />
        }
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Hero */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, isRTL && styles.textRTLCenter]}>
              {subtitle || l('Frequently Asked Questions', 'الأسئلة الشائعة', 'Часто задаваемые вопросы')}
            </Text>
            {description ? (
              <Text style={[styles.heroSubtitle, isRTL && styles.textRTLCenter]}>
                {description}
              </Text>
            ) : null}
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
              <Ionicons name="search" size={18} color={colors.secondaryLabel} />
              <TextInput
                style={[styles.searchInput, isRTL && styles.textRTL]}
                placeholder={l('Search FAQ...', 'ابحث في الأسئلة...', 'Поиск по FAQ...')}
                placeholderTextColor={colors.secondaryLabel}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={t('shop.clearSearch')}
                >
                  <Ionicons name="close-circle" size={18} color={colors.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Grouped FAQ Sections */}
          {groupedFaqs.length === 0 && (
            <View style={[styles.card, styles.emptyState, shadow.card]}>
              <Ionicons name="search" size={40} color={colors.tertiary} />
              <Text style={[styles.emptyText, isRTL && styles.textRTLCenter]}>
                {l('No results found', 'لم يتم العثور على نتائج', 'Ничего не найдено')}
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchLink}>
                  {l('Clear search', 'مسح البحث', 'Очистить')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {groupedFaqs.map(({ category, items }) => {
            const meta = CATEGORY_LABELS[category] || CATEGORY_LABELS.general;
            return (
              <View key={category}>
                {/* Category header (icon tile + title) */}
                <View style={[styles.sectionHeaderRow, isRTL && styles.sectionHeaderRowRTL]}>
                  <View style={[surfaces.iconTile, { backgroundColor: meta.color || colors.accent }]}>
                    <Ionicons name={meta.icon} size={17} color={colors.white} />
                  </View>
                  <Text style={[styles.sectionHeaderTitle, isRTL && styles.textRTL]}>
                    {getCategoryLabel(category)}
                  </Text>
                </View>

                {/* FAQ items */}
                <View style={[styles.card, shadow.card]}>
                  {items.map((faq, index) => {
                    const isExpanded = !!expandedIds[faq.id];
                    return (
                      <View key={faq.id}>
                        {index > 0 ? <View style={styles.hairline} /> : null}
                        <TouchableOpacity
                          style={[styles.faqQuestion, isRTL && styles.faqQuestionRTL]}
                          onPress={() => toggleItem(faq.id)}
                          activeOpacity={0.6}
                        >
                          <Text style={[styles.faqQuestionText, isRTL && styles.textRTL, isExpanded && styles.faqQuestionTextActive]}>
                            {faq.question}
                          </Text>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={isExpanded ? colors.accent : colors.secondaryLabel}
                          />
                        </TouchableOpacity>
                        {isExpanded && (
                          <View style={styles.faqAnswer}>
                            {renderFormattedAnswer(faq.answer)}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Still have questions? */}
          <View style={styles.ctaSection}>
            <Text style={[styles.ctaTitle, isRTL && styles.textRTLCenter]}>
              {l('Still have questions?', 'لا تزال لديك أسئلة؟', 'Остались вопросы?')}
            </Text>
            <View style={[styles.ctaButtons, isRTL && styles.ctaButtonsRTL]}>
              <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: tint(colors.whatsapp) }]}
                onPress={() => { haptics.mediumTap(); Linking.openURL('https://wa.me/971585487665').catch(() => {}); }}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-whatsapp" size={18} color={colors.whatsapp} />
                <Text style={[styles.ctaBtnText, { color: colors.whatsapp }]}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: colors.accentBg }]}
                onPress={() => { haptics.mediumTap(); Linking.openURL('mailto:sales@genosys.ae').catch(() => {}); }}
                activeOpacity={0.7}
              >
                <Ionicons name="mail" size={18} color={colors.accent} />
                <Text style={[styles.ctaBtnText, { color: colors.accent }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer — shared brand block */}
          <AppFooter style={{ paddingBottom: 8 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { ...T.bodySmall, marginTop: 12, color: colors.secondaryLabel, lineHeight: undefined },
  errorText: { ...T.bodySmall, marginTop: 12, color: colors.secondaryLabel, textAlign: 'center', lineHeight: undefined },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.cta,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
  },
  retryBtnText: { ...T.button, color: colors.white, fontWeight: '700' },

  // Hero
  heroSection: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, alignItems: 'center' },
  heroTitle: { ...T.pageTitle, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { ...T.body, color: colors.secondaryLabel, textAlign: 'center', lineHeight: 22 },

  // Search
  searchContainer: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 11, default: 6 }),
  },
  searchBarRTL: { flexDirection: 'row-reverse' },
  searchInput: { ...T.input, flex: 1, padding: 0 },

  // Section header (icon tile)
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeaderRowRTL: { flexDirection: 'row-reverse' },
  sectionHeaderTitle: { ...T.label, fontWeight: '700', color: colors.label },

  // Cards / rows
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    paddingHorizontal: 14,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },

  // FAQ
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  faqQuestionRTL: { flexDirection: 'row-reverse' },
  faqQuestionText: { ...T.faqQuestion, flex: 1, color: colors.label },
  faqQuestionTextActive: { color: colors.accent, fontWeight: '600' },
  faqAnswer: { paddingBottom: 14 },
  faqAnswerBody: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 14,
  },
  answerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  answerRowRTL: { flexDirection: 'row-reverse' },
  bullet: { fontSize: 16, lineHeight: 22, color: colors.accent, fontWeight: '800' },
  numBullet: { fontSize: 14, lineHeight: 22, color: colors.accent, fontWeight: '800', minWidth: 22, textAlign: 'right' },
  numBulletRTL: { textAlign: 'left' },
  answerText: { ...T.faqAnswer, flex: 1, color: colors.bodyText, fontWeight: '500' },
  answerParagraph: { ...T.faqAnswer, color: colors.bodyText, fontWeight: '500', marginBottom: 8 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 36, gap: 8, marginTop: 8 },
  emptyText: { ...T.bodySmall, color: colors.secondaryLabel, lineHeight: undefined },
  clearSearchLink: { ...T.bodySmall, color: colors.accent, fontWeight: '600', marginTop: 4, lineHeight: undefined },

  // CTA
  ctaSection: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, alignItems: 'center' },
  ctaTitle: { ...T.sectionTitleSmall, marginBottom: 16 },
  ctaButtons: { flexDirection: 'row', gap: 12 },
  ctaButtonsRTL: { flexDirection: 'row-reverse' },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaBtnText: { ...T.button, fontSize: 15, fontWeight: '700' },

  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
});
