import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { AUTH_CONFIG } from '../config/auth';
import { getJson } from '../services/httpClient';
import { createLogger } from '../utils/logger';
import T from '../utils/typography';

const log = createLogger('PrivacyPolicy');

export default function PrivacyPolicyContent({ showLastUpdated = true }) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchPolicy() {
      try {
        setLoading(true);
        setError(false);
        const data = await getJson(`${AUTH_CONFIG.API_BASE_URL}/privacy-policy`, {
          headers: {
            locale: locale || 'en',
          },
        });
        if (!cancelled) setPolicy(data);
      } catch (e) {
        log.warn('Failed to fetch privacy policy from API', e?.message || e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPolicy();
    return () => { cancelled = true; };
  }, [locale]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  if (error || !policy) {
    const fallbackUrl = `https://genosys.ae/${locale === 'en' ? '' : locale + '/'}privacy-policy`;
    return (
      <View style={styles.centered}>
        <Ionicons name="shield-outline" size={48} color="#ccc" />
        <Text style={[styles.errorText, isRTL && styles.textRTL]}>
          {locale === 'ar' ? 'لم نتمكن من تحميل سياسة الخصوصية.' : locale === 'ru' ? 'Не удалось загрузить политику конфиденциальности.' : 'Could not load privacy policy.'}
        </Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={() => Linking.openURL(fallbackUrl)}>
          <Text style={styles.fallbackButtonText}>
            {locale === 'ar' ? 'عرض على الموقع' : locale === 'ru' ? 'Открыть на сайте' : 'View on Website'}
          </Text>
          <Ionicons name="open-outline" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    );
  }

  const renderSection = (section) => {
    switch (section.type) {
      case 'highlight':
        return (
          <View key={section.id} style={[styles.highlightSection, isRTL && styles.highlightSectionRTL]}>
            <Text style={[styles.highlightTitle, isRTL && styles.textRTL]}>{section.title}</Text>
            <Text style={[styles.highlightText, isRTL && styles.textRTL]}>{section.content}</Text>
          </View>
        );

      case 'list':
        return (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {section.number ? `${section.number}. ` : ''}{section.title}
            </Text>
            {section.content && (
              <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{section.content}</Text>
            )}
            {/* Grouped card with hairline dividers between rows — matches the
                web divided-list style shipped in d25b1e16 for scannability. */}
            <View style={styles.listCard}>
              {section.items?.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.listRow,
                    i > 0 && styles.listRowDivider,
                  ]}
                >
                  <Text style={[styles.listItemLabel, isRTL && styles.textRTL]}>{item.label}</Text>
                  <Text style={[styles.listItemText, isRTL && styles.textRTL]}>{item.text}</Text>
                </View>
              ))}
            </View>
            {section.links?.map((link, i) => (
              <TouchableOpacity key={i} onPress={() => Linking.openURL(link.url)} style={[styles.linkRow, isRTL && styles.linkRowRTL]}>
                <Ionicons name="open-outline" size={14} color="#dc2626" />
                <Text style={styles.link}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'bullets':
        return (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {section.number ? `${section.number}. ` : ''}{section.title}
            </Text>
            {section.content && (
              <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{section.content}</Text>
            )}
            <View style={styles.listContainer}>
              {section.items?.map((item, i) => (
                <View key={i} style={[styles.bulletItem, isRTL && styles.bulletItemRTL]}>
                  <Text style={styles.bullet}>{isRTL ? '◂' : '▸'}</Text>
                  <Text style={[styles.bulletText, isRTL && styles.textRTL]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'text':
        return (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {section.number ? `${section.number}. ` : ''}{section.title}
            </Text>
            <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{section.content}</Text>
          </View>
        );

      case 'contact':
        return (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {section.number ? `${section.number}. ` : ''}{section.title}
            </Text>
            <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{section.content}</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactCompany}>{section.contact.company}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${section.contact.email}`)} style={[styles.contactItem, isRTL && styles.rowRTL]}>
                <Ionicons name="mail-outline" size={16} color="#dc2626" />
                <Text style={styles.contactLink}>{section.contact.email}</Text>
              </TouchableOpacity>
              <View style={[styles.contactItem, isRTL && styles.rowRTL]}>
                <Ionicons name="call-outline" size={16} color="#dc2626" />
                <Text style={styles.contactText}>{section.contact.phone}</Text>
              </View>
              <View style={[styles.contactItem, isRTL && styles.rowRTL]}>
                <Ionicons name="location-outline" size={16} color="#dc2626" />
                <Text style={[styles.contactText, isRTL && styles.textRTL]}>{section.contact.address}</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {showLastUpdated && (
        <View style={[styles.updateInfo, isRTL && styles.updateInfoRTL]}>
          <View style={styles.updatePill}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.updatePillText}>{policy.lastUpdated}</Text>
          </View>
        </View>
      )}

      {policy.sections.map(renderSection)}

      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 300 },
  errorText: { ...T.body, color: '#666', marginTop: 16, textAlign: 'center' },
  fallbackButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, padding: 12 },
  fallbackButtonText: { ...T.button, color: '#dc2626' },
  // Tight pill badge replaces the full-width italic banner — matches
  // the web Privacy Policy "Last Updated" treatment shipped in 6f9e4f04.
  updateInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  updateInfoRTL: { alignItems: 'flex-end' },
  updatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  updatePillText: { ...T.captionSmall, color: '#4B5563', fontWeight: '500' },
  highlightSection: {
    backgroundColor: '#FFF3F3',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  highlightSectionRTL: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: '#dc2626',
  },
  highlightTitle: { ...T.sectionTitleSmall, color: '#dc2626', marginBottom: 8 },
  highlightText: { ...T.body, color: '#333' },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { ...T.sectionTitleSmall, fontWeight: '600', marginBottom: 12 },
  paragraph: { ...T.body, color: '#333', marginBottom: 12, lineHeight: 22 },
  listContainer: { marginVertical: 4 },
  // Legacy styles — still referenced elsewhere, kept for safety
  listItem: { marginBottom: 12, paddingStart: 16 },
  listItemRTL: { paddingStart: 16 },
  // New grouped-card + divided-row layout (matches web d25b1e16)
  listCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  listRow: { paddingVertical: 4 },
  listRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    marginTop: 12,
    paddingTop: 12,
  },
  listItemLabel: { ...T.button, color: '#1D1D1F', marginBottom: 4 },
  listItemText: { ...T.body, color: '#333', lineHeight: 22 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, paddingStart: 8 },
  bulletItemRTL: { flexDirection: 'row-reverse', paddingStart: 0, paddingEnd: 8 },
  bullet: { color: '#dc2626', fontSize: 12, marginTop: 4, marginEnd: 8, width: 14 },
  bulletText: { ...T.body, color: '#333', lineHeight: 22, flex: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingStart: 16, marginTop: 8 },
  linkRowRTL: { flexDirection: 'row-reverse', paddingStart: 0, paddingEnd: 16 },
  contactInfo: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  contactCompany: { ...T.button, color: '#1D1D1F', marginBottom: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingStart: 4 },
  contactLink: {
    ...T.body,
    color: '#dc2626',
    lineHeight: undefined,
    textDecorationLine: 'underline',
    marginStart: 8,
  },
  contactText: { ...T.body, color: '#333', lineHeight: 22, marginStart: 8, flex: 1 },
  link: { ...T.link, color: '#dc2626', textDecorationLine: 'underline' },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  footerSpace: { height: 40 },
});
