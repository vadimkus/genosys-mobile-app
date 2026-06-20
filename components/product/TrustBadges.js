/**
 * TrustBadges - Credibility signals on product detail pages.
 *
 * Three specific, honest trust signals (free shipping threshold, authentic
 * Korean origin, VAT inclusive pricing). Stacked vertically so all three lines
 * are always visible on the narrow mobile canvas.
 *
 * Copy is inlined here (EN/AR/RU) to mirror the web implementation exactly,
 * and to avoid any i18n chunk-loading surprises.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

const COPY = {
  en: {
    shipping: 'Free shipping over AED 1,000',
    authentic: 'Authentic Korean dermacosmetics',
    vat: 'All prices VAT inclusive',
  },
  ar: {
    shipping: 'شحن مجاني للطلبات فوق 1,000 درهم',
    authentic: 'مستحضرات تجميل كورية أصلية',
    vat: 'جميع الأسعار شاملة ضريبة القيمة المضافة',
  },
  ru: {
    shipping: 'Бесплатная доставка от 1,000 AED',
    authentic: 'Оригинальная корейская космецевтика',
    vat: 'Все цены с учётом НДС',
  },
};

const BADGES = [
  { key: 'shipping', icon: 'car-outline', color: colors.orange },
  { key: 'authentic', icon: 'shield-checkmark-outline', color: colors.greenDeep },
  { key: 'vat', icon: 'card-outline', color: colors.blue },
];

export default function TrustBadges() {
  const { locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  // Robust lookup: locale could be 'en', 'en-US', 'ru-RU', etc.
  const lang = String(locale || '').toLowerCase().split('-')[0];
  const copy = COPY[lang] || COPY.en;

  return (
    <View style={styles.container} accessibilityRole="summary">
      {BADGES.map((badge) => (
        <View
          key={badge.key}
          style={[styles.row, isRTL && styles.rowRTL]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: badge.color + '15' },
              isRTL ? styles.iconWrapRTL : null,
            ]}
          >
            <Ionicons name={badge.icon} size={16} color={badge.color} />
          </View>
          <Text
            style={[styles.text, isRTL && styles.textRTL]}
            numberOfLines={2}
          >
            {copy[badge.key]}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...surfaces.card,
    ...shadow.card,
    marginBottom: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconWrapRTL: {
    marginRight: 0,
    marginLeft: 10,
  },
  text: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.label,
    flex: 1,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
