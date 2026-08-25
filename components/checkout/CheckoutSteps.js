import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import { colors } from '../../utils/theme';

/**
 * CheckoutSteps
 *
 * Journey-level checkout progress shared by Bag, Checkout, and the order
 * confirmation screen. Mirrors the website flow:
 * Cart → Details & payment → Confirmation.
 */
export default function CheckoutSteps({
  currentStep,
  onCartPress,
  style,
}) {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const steps = [
    { key: 'cart', label: t('checkout.progressCart') },
    { key: 'checkout', label: t('checkout.progressCheckout') },
    { key: 'confirmed', label: t('checkout.progressConfirmation') },
  ];
  const currentIndex = Math.max(0, steps.findIndex((step) => step.key === currentStep));

  const statusLabel = (index) => {
    if (index < currentIndex) return t('checkout.progressCompleted');
    if (index === currentIndex) return t('checkout.progressCurrent');
    return t('checkout.progressUpcoming');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.metaRow, isRTL && styles.rowRTL]}>
        <View style={[styles.secureRow, isRTL && styles.rowRTL]}>
          <Ionicons name="lock-closed" size={13} color={colors.greenDeep} />
          <Text style={styles.secureText}>{t('checkout.secureCheckout')}</Text>
        </View>
        <Text style={styles.countText}>
          {t('checkout.progressStepCount', {
            current: currentIndex + 1,
            total: steps.length,
          })}
        </Text>
      </View>

      <View style={[styles.stepsRow, isRTL && styles.rowRTL]}>
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          const active = index <= currentIndex;
          const canReturnToCart = currentStep === 'checkout' && step.key === 'cart' && onCartPress;
          const StepContainer = canReturnToCart ? TouchableOpacity : View;

          return (
            <StepContainer
              key={step.key}
              style={styles.step}
              {...(canReturnToCart
                ? {
                    onPress: onCartPress,
                    activeOpacity: 0.65,
                    accessibilityRole: 'button',
                    accessibilityHint: t('checkout.progressEditCart'),
                  }
                : {})}
              accessible
              accessibilityLabel={`${step.label}, ${statusLabel(index)}`}
              accessibilityState={{ selected: current }}
            >
              <View style={[styles.segment, active && styles.segmentActive]} />
              <View style={[styles.labelRow, isRTL && styles.rowRTL]}>
                <View style={[styles.marker, active && styles.markerActive]}>
                  {completed ? (
                    <Ionicons name="checkmark" size={12} color={colors.greenDeep} />
                  ) : (
                    <Text style={[styles.markerText, active && styles.markerTextActive]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.stepLabel,
                    active && styles.stepLabelActive,
                    current && styles.stepLabelCurrent,
                    isRTL && styles.textRTL,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            </StepContainer>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.greenDeep,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondaryLabel,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  step: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
  },
  segment: {
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.separator,
  },
  segmentActive: {
    backgroundColor: colors.greenDeep,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fillSecondary,
  },
  markerActive: {
    backgroundColor: colors.greenBg,
  },
  markerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondaryLabel,
  },
  markerTextActive: {
    color: colors.greenDeep,
  },
  stepLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    fontWeight: '600',
    color: colors.secondaryLabel,
  },
  stepLabelActive: {
    color: colors.greenDeep,
  },
  stepLabelCurrent: {
    fontWeight: '800',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
