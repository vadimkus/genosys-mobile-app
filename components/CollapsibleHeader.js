import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
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

/**
 * Hide-on-scroll, the pattern Instagram and Safari use: the bar leaves when you
 * scroll into content and comes back the moment you scroll up, because scrolling
 * up is how someone signals they are done reading and want to navigate.
 *
 * Three details separate a good one from a twitchy one:
 *   · a direction threshold, so a shaky thumb does not flap the bar;
 *   · snapping fully open or shut rather than resting halfway;
 *   · never hiding near the top, where there is nothing to gain.
 * The movement itself runs on the native thread; only the decision is JS, once
 * per scroll event rather than per frame.
 */
const DIRECTION_THRESHOLD = 10;
const HIDE_DURATION = 180;
const REVEAL_DURATION = 220;

/**
 * Should the bar be hidden after this scroll event?
 *
 * Pure, and exported, because the awkward cases are the ones worth having a
 * test for: rubber-band bounce at the top reads as a downward scroll, and a
 * thumb resting on the screen sends a stream of one-pixel deltas.
 */
export function shouldHideHeader({ y, lastY, headerHeight, isHidden }) {
  if (y <= headerHeight) return false;
  const delta = y - lastY;
  if (Math.abs(delta) < DIRECTION_THRESHOLD) return isHidden;
  return delta > 0;
}

/** Hook that wires an Animated scroll value + the padding the content needs. */
export function useCollapsibleHeader({ hideOnScroll = false } = {}) {
  const insets = useSafeAreaInsets();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const headerHeight = HEADER_BAR_HEIGHT + insets.top;

  const hidden = React.useRef(new Animated.Value(0)).current;
  const isHidden = React.useRef(false);
  const lastY = React.useRef(0);

  const setHidden = React.useCallback(
    (next) => {
      if (isHidden.current === next) return;
      isHidden.current = next;
      Animated.timing(hidden, {
        toValue: next ? 1 : 0,
        duration: next ? HIDE_DURATION : REVEAL_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [hidden]
  );

  const revealHeader = React.useCallback(() => setHidden(false), [setHidden]);

  const onScroll = React.useMemo(() => {
    const config = { useNativeDriver: true };
    if (hideOnScroll) {
      config.listener = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        const next = shouldHideHeader({
          y,
          lastY: lastY.current,
          headerHeight,
          isHidden: isHidden.current,
        });
        lastY.current = y;
        setHidden(next);
      };
    }
    return Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], config);
  }, [scrollY, hideOnScroll, headerHeight, setHidden]);

  const headerTranslate = React.useMemo(
    () =>
      hidden.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -headerHeight],
      }),
    [hidden, headerHeight]
  );

  return {
    scrollY,
    onScroll,
    headerHeight,
    insets,
    translateY: hideOnScroll ? headerTranslate : undefined,
    revealHeader,
  };
}

export default function CollapsibleHeader({
  title,
  scrollY,
  translateY,
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
    <Animated.View
      style={[
        styles.wrap,
        { height: HEADER_BAR_HEIGHT + insets.top, paddingTop: insets.top },
        translateY ? { transform: [{ translateY }] } : null,
      ]}
    >
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
    </Animated.View>
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
