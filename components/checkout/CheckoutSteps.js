import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';

/**
 * CheckoutSteps
 *
 * Renders the checkout header with a back button and a step indicator
 * (Delivery → Payment → Review). The active step is determined by
 * scroll position in the parent.
 */
export default function CheckoutSteps({
  activeStep,
  onBack,
  styles,
}) {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  const steps = ['delivery', 'payment', 'review'];

  const stepLabel = (key) => {
    if (key === 'delivery') return t('checkout.stepDelivery');
    if (key === 'payment') return t('checkout.stepPayment');
    return t('checkout.stepReview');
  };

  return (
    <View style={[styles.header, isRTL && styles.headerRTL]}>
      <TouchableOpacity
        style={[styles.backButton, isRTL && styles.backButtonRTL]}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('common.back') || 'Back'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('checkout.title')}</Text>
        <View style={[styles.stepsRow, isRTL && styles.stepsRowRTL]}>
          {steps.map((k) => (
            <View key={k} style={styles.stepItem}>
              <Text style={[styles.stepText, isRTL && styles.textRTL, activeStep === k && styles.stepTextActive]}>
                {stepLabel(k)}
              </Text>
              {activeStep === k ? <View style={styles.stepUnderline} /> : <View style={styles.stepUnderlineSpacer} />}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.headerSpacer} />
    </View>
  );
}
