import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { PAYMENT_METHODS } from '../../services/paymentPreferences';

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

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
        <Ionicons name="card" size={20} color="#27AE60" />
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

      <View style={styles.paymentOptions}>
        {/* Cash on Delivery */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedMethod === PAYMENT_METHODS.COD && styles.paymentOptionSelected
          ]}
          onPress={() => onMethodChange(PAYMENT_METHODS.COD)}
        >
          <View style={[styles.paymentOptionHeader, isRTL && styles.rowRTL]}>
            <Ionicons
              name={selectedMethod === PAYMENT_METHODS.COD ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selectedMethod === PAYMENT_METHODS.COD ? "#dc2626" : "#C7C7CC"}
            />
            <Text style={[styles.paymentTitle, isRTL && styles.textRTL]}>{t('checkout.cashOnDelivery')}</Text>
          </View>
          <Text style={[styles.paymentDescription, isRTL && styles.paymentDescriptionRTL]}>{t('checkout.payWhenDelivered')}</Text>
        </TouchableOpacity>

        {/* Card Payment (Stripe) */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedMethod === PAYMENT_METHODS.CARD && styles.paymentOptionSelected
          ]}
          onPress={() => onMethodChange(PAYMENT_METHODS.CARD)}
        >
          <View style={[styles.paymentOptionHeader, isRTL && styles.rowRTL]}>
            <Ionicons
              name={selectedMethod === PAYMENT_METHODS.CARD ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selectedMethod === PAYMENT_METHODS.CARD ? "#dc2626" : "#C7C7CC"}
            />
            <Text style={[styles.paymentTitle, isRTL && styles.textRTL]}>{t('checkout.cardPayment')}</Text>
          </View>
          <Text style={[styles.paymentDescription, isRTL && styles.paymentDescriptionRTL]}>{t('checkout.paySecurelyStripe')}</Text>
        </TouchableOpacity>
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
