import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../../contexts/LocalizationContext';
import * as haptics from '../../utils/haptics';

export default function TermsScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const lastUpdated = t('terms.lastUpdatedDate');

  const sections = [
    {
      key: 'agreement',
      title: t('terms.sections.agreement.title'),
      paragraphs: [t('terms.sections.agreement.p1')],
    },
    {
      key: 'useLicense',
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
      title: t('terms.sections.returns.title'),
      paragraphs: [t('terms.sections.returns.p1')],
    },
    {
      key: 'privacy',
      title: t('terms.sections.privacy.title'),
      paragraphs: [t('terms.sections.privacy.p1')],
    },
    {
      key: 'prohibited',
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
      title: t('terms.sections.disclaimers.title'),
      paragraphs: [
        t('terms.sections.disclaimers.p1'),
        t('terms.sections.disclaimers.p2'),
      ],
    },
    {
      key: 'limitations',
      title: t('terms.sections.limitations.title'),
      paragraphs: [t('terms.sections.limitations.p1')],
    },
    {
      key: 'governingLaw',
      title: t('terms.sections.governingLaw.title'),
      paragraphs: [t('terms.sections.governingLaw.p1')],
    },
    {
      key: 'changes',
      title: t('terms.sections.changes.title'),
      paragraphs: [t('terms.sections.changes.p1')],
    },
  ];

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
      {children}
    </View>
  );

  const Paragraph = ({ children }) => (
    <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{children}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); }} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('terms.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.updateInfo}>
          <Text style={[styles.updateText, isRTL && styles.updateTextRTL]}>{t('terms.lastUpdated', { date: lastUpdated })}</Text>
        </View>

        {sections.map((s) => (
          <Section key={s.key} title={s.title}>
            {Array.isArray(s.paragraphs) &&
              s.paragraphs.map((p, idx) => <Paragraph key={`${s.key}-p-${idx}`}>{p}</Paragraph>)}
            {Array.isArray(s.bullets) && s.bullets.length > 0 && (
              <View style={styles.bulletList}>
                {s.bullets.map((b, idx) => (
                  <Text key={`${s.key}-b-${idx}`} style={[styles.bulletPoint, isRTL && styles.textRTL]}>
                    {isRTL ? `${b} •` : `• ${b}`}
                  </Text>
                ))}
              </View>
            )}
          </Section>
        ))}

        {/* Contact Information */}
        <Section title={t('terms.sections.contact.title')}>
          <Paragraph>{t('terms.sections.contact.p1')}</Paragraph>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactItem, isRTL && styles.textRTL]}>
              {t('terms.contact.emailLabel')}: {t('contact.emailValue')}
            </Text>
            <Text style={[styles.contactItem, isRTL && styles.textRTL]}>
              {t('terms.contact.whatsappLabel')}: {t('contact.phoneDisplay')}
            </Text>
            <Text style={[styles.contactItem, isRTL && styles.textRTL]}>
              {t('terms.contact.addressLabel')}: {t('contact.locationValue')}
            </Text>
          </View>
        </Section>

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backButton: {
    padding: 4,
    width: 130,
  },
  backButtonRTL: { alignItems: 'flex-end' },
  backButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backButtonContentRTL: { flexDirection: 'row-reverse' },
  backText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
  backTextRTL: { textAlign: 'right', writingDirection: 'rtl' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: { width: 130 },
  scrollView: {
    flex: 1,
  },

  // Update Info
  updateInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  updateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  updateTextRTL: {
    writingDirection: 'rtl',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  paragraph: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 12,
  },

  // Lists
  bulletList: {
    marginVertical: 8,
    marginStart: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 4,
  },

  // Contact Info
  contactInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  contactItem: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 4,
  },
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },

  // Footer
  footerSpace: {
    height: 40,
  },
});
