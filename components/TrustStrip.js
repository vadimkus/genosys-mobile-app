/**
 * TrustStrip - Horizontal brand-promise strip for the shop/catalog screen.
 *
 * Mirrors the mobile web pattern on genosys.ae/products:
 *   [ 🚚 Free shipping over AED 1,000 ]  [ 🛡 Authentic Korean dermacosmetics ]  [ 💳 All prices VAT inclusive ]
 *
 * Single horizontal row with a thin top + bottom border; scrolls horizontally
 * on narrow screens so copy never truncates. Copy is inlined per locale to
 * avoid any i18n chunk-loading surprises on first paint.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, I18nManager } from 'react-native';
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
  const copy = COPY[locale] || COPY.en;

  return (
    <View style={styles.wrapper} accessibilityRole="summary">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.content, isRTL && styles.contentRTL]}
      >
        {ITEMS.map((item, idx) => (
          <View
            key={item.key}
            style={[
              styles.item,
              isRTL && styles.itemRTL,
              idx < ITEMS.length - 1 && (isRTL ? styles.itemSpacerRTL : styles.itemSpacer),
            ]}
          >
            <Ionicons
              name={item.icon}
              size={14}
              color="#dc2626"
              style={isRTL ? styles.iconRTL : styles.icon}
            />
            <Text style={[styles.text, isRTL && styles.textRTL]} numberOfLines={1}>
              {copy[item.key]}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    // center when content is narrower than viewport
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentRTL: {
    flexDirection: 'row-reverse',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRTL: {
    flexDirection: 'row-reverse',
  },
  itemSpacer: {
    marginRight: 18,
  },
  itemSpacerRTL: {
    marginLeft: 18,
  },
  icon: {
    marginRight: 6,
  },
  iconRTL: {
    marginLeft: 6,
  },
  text: {
    ...T.captionSmall,
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  textRTL: {
    writingDirection: 'rtl',
  },
});
