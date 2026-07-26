import React from 'react';
import {
  View,
  Text,
  Pressable,
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
 * Luxury treatment mirrors the website gift certificate:
 *   - full gold frame (outer rim + inset hairline)
 *   - static gold gradient top bar (#d4af37 → #f9e79f)
 *   - corner ornaments
 *   - white wordmark, gold accents on interactive links
 *
 * No continuous Reanimated loops (those froze Account scroll in prod).
 * Card is pressable → genosys.ae with haptic; links keep their own targets.
 */

const GOLD = '#D4AF37';
const GOLD_SOFT = '#F9E79F';
const GOLD_DEEP = '#B8860B';
const CARD_BG = '#2F3134';

/** Static gold bar — View segments only (no SVG %, no animation). */
function GoldTopBar() {
  return (
    <View style={styles.topBar} pointerEvents="none">
      <View style={[styles.topBarSeg, { flex: 1, backgroundColor: GOLD_DEEP, opacity: 0.55 }]} />
      <View style={[styles.topBarSeg, { flex: 2, backgroundColor: GOLD }]} />
      <View style={[styles.topBarSeg, { flex: 3, backgroundColor: GOLD_SOFT }]} />
      <View style={[styles.topBarSeg, { flex: 2, backgroundColor: GOLD }]} />
      <View style={[styles.topBarSeg, { flex: 1, backgroundColor: GOLD_DEEP, opacity: 0.55 }]} />
    </View>
  );
}

function Corner({ style }) {
  return <View style={[styles.corner, style]} pointerEvents="none" />;
}

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
    haptics.mediumTap();
    Linking.openURL(url).catch(() => {});
  };

  const openSite = () => open('https://www.genosys.ae');

  return (
    <View style={[styles.wrap, style]}>
      {/* Outer gold rim — full continuous frame */}
      <View style={styles.goldRim}>
        <Pressable
          onPress={openSite}
          accessibilityRole="link"
          accessibilityLabel="GENOSYS — www.genosys.ae"
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          {/* Inset gold hairline for double-frame depth */}
          <View style={styles.insetFrame} pointerEvents="none" />

          <GoldTopBar />

          <Corner style={styles.cornerTL} />
          <Corner style={styles.cornerTR} />
          <Corner style={styles.cornerBL} />
          <Corner style={styles.cornerBR} />

          <Text style={styles.wordmark}>GENOSYS</Text>
          <Text style={styles.tagline}>{tagline || defaultTagline}</Text>

          <View style={styles.dividerRow} pointerEvents="none">
            <View style={styles.dividerArm} />
            <View style={styles.dividerJewel} />
            <View style={styles.dividerArm} />
          </View>

          <View style={styles.linksRow}>
            <TouchableOpacity
              onPress={() => open('https://www.genosys.ae')}
              activeOpacity={0.7}
              style={styles.linkItem}
              accessibilityRole="link"
              accessibilityLabel="www.genosys.ae"
            >
              <Ionicons name="globe-outline" size={13} color={GOLD_SOFT} />
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
              <Ionicons name="mail-outline" size={13} color={GOLD_SOFT} />
              <Text style={styles.linkText}>sales@genosys.ae</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>© {year} Genosys Middle East FZ-LLC</Text>
          <Text style={styles.legalSub}>{legalParts.join('  ·  ')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const CORNER = 14;

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  goldRim: {
    borderRadius: 18,
    padding: 1.5,
    // Solid multi-tone rim via layered look (deep gold base)
    backgroundColor: GOLD,
    // Soft outer gold glow — static shadow only, no animation
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16.5,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  insetFrame: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16.5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(249, 231, 159, 0.35)',
    margin: 5,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  topBarSeg: {
    height: 3,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: 'rgba(212, 175, 55, 0.55)',
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomRightRadius: 4,
  },
  wordmark: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 5,
    color: '#FFFFFF',
    marginTop: 4,
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(249, 231, 159, 0.72)',
    marginTop: 5,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginVertical: 14,
    paddingHorizontal: 8,
    gap: 8,
  },
  dividerArm: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
  },
  dividerJewel: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
    opacity: 0.85,
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
    color: GOLD_SOFT,
  },
  linkSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.45)',
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
