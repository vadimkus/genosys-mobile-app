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
import { useLocalization } from '../contexts/LocalizationContext';
import { parseGenosysAddress, getAddressLine, formatAddressForDisplay } from '../utils/addressUtils';

function EmirateFlagIcon({ name }) {
  const emirate = String(name || '').trim();

  // UAE national flag (used for Fujairah per requirement)
  const UAE = () => (
    <View style={flagStyles.flagBox}>
      <View style={flagStyles.uaeRed} />
      <View style={flagStyles.uaeRight}>
        <View style={[flagStyles.uaeStripe, { backgroundColor: '#00732F' }]} />
        <View style={[flagStyles.uaeStripe, { backgroundColor: '#FFFFFF' }]} />
        <View style={[flagStyles.uaeStripe, { backgroundColor: '#000000' }]} />
      </View>
    </View>
  );

  // Abu Dhabi: red field with a small white canton in the upper hoist corner
  const AbuDhabi = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#D81E05' }]}>
      <View style={flagStyles.abuDhabiCanton} />
    </View>
  );

  // Dubai / Ajman: red field with a vertical white stripe at the hoist
  const DubaiAjman = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#D81E05' }]}>
      <View style={flagStyles.hoistWhiteStripe} />
    </View>
  );

  // Sharjah / Ras Al Khaimah: red rectangle on a white field
  const SharjahRas = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#FFFFFF' }]}>
      <View style={flagStyles.centerRedRect} />
    </View>
  );

  // Umm Al Quwain: red field with a vertical white stripe at hoist and a white crescent + star
  const UmmAlQuwain = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#D81E05' }]}>
      <View style={flagStyles.hoistWhiteStripe} />
      {/* Crescent (approx) */}
      <View style={flagStyles.uaqCrescentOuter} />
      <View style={flagStyles.uaqCrescentInner} />
      {/* Star */}
      <Text style={flagStyles.uaqStar}>★</Text>
    </View>
  );

  if (emirate === 'Fujairah') return <UAE />;
  if (emirate === 'Abu Dhabi') return <AbuDhabi />;
  if (emirate === 'Dubai' || emirate === 'Ajman') return <DubaiAjman />;
  if (emirate === 'Sharjah' || emirate === 'Ras Al Khaimah') return <SharjahRas />;
  if (emirate === 'Umm Al Quwain') return <UmmAlQuwain />;

  return <UAE />;
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, getTotalItems, getCartSummary, selectedEmirate, setSelectedEmirate, clearCart, getAvailableEmirates, reloadShippingRates } = useCart();
  const { t } = useLocalization();
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
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
      const parsed = parseGenosysAddress(user.address || '');
      setAddressDetails(parsed);
      // Show only the clean address line in the text input (no GENOSYS_ADDR_V1 payload)
      setAddress(getAddressLine(parsed || (user.address || '')));

      // If the saved address contains a phone, use it only when profile phone is empty
      if (!String(user.phone || '').trim() && parsed?.phone) {
        setPhone(String(parsed.phone));
      }

      // If saved address contains emirate, pre-select it when possible
      if (parsed?.emirate && typeof setSelectedEmirate === 'function') {
        const next = String(parsed.emirate);
        setSelectedEmirate(next);
      }
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
        t('checkout.loginRequiredTitle'),
        t('checkout.loginRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel', onPress: () => router.back() },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
    }
  }, [user]);

  const handleSubmit = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert(t('common.error') || 'Error', t('checkout.firstNameRequired'));
      return;
    }
    if (!lastName.trim()) {
      Alert.alert(t('common.error') || 'Error', t('checkout.lastNameRequired'));
      return;
    }
    if (!email.trim()) {
      Alert.alert(t('common.error') || 'Error', t('checkout.emailRequired'));
      return;
    }
    if (!phone.trim()) {
      Alert.alert(t('common.error') || 'Error', t('checkout.phoneRequired'));
      return;
    }
    if (!address.trim()) {
      Alert.alert(t('common.error') || 'Error', t('checkout.addressRequired'));
      return;
    }

    setIsProcessing(true);

    try {
      const cleanedAddress = address.trim();
      const addressFromV1 =
        addressDetails &&
        cleanedAddress &&
        String(addressDetails.address || '').trim() &&
        cleanedAddress === String(addressDetails.address || '').trim()
          ? formatAddressForDisplay(addressDetails)
          : cleanedAddress;

      // Prepare order data
      const orderData = {
        orderNumber,
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        customerAddress: addressFromV1,
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
            t('checkout.orderSubmittedTitle'),
            t('checkout.orderSubmittedMessageCOD', { orderNumber }),
            [{ text: t('checkout.continueShopping'), onPress: () => router.replace('/(tabs)/shop') }]
          );
          return;
        }

        // Card (incl. Apple Pay / Google Pay): DO NOT claim success until payment is confirmed.
        if (!result.paymentUrl) {
          Alert.alert(
            t('checkout.paymentLinkUnavailableTitle'),
            t('checkout.paymentLinkUnavailableMessage')
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
          t('checkout.orderSubmissionFailedTitle'),
          result.error || t('checkout.orderProcessingErrorMessage'),
          [
            { text: t('checkout.tryAgain'), style: 'default' },
            { 
              text: t('checkout.contactSupport'), 
              onPress: async () => {
                const phoneNumber = '971585487665';
                const message = `Hi! I need help with placing order ${orderNumber}. Payment method: ${selectedPaymentMethod}. Can you assist me?`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                try {
                  await Linking.openURL(whatsappUrl);
                } catch {
                  Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
                }
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Order processing error:', error);
      Alert.alert(
        t('checkout.orderProcessingErrorTitle'),
        t('checkout.orderProcessingErrorMessage'),
        [
          { text: t('checkout.tryAgain'), style: 'default' },
          { 
            text: t('checkout.contactSupport'), 
            onPress: async () => {
              const phoneNumber = '971585487665';
              const message = `Hi! I encountered an error while placing order ${orderNumber}. Can you help me?`;
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              try {
                await Linking.openURL(whatsappUrl);
              } catch {
                Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
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
      Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
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
        
        <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
        
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
                <Text style={styles.itemCount}>{t('bag.header', { count: getTotalItems(), label: getTotalItems() === 1 ? t('bag.item') : t('bag.items') })}</Text>
              </View>
              <Ionicons
                name={orderSummaryExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>

            {orderSummaryExpanded ? (
              <View style={styles.orderSummaryBody}>
                <Text style={styles.orderSummaryTitle}>{t('checkout.orderSummary')}</Text>

                {paidItems.map((it, idx) => {
                  const name = it.product?.name || 'Item';
                  const qty = Number(it.quantity) || 0;
                  const size = it.selectedSize ? String(it.selectedSize) : '';
                  const color = it.selectedColor ? String(it.selectedColor) : '';
                  const extras = [
                    size && `${t('common.size')}: ${size}`,
                    color && `${t('common.color')}: ${color}`,
                  ]
                    .filter(Boolean)
                    .join(' • ');
                  const price = Number(it.product?.displayPrice ?? it.product?.price ?? 0) || 0;
                  return (
                    <Text key={`${it.product?.id || name}-${idx}`} style={styles.orderSummaryLine}>
                      {qty}× {name}{extras ? ` — ${extras}` : ''} — AED {price.toFixed(2)}
                    </Text>
                  );
                })}

                {promoItems.length ? (
                  <>
                    <Text style={styles.orderSummarySection}>{t('checkout.promotion')}</Text>
                    {promoItems.map((it, idx) => {
                      const name = it.product?.name || 'Promo item';
                      const qty = Number(it.quantity) || 1;
                      const size = it.product?.size ? String(it.product.size) : '';
                      return (
                        <Text key={`${it.product?.id || name}-promo-${idx}`} style={styles.orderSummaryLine}>
                          {qty}× {name}{size ? ` — ${size}` : ''} — {t('common.free')}
                        </Text>
                      );
                    })}
                  </>
                ) : null}

                <View style={styles.orderSummaryDivider} />
                <Text style={styles.orderSummarySection}>{t('checkout.totals')}</Text>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>{t('checkout.subtotal')}</Text>
                  <Text style={styles.orderTotalsValue}>AED {safeSubtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>{t('checkout.shippingTo', { emirate: selectedEmirate })}</Text>
                  <Text style={styles.orderTotalsValue}>{safeShipping === 0 ? t('common.free') : `AED ${safeShipping.toFixed(2)}`}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>{t('checkout.vatIncluded')}</Text>
                  <Text style={styles.orderTotalsValue}>AED {safeVat.toFixed(2)}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabelStrong}>{t('checkout.total')}</Text>
                  <Text style={styles.orderTotalsValueStrong}>AED {safeTotal.toFixed(2)}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Shipping Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#E74C3C" />
              <Text style={styles.sectionTitle}>{t('checkout.shippingInformation')}</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>{t('checkout.firstName')} *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t('checkout.enterFirstName')}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>{t('checkout.lastName')} *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t('checkout.enterLastName')}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.emailAddress')} *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('checkout.enterEmail')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.phoneNumber')} *</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('checkout.enterPhone')}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.deliveryAddress')} *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder={t('checkout.enterAddress')}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.emirate')} *</Text>
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
                    <View style={styles.emirateTopRow}>
                      <EmirateFlagIcon name={emirate.name} />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                        styles.emirateText,
                        selectedEmirate === emirate.name && styles.emirateTextSelected
                      ]}
                      >
                        {emirate.name}
                      </Text>
                    </View>
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
              <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
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
                  <Text style={styles.paymentTitle}>{t('checkout.cashOnDelivery')}</Text>
                </View>
                <Text style={styles.paymentDescription}>{t('checkout.payWhenDelivered')}</Text>
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
                  <Text style={styles.paymentTitle}>{t('checkout.cardPayment')}</Text>
                </View>
                <Text style={styles.paymentDescription}>{t('checkout.paySecurelyStripe')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('checkout.orderNotesOptional')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder={t('checkout.orderNotesPlaceholder')}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t('checkout.subtotal')} ({t('bag.header', { count: getTotalItems(), label: getTotalItems() === 1 ? t('bag.item') : t('bag.items') })})
              </Text>
              <Text style={styles.summaryValue}>AED {safeSubtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.shippingTo', { emirate: selectedEmirate })}</Text>
              <Text style={styles.summaryValue}>
                {safeShipping === 0 ? t('common.free') : `AED ${safeShipping.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.vatIncluded')}</Text>
              <Text style={styles.summaryValue}>AED {safeVat.toFixed(2)}</Text>
            </View>

            {totals.subtotal >= 1000 && (
              <View style={styles.freeShippingBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                <Text style={styles.freeShippingText}>{t('checkout.freeShippingApplied')}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
              <Text style={styles.totalValue}>AED {safeTotal.toFixed(2)}</Text>
            </View>

            <Text style={styles.vatNote}>*{t('checkout.allPricesVatInclusive')}</Text>
          </View>

          {/* Support */}
          <View style={styles.supportSection}>
            <View style={styles.supportHeader}>
              <Ionicons name="chatbubble" size={20} color="#25D366" />
              <Text style={styles.supportTitle}>{t('checkout.needHelp')}</Text>
            </View>
            <Text style={styles.supportText}>{t('checkout.haveQuestions')}</Text>
            <TouchableOpacity style={styles.whatsappButton} onPress={contactWhatsApp}>
              <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
              <Text style={styles.whatsappButtonText}>{t('checkout.contactSupport')}</Text>
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
            {isProcessing ? t('checkout.processing') : `${t('checkout.placeOrder')} - AED ${safeTotal.toFixed(2)}`}
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
    justifyContent: 'space-between',
  },
  emirateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emirateOption: {
    width: '48%',
    minHeight: 56,
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
    flexShrink: 1,
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

const flagStyles = StyleSheet.create({
  flagBox: {
    width: 26,
    height: 18,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
    position: 'relative',
  },

  // UAE
  uaeRed: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '24%',
    backgroundColor: '#CE1126',
  },
  uaeRight: {
    position: 'absolute',
    left: '24%',
    top: 0,
    bottom: 0,
    right: 0,
  },
  uaeStripe: {
    flex: 1,
  },

  // Abu Dhabi
  abuDhabiCanton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '40%',
    height: '45%',
    backgroundColor: '#FFFFFF',
  },

  // Dubai / Ajman / UAQ hoist stripe
  hoistWhiteStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '18%',
    backgroundColor: '#FFFFFF',
  },

  // Sharjah / Ras Al Khaimah
  centerRedRect: {
    position: 'absolute',
    left: '16%',
    top: '18%',
    width: '68%',
    height: '64%',
    backgroundColor: '#D81E05',
  },

  // Umm Al Quwain (approx crescent + star)
  uaqCrescentOuter: {
    position: 'absolute',
    left: '46%',
    top: '30%',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  uaqCrescentInner: {
    position: 'absolute',
    left: '50%',
    top: '30%',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D81E05',
  },
  uaqStar: {
    position: 'absolute',
    left: '58%',
    top: '28%',
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
});

