import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { PAYMENT_METHODS } from '../../services/paymentPreferences';
import { colors, surfaces, tint } from '../../utils/theme';
import T from '../../utils/typography';

/**
 * PaymentMethodSelector
 *
 * Renders the payment method selection section of checkout.
 * Currently supports COD and Card (Stripe) payment methods.
 * Purely presentational — selection callback is owned by parent.
 */
export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  styles,
}) {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const renderMethod = ({ method, icon, tileColor, title, description }) => {
    const selected = selectedMethod === method;
    return (
      <TouchableOpacity
        style={[ls.methodRow, isRTL && ls.methodRowRTL, selected && ls.methodRowSelected]}
        onPress={() => onMethodChange(method)}
        activeOpacity={0.85}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={title}
      >
        <View style={[surfaces.iconTile, ls.methodTile, { backgroundColor: tileColor }]}>
          <Ionicons name={icon} size={17} color="#ffffff" />
        </View>
        <View style={ls.methodBody}>
          <Text style={[ls.methodTitle, isRTL && styles.textRTL]} numberOfLines={1}>{title}</Text>
          <Text style={[ls.methodDesc, isRTL && styles.textRTL]} numberOfLines={2}>{description}</Text>
        </View>
        <Ionicons
          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={selected ? colors.brand : colors.tertiary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
        <View style={[surfaces.iconTile, { backgroundColor: colors.green }]}>
          <Ionicons name="card" size={17} color="#ffffff" />
        </View>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('checkout.paymentMethod')}</Text>
      </View>

      <Text style={[styles.paymentHint, isRTL && styles.textRTL]}>
        {t('checkout.defaultPaymentMethod')}:{' '}
        <Text style={styles.paymentHintStrong}>
          {selectedMethod === PAYMENT_METHODS.CARD
            ? t('checkout.cardPayment')
            : t('checkout.cashOnDelivery')}
        </Text>
        {' '}• {t('checkout.tapToChange')}
      </Text>

      <View style={ls.methods}>
        {/* Cash on Delivery */}
        {renderMethod({
          method: PAYMENT_METHODS.COD,
          icon: 'cash',
          tileColor: colors.green,
          title: t('checkout.cashOnDelivery'),
          description: t('checkout.payWhenDelivered'),
        })}

        {/* Card Payment (Stripe) */}
        {renderMethod({
          method: PAYMENT_METHODS.CARD,
          icon: 'card',
          tileColor: colors.blue,
          title: t('checkout.cardPayment'),
          description: t('checkout.paySecurelyStripe'),
        })}
      </View>

      {/* Trust badges */}
      <View style={[styles.trustRow, isRTL && styles.rowRTL]}>
        <Ionicons name="lock-closed" size={14} color="#6B7280" />
        <Text style={[styles.trustText, isRTL && styles.textRTL]}>{t('checkout.trustStripe')}</Text>
      </View>
      <Text style={[styles.trustTextSecondary, isRTL && styles.trustTextSecondaryRTL]}>{t('checkout.trustStripeSecondary')}</Text>
    </View>
  );
}

const ls = StyleSheet.create({
  methods: {
    gap: 10,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.subtleBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  methodRowRTL: {
    flexDirection: 'row-reverse',
  },
  methodRowSelected: {
    backgroundColor: tint(colors.brand, '0D'),
    borderColor: colors.brand,
  },
  methodTile: {
    width: 30,
    height: 30,
  },
  methodBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  methodTitle: {
    ...T.label,
    fontWeight: '600',
    color: colors.label,
  },
  methodDesc: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
  },
});
