/**
 * Contact Screen - Standalone (accessed from hamburger menu)
 * Contact page (opened from the Profile → Information section).
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
import { openWhatsApp, callSupport } from '../utils/support';
import PageHero from '../components/PageHero';

export default function ContactScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { onScroll, headerHeight, translateY: headerTranslateY } = useCollapsibleHeader({ hideOnScroll: true });
  const PHONE_DISPLAY = t('contact.phoneDisplay');
  const EMAIL = 'sales@genosys.ae';
  const WEBSITE = 'https://genosys.ae';
  const INSTAGRAM = 'https://instagram.com/genosys.uae';
  const FACEBOOK = 'https://facebook.com/genosys.ae';
  const MAP_URL = 'https://maps.google.com/?q=' + encodeURIComponent('Cordoba Residence, E02, Dubai, UAE');

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const contactMethods = [
    {
      id: 'whatsapp',
      title: t('contact.methodWhatsappTitle'),
      value: PHONE_DISPLAY,
      icon: 'logo-whatsapp',
      tileColor: colors.whatsappDeep,
      description: t('contact.methodWhatsappDesc'),
      action: () => openWhatsApp(),
    },
    {
      id: 'phone',
      title: t('contact.methodPhoneTitle'),
      value: PHONE_DISPLAY,
      icon: 'call',
      tileColor: colors.accent,
      description: t('contact.methodPhoneDesc'),
      action: () => callSupport(),
    },
    {
      id: 'email',
      title: t('contact.methodEmailTitle'),
      value: EMAIL,
      icon: 'mail',
      tileColor: colors.accent,
      description: t('contact.methodEmailDesc'),
      action: () => Linking.openURL(`mailto:${EMAIL}`).catch(() => {}),
    },
    {
      id: 'website',
      title: t('contact.methodWebsiteTitle'),
      value: 'genosys.ae',
      icon: 'globe',
      tileColor: colors.accent,
      description: t('contact.methodWebsiteDesc'),
      action: () => Linking.openURL(WEBSITE).catch(() => {}),
    },
    {
      id: 'instagram',
      title: t('contact.methodInstagramTitle'),
      value: '@genosys.uae',
      icon: 'logo-instagram',
      tileColor: colors.accent,
      description: t('contact.methodInstagramDesc'),
      action: () => Linking.openURL(INSTAGRAM).catch(() => {}),
    },
    {
      id: 'facebook',
      title: t('contact.methodFacebookTitle'),
      value: 'genosys.ae',
      icon: 'logo-facebook',
      tileColor: colors.accent,
      description: t('contact.methodFacebookDesc'),
      action: () => Linking.openURL(FACEBOOK).catch(() => {}),
    },
    {
      id: 'location',
      title: t('contact.methodVisitTitle'),
      value: t('contact.locationValue'),
      icon: 'location',
      tileColor: colors.accent,
      description: t('contact.methodVisitDesc'),
      action: () => Linking.openURL(MAP_URL).catch(() => {}),
    },
  ];

  const ContactMethodRow = ({ method, showDivider }) => (
    <View>
      {showDivider ? <View style={styles.hairline} /> : null}
      <TouchableOpacity
        style={[styles.row, isRTL && styles.rowRTL]}
        onPress={() => { haptics.lightTap(); method.action(); }}
        activeOpacity={0.6}
      >
        <View style={[surfaces.iconTile, { backgroundColor: method.tileColor }]}>
          <Ionicons name={method.icon} size={17} color={colors.white} />
        </View>
        <View style={styles.rowMiddle}>
          <Text style={[styles.rowTitle, isRTL && styles.textRTL]}>{method.title}</Text>
          <Text style={[styles.rowValue, isRTL ? styles.valueLTRRight : styles.valueLTR]} numberOfLines={1}>{method.value}</Text>
          <Text style={[styles.rowDesc, isRTL && styles.textRTL]} numberOfLines={2}>{method.description}</Text>
        </View>
        <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.tertiary} />
      </TouchableOpacity>
    </View>
  );

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader translateY={headerTranslateY} title={t('contact.title')} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: (insets?.bottom || 0) + 24 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Hero Section */}
          <PageHero
            title={t('contact.companyName')}
            subtitle={t('contact.country')}
            isRTL={isRTL}
          />

          {/* Contact Methods */}
          <Text style={[styles.groupHeader, isRTL && styles.textRTL]}>{t('contact.contactMethods')}</Text>
          <View style={[styles.card, shadow.card]}>
            {contactMethods.map((method, index) => (
              <ContactMethodRow key={`${method.id}-${index}`} method={method} showDivider={index > 0} />
            ))}
          </View>

          {/* Official Distributor in the UAE */}
          <Text style={[styles.groupHeader, isRTL && styles.textRTL]}>{t('contact.officialDistributorTitle')}</Text>
          <View style={[styles.card, styles.cardPad, shadow.card]}>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>{t('contact.officialDistributorLine1')}</Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>{t('contact.officialDistributorLine2')}</Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL, { marginTop: 4 }]}>
              <Ionicons name="document-text" size={18} color={colors.secondaryLabel} />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>
                {t('contact.licenseLabel')} {t('contact.licenseValue')}
              </Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL]}>
              <Ionicons name="document-text" size={18} color={colors.secondaryLabel} />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>
                {t('contact.companyLicenseLabel')} {t('contact.companyLicenseValue')}
              </Text>
            </View>
            <View style={[styles.distributorRow, isRTL && styles.rowRTL, styles.distributorRowLast]}>
              <Ionicons name="document-text" size={18} color={colors.secondaryLabel} />
              <Text style={[styles.distributorText, isRTL && styles.textRTL]}>
                {t('contact.trnLabel')} {t('contact.trnValue')}
              </Text>
            </View>
          </View>

          {/* Footer - shared brand block */}
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

  // Group header
  groupHeader: {
    ...T.eyebrow,
    marginHorizontal: 32,
    marginTop: 8,
    marginBottom: 8,
  },

  // Cards / rows
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    paddingHorizontal: 14,
  },
  cardPad: { paddingVertical: 14 },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  rowMiddle: { flex: 1, minWidth: 0 },
  rowTitle: { ...T.label, fontSize: 15, color: colors.label },
  rowValue: { ...T.captionSmall, color: colors.accent, fontWeight: '600', marginTop: 2 },
  rowDesc: { ...T.captionSmall, color: colors.secondaryLabel, marginTop: 2 },

  // Distributor
  distributorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  distributorRowLast: { marginBottom: 0 },
  distributorText: { ...T.bodySmall, color: colors.label, flex: 1, lineHeight: 21 },

  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  valueLTR: { writingDirection: 'ltr', textAlign: 'left' },
  valueLTRRight: { writingDirection: 'ltr', textAlign: 'right' },
});
