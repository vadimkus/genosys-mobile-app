/**
 * FAQ Screen - Native (fetches from API)
 * Data is loaded dynamically from /api/mobile/faq on the website.
 * When FAQ content is updated on the website, it appears here automatically.
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
import * as Haptics from 'expo-haptics';

export default function FAQScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const [faqData, setFaqData] = useState([]);
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

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
      console.warn('Failed to fetch FAQ:', err.message);
      setError(l('Failed to load FAQ', 'فشل تحميل الأسئلة الشائعة', 'Не удалось загрузить FAQ'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchFAQ();
  }, [fetchFAQ]);

  const toggleItem = useCallback((id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderFormattedAnswer = (answer) => {
    const raw = String(answer || '');
    const lines = raw.replace(/\r\n/g, '\n').split('\n');
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

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t('navigation.faq') || 'FAQ'}
          </Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>
            {l('Loading...', 'جارٍ التحميل...', 'Загрузка...')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && faqData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t('navigation.faq') || 'FAQ'}
          </Text>
          <View style={styles.backBtn} />
        </View>
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
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.faq') || 'FAQ'}
        </Text>
        <View style={styles.backBtn} />
      </View>

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

        {/* FAQ List */}
        <View style={styles.section}>
          <View style={styles.faqContainer}>
            {faqData.map((faq, index) => (
              <View key={faq.id} style={[styles.faqItem, index < faqData.length - 1 && styles.faqItemBorder]}>
                <TouchableOpacity
                  style={[styles.faqQuestion, isRTL && styles.faqQuestionRTL]}
                  onPress={() => toggleItem(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestionText, isRTL && styles.textRTL, expandedId === faq.id && styles.faqQuestionTextActive]}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={expandedId === faq.id ? '#dc2626' : '#9CA3AF'}
                  />
                </TouchableOpacity>
                {expandedId === faq.id && (
                  <View style={styles.faqAnswer}>
                    {renderFormattedAnswer(faq.answer)}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Still have questions? */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, isRTL && styles.textRTL]}>
            {l("Still have questions?", "لا تزال لديك أسئلة؟", "Остались вопросы?")}
          </Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnPrimary]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Linking.openURL('https://wa.me/971585487665'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#ffffff" />
              <Text style={styles.ctaBtnPrimaryText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaBtn, styles.ctaBtnSecondary]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Linking.openURL('mailto:sales@genosys.ae'); }}
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
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginHorizontal: 8 },
  scrollView: { flex: 1 },

  // Loading / Error
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 15, color: '#6B7280' },
  errorText: { marginTop: 12, fontSize: 15, color: '#6B7280', textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: '#dc2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center', backgroundColor: '#FAFAFA' },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 8, letterSpacing: -0.4 },
  heroSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },

  // Section
  section: { paddingHorizontal: 20, paddingVertical: 20 },

  // FAQ
  faqContainer: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  faqItem: {},
  faqItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  faqQuestionRTL: { flexDirection: 'row-reverse' },
  faqQuestionText: { fontSize: 15, fontWeight: '500', color: '#1F2937', flex: 1, paddingEnd: 12 },
  faqQuestionTextActive: { color: '#dc2626', fontWeight: '600' },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#F9FAFB' },

  // Answer formatting
  answerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  answerRowRTL: { flexDirection: 'row-reverse' },
  bullet: { fontSize: 16, lineHeight: 22, color: '#dc2626', fontWeight: '800' },
  numBullet: { fontSize: 14, lineHeight: 22, color: '#dc2626', fontWeight: '800', minWidth: 22, textAlign: 'right' },
  answerText: { flex: 1, fontSize: 14, lineHeight: 22, color: '#4B5563', fontWeight: '400' },
  answerParagraph: { fontSize: 14, lineHeight: 22, color: '#4B5563', marginBottom: 6 },

  // CTA
  ctaSection: { paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center', backgroundColor: '#F9FAFB' },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 16 },
  ctaButtons: { flexDirection: 'row', gap: 12 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14 },
  ctaBtnPrimary: { backgroundColor: '#25D366' },
  ctaBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  ctaBtnSecondary: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  ctaBtnSecondaryText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
