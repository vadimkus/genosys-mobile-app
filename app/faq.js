/**
 * FAQ Screen - Native (fetches from API)
 * Data is loaded dynamically from /api/mobile/faq on the website.
 * Grouped by category with section headers.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import AUTH_CONFIG from '../config/auth';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { createLogger } from '../utils/logger';

const log = createLogger('FAQ');

const CATEGORY_ORDER = ['general', 'products', 'orders', 'shipping', 'app', 'account'];

const CATEGORY_LABELS = {
  general:  { en: 'About GENOSYS',     ar: 'عن GENOSYS',       ru: 'О GENOSYS',           icon: 'storefront-outline' },
  products: { en: 'Products',          ar: 'المنتجات',         ru: 'Продукты',            icon: 'sparkles-outline' },
  orders:   { en: 'Orders & Payment',  ar: 'الطلبات والدفع',   ru: 'Заказы и оплата',     icon: 'card-outline' },
  shipping: { en: 'Shipping',          ar: 'الشحن',            ru: 'Доставка',            icon: 'car-outline' },
  app:      { en: 'Mobile App',        ar: 'التطبيق',          ru: 'Приложение',          icon: 'phone-portrait-outline' },
  account:  { en: 'Account & Support', ar: 'الحساب والدعم',    ru: 'Аккаунт и поддержка', icon: 'person-outline' },
};

export default function FAQScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const [faqData, setFaqData] = useState([]);
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedIds, setExpandedIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

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
      const res = await fetch(`${baseUrl}/api/mobile/faq`, {
        headers: {
          'x-api-key': AUTH_CONFIG.API_KEY,
          'x-locale': locale || 'en',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

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
      <View>
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
                <Text style={[styles.numBullet, isRTL && { textAlign: 'left' }]}>{r.num}.</Text>
                <Text style={[styles.answerText, isRTL && styles.textRTL]}>{r.text}</Text>
              </View>
            );
          }
          return <Text key={r.key} style={[styles.answerParagraph, isRTL && styles.textRTL]}>{r.text}</Text>;
        })}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, isRTL && styles.headerRTL]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {t('navigation.faq') || 'FAQ'}
      </Text>
      <View style={styles.backBtn} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>
            {l('Loading...', 'جارٍ التحميل...', 'Загрузка...')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && faqData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centered}>
          <Ionicons name="cloud-offline" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchFAQ()} activeOpacity={0.7}>
            <Text style={styles.retryBtnText}>{l('Try Again', 'حاول مرة أخرى', 'Попробовать снова')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchFAQ(true)} tintColor="#dc2626" />
        }
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
            {subtitle || l('Frequently Asked Questions', 'الأسئلة الشائعة', 'Часто задаваемые вопросы')}
          </Text>
          {description ? (
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
              {description}
            </Text>
          ) : null}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={[styles.searchInput, isRTL && styles.textRTL]}
              placeholder={l('Search FAQ...', 'ابحث في الأسئلة...', 'Поиск по FAQ...')}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Grouped FAQ Sections */}
        <View style={styles.section}>
          {groupedFaqs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={40} color="#D1D5DB" />
              <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
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
              <View key={category} style={styles.categoryGroup}>
                {/* Category header */}
                <View style={[styles.categoryHeader, isRTL && styles.categoryHeaderRTL]}>
                  <Ionicons name={meta.icon} size={18} color="#dc2626" />
                  <Text style={[styles.categoryTitle, isRTL && styles.textRTL]}>
                    {getCategoryLabel(category)}
                  </Text>
                  <View style={styles.categoryDivider} />
                </View>

                {/* FAQ items */}
                <View style={styles.faqContainer}>
                  {items.map((faq, index) => {
                    const isExpanded = !!expandedIds[faq.id];
                    return (
                      <View key={faq.id} style={[styles.faqItem, index < items.length - 1 && styles.faqItemBorder]}>
                        <TouchableOpacity
                          style={[styles.faqQuestion, isRTL && styles.faqQuestionRTL]}
                          onPress={() => toggleItem(faq.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.faqQuestionText, isRTL && styles.textRTL, isExpanded && styles.faqQuestionTextActive]}>
                            {faq.question}
                          </Text>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={isExpanded ? '#dc2626' : '#9CA3AF'}
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
        </View>

        {/* Still have questions? */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, isRTL && styles.textRTL]}>
            {l('Still have questions?', 'لا تزال لديك أسئلة؟', 'Остались вопросы?')}
          </Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnPrimary]}
              onPress={() => { haptics.mediumTap(); Linking.openURL('https://wa.me/971585487665'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#ffffff" />
              <Text style={styles.ctaBtnPrimaryText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnSecondary]}
              onPress={() => { haptics.mediumTap(); Linking.openURL('mailto:sales@genosys.ae'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={18} color="#dc2626" />
              <Text style={styles.ctaBtnSecondaryText}>Email</Text>
            </TouchableOpacity>
          </View>
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

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { ...T.bodySmall, marginTop: 12, color: '#6B7280', lineHeight: undefined },
  errorText: { ...T.bodySmall, marginTop: 12, color: '#6B7280', textAlign: 'center', lineHeight: undefined },
  retryBtn: { marginTop: 16, backgroundColor: '#dc2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { ...T.buttonSmall, color: '#fff', fontSize: 15 },

  heroSection: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center', backgroundColor: '#FAFAFA' },
  heroTitle: { ...T.pageTitle, color: '#000', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { ...T.subtitle, textAlign: 'center', lineHeight: 22 },

  searchContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchBarRTL: { flexDirection: 'row-reverse' },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937', padding: 0 },

  section: { paddingHorizontal: 20, paddingVertical: 12 },

  categoryGroup: { marginBottom: 20 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  categoryHeaderRTL: { flexDirection: 'row-reverse' },
  categoryTitle: { ...T.faqQuestion, color: '#1F2937', fontWeight: '700', fontSize: 15 },
  categoryDivider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },

  faqContainer: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  faqItem: {},
  faqItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  faqQuestionRTL: { flexDirection: 'row-reverse' },
  faqQuestionText: { ...T.faqQuestion, color: '#1F2937', flex: 1, paddingEnd: 12 },
  faqQuestionTextActive: { color: '#dc2626', fontWeight: '600' },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#F9FAFB' },

  answerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  answerRowRTL: { flexDirection: 'row-reverse' },
  bullet: { fontSize: 16, lineHeight: 22, color: '#dc2626', fontWeight: '800' },
  numBullet: { fontSize: 14, lineHeight: 22, color: '#dc2626', fontWeight: '800', minWidth: 22, textAlign: 'right' },
  answerText: { ...T.faqAnswer, flex: 1, color: '#4B5563' },
  answerParagraph: { ...T.faqAnswer, color: '#4B5563', marginBottom: 6 },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { ...T.bodySmall, color: '#9CA3AF', lineHeight: undefined },
  clearSearchLink: { ...T.bodySmall, color: '#dc2626', fontWeight: '600', marginTop: 4, lineHeight: undefined },

  ctaSection: { paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center', backgroundColor: '#F9FAFB' },
  ctaTitle: { ...T.sectionTitleSmall, color: '#000', marginBottom: 16 },
  ctaButtons: { flexDirection: 'row', gap: 12 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14 },
  ctaBtnPrimary: { backgroundColor: '#25D366' },
  ctaBtnPrimaryText: { ...T.buttonSmall, color: '#fff', fontSize: 15 },
  ctaBtnSecondary: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  ctaBtnSecondaryText: { ...T.buttonSmall, color: '#dc2626', fontSize: 15 },

  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
