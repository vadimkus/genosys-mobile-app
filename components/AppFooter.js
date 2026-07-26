import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import * as haptics from '../utils/haptics';
import { useLocalization } from '../contexts/LocalizationContext';

/**
 * Shared app footer — brand block for Account / About / Brand / Training.
 *
 * Static luxury gold treatment (border + top edge + tinted type).
 * Continuous Reanimated/SVG shimmer was removed after production freeze
 * on Account scroll (OTA hotfix 2026-07-26).
 */

const GOLD = '#D4AF37';
const GOLD_SOFT = '#F9E79F';

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
        <View style={styles.topEdge} pointerEvents="none" />

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
            <Ionicons name="globe-outline" size={13} color="rgba(249,231,159,0.9)" />
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
            <Ionicons name="mail-outline" size={13} color="rgba(249,231,159,0.9)" />
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
    backgroundColor: '#2F3134',
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: GOLD,
    opacity: 0.85,
  },
  wordmark: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 5,
    color: GOLD_SOFT,
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(249, 231, 159, 0.65)',
    marginTop: 5,
    textAlign: 'center',
  },
  divider: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(212, 175, 55, 0.28)',
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
    color: 'rgba(249, 231, 159, 0.9)',
  },
  linkSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.35)',
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
