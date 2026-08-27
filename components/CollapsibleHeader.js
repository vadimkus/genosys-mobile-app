import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import T from '../utils/typography';
import { colors, shadow } from '../utils/theme';
import { tStatic } from '../contexts/LocalizationContext';

/**
 * Scroll-aware navigation header.
 *
 * A floating bar rather than a band across the top: inset from both edges,
 * rounded, on its own hairline and shadow, so it reads as an element sitting on
 * the page the way the search field does - not as a white rectangle the page
 * happens to start below. Content scrolls underneath it.
 *
 * Usage:
 *   const { onScroll, headerHeight } = useCollapsibleHeader();
 *   <CollapsibleHeader title={t('orders.title')}
 *     onBack={...} onRefresh={...} isRTL={isRTL} />
 *   <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}
 *     contentContainerStyle={{ paddingTop: headerHeight }} />
 */

export const HEADER_BAR_HEIGHT = 48;
// Breathing room under the floating bar, so page content does not begin flush
// against it and lose the sense that the bar is a separate thing.
export const HEADER_GAP = 10;
const HEADER_INSET = 12;

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

/**
 * The hide-on-scroll movement on its own, for a screen that already owns its
 * scroll handler and wants only the behaviour. Feed it the offset from wherever
 * that handler already reads it; it hands back the transform for the bar.
 */
export function useHideOnScroll(distance) {
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

  const handleScroll = React.useCallback(
    (y) => {
      const next = shouldHideHeader({
        y,
        lastY: lastY.current,
        headerHeight: distance,
        isHidden: isHidden.current,
      });
      lastY.current = y;
      setHidden(next);
    },
    [distance, setHidden]
  );

  const translateY = React.useMemo(
    () => hidden.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }),
    [hidden, distance]
  );

  const reveal = React.useCallback(() => setHidden(false), [setHidden]);

  return { translateY, handleScroll, reveal };
}

/**
 * Hook that wires an Animated scroll value + the padding the content needs.
 *
 * `hideDistance` is for screens that bring their own header rather than this
 * one - the shop's is taller, with a logo and a subtitle - so they can share the
 * behaviour without inheriting this bar's dimensions.
 */
export function useCollapsibleHeader({ hideOnScroll = false, hideDistance } = {}) {
  const insets = useSafeAreaInsets();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const barHeight = HEADER_BAR_HEIGHT + HEADER_GAP + insets.top;
  const { translateY, handleScroll, reveal } = useHideOnScroll(hideDistance ?? barHeight);

  const onScroll = React.useMemo(() => {
    const config = { useNativeDriver: true };
    if (hideOnScroll) {
      config.listener = (event) => handleScroll(event.nativeEvent.contentOffset.y);
    }
    return Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], config);
  }, [scrollY, hideOnScroll, handleScroll]);

  return {
    scrollY,
    onScroll,
    // Screens padding for this bar want its height; screens with their own
    // header already know theirs and only borrowed the behaviour.
    headerHeight: barHeight,
    insets,
    translateY: hideOnScroll ? translateY : undefined,
    revealHeader: reveal,
  };
}

export default function CollapsibleHeader({
  title,
  translateY,
  onBack,
  onRefresh,
  rightIcon = 'refresh',
  right,
  isRTL = false,
  backIcon,
}) {
  const insets = useSafeAreaInsets();
  const chevron = backIcon || (isRTL ? 'chevron-forward' : 'chevron-back');

  return (
    <Animated.View
      style={[
        styles.wrap,
        { paddingTop: insets.top },
        translateY ? { transform: [{ translateY }] } : null,
      ]}
      pointerEvents="box-none"
    >
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
  // White, on its own hairline and shadow, the same treatment as the search
  // field on the shop page. Solid rather than translucent because content
  // passes underneath it.
  bar: {
    height: HEADER_BAR_HEIGHT,
    marginHorizontal: HEADER_INSET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    backgroundColor: colors.card,
    borderRadius: HEADER_BAR_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    ...shadow.card,
  },
  barRTL: {
    flexDirection: 'row-reverse',
  },
  side: {
    width: 40,
    height: HEADER_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // For text actions (e.g. "Save") in the `right` slot - hug content, don't clip.
  sideAuto: {
    width: undefined,
    minWidth: 40,
    paddingHorizontal: 8,
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
