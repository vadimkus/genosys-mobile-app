import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { user } = useStore();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { theme } = useTheme();
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'UAE',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
      Alert.alert('Missing Information', 'Please fill in all required shipping details.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Order Placed Successfully!',
        `Your order for ${getTotalItems()} items (AED ${getTotalPrice().toFixed(2)}) has been placed.`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.navigate('MainTabs', { screen: 'Orders' });
            }
          }
        ]
      );
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Add some products to checkout</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>Complete your purchase</Text>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Items: {getTotalItems()}</Text>
          <Text style={styles.summaryText}>Subtotal: AED {getTotalPrice().toFixed(2)}</Text>
          <Text style={styles.summaryText}>Shipping: AED 0.00</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>AED {getTotalPrice().toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Shipping Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="First Name"
            value={shippingInfo.firstName}
            onChangeText={(text) => setShippingInfo({...shippingInfo, firstName: text})}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Last Name"
            value={shippingInfo.lastName}
            onChangeText={(text) => setShippingInfo({...shippingInfo, lastName: text})}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={shippingInfo.email}
          onChangeText={(text) => setShippingInfo({...shippingInfo, email: text})}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={shippingInfo.phone}
          onChangeText={(text) => setShippingInfo({...shippingInfo, phone: text})}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={shippingInfo.address}
          onChangeText={(text) => setShippingInfo({...shippingInfo, address: text})}
          multiline
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="City"
            value={shippingInfo.city}
            onChangeText={(text) => setShippingInfo({...shippingInfo, city: text})}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Postal Code"
            value={shippingInfo.postalCode}
            onChangeText={(text) => setShippingInfo({...shippingInfo, postalCode: text})}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Country"
          value={shippingInfo.country}
          onChangeText={(text) => setShippingInfo({...shippingInfo, country: text})}
        />
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionSelected]}
          onPress={() => setPaymentMethod('card')}
        >
          <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextSelected]}>
            💳 Credit/Debit Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionSelected]}
          onPress={() => setPaymentMethod('cod')}
        >
          <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextSelected]}>
            💰 Cash on Delivery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Text style={styles.placeOrderButtonText}>
            {isProcessing ? 'Processing...' : `Place Order - AED ${getTotalPrice().toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryContainer: {
    gap: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  paymentOptionSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  paymentText: {
    fontSize: 16,
    color: '#6b7280',
  },
  paymentTextSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  placeOrderButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
