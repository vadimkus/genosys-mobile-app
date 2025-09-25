import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'MULTI VITA RADIANCE CREAM',
      price: 280,
      quantity: 1,
      image: 'https://genosys.ae/images/products/multi-vita-radiance-cream.jpg'
    },
    {
      id: '2',
      name: 'HR³ MATRIX HAIR SOLUTION',
      price: 450,
      quantity: 1,
      image: 'https://genosys.ae/images/products/hr3-matrix-hair-solution.jpg'
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = () => {
    Alert.alert(
      'Order Placed Successfully!',
      'Your order has been confirmed. You will receive a confirmation email shortly.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home' as never)
        }
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            step >= stepNumber && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepNumber,
              step >= stepNumber && styles.stepNumberActive
            ]}>
              {stepNumber}
            </Text>
          </View>
          {stepNumber < 3 && (
            <View style={[
              styles.stepLine,
              step > stepNumber && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Shipping Information</Text>
      <Text style={styles.stepSubtitle}>Enter your delivery details</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.name}
            onChangeText={(text) => setShippingInfo({...shippingInfo, name: text})}
            placeholder="Enter your full name"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.email}
            onChangeText={(text) => setShippingInfo({...shippingInfo, email: text})}
            placeholder="Enter your email"
            placeholderTextColor="#999999"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.phone}
            onChangeText={(text) => setShippingInfo({...shippingInfo, phone: text})}
            placeholder="Enter your phone number"
            placeholderTextColor="#999999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={shippingInfo.address}
            onChangeText={(text) => setShippingInfo({...shippingInfo, address: text})}
            placeholder="Enter your address"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.input}
              value={shippingInfo.city}
              onChangeText={(text) => setShippingInfo({...shippingInfo, city: text})}
              placeholder="City"
              placeholderTextColor="#999999"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={shippingInfo.postalCode}
              onChangeText={(text) => setShippingInfo({...shippingInfo, postalCode: text})}
              placeholder="Postal Code"
              placeholderTextColor="#999999"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <Text style={styles.stepSubtitle}>Choose your payment option</Text>
      
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'card' && styles.paymentOptionActive
          ]}
          onPress={() => setPaymentMethod('card')}
        >
          <View style={styles.paymentIcon}>
            <Text style={styles.paymentEmoji}>💳</Text>
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Credit/Debit Card</Text>
            <Text style={styles.paymentSubtitle}>Visa, Mastercard, American Express</Text>
          </View>
          <View style={[
            styles.paymentRadio,
            paymentMethod === 'card' && styles.paymentRadioActive
          ]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'apple' && styles.paymentOptionActive
          ]}
          onPress={() => setPaymentMethod('apple')}
        >
          <View style={styles.paymentIcon}>
            <Text style={styles.paymentEmoji}>🍎</Text>
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Apple Pay</Text>
            <Text style={styles.paymentSubtitle}>Pay with Touch ID or Face ID</Text>
          </View>
          <View style={[
            styles.paymentRadio,
            paymentMethod === 'apple' && styles.paymentRadioActive
          ]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'google' && styles.paymentOptionActive
          ]}
          onPress={() => setPaymentMethod('google')}
        >
          <View style={styles.paymentIcon}>
            <Text style={styles.paymentEmoji}>📱</Text>
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Google Pay</Text>
            <Text style={styles.paymentSubtitle}>Quick and secure payment</Text>
          </View>
          <View style={[
            styles.paymentRadio,
            paymentMethod === 'google' && styles.paymentRadioActive
          ]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Order Summary</Text>
      <Text style={styles.stepSubtitle}>Review your order details</Text>
      
      <View style={styles.orderItems}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.orderItemImage}>
              <Text style={styles.orderItemEmoji}>🧴</Text>
            </View>
            <View style={styles.orderItemInfo}>
              <Text style={styles.orderItemName}>{item.name}</Text>
              <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.orderItemPrice}>AED {item.price}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>AED {subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>AED {shipping}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (5%)</Text>
          <Text style={styles.summaryValue}>AED {tax}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>AED {total}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerTotal}>AED {total}</Text>
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {step === 3 ? 'Place Order' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#1a1a1a',
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#1a1a1a',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentOptionActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4ade80',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentEmoji: {
    fontSize: 20,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  paymentRadioActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  orderItems: {
    marginBottom: 24,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  orderItemEmoji: {
    fontSize: 18,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#666666',
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 16,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  nextButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginLeft: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});