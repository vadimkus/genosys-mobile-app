import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useLocalization } from '../contexts/LocalizationContext';

/**
 * Apple Pay Button Component
 * 
 * A black button with the Apple logo and "Pay with Apple Pay" text
 * that follows Apple's design guidelines.
 * 
 * Only renders on iOS platform.
 */
export default function ApplePayButton({ onPress, disabled = false, loading = false, style }) {
  const { t } = useLocalization();
  // Apple Pay is iOS-only
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.applePayButton, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {/* Apple Logo */}
      <View style={styles.logoContainer}>
        <Svg width="20" height="24" viewBox="0 0 814 1000">
          <Path
            fill="white"
            d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
          />
        </Svg>
      </View>
      
      {/* Pay with Apple Pay text */}
      <Text style={styles.buttonText}>
        {loading ? t('applePay.processing') : t('applePay.payWithPrefix')}{!loading ? ' ' : ''}
        <Text style={styles.buttonTextBold}>
          {loading ? '' : t('applePay.applePay')}
        </Text>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  applePayButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 56,
  },
  disabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  logoContainer: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  buttonTextBold: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

