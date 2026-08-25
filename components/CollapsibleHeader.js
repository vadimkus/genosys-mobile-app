import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import T from '../utils/typography';
import { colors } from '../utils/theme';
import { tStatic } from '../contexts/LocalizationContext';

/**
 * Scroll-aware navigation header — the stock-iOS effect.
 *
 * At the top of the scroll the bar is transparent so it blends into the page
 * background; as the user scrolls, a cream fill + hairline fade in (and
 * content scrolls *under* the bar). Reusable across every screen.
 *
 * Usage:
 *   const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();
 *   <CollapsibleHeader title={t('orders.title')} scrollY={scrollY}
 *     onBack={...} onRefresh={...} isRTL={isRTL} />
 *   <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}
 *     contentContainerStyle={{ paddingTop: headerHeight }} />
 */

export const HEADER_BAR_HEIGHT = 52;
// Distance (px) over which the bar fades from transparent to solid.
const FADE_DISTANCE = 28;

/** Hook that wires an Animated scroll value + the padding the content needs. */
export function useCollapsibleHeader() {
  const insets = useSafeAreaInsets();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const onScroll = React.useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }),
    [scrollY]
  );
  return { scrollY, onScroll, headerHeight: HEADER_BAR_HEIGHT + insets.top, insets };
}

export default function CollapsibleHeader({
  title,
  scrollY,
  onBack,
  onRefresh,
  rightIcon = 'refresh',
  right,
  isRTL = false,
  backIcon,
}) {
  const insets = useSafeAreaInsets();
  const bgOpacity = scrollY
    ? scrollY.interpolate({ inputRange: [0, FADE_DISTANCE], outputRange: [0, 1], extrapolate: 'clamp' })
    : 1;
  const chevron = backIcon || (isRTL ? 'chevron-forward' : 'chevron-back');

  return (
    <View style={[styles.wrap, { height: HEADER_BAR_HEIGHT + insets.top, paddingTop: insets.top }]}>
      {/* Fill + hairline fade in on scroll (opacity → native-driver friendly) */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.fill, { opacity: bgOpacity }]} />
      <Animated.View style={[styles.hairline, { opacity: bgOpacity }]} />

      <View style={[styles.bar, isRTL && styles.barRTL]}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.side}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={tStatic('common.back')}
          >
            <Ionicons name={chevron} size={24} color={colors.label} />
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}

        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">{title}</Text>

        {right ? (
          <View style={[styles.side, styles.sideAuto, isRTL && styles.sideAutoRTL]}>{right}</View>
        ) : onRefresh ? (
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.side}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={tStatic('common.refresh')}
          >
            <Ionicons name={rightIcon} size={20} color={colors.secondaryLabel} />
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  // Cream, not white: the bar floats over the page, and a white fill would
  // read as a separate panel sliding in rather than the page continuing under
  // its own header.
  fill: {
    backgroundColor: colors.groupedBg,
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  bar: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  barRTL: {
    flexDirection: 'row-reverse',
  },
  side: {
    width: 44,
    height: HEADER_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // For text actions (e.g. "Save") in the `right` slot — hug content, don't clip.
  sideAuto: {
    width: undefined,
    minWidth: 44,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  sideAutoRTL: {
    alignItems: 'flex-start',
  },
  title: {
    ...T.navTitle,
    flex: 1,
    textAlign: 'center',
  },
});
