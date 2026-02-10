/**
 * Delivery Screen - Native (replaces WebView)
 * Displays delivery information, shipping rates, and return policy.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';

export default function DeliveryScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  const deliveryMethods = [
    {
      icon: 'flash',
      iconColor: '#dc2626',
      bgColor: '#FEF2F2',
      title: l('Express Delivery — Dubai', 'التوصيل السريع — دبي', 'Экспресс-доставка — Дубай'),
      desc: l('Within 1–2 hours', 'خلال ١-٢ ساعة', 'В течение 1–2 часов'),
      partner: l('Via Careem / QuipQup', 'عبر كريم / كويب كوب', 'Через Careem / QuipQup'),
    },
    {
      icon: 'car',
      iconColor: '#2563eb',
      bgColor: '#EFF6FF',
      title: l('Standard Delivery — UAE', 'التوصيل القياسي — الإمارات', 'Стандартная доставка — ОАЭ'),
      desc: l('24–36 hours', '٢٤-٣٦ ساعة', '24–36 часов'),
      partner: l('All Emirates', 'جميع الإمارات', 'Все эмираты'),
    },
  ];

  const shippingRates = [
    { emirate: l('Dubai', 'دبي', 'Дубай'), rate: l('25 AED', '٢٥ د.إ', '25 AED') },
    { emirate: l('Abu Dhabi', 'أبو ظبي', 'Абу-Даби'), rate: l('35 AED', '٣٥ د.إ', '35 AED') },
    { emirate: l('Sharjah', 'الشارقة', 'Шарджа'), rate: l('30 AED', '٣٠ د.إ', '30 AED') },
    { emirate: l('Ajman', 'عجمان', 'Аджман'), rate: l('30 AED', '٣٠ د.إ', '30 AED') },
    { emirate: l('Ras Al Khaimah', 'رأس الخيمة', 'Рас-эль-Хайма'), rate: l('35 AED', '٣٥ د.إ', '35 AED') },
    { emirate: l('Fujairah', 'الفجيرة', 'Фуджейра'), rate: l('35 AED', '٣٥ د.إ', '35 AED') },
    { emirate: l('Umm Al Quwain', 'أم القيوين', 'Умм-эль-Кайвайн'), rate: l('35 AED', '٣٥ د.إ', '35 AED') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.delivery') || 'Delivery'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Delivery Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {l('Delivery Options', 'خيارات التوصيل', 'Варианты доставки')}
          </Text>
          {deliveryMethods.map((method, index) => (
            <View key={index} style={[styles.methodCard, isRTL && styles.methodCardRTL]}>
              <View style={[styles.methodIcon, { backgroundColor: method.bgColor }]}>
                <Ionicons name={method.icon} size={24} color={method.iconColor} />
              </View>
              <View style={styles.methodContent}>
                <Text style={[styles.methodTitle, isRTL && styles.textRTL]}>{method.title}</Text>
                <Text style={[styles.methodDesc, isRTL && styles.textRTL]}>{method.desc}</Text>
                <Text style={[styles.methodPartner, isRTL && styles.textRTL]}>{method.partner}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Free Shipping Banner */}
        <View style={styles.freeShippingBanner}>
          <Ionicons name="gift" size={28} color="#16a34a" />
          <Text style={[styles.freeShippingTitle, isRTL && styles.textRTL]}>
            {l('Free Shipping', 'شحن مجاني', 'Бесплатная доставка')}
          </Text>
          <Text style={[styles.freeShippingDesc, isRTL && styles.textRTL]}>
            {l('On orders above 1,000 AED', 'للطلبات فوق ١٬٠٠٠ د.إ', 'При заказе от 1 000 AED')}
          </Text>
        </View>

        {/* Shipping Rates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {l('Shipping Rates by Emirate', 'أسعار الشحن حسب الإمارة', 'Стоимость доставки по эмиратам')}
          </Text>
          <View style={styles.ratesCard}>
            {shippingRates.map((item, index) => (
              <View key={index} style={[styles.rateRow, isRTL && styles.rateRowRTL, index < shippingRates.length - 1 && styles.rateRowBorder]}>
                <Text style={[styles.rateEmirate, isRTL && styles.textRTL]}>{item.emirate}</Text>
                <Text style={styles.rateAmount}>{item.rate}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Return Policy */}
        <View style={[styles.section, styles.sectionAlt]}>
          <View style={styles.policyHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#2563eb" />
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL, { marginBottom: 0, marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 0 }]}>
              {l('Return Policy', 'سياسة الإرجاع', 'Политика возврата')}
            </Text>
          </View>
          <View style={styles.policyCard}>
            <View style={[styles.policyItem, isRTL && styles.policyItemRTL]}>
              <View style={styles.policyIcon}><Ionicons name="calendar" size={18} color="#6B7280" /></View>
              <Text style={[styles.policyText, isRTL && styles.textRTL]}>
                {l('10-day return window from delivery date', 'نافذة إرجاع ١٠ أيام من تاريخ التسليم', '10 дней на возврат с даты доставки')}
              </Text>
            </View>
            <View style={[styles.policyItem, isRTL && styles.policyItemRTL]}>
              <View style={styles.policyIcon}><Ionicons name="cube" size={18} color="#6B7280" /></View>
              <Text style={[styles.policyText, isRTL && styles.textRTL]}>
                {l('Products must be unopened and in original packaging', 'يجب أن تكون المنتجات مغلقة وفي عبوتها الأصلية', 'Продукты должны быть в оригинальной упаковке')}
              </Text>
            </View>
            <View style={[styles.policyItem, isRTL && styles.policyItemRTL]}>
              <View style={styles.policyIcon}><Ionicons name="wallet" size={18} color="#6B7280" /></View>
              <Text style={[styles.policyText, isRTL && styles.textRTL]}>
                {l('Refund processed within 3–5 business days', 'يتم معالجة الاسترداد خلال ٣-٥ أيام عمل', 'Возврат средств в течение 3–5 рабочих дней')}
              </Text>
            </View>
          </View>
        </View>

        {/* Need Help? */}
        <View style={styles.helpSection}>
          <Text style={[styles.helpTitle, isRTL && styles.textRTL]}>
            {l('Need Help?', 'تحتاج مساعدة؟', 'Нужна помощь?')}
          </Text>
          <TouchableOpacity
            style={[styles.helpBtn, isRTL && styles.helpBtnRTL]}
            onPress={() => Linking.openURL('https://wa.me/971585487665')}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
            <Text style={styles.helpBtnText}>
              {l('Chat on WhatsApp', 'تواصل عبر واتساب', 'Написать в WhatsApp')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginHorizontal: 8 },
  scrollView: { flex: 1 },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 24 },
  sectionAlt: { backgroundColor: '#F9FAFB' },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 16, letterSpacing: -0.4 },

  // Delivery Methods
  methodCard: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  methodCardRTL: { flexDirection: 'row-reverse' },
  methodIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  methodContent: { flex: 1 },
  methodTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  methodDesc: { fontSize: 15, fontWeight: '600', color: '#dc2626', marginBottom: 2 },
  methodPartner: { fontSize: 13, color: '#6B7280' },

  // Free Shipping
  freeShippingBanner: { marginHorizontal: 20, backgroundColor: '#F0FDF4', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
  freeShippingTitle: { fontSize: 20, fontWeight: '700', color: '#16a34a', marginTop: 8 },
  freeShippingDesc: { fontSize: 15, color: '#4B5563', marginTop: 4 },

  // Shipping Rates
  ratesCard: { backgroundColor: '#F9FAFB', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rateRowRTL: { flexDirection: 'row-reverse' },
  rateRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  rateEmirate: { fontSize: 15, fontWeight: '500', color: '#374151' },
  rateAmount: { fontSize: 15, fontWeight: '700', color: '#111827' },

  // Return Policy
  policyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  policyCard: { backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  policyItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  policyItemRTL: { flexDirection: 'row-reverse' },
  policyIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  policyText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },

  // Help
  helpSection: { paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' },
  helpTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 14 },
  helpBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#25D366', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  helpBtnRTL: { flexDirection: 'row-reverse' },
  helpBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
