/**
 * ConcernFaceMap — "Tap where it bothers you" (native version).
 *
 * Living-diagnostic face map for the Skin Concerns screen, styled after
 * AI skin-analysis scanners (Revieve / YouCam aesthetic):
 *
 *  1. Scan sweep — a soft light band with a red "laser" edge sweeps down the
 *     face once on mount; each hotspot pops in as the line passes it.
 *  2. Breathing dots — frosted-glass dots pulse with per-dot phase offsets
 *     so the face feels alive instead of blinking in unison.
 *  3. Target reticle — the active dot grows a slowly rotating dashed focus
 *     ring (clinical HUD) with a leader line up to the zone label chip.
 *  4. Quick chips — a chip cloud below gives one-tap access to all concerns
 *     (replaces the old duplicated card grid).
 *
 * Mirrors the web component (components/products/ConcernFaceMap.tsx) — same
 * image, zones and copy. Built with RN Animated + react-native-svg only.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Line, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { colors, shadow } from '../utils/theme';

const FACE_IMAGE = 'https://genosys.ae/images/face-map/face-front.jpg';

// Hotspot centers in % of the 4:5 image (identical to the web face map)
const ZONES = [
  { id: 'scalp', cx: 50, cy: 11, concerns: ['hair-loss'], label: { en: 'Scalp & hairline', ar: 'فروة الرأس وخط الشعر', ru: 'Кожа головы и линия роста волос' } },
  { id: 'forehead', cx: 50, cy: 30, concerns: ['anti-aging', 'sun-protection'], label: { en: 'Forehead', ar: 'الجبهة', ru: 'Лоб' } },
  { id: 'eyes', cx: 71, cy: 47, concerns: ['anti-aging'], label: { en: 'Eye contour', ar: 'محيط العين', ru: 'Контур глаз' } },
  { id: 'cheek-left', cx: 26, cy: 62, concerns: ['pigmentation'], label: { en: 'Cheek — spots', ar: 'الخد — تصبغات', ru: 'Щека — пигментация' } },
  { id: 'nose', cx: 50, cy: 58, concerns: ['acne-treatment'], label: { en: 'Nose & T-zone', ar: 'الأنف والمنطقة T', ru: 'Нос и Т-зона' } },
  { id: 'cheek-right', cx: 74, cy: 62, concerns: ['sensitivity'], label: { en: 'Cheek — redness', ar: 'الخد — احمرار', ru: 'Щека — покраснение' } },
  { id: 'mouth', cx: 50, cy: 78, concerns: ['hydration'], label: { en: 'Lips & smile lines', ar: 'الشفاه وخطوط الابتسامة', ru: 'Губы и носогубные линии' } },
  { id: 'chin', cx: 50, cy: 90, concerns: ['scars-treatment', 'acne-treatment'], label: { en: 'Chin & jawline', ar: 'الذقن وخط الفك', ru: 'Подбородок и линия челюсти' } },
];

const COPY = {
  kicker: { en: 'INTERACTIVE SKIN MAP', ar: 'خريطة البشرة التفاعلية', ru: 'ИНТЕРАКТИВНАЯ КАРТА КОЖИ' },
  title: { en: 'Tap where it bothers you', ar: 'اضغطي على المنطقة التي تزعجك', ru: 'Нажмите на зону, которая вас беспокоит' },
  hint: { en: 'Tap a point on the face', ar: 'اضغطي على نقطة على الوجه', ru: 'Нажмите на точку на лице' },
  zoneLabel: { en: 'Selected zone', ar: 'المنطقة المحددة', ru: 'Выбранная зона' },
  explore: { en: 'Explore protocol', ar: 'اكتشفي البروتوكول', ru: 'Смотреть протокол' },
  allConcerns: { en: 'All concerns', ar: 'جميع المشاكل', ru: 'Все проблемы' },
};

const SCAN_DURATION = 1700;
const SCAN_BAND = 110;
const RETICLE_SIZE = 44;

export default function ConcernFaceMap({ concerns, locale, isRTL, onSelectConcern }) {
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [cardHeight, setCardHeight] = useState(0);

  // ── Scan sweep (runs once on mount) ─────────────────────────────────
  const scan = useRef(new Animated.Value(0)).current;
  const scanStarted = useRef(false);

  // ── Per-dot reveal + breathing pulse values ─────────────────────────
  const reveals = useRef(ZONES.map(() => new Animated.Value(0))).current;
  const pulses = useRef(ZONES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (scanStarted.current) return;
    scanStarted.current = true;

    // Sweep the light band down the face once
    Animated.timing(scan, {
      toValue: 1,
      duration: SCAN_DURATION,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();

    const animations = [];

    ZONES.forEach((zone, i) => {
      // Dot pops in as the scan line passes its latitude
      const revealDelay = 180 + SCAN_DURATION * 0.85 * (zone.cy / 100);
      const reveal = Animated.sequence([
        Animated.delay(revealDelay),
        Animated.spring(reveals[i], { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
      ]);

      // Breathing pulse: one-time phase offset per dot, then a steady loop —
      // the offsets make the pulses travel across the face like a wave
      const pulse = Animated.sequence([
        Animated.delay(revealDelay + 400 + i * 300),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulses[i], { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(pulses[i], { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.delay(1400),
          ])
        ),
      ]);

      animations.push(reveal, pulse);
    });

    animations.forEach(a => a.start());
  }, [scan, reveals, pulses]);

  // ── Rotating reticle on the active dot ──────────────────────────────
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!activeZoneId) return;
    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [activeZoneId, spin]);

  const spinDeg = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const scanTranslate = scan.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCAN_BAND, Math.max(cardHeight, 1) + 8],
  });
  const scanOpacity = scan.interpolate({
    inputRange: [0, 0.06, 0.88, 1],
    outputRange: [0, 1, 1, 0],
  });

  const activeZone = useMemo(() => ZONES.find(z => z.id === activeZoneId) || null, [activeZoneId]);

  const activeConcerns = useMemo(() => {
    if (!activeZone) return [];
    return activeZone.concerns
      .map(slug => concerns.find(c => c.slug === slug))
      .filter(Boolean);
  }, [activeZone, concerns]);

  const handleZonePress = (zone) => {
    haptics.lightTap();
    setActiveZoneId(zone.id);
  };

  const loc = (obj) => obj[locale] || obj.en;

  return (
    <View style={styles.wrap}>
      {/* Header */}
      <Text style={styles.kicker}>{loc(COPY.kicker)}</Text>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{loc(COPY.title)}</Text>

      {/* Face with hotspots */}
      <View
        style={styles.faceCard}
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
      >
        <Image
          source={FACE_IMAGE}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />

        {/* Scan sweep — soft glow band with a red laser edge */}
        {cardHeight > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.scanBand,
              { opacity: scanOpacity, transform: [{ translateY: scanTranslate }] },
            ]}
          >
            <Svg width="100%" height={SCAN_BAND}>
              <Defs>
                <LinearGradient id="scanGlow" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.white} stopOpacity="0" />
                  <Stop offset="0.72" stopColor={colors.white} stopOpacity="0.34" />
                  <Stop offset="1" stopColor={colors.white} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height={SCAN_BAND - 4} fill="url(#scanGlow)" />
              <Rect x="0" y={SCAN_BAND - 26} width="100%" height="1.6" fill={colors.accent} opacity="0.8" />
            </Svg>
          </Animated.View>
        )}

        {ZONES.map((zone, i) => {
          const isActive = zone.id === activeZoneId;
          const revealScale = reveals[i].interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
          const pulseScale = pulses[i].interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
          const pulseOpacity = pulses[i].interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.5, 0.12, 0] });

          return (
            <TouchableOpacity
              key={zone.id}
              accessibilityRole="button"
              accessibilityLabel={loc(zone.label)}
              onPress={() => handleZonePress(zone)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.hotspot, { left: `${zone.cx}%`, top: `${zone.cy}%` }]}
            >
              <Animated.View style={[styles.dotStack, { opacity: reveals[i], transform: [{ scale: revealScale }] }]}>
                {/* Breathing halo */}
                {!isActive && (
                  <Animated.View
                    style={[styles.pulseRing, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]}
                  />
                )}

                {/* Rotating target reticle (active only) */}
                {isActive && (
                  <Animated.View style={[styles.reticle, { transform: [{ rotate: spinDeg }] }]}>
                    <Svg width={RETICLE_SIZE} height={RETICLE_SIZE} viewBox={`0 0 ${RETICLE_SIZE} ${RETICLE_SIZE}`}>
                      <Circle
                        cx={RETICLE_SIZE / 2}
                        cy={RETICLE_SIZE / 2}
                        r={RETICLE_SIZE / 2 - 5}
                        stroke={colors.accent}
                        strokeWidth="1.6"
                        strokeDasharray="7 8"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Crosshair ticks */}
                      <Line x1={RETICLE_SIZE / 2} y1="0" x2={RETICLE_SIZE / 2} y2="4.5" stroke={colors.accent} strokeWidth="1.8" strokeLinecap="round" />
                      <Line x1={RETICLE_SIZE / 2} y1={RETICLE_SIZE} x2={RETICLE_SIZE / 2} y2={RETICLE_SIZE - 4.5} stroke={colors.accent} strokeWidth="1.8" strokeLinecap="round" />
                      <Line x1="0" y1={RETICLE_SIZE / 2} x2="4.5" y2={RETICLE_SIZE / 2} stroke={colors.accent} strokeWidth="1.8" strokeLinecap="round" />
                      <Line x1={RETICLE_SIZE} y1={RETICLE_SIZE / 2} x2={RETICLE_SIZE - 4.5} y2={RETICLE_SIZE / 2} stroke={colors.accent} strokeWidth="1.8" strokeLinecap="round" />
                    </Svg>
                  </Animated.View>
                )}

                {/* Frosted glass dot */}
                <View style={[styles.dot, isActive && styles.dotActive]} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}

        {/* Zone label chip + leader line (medical callout style).
            Chips sit above the dot; near the top edge they flip below it. */}
        {activeZone && (() => {
          const flipBelow = activeZone.cy < 18;
          return (
            <View
              pointerEvents="none"
              style={[
                styles.chipWrap,
                { left: `${activeZone.cx}%`, top: `${activeZone.cy}%` },
                flipBelow ? styles.chipWrapBelow : styles.chipWrapAbove,
              ]}
            >
              {flipBelow && <View style={styles.leaderLine} />}
              <View style={styles.chip}>
                <View style={styles.chipDot} />
                <Text style={styles.chipText}>{loc(activeZone.label)}</Text>
              </View>
              {!flipBelow && <View style={styles.leaderLine} />}
            </View>
          );
        })()}
      </View>

      {/* Result area */}
      {activeConcerns.length > 0 ? (
        <View style={styles.results}>
          <Text style={[styles.zoneLabel, isRTL && styles.textRTL]}>
            {loc(COPY.zoneLabel)} — {loc(activeZone.label)}
          </Text>
          {activeConcerns.map((concern) => {
            const data = concern[locale] || concern.en;
            return (
              <TouchableOpacity
                key={concern.slug}
                style={styles.resultCard}
                onPress={() => onSelectConcern(concern)}
                activeOpacity={0.85}
              >
                <View style={[styles.resultRow, isRTL && styles.rowRTL]}>
                  <Text style={styles.resultIcon}>{concern.icon}</Text>
                  <View style={styles.resultBody}>
                    <Text style={[styles.resultTitle, isRTL && styles.textRTL]} numberOfLines={2}>{data.h1}</Text>
                    {data.heroShort ? (
                      <Text style={[styles.resultDesc, isRTL && styles.textRTL]} numberOfLines={2}>{data.heroShort}</Text>
                    ) : null}
                    <View style={[styles.exploreRow, isRTL && styles.rowRTL]}>
                      <Text style={styles.exploreText}>{loc(COPY.explore)}</Text>
                      <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={13} color={colors.accent} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.hintBox}>
          <Text style={styles.hintEmoji}>👆</Text>
          <Text style={[styles.hintText, isRTL && styles.textRTL]}>{loc(COPY.hint)}</Text>
        </View>
      )}

      {/* Quick chips — one-tap access to every concern */}
      <Text style={[styles.allConcernsLabel, isRTL && styles.textRTL]}>{loc(COPY.allConcerns)}</Text>
      <View style={[styles.chipsCloud, isRTL && styles.rowRTL]}>
        {concerns.map((concern) => {
          const label = concern.short ? loc(concern.short) : (concern[locale] || concern.en).h1;
          return (
            <TouchableOpacity
              key={concern.slug}
              style={styles.quickChip}
              onPress={() => { haptics.lightTap(); onSelectConcern(concern); }}
              activeOpacity={0.8}
            >
              <Text style={styles.quickChipIcon}>{concern.icon}</Text>
              <Text style={styles.quickChipText}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const DOT = 13;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 28,
  },
  kicker: {
    ...T.badge,
    color: colors.accent,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    ...T.sectionTitle,
    color: colors.label,
    textAlign: 'center',
    marginBottom: 16,
  },
  faceCard: {
    alignSelf: 'center',
    width: '86%',
    aspectRatio: 4 / 5,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.card,
    ...shadow.card,
  },
  scanBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCAN_BAND,
  },
  hotspot: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotStack: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: DOT + 8,
    height: DOT + 8,
    borderRadius: (DOT + 8) / 2,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  reticle: {
    position: 'absolute',
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: colors.shadowCast,
    shadowOpacity: 0.22,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  dotActive: {
    backgroundColor: colors.cta,
    borderColor: colors.white,
  },
  chipWrap: {
    position: 'absolute',
    width: 0,
    alignItems: 'center',
  },
  chipWrapAbove: {
    marginTop: -60,
  },
  chipWrapBelow: {
    marginTop: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17,17,19,0.85)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.cta,
  },
  chipText: {
    ...T.badge,
    color: colors.white,
  },
  leaderLine: {
    width: 1.5,
    height: 16,
    backgroundColor: 'rgba(17,17,19,0.55)',
  },
  results: {
    marginTop: 16,
    gap: 10,
  },
  zoneLabel: {
    ...T.badge,
    color: colors.secondaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    ...shadow.card,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  resultIcon: {
    fontSize: 26,
    marginTop: 2,
  },
  resultBody: {
    flex: 1,
  },
  resultTitle: {
    ...T.sectionTitleSmall,
    color: colors.label,
  },
  resultDesc: {
    ...T.caption,
    color: colors.secondaryLabel,
    marginTop: 3,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  exploreText: {
    ...T.badge,
    color: colors.accent,
  },
  hintBox: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  hintEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  hintText: {
    ...T.caption,
    color: colors.secondaryLabel,
  },
  allConcernsLabel: {
    ...T.badge,
    color: colors.secondaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 10,
  },
  chipsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    ...shadow.card,
  },
  quickChipIcon: {
    fontSize: 14,
  },
  quickChipText: {
    ...T.labelSmall,
    color: colors.label,
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
