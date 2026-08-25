import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import T from '../utils/typography';
import { colors, surfaces } from '../utils/theme';

/**
 * Icon tile plus a title, the header that opens a section.
 *
 * This existed nine times over, declared separately in about, brand, delivery,
 * training, billing, payment, add-address, order detail and the product page.
 * The copies had already drifted: one drew its icon a pixel larger, and the
 * bottom margin was 14 in some screens and 16 in others. Standardised on 16
 * and one icon size here, since the difference was never intentional.
 *
 * The tile is rose by default. Pass `tileColor` only where the colour carries
 * meaning, such as danger.
 *
 * Usage:
 *   <SectionHeader icon="card" title={t('...')} isRTL={isRTL} />
 */
export default function SectionHeader({
  icon,
  title,
  tileColor = colors.accent,
  isRTL = false,
  style,
  titleStyle,
}) {
  return (
    <View style={[styles.row, isRTL && styles.rowRTL, style]}>
      <View style={[surfaces.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      <Text style={[styles.title, isRTL && styles.titleRTL, titleStyle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    ...T.body,
    fontWeight: '700',
    color: colors.label,
    flexShrink: 1,
  },
  titleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
