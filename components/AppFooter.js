import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import * as haptics from '../utils/haptics';
import { useLocalization } from '../contexts/LocalizationContext';
import { colors, surfaces } from '../utils/theme';

/**
 * Shared app footer — single source of truth for the brand block shown
 * at the bottom of Account, About, Brand, Training and similar screens.
 *
 * A quiet card at the foot of the page, not an inverted slab: the wordmark in
 * ink, the links in rose, the legal line in grey. It used to be black to match
 * the Partner Portal block on Account, and that block is a light card now.
 *
 * Layout:
 *   ┌────────────────────────────────┐
 *   │        G E N O S Y S           │
 *   │  Official Distributor in the UAE │
 *   │  ─────────── divider ────────── │
 *   │   🌐 genosys.ae   ✉ sales@…    │
 *   │ © 2026 Genosys Middle East FZ-LLC │
 *   │      All rights reserved · v…  │
 *   └────────────────────────────────┘
 */
export default function AppFooter({ tagline, showVersion = true, style }) {
  const { locale } = useLocalization();

  const defaultTagline =
    locale === 'ar'
      ? 'الموزع الرسمي في الإمارات'
      : locale === 'ru'
      ? 'Официальный дистрибьютор в ОАЭ'
      : 'Official Distributor in the UAE';

  const rightsText =
    locale === 'ar'
      ? 'جميع الحقوق محفوظة'
      : locale === 'ru'
      ? 'Все права защищены'
      : 'All rights reserved';

  const version = Constants.expoConfig?.version;
  const year = new Date().getFullYear();
  const legalParts = [rightsText];
  if (showVersion && version) legalParts.push(`v${version}`);

  const open = (url) => {
    haptics.lightTap();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.card}>
        <Text style={styles.wordmark}>GENOSYS</Text>
        <Text style={styles.tagline}>{tagline || defaultTagline}</Text>

        <View style={styles.divider} />

        <View style={styles.linksRow}>
          <TouchableOpacity
            onPress={() => open('https://www.genosys.ae')}
            activeOpacity={0.7}
            style={styles.linkItem}
            accessibilityRole="link"
            accessibilityLabel="www.genosys.ae"
          >
            <Ionicons name="globe-outline" size={13} color={colors.accent} />
            <Text style={styles.linkText}>genosys.ae</Text>
          </TouchableOpacity>
          <View style={styles.linkSeparator} />
          <TouchableOpacity
            onPress={() => open('mailto:sales@genosys.ae')}
            activeOpacity={0.7}
            style={styles.linkItem}
            accessibilityRole="link"
            accessibilityLabel="sales@genosys.ae"
          >
            <Ionicons name="mail-outline" size={13} color={colors.accent} />
            <Text style={styles.linkText}>sales@genosys.ae</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>© {year} Genosys Middle East FZ-LLC</Text>
        <Text style={styles.legalSub}>{legalParts.join('  ·  ')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  card: {
    ...surfaces.card,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 5,
    color: colors.label,
  },
  tagline: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 5,
    textAlign: 'center',
  },
  divider: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginVertical: 14,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  linkSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 14,
    backgroundColor: colors.separatorStrong,
    marginHorizontal: 10,
  },
  legal: {
    fontSize: 10.5,
    color: colors.mutedText,
    marginTop: 14,
    textAlign: 'center',
  },
  legalSub: {
    fontSize: 10,
    color: colors.placeholder,
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
