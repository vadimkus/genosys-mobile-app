import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../../services/paymentPreferences';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBilling } from '../../services/databaseService';
import { mediumTap } from '../../utils/haptics';

export default function PaymentScreen() {
  const router = useRouter();
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const token = user?.token || '';
  const [defaultMethod, setDefaultMethodState] = useState(PAYMENT_METHODS.COD);
  const [billingAddress, setBillingAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('');

  const loadBilling = useCallback(async () => {
    if (!token) return;
    const res = await getUserBilling(token).catch(() => null);
    const data = res?.data?.data || res?.data || {};
    setBillingAddress(String(data?.billingAddress || '').trim());
    setVatNumber(String(data?.vatNumber || '').trim());
  }, [token]);

  useEffect(() => {
    (async () => {
      const method = await getDefaultPaymentMethod();
      setDefaultMethodState(method);
    })();
  }, []);

  // Initial load + refresh whenever user returns from the Billing edit screen.
  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  useFocusEffect(
    useCallback(() => {
      loadBilling();
    }, [loadBilling])
  );

  const selectDefault = async (method) => {
    mediumTap();
    try {
      const saved = await setDefaultPaymentMethod(method);
      setDefaultMethodState(saved);
    } catch (e) {
      Alert.alert(t('common.error'), t('paymentSettings.saveError'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/profile')} style={styles.backButton}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('paymentSettings.title')}</Text>
        <View style={styles.addButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('paymentSettings.defaultMethod')}</Text>

          <TouchableOpacity
            style={[styles.methodRow, defaultMethod === PAYMENT_METHODS.COD && styles.methodRowSelected]}
            onPress={() => selectDefault(PAYMENT_METHODS.COD)}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeft}>
              <Ionicons name="cash-outline" size={22} color="#27AE60" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>{t('paymentSettings.cod')}</Text>
                <Text style={styles.methodSubtitle}>{t('paymentSettings.codSubtitle')}</Text>
              </View>
            </View>
            <Ionicons
              name={defaultMethod === PAYMENT_METHODS.COD ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={defaultMethod === PAYMENT_METHODS.COD ? '#dc2626' : '#C7C7CC'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodRow, defaultMethod === PAYMENT_METHODS.CARD && styles.methodRowSelected]}
            onPress={() => selectDefault(PAYMENT_METHODS.CARD)}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeft}>
              <Ionicons name="card-outline" size={22} color="#1D1D1F" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>{t('paymentSettings.card')}</Text>
                <Text style={styles.methodSubtitle}>{t('paymentSettings.cardSubtitle')}</Text>
              </View>
            </View>
            <Ionicons
              name={defaultMethod === PAYMENT_METHODS.CARD ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={defaultMethod === PAYMENT_METHODS.CARD ? '#dc2626' : '#C7C7CC'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="lock-closed" size={18} color="#27AE60" />
          <Text style={styles.noteText}>
            {t('paymentSettings.note')}
          </Text>
        </View>

        {/* Billing Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('paymentSettings.billingInfo')}</Text>
          <View style={styles.billingCard}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>{t('paymentSettings.billingAddress')}</Text>
              <TouchableOpacity onPress={() => router.push('/profile/billing')} activeOpacity={0.7}>
                <Text style={styles.billingLink}>{t('paymentSettings.update')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.billingAddress}>
              {billingAddress ? billingAddress : t('paymentSettings.sameAsShipping')}
            </Text>
            
            <View style={[styles.billingRow, { marginTop: 16 }]}>
              <Text style={styles.billingLabel}>{t('paymentSettings.taxInfo')}</Text>
              {/* single action only: keep "Update" above; tax info is view-only here */}
              <View />
            </View>
            <Text style={styles.billingAddress}>
              {vatNumber ? t('paymentSettings.vatTrn', { vatNumber }) : t('paymentSettings.vatNumberMissing')}
            </Text>
          </View>
        </View>

        {/* Security Information */}
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>{t('paymentSettings.securityPrivacy')}</Text>
          <View style={styles.securityCard}>
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityItemTitle}>{t('paymentSettings.securePayments')}</Text>
                <Text style={styles.securityItemText}>{t('paymentSettings.securePaymentsText')}</Text>
              </View>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="lock-closed" size={20} color="#27AE60" />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityItemTitle}>{t('paymentSettings.dataProtection')}</Text>
                <Text style={styles.securityItemText}>{t('paymentSettings.dataProtectionText')}</Text>
              </View>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="card" size={20} color="#27AE60" />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityItemTitle}>{t('paymentSettings.pci')}</Text>
                <Text style={styles.securityItemText}>{t('paymentSettings.pciText')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  infoText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },

  methodRow: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  methodRowSelected: {
    borderColor: '#dc2626',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingEnd: 12,
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },

  noteBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Billing Information
  billingCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  billingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  billingLink: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '500',
  },
  billingAddress: {
    fontSize: 15,
    color: '#8E8E93',
  },

  // Security Section
  securitySection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  securityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityInfo: {
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  securityItemText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
});
