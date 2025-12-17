import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Shared footer pattern used across Bag + Checkout:
 * - An absolute-positioned chevron toggle (top-right)
 * - Optional "details" section shown only when expanded
 * - Optional "always" section shown regardless of collapsed state
 * - Optional "action" section rendered below content (e.g. CTA button)
 */
export default function CollapsibleFooter({
  collapsed,
  onToggle,
  chevronCollapsedName = 'chevron-down',
  chevronExpandedName = 'chevron-up',
  chevronColor = '#86868B',
  chevronSize = 18,
  chevronHitSlop,
  containerStyle,
  contentStyle,
  chevronButtonStyle,
  details,
  always,
  action,
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.content, contentStyle]}>
        <TouchableOpacity
          style={[styles.chevronBtn, chevronButtonStyle]}
          onPress={onToggle}
          activeOpacity={0.8}
          hitSlop={chevronHitSlop}
        >
          <Ionicons
            name={collapsed ? chevronCollapsedName : chevronExpandedName}
            size={chevronSize}
            color={chevronColor}
          />
        </TouchableOpacity>

        {!collapsed ? details : null}
        {always}
      </View>

      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    position: 'relative',
    paddingRight: 40, // reserve space for chevron so it never overlaps content
  },
  chevronBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
});




