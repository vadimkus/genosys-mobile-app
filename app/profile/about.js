import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useLocalization } from '../../contexts/LocalizationContext';
import AUTH_CONFIG from '../../config/auth';

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useLocalization();
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
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Text style={[styles.infoValue, styles.infoValueLink]}>{value}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: AUTH_CONFIG.LOGO_URL || `${AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae'}/images/prd_logo.png` }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>{t('about.companyName')}</Text>
          <Text style={styles.heroSubtitle}>{t('about.country')}</Text>
        </View>

        {/* About Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.aboutUsTitle')}</Text>
          <Text style={styles.paragraph}>{t('about.aboutUsLine1')}</Text>
          <Text style={styles.paragraph}>{t('about.aboutUsLine2')}</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.missionTitle')}</Text>
          <Text style={styles.paragraph}>{t('about.missionText')}</Text>
        </View>

        {/* Legal Information & Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.legalTitle')}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('about.companyDetailsTitle')}</Text>
            <InfoRow label={t('about.companyLabel')} value={t('about.companyName')} />
            <InfoRow label={t('about.yearLabel')} value={t('about.yearValue')} />
            <InfoRow label={t('about.licenseLabel')} value={t('about.licenseValue')} />
            <InfoRow label={t('about.trnLabel')} value={t('about.trnValue')} />
            <InfoRow label={t('about.mainOfficeLabel')} value={t('about.mainOfficeValue')} />
            <InfoRow label={t('about.dubaiOfficeLabel')} value={t('about.dubaiOfficeValue')} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('about.businessInfoTitle')}</Text>
            <InfoRow label={t('about.distributorLabel')} value={t('about.distributorValue')} />
            <InfoRow label={t('about.certificationLabel')} value={t('about.certificationValue')} />
            <InfoRow label={t('about.productsLabel')} value={t('about.productsValue')} />
            <InfoRow label={t('about.areaLabel')} value={t('about.areaValue')} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('about.footerCopyright')}</Text>
          <Text style={styles.footerSubtext}>{t('about.versionLabel', { version: appVersion })}</Text>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 32,
  },
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
  logoContainer: {
    width: 86,
    height: 86,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#1D1D1F',
    marginBottom: 8,
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
    paddingRight: 8,
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
});
