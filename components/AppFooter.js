import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import * as haptics from '../utils/haptics';
import { colors } from '../utils/theme';
import { useLocalization } from '../contexts/LocalizationContext';

/**
 * Shared app footer — single source of truth for the brand block shown
 * at the bottom of Account, About, Brand, Training and similar screens.
 *
 * Corporate dark card:
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
            <Ionicons name="globe-outline" size={13} color="rgba(255,255,255,0.85)" />
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
            <Ionicons name="mail-outline" size={13} color="rgba(255,255,255,0.85)" />
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
    backgroundColor: '#1D1D1F',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 5,
    color: colors.white,
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 5,
    textAlign: 'center',
  },
  divider: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.14)',
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
    color: 'rgba(255,255,255,0.85)',
  },
  linkSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 10,
  },
  legal: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 14,
    textAlign: 'center',
  },
  legalSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
