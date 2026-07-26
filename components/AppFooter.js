import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as haptics from '../utils/haptics';
import { useLocalization } from '../contexts/LocalizationContext';

/**
 * Shared app footer — single source of truth for the brand block shown
 * at the bottom of Account, About, Brand, Training and similar screens.
 *
 * Corporate dark card with a luxury gold shimmer (same pattern as the
 * website certificate: sliding transparent→gold→transparent band) plus
 * a soft gold edge glow. Animation respects Reduce Motion.
 */

const GOLD = '#D4AF37';
const GOLD_SOFT = '#F9E79F';
const GOLD_DEEP = '#B8860B';

function GoldShimmerSweep({ width, height, active }) {
  const translateX = useSharedValue(-(width || 120));

  useEffect(() => {
    if (!active || !width || !height) {
      cancelAnimation(translateX);
      return undefined;
    }

    const band = Math.max(width * 0.45, 90);
    translateX.value = -band;
    translateX.value = withRepeat(
      withSequence(
        withTiming(width + band, {
          duration: 2200,
          easing: Easing.inOut(Easing.cubic),
        }),
        withDelay(2800, withTiming(-band, { duration: 0 })),
      ),
      -1,
      false,
    );

    return () => cancelAnimation(translateX);
  }, [active, width, height, translateX]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { skewX: '-18deg' },
    ],
  }));

  if (!width || !height) return null;

  const bandW = Math.max(width * 0.45, 90);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { overflow: 'hidden', borderRadius: 16 },
      ]}
    >
      <Animated.View style={[{ width: bandW, height: '100%' }, style]}>
        <Svg width={bandW} height={height}>
          <Defs>
            <LinearGradient id="goldShimmer" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={GOLD} stopOpacity="0" />
              <Stop offset="0.45" stopColor={GOLD_SOFT} stopOpacity="0.28" />
              <Stop offset="0.55" stopColor={GOLD} stopOpacity="0.22" />
              <Stop offset="1" stopColor={GOLD} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={bandW} height={height} fill="url(#goldShimmer)" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

function GoldTopEdge({ active, width }) {
  const opacity = useSharedValue(0.55);
  const edgeW = Math.max((width || 0) - 24, 0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(opacity);
      opacity.value = 0.55;
      return undefined;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.45, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [active, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!edgeW) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.topEdge, style]}>
      <Svg width={edgeW} height={3}>
        <Defs>
          <LinearGradient id="goldEdge" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={GOLD_DEEP} stopOpacity="0" />
            <Stop offset="0.2" stopColor={GOLD} stopOpacity="0.9" />
            <Stop offset="0.5" stopColor={GOLD_SOFT} stopOpacity="1" />
            <Stop offset="0.8" stopColor={GOLD} stopOpacity="0.9" />
            <Stop offset="1" stopColor={GOLD_DEEP} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={edgeW} height={3} fill="url(#goldEdge)" />
      </Svg>
    </Animated.View>
  );
}

export default function AppFooter({ tagline, showVersion = true, style }) {
  const { locale } = useLocalization();
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setMotionOk(!enabled);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled) => setMotionOk(!enabled),
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

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
      <View
        style={styles.glow}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width !== cardSize.width || height !== cardSize.height) {
            setCardSize({ width, height });
          }
        }}
      >
        <View style={styles.card}>
          <GoldTopEdge active={motionOk} width={cardSize.width} />
          <GoldShimmerSweep
            width={cardSize.width}
            height={cardSize.height}
            active={motionOk}
          />

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  glow: {
    borderRadius: 18,
    // Soft gold outer glow (iOS shadowColor supports gold tint)
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
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
    left: 12,
    right: 12,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    overflow: 'hidden',
  },
  wordmark: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 5,
    color: GOLD_SOFT,
    textShadowColor: 'rgba(212, 175, 55, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
