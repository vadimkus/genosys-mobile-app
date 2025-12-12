import React, { useState } from 'react';
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

export default function PaymentScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      brand: 'visa',
      last4: '4567',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true,
      holderName: 'John Doe'
    },
    {
      id: 2,
      type: 'card',
      brand: 'mastercard',
      last4: '8901',
      expiryMonth: '08',
      expiryYear: '26',
      isDefault: false,
      holderName: 'John Doe'
    }
  ]);

  const handleAddPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'Payment method setup coming soon!');
  };

  const handleEditPaymentMethod = (methodId) => {
    Alert.alert('Edit Payment Method', `Editing payment method ${methodId} coming soon!`);
  };

  const handleDeletePaymentMethod = (methodId) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(methods => methods.filter(method => method.id !== methodId));
          }
        }
      ]
    );
  };

  const handleSetDefault = (methodId) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const getCardIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return { name: 'card', color: '#1A1F71' };
      case 'mastercard':
        return { name: 'card', color: '#EB001B' };
      case 'amex':
        return { name: 'card', color: '#006FCF' };
      default:
        return { name: 'card-outline', color: '#8E8E93' };
    }
  };

  const PaymentMethodCard = ({ method }) => {
    const cardIcon = getCardIcon(method.brand);
    
    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <View style={styles.cardIconContainer}>
              <Ionicons name={cardIcon.name} size={24} color={cardIcon.color} />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardBrand}>{method.brand.toUpperCase()}</Text>
              <Text style={styles.cardNumber}>•••• {method.last4}</Text>
              <Text style={styles.cardExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
            </View>
          </View>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditPaymentMethod(method.id)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          {!method.isDefault && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.setDefaultButton]}
              onPress={() => handleSetDefault(method.id)}
            >
              <Text style={[styles.actionButtonText, styles.setDefaultText]}>Set Default</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => handleDeletePaymentMethod(method.id)}
          >
            <Text style={[styles.actionButtonText, styles.removeText]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment & Billing</Text>
        <TouchableOpacity onPress={handleAddPaymentMethod} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Manage your payment methods for secure and fast checkout
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </View>

        {/* Add New Payment Method */}
        <TouchableOpacity style={styles.addNewButton} onPress={handleAddPaymentMethod}>
          <View style={styles.addNewContent}>
            <View style={styles.addIconContainer}>
              <Ionicons name="add" size={24} color="#E74C3C" />
            </View>
            <Text style={styles.addNewText}>Add New Payment Method</Text>
          </View>
        </TouchableOpacity>

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

  // Payment Method Cards
  paymentCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 48,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 13,
    color: '#8E8E93',
  },
  defaultBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Card Actions
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E74C3C',
  },
  setDefaultButton: {
    backgroundColor: '#E74C3C',
  },
  setDefaultText: {
    color: '#ffffff',
  },
  removeButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  removeText: {
    color: '#E74C3C',
  },

  // Add New Button
  addNewButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  addNewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addNewText: {
    fontSize: 17,
    color: '#E74C3C',
    fontWeight: '500',
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
