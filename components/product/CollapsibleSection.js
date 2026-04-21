/**
 * CollapsibleSection - Reusable accordion block for product detail pages.
 *
 * Header: icon (optional) + title + chevron. Tapping toggles content visibility.
 * Uses LayoutAnimation for a smooth expand/collapse — no additional native deps,
 * safe to ship via OTA.
 *
 * Matches the web PDP accordion pattern (ProductInfoAccordion.tsx).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import T from '../../utils/typography';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CollapsibleSection({
  title,
  icon,
  iconColor = '#86868B',
  defaultOpen = false,
  isRTL = false,
  children,
  containerStyle,
  contentStyle,
  testID,
}) {
  const [isOpen, setIsOpen] = useState(!!defaultOpen);

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <View style={[styles.section, containerStyle]} testID={testID}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}
        style={styles.headerTouchable}
      >
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <View style={[styles.headerLeft, isRTL && styles.headerLeftRTL]}>
            {icon ? (
              <Ionicons
                name={icon}
                size={18}
                color={iconColor}
                style={isRTL ? styles.iconRTL : styles.icon}
              />
            ) : null}
            <Text
              style={[styles.title, isRTL && styles.titleRTL]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#86868B"
          />
        </View>
      </TouchableOpacity>

      {isOpen ? (
        <View style={[styles.content, contentStyle]}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  headerTouchable: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLeftRTL: {
    flexDirection: 'row-reverse',
  },
  icon: {
    marginRight: 10,
  },
  iconRTL: {
    marginLeft: 10,
  },
  title: {
    ...T.sectionTitle,
    flex: 1,
  },
  titleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  content: {
    paddingBottom: 16,
  },
});
