import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { calculateCartTotals } from '../utils/cartUtils';
import { submitCODOrder, submitCardOrder, generateOrderNumber } from '../services/orderService';
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../services/paymentPreferences';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, getTotalItems, getCartSummary, selectedEmirate, setSelectedEmirate, clearCart, getAvailableEmirates, reloadShippingRates } = useCart();
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber] = useState(() => generateOrderNumber());
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);

  // Calculate totals
  const cartSummary = getCartSummary();
  const totals = calculateCartTotals(items, user, selectedEmirate, getAvailableEmirates());
  const safeSubtotal = Number(totals.subtotal) || 0;
  const safeShipping = Number(totals.shipping) || 0;
  const safeVat = Number(totals.vatAmount) || 0;
  const safeTotal = Number(totals.total) || 0;

  const isPromoItem = (item) => item?.isPromotionItem === true || item?.selectedSize === '__PROMO__';
  const paidItems = items.filter((it) => !isPromoItem(it));
  const promoItems = items.filter((it) => isPromoItem(it));

  // Always refresh DB-driven shipping rates when opening checkout
  useEffect(() => {
    reloadShippingRates?.();
  }, []);

  // Load default payment method preference
  useEffect(() => {
    (async () => {
      const saved = await getDefaultPaymentMethod();
      setSelectedPaymentMethod(saved);
    })();
  }, []);

  const selectPaymentMethod = async (method) => {
    const safe =
      method === PAYMENT_METHODS.CARD
        ? PAYMENT_METHODS.CARD
        : PAYMENT_METHODS.COD;
    setSelectedPaymentMethod(safe);
    // Persist for next checkout
    try {
      await setDefaultPaymentMethod(safe);
    } catch {
      // ignore preference save failures
    }
  };

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || [];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/(tabs)/bag');
    }
  }, [items.length]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to complete your order.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
    }
  }, [user]);

  const handleSubmit = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address.');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        orderNumber,
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        emirate: selectedEmirate,
        items: items,
        subtotal: safeSubtotal,
        shippingCost: safeShipping,
        vatAmount: safeVat,
        total: safeTotal,
        paymentMethod: selectedPaymentMethod,
        orderNotes: orderNotes.trim(),
        userToken: user?.token || user?.accessToken || null,
      };

      console.log('📦 Submitting order to database and sending emails:', {
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        paymentMethod: orderData.paymentMethod,
        total: orderData.total,
        itemCount: orderData.items.length
      });

      // Submit order based on payment method
      let result;
      if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
        result = await submitCODOrder(orderData);
      } else {
        result = await submitCardOrder(orderData);
      }

      if (result.success) {
        console.log('✅ Checkout step success:', result);

        // COD: submit immediately (no payment step)
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
          clearCart();
          Alert.alert(
            'Order Submitted Successfully!',
            `Your order ${orderNumber} has been placed successfully! You will receive a confirmation email shortly. Pay when your order is delivered.`,
            [{ text: 'Continue Shopping', onPress: () => router.replace('/(tabs)/shop') }]
          );
          return;
        }

        // Card (incl. Apple Pay / Google Pay): DO NOT claim success until payment is confirmed.
        if (!result.paymentUrl) {
          Alert.alert(
            'Payment link unavailable',
            'We could not start the payment flow. Please try again or contact support.'
          );
          return;
        }

        router.push({
          pathname: '/payment/stripe',
          params: {
            orderId: String(result.orderId || ''),
            orderNumber: String(orderNumber),
            paymentUrl: String(result.paymentUrl),
          },
        });
      } else {
        console.error('❌ Order submission failed:', result);
        Alert.alert(
          'Order Submission Failed',
          result.error || 'Failed to submit order. Please try again or contact support.',
          [
            { text: 'Try Again', style: 'default' },
            { 
              text: 'Contact Support', 
              onPress: async () => {
                const phoneNumber = '971585487665';
                const message = `Hi! I need help with placing order ${orderNumber}. Payment method: ${selectedPaymentMethod}. Can you assist me?`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                try {
                  await Linking.openURL(whatsappUrl);
                } catch {
                  Alert.alert('Could not open WhatsApp', 'Please install WhatsApp or try again.');
                }
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Order processing error:', error);
      Alert.alert(
        'Order Processing Error',
        'An unexpected error occurred. Please try again or contact support.',
        [
          { text: 'Try Again', style: 'default' },
          { 
            text: 'Contact Support', 
            onPress: async () => {
              const phoneNumber = '971585487665';
              const message = `Hi! I encountered an error while placing order ${orderNumber}. Can you help me?`;
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              try {
                await Linking.openURL(whatsappUrl);
              } catch {
                Alert.alert('Could not open WhatsApp', 'Please install WhatsApp or try again.');
              }
            }
          }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const contactWhatsApp = () => {
    const phoneNumber = '971585487665';
    const message = `Hi! I need help with my order ${orderNumber}. Can you assist me?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Could not open WhatsApp', 'Please install WhatsApp or try again.');
    });
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Checkout</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Order Summary Header */}
          <View style={styles.orderHeaderCard}>
            <TouchableOpacity
              style={styles.orderHeader}
              onPress={() => setOrderSummaryExpanded((v) => !v)}
              activeOpacity={0.85}
            >
              <View style={styles.orderHeaderLeft}>
                <Text style={styles.orderNumber}>Order {orderNumber}</Text>
                <Text style={styles.itemCount}>{getTotalItems()} items</Text>
              </View>
              <Ionicons
                name={orderSummaryExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>

            {orderSummaryExpanded ? (
              <View style={styles.orderSummaryBody}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>

                {paidItems.map((it, idx) => {
                  const name = it.product?.name || 'Item';
                  const qty = Number(it.quantity) || 0;
                  const size = it.selectedSize ? String(it.selectedSize) : '';
                  const color = it.selectedColor ? String(it.selectedColor) : '';
                  const extras = [size && `Size: ${size}`, color && `Color: ${color}`].filter(Boolean).join(' • ');
                  const price = Number(it.product?.displayPrice ?? it.product?.price ?? 0) || 0;
                  return (
                    <Text key={`${it.product?.id || name}-${idx}`} style={styles.orderSummaryLine}>
                      {qty}× {name}{extras ? ` — ${extras}` : ''} — AED {price.toFixed(2)}
                    </Text>
                  );
                })}

                {promoItems.length ? (
                  <>
                    <Text style={styles.orderSummarySection}>Promotion</Text>
                    {promoItems.map((it, idx) => {
                      const name = it.product?.name || 'Promo item';
                      const qty = Number(it.quantity) || 1;
                      const size = it.product?.size ? String(it.product.size) : '';
                      return (
                        <Text key={`${it.product?.id || name}-promo-${idx}`} style={styles.orderSummaryLine}>
                          {qty}× {name}{size ? ` — ${size}` : ''} — FREE
                        </Text>
                      );
                    })}
                  </>
                ) : null}

                <View style={styles.orderSummaryDivider} />
                <Text style={styles.orderSummarySection}>Totals</Text>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>Subtotal</Text>
                  <Text style={styles.orderTotalsValue}>AED {safeSubtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>Shipping to {selectedEmirate}</Text>
                  <Text style={styles.orderTotalsValue}>{safeShipping === 0 ? 'FREE' : `AED ${safeShipping.toFixed(2)}`}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>VAT (included)</Text>
                  <Text style={styles.orderTotalsValue}>AED {safeVat.toFixed(2)}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabelStrong}>Total</Text>
                  <Text style={styles.orderTotalsValueStrong}>AED {safeTotal.toFixed(2)}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Shipping Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#E74C3C" />
              <Text style={styles.sectionTitle}>Shipping Information</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter last name"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Delivery Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your complete delivery address"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Emirate *</Text>
              <View style={styles.emirateGrid}>
                {getAvailableEmirates().map((emirate) => (
                  <TouchableOpacity
                    key={emirate.name}
                    style={[
                      styles.emirateOption,
                      selectedEmirate === emirate.name && styles.emirateOptionSelected
                    ]}
                    onPress={() => setSelectedEmirate(emirate.name)}
                  >
                    <Text style={[
                      styles.emirateText,
                      selectedEmirate === emirate.name && styles.emirateTextSelected
                    ]}>
                      {emirate.name}
                    </Text>
                    <Text style={[
                      styles.emirateShipping,
                      selectedEmirate === emirate.name && styles.emirateTextSelected
                    ]}>
                      AED {emirate.shippingCost}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={20} color="#27AE60" />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === PAYMENT_METHODS.COD && styles.paymentOptionSelected
                ]}
                onPress={() => selectPaymentMethod(PAYMENT_METHODS.COD)}
              >
                <View style={styles.paymentOptionHeader}>
                  <Ionicons 
                    name={selectedPaymentMethod === PAYMENT_METHODS.COD ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedPaymentMethod === PAYMENT_METHODS.COD ? "#E74C3C" : "#C7C7CC"} 
                  />
                  <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                </View>
                <Text style={styles.paymentDescription}>Pay when your order is delivered</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === PAYMENT_METHODS.CARD && styles.paymentOptionSelected
                ]}
                onPress={() => selectPaymentMethod(PAYMENT_METHODS.CARD)}
              >
                <View style={styles.paymentOptionHeader}>
                  <Ionicons 
                    name={selectedPaymentMethod === PAYMENT_METHODS.CARD ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedPaymentMethod === PAYMENT_METHODS.CARD ? "#E74C3C" : "#C7C7CC"} 
                  />
                  <Text style={styles.paymentTitle}>Card Payment</Text>
                </View>
                <Text style={styles.paymentDescription}>Pay securely with Card • Apple Pay • Google Pay (Stripe)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Order Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Any special instructions for your order..."
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</Text>
              <Text style={styles.summaryValue}>AED {safeSubtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping to {selectedEmirate}</Text>
              <Text style={styles.summaryValue}>
                {safeShipping === 0 ? 'FREE' : `AED ${safeShipping.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (included)</Text>
              <Text style={styles.summaryValue}>AED {safeVat.toFixed(2)}</Text>
            </View>

            {totals.subtotal >= 1000 && (
              <View style={styles.freeShippingBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                <Text style={styles.freeShippingText}>Free shipping applied!</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>AED {safeTotal.toFixed(2)}</Text>
            </View>

            <Text style={styles.vatNote}>*All prices are VAT inclusive</Text>
          </View>

          {/* Support */}
          <View style={styles.supportSection}>
            <View style={styles.supportHeader}>
              <Ionicons name="chatbubble" size={20} color="#25D366" />
              <Text style={styles.supportTitle}>Need Help?</Text>
            </View>
            <Text style={styles.supportText}>Have questions about your order?</Text>
            <TouchableOpacity style={styles.whatsappButton} onPress={contactWhatsApp}>
              <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
              <Text style={styles.whatsappButtonText}>Contact Support via WhatsApp</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
          onPress={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons name="bag-check" size={20} color="#ffffff" />
          )}
          <Text style={styles.placeOrderButtonText}>
            {isProcessing ? 'Processing...' : `Place Order - AED ${safeTotal.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  
  // Order Header
  orderHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  orderHeader: {
    backgroundColor: '#E74C3C',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  itemCount: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  orderSummaryBody: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    padding: 14,
    paddingTop: 12,
  },
  orderSummaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  orderSummarySection: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  orderSummaryLine: {
    fontSize: 12,
    color: '#3C3C43',
    lineHeight: 18,
    marginBottom: 4,
  },
  orderSummaryDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 10,
    marginBottom: 6,
  },
  orderTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderTotalsLabel: {
    fontSize: 12,
    color: '#3C3C43',
    fontWeight: '600',
  },
  orderTotalsValue: {
    fontSize: 12,
    color: '#1D1D1F',
    fontWeight: '700',
  },
  orderTotalsLabelStrong: {
    fontSize: 13,
    color: '#1D1D1F',
    fontWeight: '800',
  },
  orderTotalsValueStrong: {
    fontSize: 13,
    color: '#1D1D1F',
    fontWeight: '900',
  },

  // Section
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },

  // Form
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formHalf: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1D1D1F',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },

  // Emirates
  emirateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emirateOption: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  emirateOptionSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  emirateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
  },
  emirateTextSelected: {
    color: '#E74C3C',
  },
  emirateShipping: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },

  // Payment
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  paymentOptionSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 32,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#3C3C43',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  freeShippingText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
  },
  vatNote: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Support
  supportSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 20,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  supportText: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 12,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Bottom Action
  bottomContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: 34, // Safe area
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});

