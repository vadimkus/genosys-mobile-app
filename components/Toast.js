/**
 * Toast - Lightweight, non-blocking feedback overlay.
 *
 * Used in place of `Alert.alert` for positive-path feedback (e.g. "Added to
 * bag"). Slides up from just above the bottom bar, auto-dismisses, and
 * supports an optional action button (tap → callback).
 *
 * Zero external deps. Pure React Native Animated.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import T from '../utils/typography';
import { colors } from '../utils/theme';

const AUTO_DISMISS_MS = 2500;

export default function Toast({
  visible,
  message,
  actionLabel,
  onAction,
  onHide,
  bottomOffset = 110,
  icon = 'checkmark-circle',
  iconColor = colors.ok,
  isRTL = false,
}) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        dismiss();
      }, AUTO_DISMISS_MS);
    } else {
      dismiss();
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 40, duration: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      onHide && onHide();
    });
  };

  if (!visible && opacity.__getValue && opacity.__getValue() === 0) {
    // Keep mounted briefly during exit animation, but skip render once fully hidden.
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        {
          bottom: bottomOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.card, isRTL && styles.cardRTL]}>
        <Ionicons name={icon} size={20} color={iconColor} style={isRTL ? styles.iconRTL : styles.icon} />
        <Text style={[styles.message, isRTL && styles.textRTL]} numberOfLines={2}>
          {message}
        </Text>
        {actionLabel && onAction ? (
          <TouchableOpacity
            onPress={() => {
              onAction();
              dismiss();
            }}
            activeOpacity={0.7}
            style={isRTL ? styles.actionRTL : styles.action}
            accessibilityRole="button"
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.label,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  cardRTL: {
    flexDirection: 'row-reverse',
  },
  icon: {
    marginRight: 10,
  },
  iconRTL: {
    marginLeft: 10,
  },
  message: {
    ...T.bodySmall,
    flex: 1,
    color: colors.white,
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  action: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  actionRTL: {
    marginLeft: 0,
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.1,
  },
});
