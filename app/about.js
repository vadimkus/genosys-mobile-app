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
import AppFooter from '../components/AppFooter';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow, surfaces } from '../utils/theme';
import SectionHeader from '../components/SectionHeader';

export default function AboutScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight, translateY: headerTranslateY } = useCollapsibleHeader({ hideOnScroll: true });

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

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
      <CollapsibleHeader translateY={headerTranslateY} title={t('about.title')} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

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
              <Ionicons name="heart" size={14} color={colors.accent} />
            </View>
          </View>

          {/* About Us */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="information-circle" title={t('about.aboutUsTitle')} isRTL={isRTL} />
            <Text style={[styles.paragraph, isRTL && styles.textRTL]}>{t('about.aboutUsLine1')}</Text>
            <Text style={[styles.paragraph, styles.paragraphLast, isRTL && styles.textRTL]}>{t('about.aboutUsLine2')}</Text>
          </View>

          {/* Mission */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="flag" title={t('about.missionTitle')} isRTL={isRTL} />
            <Text style={[styles.paragraph, styles.paragraphLast, isRTL && styles.textRTL]}>{t('about.missionText')}</Text>
          </View>

          {/* Company Details */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="business" title={t('about.companyDetailsTitle')} isRTL={isRTL} />
            <InfoRow label={t('about.companyLabel')} value={t('about.companyName')} />
            <InfoRow label={t('about.yearLabel')} value={t('about.yearValue')} />
            <InfoRow label={t('about.licenseLabel')} value={t('about.licenseValue')} />
            <InfoRow label={t('about.trnLabel')} value={t('about.trnValue')} />
            <InfoRow label={t('about.mainOfficeLabel')} value={t('about.mainOfficeValue')} />
            <InfoRow label={t('about.dubaiOfficeLabel')} value={t('about.dubaiOfficeValue')} isLast />
          </View>

          {/* Business Info */}
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <SectionHeader icon="briefcase" title={t('about.businessInfoTitle')} isRTL={isRTL} />
            <InfoRow label={t('about.distributorLabel')} value={t('about.distributorValue')} />
            <InfoRow label={t('about.certificationLabel')} value={t('about.certificationValue')} />
            <InfoRow label={t('about.productsLabel')} value={t('about.productsValue')} />
            <InfoRow label={t('about.areaLabel')} value={t('about.areaValue')} isLast />
          </View>

          {/* Footer — shared brand block */}
          <AppFooter style={{ paddingBottom: 16 }} />
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

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
});
