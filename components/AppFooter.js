import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors } from '../utils/theme';
import { useLocalization } from '../contexts/LocalizationContext';

/**
 * Shared app footer — single source of truth for the brand block shown
 * at the bottom of Account, About, Brand, Training and similar screens.
 *
 * Layout (all centered, consistent vertical rhythm):
 *   ── hairline divider ──
 *   G E N O S Y S            (spaced wordmark)
 *   Official Distributor in the UAE
 *   www.genosys.ae           (tappable, brand red)
 *   © 2026 GENOSYS · All rights reserved · v1.10.5
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
  const metaParts = [`© ${year} GENOSYS`, rightsText];
  if (showVersion && version) metaParts.push(`v${version}`);

  return (
    <View style={[styles.footer, style]}>
      <View style={styles.divider} />
      <Text style={styles.wordmark}>GENOSYS</Text>
      <Text style={styles.tagline}>{tagline || defaultTagline}</Text>
      <TouchableOpacity
        onPress={() => {
          haptics.lightTap();
          Linking.openURL('https://www.genosys.ae').catch(() => {});
        }}
        activeOpacity={0.7}
        style={styles.linkWrap}
        accessibilityRole="link"
        accessibilityLabel="www.genosys.ae"
      >
        <Text style={styles.link}>www.genosys.ae</Text>
      </TouchableOpacity>
      <Text style={styles.meta}>{metaParts.join('  ·  ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  divider: {
    width: 40,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginBottom: 20,
  },
  wordmark: {
    ...T.captionSmall,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.secondaryLabel,
  },
  tagline: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 6,
    textAlign: 'center',
  },
  linkWrap: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  link: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.brand,
  },
  meta: {
    ...T.captionTiny,
    color: '#AEAEB2', // systemGray2 — legible but subdued on grouped background
    marginTop: 12,
    textAlign: 'center',
  },
});
