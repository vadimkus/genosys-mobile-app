import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { colors, surfaces } from '../../utils/theme';

/**
 * OrderSummaryCard
 *
 * Renders the "Order Notes" section of checkout. This is kept as a simple
 * presentational component that can be extended to include a full order
 * summary breakdown if the order header card is ever merged into a single
 * review section.
 *
 * Props:
 * - orderNotes: current notes text
 * - setOrderNotes: setter for notes
 * - styles: stylesheet from parent
 */
export default function OrderSummaryCard({
  orderNotes,
  setOrderNotes,
  styles,
}) {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
        <View style={[surfaces.iconTile, { backgroundColor: colors.secondaryLabel }]}>
          <Ionicons name="chatbubble-ellipses" size={17} color="#ffffff" />
        </View>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('checkout.orderNotesOptional')}</Text>
      </View>
      <TextInput
        style={[styles.input, styles.textArea, isRTL && styles.inputRTL]}
        value={orderNotes}
        onChangeText={setOrderNotes}
        placeholder={t('checkout.orderNotesPlaceholder')}
        placeholderTextColor={colors.tertiary}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        maxLength={500}
      />
    </View>
  );
}
