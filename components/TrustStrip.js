/**
 * TrustStrip - Horizontal brand-promise strip for the shop/catalog screen.
 *
 * Mirrors the mobile web brand promises:
 *   🚚 Free shipping over AED 1,000 · 🛡 Authentic Korean dermacosmetics · 💳 All prices VAT inclusive
 *
 * Rendered as a compact vertical stack (one promise per full-width row) so each
 * line shows completely — no horizontal scroll, no truncation/clipping — and it
 * sits cleanly inside the Apple-native card the Shop wraps it in. Copy is inlined
 * per locale to avoid any i18n chunk-loading surprises on first paint.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../contexts/LocalizationContext';
import T from '../utils/typography';

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

const ITEMS = [
  { key: 'shipping', icon: 'car-outline' },
  { key: 'authentic', icon: 'shield-checkmark-outline' },
  { key: 'vat', icon: 'card-outline' },
];

export default function TrustStrip() {
  const { locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  // Robust lookup: locale could be 'en', 'en-US', 'ru-RU', etc.
  const lang = String(locale || '').toLowerCase().split('-')[0];
  const copy = COPY[lang] || COPY.en;

  return (
    <View style={styles.wrapper} accessibilityRole="summary">
      {ITEMS.map((item, idx) => (
        <View
          key={item.key}
          style={[
            styles.row,
            isRTL && styles.rowRTL,
            idx > 0 && styles.rowDivider,
          ]}
        >
          <Ionicons
            name={item.icon}
            size={16}
            color="#dc2626"
            style={isRTL ? styles.iconRTL : styles.icon}
          />
          <Text style={[styles.text, isRTL && styles.textRTL]} numberOfLines={1}>
            {copy[item.key]}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Transparent — the Shop wraps this in a white Apple-native card.
  wrapper: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  icon: {
    marginRight: 8,
  },
  iconRTL: {
    marginLeft: 8,
  },
  text: {
    ...T.captionSmall,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
  },
  textRTL: {
    writingDirection: 'rtl',
  },
});
