/**
 * ConcernFaceMap — "Tap where it bothers you" (native version).
 *
 * Interactive face map for the Skin Concerns screen: a studio portrait with
 * pulsing hotspots on facial zones. Tapping a zone reveals the matching
 * concern card(s) below with navigation to the concern-detail screen.
 *
 * Mirrors the web component (components/products/ConcernFaceMap.tsx) — same
 * image, zones and copy, rebuilt with RN Animated (no extra dependencies).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
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
};

export default function ConcernFaceMap({ concerns, locale, isRTL, onSelectConcern }) {
  const [activeZoneId, setActiveZoneId] = useState(null);

  // Shared pulse loop for all idle dots
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.55, 0.12, 0] });

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
      <View style={styles.faceCard}>
        <Image
          source={FACE_IMAGE}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
        {ZONES.map((zone) => {
          const isActive = zone.id === activeZoneId;
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
              <Animated.View
                style={[
                  styles.pulseRing,
                  isActive && styles.pulseRingActive,
                  { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
                ]}
              />
              <View style={[styles.dot, isActive && styles.dotActive]} />
            </TouchableOpacity>
          );
        })}

        {/* Zone label chip */}
        {activeZone && (
          <View
            pointerEvents="none"
            style={[
              styles.chipWrap,
              {
                left: `${Math.min(Math.max(activeZone.cx, 25), 75)}%`,
                top: `${activeZone.cy}%`,
              },
            ]}
          >
            <View style={styles.chip}>
              <Text style={styles.chipText}>{loc(activeZone.label)}</Text>
            </View>
          </View>
        )}
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
                      <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={13} color={colors.brand} />
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
    </View>
  );
}

const DOT = 15;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 28,
  },
  kicker: {
    ...T.badge,
    color: colors.brand,
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
  hotspot: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
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
  pulseRingActive: {
    backgroundColor: 'rgba(220,38,38,0.45)',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: colors.brand,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  dotActive: {
    backgroundColor: colors.brand,
    borderColor: '#fff',
    width: DOT + 4,
    height: DOT + 4,
    borderRadius: (DOT + 4) / 2,
  },
  chipWrap: {
    position: 'absolute',
    width: 0,
    alignItems: 'center',
    marginTop: -44,
  },
  chip: {
    backgroundColor: 'rgba(17,17,19,0.85)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    ...T.badge,
    color: '#fff',
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
    color: colors.brand,
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
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
