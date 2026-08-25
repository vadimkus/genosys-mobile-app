import React from 'react';
import { View, StyleSheet } from 'react-native';
import SectionHeader from './SectionHeader';
import { surfaces, shadow } from '../utils/theme';

/**
 * A card carrying a section header and its body.
 *
 * This shape was written out by hand twenty-four times across brand, delivery,
 * billing, payment, add-address, order detail and edit profile. The copies had
 * drifted: padding was 16 in four screens and 18 in three, and order detail had
 * stopped using the shared card surface altogether and rebuilt it inline, so it
 * missed the hairline border added with the cream palette.
 *
 * Padding is 16 by default. Pass `padding={0}` for a card whose rows run to the
 * edge, and `style` for the rare screen that needs a different margin.
 *
 * Omit `title` to get a bare card with no header.
 *
 * Usage:
 *   <SectionCard icon="card" title={t('...')} isRTL={isRTL}>
 *     ...
 *   </SectionCard>
 */
export default function SectionCard({
  icon,
  title,
  tileColor,
  isRTL = false,
  padding = 16,
  style,
  headerStyle,
  children,
}) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {title ? (
        <SectionHeader
          icon={icon}
          title={title}
          tileColor={tileColor}
          isRTL={isRTL}
          style={headerStyle}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surfaces.card,
    ...shadow.card,
    marginHorizontal: 16,
    marginBottom: 14,
  },
});
