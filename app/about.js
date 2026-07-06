/**
 * About Screen - Standalone (accessed from hamburger menu)
 * Company About page (opened from the Profile → Information section)
 * and footer with website link + copyright.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Linking,
  Image,
  I18nManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useLocalization } from '../contexts/LocalizationContext';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, surfaces } from '../utils/theme';

export default function AboutScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
  const appVersion = String(Constants?.expoConfig?.version || Constants?.manifest?.version || '1.0.0');

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const SectionHeader = ({ icon, tileColor, title }) => (
    <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
      <View style={[surfaces.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
    </View>
  );

  const InfoRow = ({ label, value, onPress, isLast }) => (
    <View style={[styles.infoRow, isRTL && styles.infoRowRTL, isLast && styles.infoRowLast]}>
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

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={t('about.title')} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 12 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image
              source={require('../assets/genosys-logo-gray.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.heroTitle, isRTL && styles.textRTLCenter]}>{t('about.companyName')}</Text>
            <View style={[styles.countryRow, I18nManager.isRTL && styles.countryRowRtl]}>
              <Text style={styles.flagText}>🇦🇪</Text>
              <Text style={[styles.countryText, isRTL && styles.textRTLCenter]}>{t('about.country')}</Text>
              <Ionicons name="heart" size={14} color={colors.brand} />
            </View>
          </View>

          {/* About Us */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="information-circle" tileColor={colors.blue} title={t('about.aboutUsTitle')} />
            <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{t('about.aboutUsLine1')}</Text>
            <Text style={[styles.paragraph, styles.paragraphLast, isRTL && styles.textRTL]}>{t('about.aboutUsLine2')}</Text>
          </View>

          {/* Mission */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="flag" tileColor={colors.brand} title={t('about.missionTitle')} />
            <Text style={[styles.paragraph, styles.paragraphLast, isRTL && styles.textRTL]}>{t('about.missionText')}</Text>
          </View>

          {/* Company Details */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="business" tileColor={colors.indigo} title={t('about.companyDetailsTitle')} />
            <InfoRow label={t('about.companyLabel')} value={t('about.companyName')} />
            <InfoRow label={t('about.yearLabel')} value={t('about.yearValue')} />
            <InfoRow label={t('about.licenseLabel')} value={t('about.licenseValue')} />
            <InfoRow label={t('about.trnLabel')} value={t('about.trnValue')} />
            <InfoRow label={t('about.mainOfficeLabel')} value={t('about.mainOfficeValue')} />
            <InfoRow label={t('about.dubaiOfficeLabel')} value={t('about.dubaiOfficeValue')} isLast />
          </View>

          {/* Business Info */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="briefcase" tileColor={colors.teal} title={t('about.businessInfoTitle')} />
            <InfoRow label={t('about.distributorLabel')} value={t('about.distributorValue')} />
            <InfoRow label={t('about.certificationLabel')} value={t('about.certificationValue')} />
            <InfoRow label={t('about.productsLabel')} value={t('about.productsValue')} />
            <InfoRow label={t('about.areaLabel')} value={t('about.areaValue')} isLast />
          </View>

          {/* Footer with website link and copyright */}
          <View style={styles.footer}>
            <Text style={[styles.footerBrand, isRTL && styles.textRTLCenter]}>GENOSYS</Text>
            <Text style={[styles.footerSub, isRTL && styles.textRTLCenter]}>
              {locale === 'ar' ? 'الموزع الرسمي في الإمارات' : locale === 'ru' ? 'Официальный дистрибьютор в ОАЭ' : 'Official Distributor in the UAE'}
            </Text>
            <TouchableOpacity onPress={() => { haptics.lightTap(); Linking.openURL('https://www.genosys.ae').catch(() => {}); }} activeOpacity={0.7} style={styles.footerLinkWrap}>
              <Text style={styles.footerLink}>www.genosys.ae</Text>
            </TouchableOpacity>
            <Text style={styles.footerCopyright}>© {new Date().getFullYear()} GENOSYS. All rights reserved.</Text>
            <Text style={[styles.footerVersion, isRTL && styles.textRTLCenter]}>{t('about.versionLabel', { version: appVersion })}</Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logo: { width: 240, height: 72, marginBottom: 14 },
  heroTitle: { ...T.pageTitle, textAlign: 'center', marginBottom: 8 },
  countryRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  countryRowRtl: { flexDirection: 'row-reverse' },
  flagText: { fontSize: 14 },
  countryText: { ...T.body, color: colors.secondaryLabel },

  // Cards
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  cardPad: { padding: 18 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  sectionTitle: { ...T.body, fontWeight: '700', color: colors.label },

  paragraph: { ...T.body, marginBottom: 12, lineHeight: 23 },
  paragraphLast: { marginBottom: 0 },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  infoRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  infoRowRTL: { flexDirection: 'row-reverse' },
  infoLabel: {
    ...T.labelSmall,
    fontWeight: '600',
    color: colors.secondaryLabel,
    width: '38%',
    paddingEnd: 8,
  },
  infoValue: {
    ...T.labelSmall,
    fontWeight: '600',
    color: colors.label,
    width: '62%',
    textAlign: 'right',
  },
  infoValueLink: { color: colors.blue },
  infoLabelRTL: { textAlign: 'right', writingDirection: 'rtl' },
  infoValueRTL: { textAlign: 'left' },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
  },
  footerBrand: { ...T.bodySmall, fontWeight: '700', color: colors.secondaryLabel, letterSpacing: 0.5 },
  footerSub: { ...T.caption, color: colors.tertiary, marginTop: 4, textAlign: 'center' },
  footerLinkWrap: { marginTop: 8 },
  footerLink: { ...T.link, color: colors.brand },
  footerCopyright: { ...T.captionSmall, color: colors.tertiary, marginTop: 12, textAlign: 'center' },
  footerVersion: { ...T.captionSmall, color: colors.tertiary, marginTop: 6, textAlign: 'center' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
});
