import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

/**
 * Non-blocking banner shown when a newer app version is available
 * but the current version still meets the minimum requirement.
 *
 * Slides in from the top and can be dismissed by the user.
 * Dismissal persists via AsyncStorage in the parent (_layout.js)
 * so the user isn't nagged again for the same version.
 */
export default function UpdateBanner({ updateUrl, onDismiss }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleUpdate = () => {
    if (updateUrl) {
      Linking.openURL(updateUrl).catch(() => {});
    }
  };

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onDismiss?.());
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top + 8, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.inner}>
        <Ionicons name="arrow-up-circle" size={22} color={colors.white} style={styles.icon} />

        <Text style={styles.text} numberOfLines={1}>
          {Platform.OS === 'ios'
            ? 'A new version is available on the App Store'
            : 'A new version is available on Google Play'}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.updateBtn, pressed && styles.pressed]}
          onPress={handleUpdate}
          hitSlop={8}
        >
          <Text style={styles.updateText}>Update</Text>
        </Pressable>

        <Pressable onPress={handleDismiss} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 998,
    backgroundColor: colors.label,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  updateBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  updateText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    marginLeft: 10,
    padding: 2,
  },
});
