import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { AUTH_CONFIG } from '../config/auth';
import { getJson } from '../services/httpClient';
import { createLogger } from '../utils/logger';
import T from '../utils/typography';
import { colors } from '../utils/theme';

const log = createLogger('PrivacyPolicy');

/**
 * Shared privacy-policy body.
 *
 * Optional scroll-aware props (used by the full-screen `app/profile/privacy.js`
 * so the CollapsibleHeader fades in on scroll). When omitted (e.g. the modal),
 * the component renders exactly as before.
 *   - scrollY: Animated.Value the parent header reads (we just need onScroll wired)
 *   - onScroll: Animated.event handler from useCollapsibleHeader()
 *   - contentTopInset: top padding so content starts below the floating header
 */
export default function PrivacyPolicyContent({ showLastUpdated = true, onScroll = null, contentTopInset = 0 }) {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const topInsetStyle = contentTopInset ? { paddingTop: contentTopInset } : null;
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
      <View style={[styles.centered, topInsetStyle]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !policy) {
    const fallbackUrl = `https://genosys.ae/${locale === 'en' ? '' : locale + '/'}privacy-policy`;
    return (
      <View style={[styles.centered, topInsetStyle]}>
        <Ionicons name="shield-outline" size={48} color={colors.tertiary} />
        <Text style={[styles.errorText, isRTL && styles.textRTL]}>
          {locale === 'ar' ? 'لم نتمكن من تحميل سياسة الخصوصية.' : locale === 'ru' ? 'Не удалось загрузить политику конфиденциальности.' : 'Could not load privacy policy.'}
        </Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={() => Linking.openURL(fallbackUrl).catch(() => {})}>
          <Text style={styles.fallbackButtonText}>
            {locale === 'ar' ? 'عرض على الموقع' : locale === 'ru' ? 'Открыть на сайте' : 'View on Website'}
          </Text>
          <Ionicons name="open-outline" size={16} color={colors.accent} />
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
            {/* Grouped card with hairline dividers between rows - matches the
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
              <TouchableOpacity key={i} onPress={() => Linking.openURL(link.url).catch(() => {})} style={[styles.linkRow, isRTL && styles.linkRowRTL]}>
                <Ionicons name="open-outline" size={14} color={colors.accent} />
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
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${section.contact.email}`).catch(() => {})} style={[styles.contactItem, isRTL && styles.rowRTL]}>
                <Ionicons name="mail-outline" size={16} color={colors.accent} />
                <Text style={styles.contactLink}>{section.contact.email}</Text>
              </TouchableOpacity>
              <View style={[styles.contactItem, isRTL && styles.rowRTL]}>
                <Ionicons name="call-outline" size={16} color={colors.accent} />
                <Text style={styles.contactText}>{section.contact.phone}</Text>
              </View>
              <View style={[styles.contactItem, isRTL && styles.rowRTL]}>
                <Ionicons name="location-outline" size={16} color={colors.accent} />
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
    <Animated.ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.contentContainer, topInsetStyle]}
      onScroll={onScroll || undefined}
      scrollEventThrottle={16}
    >
      {showLastUpdated && (
        <View style={[styles.updateInfo, isRTL && styles.updateInfoRTL]}>
          <View style={styles.updatePill}>
            <Ionicons name="time-outline" size={14} color={colors.mutedText} />
            <Text style={styles.updatePillText}>{policy.lastUpdated}</Text>
          </View>
        </View>
      )}

      {policy.sections.map(renderSection)}

      <View style={styles.footerSpace} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 300 },
  errorText: { ...T.body, color: colors.mutedText, marginTop: 16, textAlign: 'center' },
  fallbackButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, padding: 12 },
  fallbackButtonText: { ...T.button, color: colors.accent },
  // Tight pill badge replaces the full-width italic banner - matches
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
    backgroundColor: colors.fill,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  updatePillText: { ...T.captionSmall, color: colors.mutedText, fontWeight: '500' },
  highlightSection: {
    backgroundColor: colors.redBg,
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  highlightSectionRTL: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: colors.accent,
  },
  highlightTitle: { ...T.sectionTitleSmall, color: colors.accent, marginBottom: 8 },
  highlightText: { ...T.body, color: colors.bodyText },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { ...T.sectionTitleSmall, fontWeight: '600', marginBottom: 12 },
  paragraph: { ...T.body, color: colors.bodyText, marginBottom: 12, lineHeight: 22 },
  listContainer: { marginVertical: 4 },
  // Legacy styles - still referenced elsewhere, kept for safety
  listItem: { marginBottom: 12, paddingStart: 16 },
  listItemRTL: { paddingStart: 16 },
  // New grouped-card + divided-row layout (matches web d25b1e16)
  listCard: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  listRow: { paddingVertical: 4 },
  listRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    marginTop: 12,
    paddingTop: 12,
  },
  listItemLabel: { ...T.button, color: colors.label, marginBottom: 4 },
  listItemText: { ...T.body, color: colors.bodyText, lineHeight: 22 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, paddingStart: 8 },
  bulletItemRTL: { flexDirection: 'row-reverse', paddingStart: 0, paddingEnd: 8 },
  bullet: { color: colors.accent, fontSize: 12, marginTop: 4, marginEnd: 8, width: 14 },
  bulletText: { ...T.body, color: colors.bodyText, lineHeight: 22, flex: 1 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingStart: 16, marginTop: 8 },
  linkRowRTL: { flexDirection: 'row-reverse', paddingStart: 0, paddingEnd: 16 },
  contactInfo: {
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.subtleBg,
    borderRadius: 8,
  },
  contactCompany: { ...T.button, color: colors.label, marginBottom: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingStart: 4 },
  contactLink: {
    ...T.body,
    color: colors.accent,
    lineHeight: undefined,
    textDecorationLine: 'underline',
    marginStart: 8,
  },
  contactText: { ...T.body, color: colors.bodyText, lineHeight: 22, marginStart: 8, flex: 1 },
  link: { ...T.link, color: colors.accent, textDecorationLine: 'underline' },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  footerSpace: { height: 40 },
});
