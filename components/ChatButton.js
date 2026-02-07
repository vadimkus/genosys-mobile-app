/**
 * Floating Chat Button - Opens AI chatbot ("Genie")
 * Positioned bottom-right, above the tab bar.
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ChatButton({ visible = true }) {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="auto">
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/chat')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Open chat with Genie"
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#ffffff" />
        {/* Green notification dot (matches web) */}
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 72,
    right: 16,
    zIndex: 999,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
