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
import { useLocalization } from '../../contexts/LocalizationContext';
import * as haptics from '../../utils/haptics';

export default function AboutScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
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
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => { haptics.lightTap(); router.replace('/profile'); }} style={[styles.backButton, isRTL && styles.backButtonRTL]}>
          <View style={[styles.backButtonContent, isRTL && styles.backButtonContentRTL]}>
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
            <Text style={[styles.backText, isRTL && styles.backTextRTL]} numberOfLines={1}>
              {t('profile.accountTitle')}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.headerTitleRTL]}>{t('about.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/splash-logo.png')}
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isRTL && styles.footerTextRTL]}>{t('about.footerCopyright')}</Text>
          <Text style={[styles.footerSubtext, isRTL && styles.footerSubtextRTL]}>{t('about.versionLabel', { version: appVersion })}</Text>
        </View>
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
  backButton: {
    padding: 4,
    width: 130,
  },
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

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 240,
    height: 72,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  countryRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  countryRowRtl: {
    flexDirection: 'row-reverse',
  },
  flagText: {
    fontSize: 14,
  },
  countryText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  versionText: {
    fontSize: 14,
    color: '#C7C7CC',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },

  paragraph: {
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    width: '38%',
    paddingEnd: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    width: '62%',
    textAlign: 'right',
  },
  infoValueLink: {
    color: '#2563eb',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 8,
  },

  // RTL Support Styles
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButtonRTL: {
    marginRight: 0,
    marginStart: 'auto',
  },
  // Keep RTL alignment consistent with the Account-style back button
  // (we still keep the existing layout mirroring for the header row).
  // Note: backButtonRTL here only affects container alignment; icon flip is handled in JSX.
  // backButtonContentRTL mirrors icon+text.
  headerTitleRTL: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  heroTitleRTL: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  heroSubtitleRTL: {
    textAlign: 'center',
  },
  sectionTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  paragraphRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoRowRTL: {
    flexDirection: 'row-reverse',
  },
  infoLabelRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValueRTL: {
    textAlign: 'left',
  },
  footerTextRTL: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  footerSubtextRTL: {
    textAlign: 'center',
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
