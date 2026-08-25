import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { success as successHaptic } from '../utils/haptics';
import T from '../utils/typography';
import CheckoutSteps from './checkout/CheckoutSteps';
import { colors } from '../utils/theme';

/**
 * Full-screen animated order-success confirmation.
 *
 * Shared by the card / Apple Pay flow (`app/payment/stripe.js`) and the COD
 * flow (`app/checkout.js`) so both confirmations are visually identical.
 * Self-animates (spring check-in + fade/lift) and fires a success haptic once
 * on mount.
 */
export default function OrderSuccessScreen({
  title,
  message,
  viewOrderLabel,
  continueLabel,
  onViewOrder,
  onContinueShopping,
}) {
  const checkScale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    successHaptic();
    Animated.parallel([
      Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 320, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [checkScale, fade, lift]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressWrap}>
        <CheckoutSteps currentStep="confirmed" />
      </View>

      <View style={styles.successContent}>
        <Animated.View style={[styles.circle, { transform: [{ scale: checkScale }] }]}>
          <Ionicons name="checkmark-sharp" size={56} color={colors.white} />
        </Animated.View>
        <Animated.View style={[styles.body, { opacity: fade, transform: [{ translateY: lift }] }]}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity style={styles.primary} onPress={onViewOrder} activeOpacity={0.85}>
            <Text style={styles.primaryText}>{viewOrderLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={onContinueShopping} activeOpacity={0.7}>
            <Text style={styles.secondaryText}>{continueLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    paddingHorizontal: 24,
  },
  progressWrap: {
    paddingTop: 8,
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  circle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#16a34a',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  body: { alignSelf: 'stretch', alignItems: 'center' },
  title: { ...T.sectionTitle, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  message: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  primary: {
    alignSelf: 'stretch',
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: { ...T.buttonSmall, fontSize: 16, fontWeight: '700', color: colors.white },
  secondary: { alignSelf: 'stretch', paddingVertical: 14, marginTop: 8, alignItems: 'center' },
  secondaryText: { ...T.buttonSmall, fontSize: 15, fontWeight: '600', color: colors.secondaryLabel },
});
