/**
 * Delivery Screen - Native (replaces WebView)
 * Displays delivery information, shipping rates, and return policy.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import { useRouter } from 'expo-router';
import * as haptics from '../utils/haptics';
import T from '../utils/typography';
import { useLocalization } from '../contexts/LocalizationContext';
import { colors, shadow, surfaces, tint } from '../utils/theme';

export default function DeliveryScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll, headerHeight } = useCollapsibleHeader();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);

  // Subtle entrance motion (matches order screens).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  const selectMethod = (index) => {
    haptics.lightTap();
    setSelectedMethod(selectedMethod === index ? null : index);
  };

  const selectRate = (index) => {
    haptics.lightTap();
    setSelectedRate(selectedRate === index ? null : index);
  };

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  const deliveryMethods = [
    {
      icon: 'flash',
      iconColor: colors.brand,
      title: l('Express Delivery — Dubai', 'التوصيل السريع — دبي', 'Экспресс-доставка — Дубай'),
      desc: l('Within 1–2 hours', 'خلال ١-٢ ساعة', 'В течение 1–2 часов'),
      partner: l('Via Careem / QuipQup', 'عبر كريم / كويب كوب', 'Через Careem / QuipQup'),
    },
    {
      icon: 'car',
      iconColor: colors.blue,
      title: l('Standard Delivery — UAE', 'التوصيل القياسي — الإمارات', 'Стандартная доставка — ОАЭ'),
      desc: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      partner: l('All Emirates', 'جميع الإمارات', 'Все эмираты'),
    },
  ];

  const shippingRates = [
    { emirate: l('Dubai', 'دبي', 'Дубай'), rate: l('45 AED', '٤٥ د.إ', '45 AED') },
    { emirate: l('Abu Dhabi', 'أبو ظبي', 'Абу-Даби'), rate: l('70 AED', '٧٠ د.إ', '70 AED') },
    { emirate: l('Sharjah', 'الشارقة', 'Шарджа'), rate: l('70 AED', '٧٠ د.إ', '70 AED') },
    { emirate: l('Ajman', 'عجمان', 'Аджман'), rate: l('70 AED', '٧٠ د.إ', '70 AED') },
    { emirate: l('Ras Al Khaimah', 'رأس الخيمة', 'Рас-эль-Хайма'), rate: l('70 AED', '٧٠ د.إ', '70 AED') },
    { emirate: l('Fujairah', 'الفجيرة', 'Фуджейра'), rate: l('70 AED', '٧٠ د.إ', '70 AED') },
    { emirate: l('Umm Al Quwain', 'أم القيوين', 'Умм-эль-Кайвайн'), rate: l('70 AED', '٧٠ د.إ', '70 AED') },
  ];

  const policies = [
    {
      icon: 'calendar',
      text: l('10-day return window from delivery date', 'نافذة إرجاع ١٠ أيام من تاريخ التسليم', '10 дней на возврат с даты доставки'),
    },
    {
      icon: 'cube',
      text: l('Products must be unopened and in original packaging', 'يجب أن تكون المنتجات مغلقة وفي عبوتها الأصلية', 'Продукты должны быть в оригинальной упаковке'),
    },
    {
      icon: 'wallet',
      text: l('Refund processed within 3–5 business days', 'يتم معالجة الاسترداد خلال ٣-٥ أيام عمل', 'Возврат средств в течение 3–5 рабочих дней'),
    },
  ];

  const SectionHeader = ({ icon, tileColor, title }) => (
    <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
      <View style={[surfaces.iconTile, { backgroundColor: tileColor }]}>
        <Ionicons name={icon} size={16} color={colors.white} />
      </View>
      <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{title}</Text>
    </View>
  );

  const onBack = () => { haptics.lightTap(); router.canGoBack() ? router.back() : router.replace('/profile'); };

  return (
    <View style={styles.container}>
      <CollapsibleHeader title={t('navigation.delivery') || 'Delivery'} scrollY={scrollY} onBack={onBack} isRTL={isRTL} />

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: (insets?.bottom || 0) + 12 }}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          {/* Delivery Options */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader icon="rocket" tileColor={colors.teal} title={l('Delivery Options', 'خيارات التوصيل', 'Варианты доставки')} />
            {deliveryMethods.map((method, index) => {
              const isSelected = selectedMethod === index;
              const isLast = index === deliveryMethods.length - 1;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.methodRow, isRTL && styles.rowRTL, !isLast && styles.methodRowBorder]}
                  onPress={() => selectMethod(index)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.methodIcon, { backgroundColor: tint(method.iconColor) }]}>
                    <Ionicons name={method.icon} size={20} color={method.iconColor} />
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={[styles.methodTitle, isRTL && styles.textRTL]}>{method.title}</Text>
                    <Text style={[styles.methodDesc, { color: method.iconColor }, isRTL && styles.textRTL]}>{method.desc}</Text>
                    <Text style={[styles.methodPartner, isRTL && styles.textRTL]}>{method.partner}</Text>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={method.iconColor} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Free Shipping Banner */}
          <View style={[styles.card, styles.freeShippingCard, shadow.card]}>
            <View style={styles.freeShippingIcon}>
              <Ionicons name="gift" size={24} color={colors.greenDeep} />
            </View>
            <Text style={[styles.freeShippingTitle, isRTL && styles.textRTLCenter]}>
              {l('Free Shipping', 'شحن مجاني', 'Бесплатная доставка')}
            </Text>
            <Text style={[styles.freeShippingDesc, isRTL && styles.textRTLCenter]}>
              {l('On orders above 1,000 AED', 'للطلبات فوق ١٬٠٠٠ د.إ', 'При заказе от 1 000 AED')}
            </Text>
          </View>

          {/* Shipping Rates */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader icon="pricetags" tileColor={colors.indigo} title={l('Shipping Rates by Emirate', 'أسعار الشحن حسب الإمارة', 'Стоимость доставки по эмиратам')} />
            {shippingRates.map((item, index) => {
              const isSelected = selectedRate === index;
              const isLast = index === shippingRates.length - 1;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.rateRow, isRTL && styles.rowRTL, !isLast && styles.rateRowBorder]}
                  onPress={() => selectRate(index)}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <Ionicons name="location" size={15} color={colors.brand} style={isRTL ? styles.rateIconRTL : styles.rateIcon} />
                  ) : null}
                  <Text style={[styles.rateEmirate, isRTL && styles.textRTL, isSelected && styles.rateEmirateSelected]}>{item.emirate}</Text>
                  <Text style={[styles.rateAmount, isSelected && styles.rateAmountSelected]}>{item.rate}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Return Policy */}
          <View style={[styles.card, shadow.card]}>
            <SectionHeader icon="shield-checkmark" tileColor={colors.blue} title={l('Return Policy', 'سياسة الإرجاع', 'Политика возврата')} />
            {policies.map((policy, index) => {
              const isLast = index === policies.length - 1;
              return (
                <View key={index} style={[styles.policyRow, isRTL && styles.rowRTL, !isLast && styles.policyRowBorder]}>
                  <View style={styles.policyIcon}>
                    <Ionicons name={policy.icon} size={16} color={colors.secondaryLabel} />
                  </View>
                  <Text style={[styles.policyText, isRTL && styles.textRTL]}>{policy.text}</Text>
                </View>
              );
            })}
          </View>

          {/* Need Help? */}
          <View style={styles.helpSection}>
            <Text style={[styles.helpTitle, isRTL && styles.textRTLCenter]}>
              {l('Need Help?', 'تحتاج مساعدة؟', 'Нужна помощь?')}
            </Text>
            <TouchableOpacity
              style={[styles.helpBtn, isRTL && styles.rowRTL]}
              onPress={() => { haptics.mediumTap(); Linking.openURL('https://wa.me/971585487665'); }}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp} />
              <Text style={styles.helpBtnText}>
                {l('Chat on WhatsApp', 'تواصل عبر واتساب', 'Написать в WhatsApp')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  scrollView: { flex: 1 },

  // Cards
  card: {
    ...surfaces.card,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  sectionTitle: { ...T.body, fontWeight: '700', color: colors.label, flex: 1 },

  // Delivery methods
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  methodRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodContent: { flex: 1, minWidth: 0 },
  methodTitle: { ...T.label, fontSize: 15, fontWeight: '700', color: colors.label, marginBottom: 3 },
  methodDesc: { ...T.bodySmall, fontWeight: '700', marginBottom: 2 },
  methodPartner: { ...T.caption, color: colors.secondaryLabel },

  // Free shipping
  freeShippingCard: { alignItems: 'center', paddingVertical: 22 },
  freeShippingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tint(colors.greenDeep),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  freeShippingTitle: { ...T.sectionTitleSmall, color: colors.greenDeep, marginBottom: 4, textAlign: 'center' },
  freeShippingDesc: { ...T.bodySmall, color: colors.secondaryLabel, textAlign: 'center' },

  // Shipping rates
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  rateRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  rateIcon: { marginRight: 6 },
  rateIconRTL: { marginLeft: 6 },
  rateEmirate: { ...T.bodySmall, flex: 1, fontWeight: '500', color: colors.label },
  rateEmirateSelected: { fontWeight: '700' },
  rateAmount: { ...T.bodySmall, fontWeight: '700', color: colors.label },
  rateAmountSelected: { color: colors.brand },

  // Return policy
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  policyRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  policyIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.subtleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyText: { ...T.bodySmall, flex: 1, color: colors.label, lineHeight: 20 },

  // Help
  helpSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
  },
  helpTitle: { ...T.sectionTitleSmall, marginBottom: 14, textAlign: 'center' },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: tint(colors.whatsapp, '1F'),
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: 'stretch',
  },
  helpBtnText: { ...T.button, fontWeight: '700', color: colors.whatsapp },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
  textRTLCenter: { writingDirection: 'rtl', textAlign: 'center' },
});
