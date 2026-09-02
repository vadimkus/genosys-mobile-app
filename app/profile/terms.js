import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import * as haptics from '../../utils/haptics';
import T from '../../utils/typography';
import { colors } from '../../utils/theme';
import SectionCard from '../../components/SectionCard';

export default function TermsScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight, translateY: headerTranslateY } = useCollapsibleHeader({ hideOnScroll: true });

  const lastUpdated = t('terms.lastUpdatedDate');

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const sections = [
    {
      key: 'agreement',
      icon: 'document-text',
      title: t('terms.sections.agreement.title'),
      paragraphs: [t('terms.sections.agreement.p1')],
    },
    {
      key: 'useLicense',
      icon: 'key',
      title: t('terms.sections.useLicense.title'),
      paragraphs: [t('terms.sections.useLicense.p1')],
      bullets: [
        t('terms.sections.useLicense.b1'),
        t('terms.sections.useLicense.b2'),
        t('terms.sections.useLicense.b3'),
        t('terms.sections.useLicense.b4'),
      ],
    },
    {
      key: 'accountTerms',
      icon: 'person-circle',
      title: t('terms.sections.accountTerms.title'),
      paragraphs: [t('terms.sections.accountTerms.p1')],
      bullets: [
        t('terms.sections.accountTerms.b1'),
        t('terms.sections.accountTerms.b2'),
        t('terms.sections.accountTerms.b3'),
        t('terms.sections.accountTerms.b4'),
      ],
    },
    {
      key: 'products',
      icon: 'cube',
      title: t('terms.sections.products.title'),
      paragraphs: [t('terms.sections.products.p1')],
      bullets: [
        t('terms.sections.products.b1'),
        t('terms.sections.products.b2'),
        t('terms.sections.products.b3'),
        t('terms.sections.products.b4'),
      ],
    },
    {
      key: 'orders',
      icon: 'receipt',
      title: t('terms.sections.orders.title'),
      paragraphs: [t('terms.sections.orders.p1')],
      bullets: [
        t('terms.sections.orders.b1'),
        t('terms.sections.orders.b2'),
        t('terms.sections.orders.b3'),
        t('terms.sections.orders.b4'),
        t('terms.sections.orders.b5'),
      ],
    },
    {
      key: 'shipping',
      icon: 'car',
      title: t('terms.sections.shipping.title'),
      paragraphs: [t('terms.sections.shipping.p1')],
      bullets: [
        t('terms.sections.shipping.b1'),
        t('terms.sections.shipping.b2'),
        t('terms.sections.shipping.b3'),
        t('terms.sections.shipping.b4'),
      ],
    },
    {
      key: 'returns',
      icon: 'refresh',
      title: t('terms.sections.returns.title'),
      paragraphs: [t('terms.sections.returns.p1')],
    },
    {
      key: 'privacy',
      icon: 'lock-closed',
      title: t('terms.sections.privacy.title'),
      paragraphs: [t('terms.sections.privacy.p1')],
    },
    {
      key: 'prohibited',
      icon: 'ban',
      title: t('terms.sections.prohibited.title'),
      paragraphs: [t('terms.sections.prohibited.p1')],
      bullets: [
        t('terms.sections.prohibited.b1'),
        t('terms.sections.prohibited.b2'),
        t('terms.sections.prohibited.b3'),
        t('terms.sections.prohibited.b4'),
      ],
    },
    {
      key: 'disclaimers',
      icon: 'alert-circle',
      title: t('terms.sections.disclaimers.title'),
      paragraphs: [
        t('terms.sections.disclaimers.p1'),
        t('terms.sections.disclaimers.p2'),
      ],
    },
    {
      key: 'limitations',
      icon: 'shield-checkmark',
      title: t('terms.sections.limitations.title'),
      paragraphs: [t('terms.sections.limitations.p1')],
    },
    {
      key: 'governingLaw',
      icon: 'business',
      title: t('terms.sections.governingLaw.title'),
      paragraphs: [t('terms.sections.governingLaw.p1')],
    },
    {
      key: 'changes',
      icon: 'sync',
      title: t('terms.sections.changes.title'),
      paragraphs: [t('terms.sections.changes.p1')],
    },
  ];

  const Paragraph = ({ children, last }) => (
    <Text style={[styles.paragraph, last && styles.paragraphLast, isRTL && styles.textRTL]}>{children}</Text>
  );

  const Bullet = ({ children }) => (
    <View style={[styles.bulletRow, isRTL && styles.rowRTL]}>
      <View style={styles.bulletDot} />
      <Text style={[styles.bulletText, isRTL && styles.textRTL]}>{children}</Text>
    </View>
  );

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY} title={t('terms.title')} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 24 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Last Updated */}
          <View style={[styles.updatePillWrap, isRTL && styles.updatePillWrapRTL]}>
            <View style={styles.updatePill}>
              <Ionicons name="time-outline" size={13} color={colors.secondaryLabel} />
              <Text style={styles.updatePillText}>{t('terms.lastUpdated', { date: lastUpdated })}</Text>
            </View>
          </View>

          {sections.map((s) => (
            <SectionCard padding={18} key={s.key} icon={s.icon} title={s.title} isRTL={isRTL}>
              {Array.isArray(s.paragraphs) &&
                s.paragraphs.map((p, idx) => (
                  <Paragraph key={`${s.key}-p-${idx}`} last={idx === s.paragraphs.length - 1 && !(s.bullets && s.bullets.length)}>{p}</Paragraph>
                ))}
              {Array.isArray(s.bullets) && s.bullets.length > 0 ? (
                <View style={styles.bulletList}>
                  {s.bullets.map((b, idx) => (
                    <Bullet key={`${s.key}-b-${idx}`}>{b}</Bullet>
                  ))}
                </View>
              ) : null}
            </SectionCard>
          ))}

          {/* Contact Information */}
          <SectionCard padding={18} icon="chatbubbles" title={t('terms.sections.contact.title')} isRTL={isRTL}>
            <Paragraph>{t('terms.sections.contact.p1')}</Paragraph>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactItem, isRTL && styles.textRTL]}>
                {t('terms.contact.emailLabel')}: {t('contact.emailValue')}
              </Text>
              <Text style={[styles.contactItem, isRTL && styles.textRTL]}>
                {t('terms.contact.whatsappLabel')}: {t('contact.phoneDisplay')}
              </Text>
              <Text style={[styles.contactItem, styles.contactItemLast, isRTL && styles.textRTL]}>
                {t('terms.contact.addressLabel')}: {t('contact.locationValue')}
              </Text>
            </View>
          </SectionCard>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Last updated pill
  updatePillWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  updatePillWrapRTL: { alignItems: 'flex-end' },
  updatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  updatePillText: { ...T.captionSmall, color: colors.secondaryLabel, fontWeight: '500' },

  // Cards
  rowRTL: { flexDirection: 'row-reverse' },

  paragraph: { ...T.body, color: colors.bodyText, marginBottom: 12, lineHeight: 23 },
  paragraphLast: { marginBottom: 0 },

  // Bullets
  bulletList: { marginTop: 4, gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.cta,
    marginTop: 8,
  },
  bulletText: { ...T.bodySmall, color: colors.bodyText, flex: 1, lineHeight: 22 },

  // Contact info
  contactInfo: {
    backgroundColor: colors.subtleBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  contactItem: { ...T.bodySmall, color: colors.accent, fontWeight: '600', marginBottom: 8 },
  contactItemLast: { marginBottom: 0 },

  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
