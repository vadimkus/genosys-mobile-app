/**
 * TrustBadges - Credibility signals on product detail pages
 * Shows UAE certification, secure payments, free shipping, and professional grade badges.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import T from '../../utils/typography';

const BADGES = [
  { key: 'certified', icon: 'shield-checkmark', color: '#16A34A' },
  { key: 'secure', icon: 'lock-closed', color: '#2563EB' },
  { key: 'shipping', icon: 'car', color: '#D97706' },
  { key: 'professional', icon: 'ribbon', color: '#7C3AED' },
];

export default function TrustBadges() {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  return (
    <View style={styles.container}>
      <View style={[styles.grid, isRTL && styles.gridRTL]}>
        {BADGES.map((badge) => (
          <View key={badge.key} style={styles.badgeItem}>
            <View style={[styles.iconCircle, { backgroundColor: badge.color + '15' }]}>
              <Ionicons name={badge.icon} size={18} color={badge.color} />
            </View>
            <Text style={[styles.badgeText, isRTL && styles.textRTL]} numberOfLines={2}>
              {t(`trustBadges.${badge.key}`) || defaultLabels[badge.key]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const defaultLabels = {
  certified: 'UAE Certified',
  secure: 'Secure Payment',
  shipping: 'Fast Delivery',
  professional: 'Professional Grade',
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridRTL: {
    flexDirection: 'row-reverse',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '48%',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
