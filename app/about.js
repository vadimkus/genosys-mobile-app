/**
 * About Screen - Standalone (accessed from hamburger menu)
 * Same content as profile/about.js but with standard back arrow navigation
 * and footer with website link + copyright.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useLocalization } from '../contexts/LocalizationContext';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';

export default function AboutScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const appVersion = String(Constants?.expoConfig?.version || Constants?.manifest?.version || '1.0.0');

  const openUrl = async (url) => {
    const u = String(url || '').trim();
    if (!u) return;
    try {
      await Linking.openURL(u);
    } catch {
      // ignore
    }
  };

  const InfoRow = ({ label, value, onPress }) => (
    <View style={[styles.infoRow, isRTL && styles.infoRowRTL]}>
      <Text style={[styles.infoLabel, isRTL && styles.infoLabelRTL]}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={() => { haptics.lightTap(); onPress(); }} activeOpacity={0.7}>
          <Text style={[styles.infoValue, styles.infoValueLink, isRTL && styles.infoValueRTL]}>{value}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.infoValue, isRTL && styles.infoValueRTL]}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - generic back arrow */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => { haptics.lightTap(); router.back(); }} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('about.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../assets/splash-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{t('about.companyName')}</Text>
          <View style={[styles.countryRow, I18nManager.isRTL && styles.countryRowRtl]}>
            <Text style={styles.flagText}>🇦🇪</Text>
            <Text style={[styles.countryText, isRTL && styles.textRTL]}>{t('about.country')}</Text>
            <View>
              <Ionicons name="heart" size={14} color="#dc2626" />
            </View>
          </View>
        </View>

        {/* About Us */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{t('about.aboutUsTitle')}</Text>
          <Text style={[styles.paragraph, isRTL && styles.paragraphRTL]}>{t('about.aboutUsLine1')}</Text>
          <Text style={[styles.paragraph, isRTL && styles.paragraphRTL]}>{t('about.aboutUsLine2')}</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{t('about.missionTitle')}</Text>
          <Text style={[styles.paragraph, isRTL && styles.paragraphRTL]}>{t('about.missionText')}</Text>
        </View>

        {/* Legal Information & Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{t('about.legalTitle')}</Text>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.cardTitleRTL]}>{t('about.companyDetailsTitle')}</Text>
            <InfoRow label={t('about.companyLabel')} value={t('about.companyName')} />
            <InfoRow label={t('about.yearLabel')} value={t('about.yearValue')} />
            <InfoRow label={t('about.licenseLabel')} value={t('about.licenseValue')} />
            <InfoRow label={t('about.trnLabel')} value={t('about.trnValue')} />
            <InfoRow label={t('about.mainOfficeLabel')} value={t('about.mainOfficeValue')} />
            <InfoRow label={t('about.dubaiOfficeLabel')} value={t('about.dubaiOfficeValue')} />
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.cardTitleRTL]}>{t('about.businessInfoTitle')}</Text>
            <InfoRow label={t('about.distributorLabel')} value={t('about.distributorValue')} />
            <InfoRow label={t('about.certificationLabel')} value={t('about.certificationValue')} />
            <InfoRow label={t('about.productsLabel')} value={t('about.productsValue')} />
            <InfoRow label={t('about.areaLabel')} value={t('about.areaValue')} />
          </View>
        </View>

        {/* Footer with website link and copyright */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isRTL && styles.footerTextRTL]}>
            {locale === 'ar' ? 'جينوسيس الشرق الأوسط FZ-LLC' : locale === 'ru' ? 'GENOSYS Middle East FZ-LLC' : 'GENOSYS Middle East FZ-LLC'}
          </Text>
          <Text style={[styles.footerSub, isRTL && styles.footerSubRTL]}>
            {locale === 'ar' ? 'الموزع الرسمي في الإمارات' : locale === 'ru' ? 'Официальный дистрибьютор в ОАЭ' : 'Official Distributor in the UAE'}
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.genosys.ae')} activeOpacity={0.7} style={{ marginTop: 8 }}>
            <Text style={styles.footerLink}>www.genosys.ae</Text>
          </TouchableOpacity>
          <Text style={styles.footerCopyright}>© {new Date().getFullYear()} GENOSYS. All rights reserved.</Text>
          <Text style={[styles.footerVersion, isRTL && styles.footerVersionRTL]}>{t('about.versionLabel', { version: appVersion })}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  // Header - generic back arrow style
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { ...T.navTitle, flex: 1, color: '#1F2937', textAlign: 'center', marginHorizontal: 8 },
  headerSpacer: { width: 40 },

  scrollView: { flex: 1 },

  // Hero Section
  heroSection: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center', backgroundColor: '#ffffff' },
  logo: { width: 240, height: 72, marginBottom: 14 },
  heroTitle: { ...T.pageTitle, color: '#000000', textAlign: 'center', marginBottom: 8 },
  countryRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  countryRowRtl: { flexDirection: 'row-reverse' },
  flagText: { fontSize: 14 },
  countryText: { ...T.body, color: '#8E8E93', lineHeight: undefined },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionTitle: { ...T.sectionTitle, fontSize: 22, color: '#000000', marginBottom: 16, letterSpacing: -0.4 },
  paragraph: { ...T.body, color: '#1D1D1F', marginBottom: 12 },

  card: { backgroundColor: '#F2F2F7', borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTitle: { ...T.label, fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  infoLabel: { ...T.caption, fontWeight: '700', color: '#6B7280', width: '38%', paddingEnd: 8 },
  infoValue: { ...T.label, fontWeight: '700', color: '#111827', width: '62%', textAlign: 'right' },
  infoValueLink: { color: '#2563eb' },

  // Footer
  footer: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center', backgroundColor: '#F8F9FA' },
  footerText: { ...T.bodySmall, fontWeight: '600', color: '#6B7280', lineHeight: undefined },
  footerSub: { ...T.caption, color: '#9CA3AF', marginTop: 4 },
  footerLink: { ...T.link, color: '#dc2626' },
  footerCopyright: { ...T.captionSmall, color: '#C7C7CC', marginTop: 12 },
  footerVersion: { ...T.captionSmall, color: '#C7C7CC', marginTop: 6 },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  sectionTitleRTL: { textAlign: 'right', writingDirection: 'rtl' },
  paragraphRTL: { textAlign: 'right', writingDirection: 'rtl' },
  cardTitleRTL: { textAlign: 'right', writingDirection: 'rtl' },
  infoRowRTL: { flexDirection: 'row-reverse' },
  infoLabelRTL: { textAlign: 'right', writingDirection: 'rtl' },
  infoValueRTL: { textAlign: 'left' },
  footerTextRTL: { textAlign: 'center', writingDirection: 'rtl' },
  footerSubRTL: { textAlign: 'center', writingDirection: 'rtl' },
  footerVersionRTL: { textAlign: 'center' },
});
