import React, { useEffect, useState } from 'react';
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
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../../services/paymentPreferences';

export default function PaymentScreen() {
  const router = useRouter();
  const [defaultMethod, setDefaultMethodState] = useState(PAYMENT_METHODS.COD);

  useEffect(() => {
    (async () => {
      const method = await getDefaultPaymentMethod();
      setDefaultMethodState(method);
    })();
  }, []);

  const selectDefault = async (method) => {
    try {
      const saved = await setDefaultPaymentMethod(method);
      setDefaultMethodState(saved);
    } catch (e) {
      Alert.alert('Error', 'Could not save payment preference. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment & Billing</Text>
        <View style={styles.addButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Choose your default payment method for faster checkout
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Payment Method</Text>

          <TouchableOpacity
            style={[styles.methodRow, defaultMethod === PAYMENT_METHODS.COD && styles.methodRowSelected]}
            onPress={() => selectDefault(PAYMENT_METHODS.COD)}
            activeOpacity={0.85}
          >
            <View style={styles.methodLeft}>
              <Ionicons name="cash-outline" size={22} color="#27AE60" />
              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>Cash on Delivery</Text>
                <Text style={styles.methodSubtitle}>Pay when your order is delivered</Text>
              </View>
            </View>
            <Ionicons
              name={defaultMethod === PAYMENT_METHODS.COD ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={defaultMethod === PAYMENT_METHODS.COD ? '#E74C3C' : '#C7C7CC'}
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
                <Text style={styles.methodTitle}>Card (Visa / Mastercard)</Text>
                <Text style={styles.methodSubtitle}>Apple Pay / Google Pay supported (Stripe)</Text>
              </View>
            </View>
            <Ionicons
              name={defaultMethod === PAYMENT_METHODS.CARD ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={defaultMethod === PAYMENT_METHODS.CARD ? '#E74C3C' : '#C7C7CC'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="lock-closed" size={18} color="#27AE60" />
          <Text style={styles.noteText}>
            For security, we don’t store your card details in the app. Card payments are completed via a secure Stripe link during checkout.
          </Text>
        </View>

        {/* Billing Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          <View style={styles.billingCard}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Billing Address</Text>
              <TouchableOpacity>
                <Text style={styles.billingLink}>Update</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.billingAddress}>Same as shipping address</Text>
            
            <View style={[styles.billingRow, { marginTop: 16 }]}>
              <Text style={styles.billingLabel}>Tax Information</Text>
              <TouchableOpacity>
                <Text style={styles.billingLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.billingAddress}>VAT Number: Not provided</Text>
          </View>
        </View>

        {/* Security Information */}
        <View style={styles.securitySection}>
          <Text style={styles.securityTitle}>Security & Privacy</Text>
          <View style={styles.securityCard}>
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#27AE60" />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityItemTitle}>Secure Payments</Text>
                <Text style={styles.securityItemText}>All transactions are encrypted and secure</Text>
              </View>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="lock-closed" size={20} color="#27AE60" />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityItemTitle}>Data Protection</Text>
                <Text style={styles.securityItemText}>Your payment data is never stored on our servers</Text>
              </View>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.securityIcon}>
                <Ionicons name="card" size={20} color="#27AE60" />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityItemTitle}>PCI Compliance</Text>
                <Text style={styles.securityItemText}>We follow industry-standard security practices</Text>
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
    borderColor: '#E74C3C',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
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
    color: '#E74C3C',
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
