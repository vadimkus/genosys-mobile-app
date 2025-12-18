import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { calculateCartTotals } from '../utils/cartUtils';
import { submitCODOrder, submitCardOrder, submitApplePayOrder, generateOrderNumber } from '../services/orderService';
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../services/paymentPreferences';
import { useLocalization } from '../contexts/LocalizationContext';
import { parseGenosysAddress, getAddressLine, formatAddressForDisplay } from '../utils/addressUtils';
import CollapsibleFooter from '../components/CollapsibleFooter';
import EmirateFlagIcon from '../components/checkout/EmirateFlagIcon';
import CheckoutOrderHeaderCard from '../components/checkout/CheckoutOrderHeaderCard';
import { createLogger } from '../utils/logger';
import ApplePayButton from '../components/ApplePayButton';
import { initializeStripe, checkApplePayAvailability, presentApplePaySheet, getStripeConfigStatus } from '../services/applePayService';
import {
  isValidEmail,
  normalizeUaeToNationalDigits,
  formatUaeNationalForInput,
  isValidUaeMobileNational,
  toE164UaePhone,
  getDeliveryEtaInfo,
  computeSavingsAED,
} from '../utils/checkoutFormUtils';

export default function CheckoutScreen() {
  const log = useMemo(() => createLogger('Checkout'), []);
  const { user } = useAuth();
  const { items, getTotalItems, getCartSummary, selectedEmirate, setSelectedEmirate, clearCart, getAvailableEmirates, reloadShippingRates } = useCart();
  const { t, locale } = useLocalization();
  const scrollRef = useRef(null);
  const fieldLayoutsRef = useRef({});
  const sectionLayoutsRef = useRef({ delivery: 0, payment: 0, review: 0 });
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNational, setPhoneNational] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [activeStep, setActiveStep] = useState('delivery'); // delivery | payment | review
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [applePaySupported, setApplePaySupported] = useState(false);
  const [applePayConfigured, setApplePayConfigured] = useState(true);
  const [applePayDebug, setApplePayDebug] = useState(null);
  const [orderNumber] = useState(() => generateOrderNumber()); // provisional; use API-returned orderNumber for confirmations
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(true);

  // Calculate totals
  const cartSummary = getCartSummary();
  const totals = calculateCartTotals(items, user, selectedEmirate, getAvailableEmirates());
  const safeSubtotal = Number(totals.subtotal) || 0;
  const safeShipping = Number(totals.shipping) || 0;
  const safeVat = Number(totals.vatAmount) || 0;
  const safeTotal = Number(totals.total) || 0;
  const savingsAED = computeSavingsAED(items, safeSubtotal);
  const etaInfo = getDeliveryEtaInfo(selectedEmirate);
  const deliveryEtaText = etaInfo.isDubai
    ? t('checkout.deliveryEtaDubai')
    : t('checkout.deliveryEtaOther');

  const errors = useMemo(() => {
    const next = {};
    if (!firstName.trim()) next.firstName = t('checkout.firstNameRequired');
    if (!lastName.trim()) next.lastName = t('checkout.lastNameRequired');
    if (!email.trim()) next.email = t('checkout.emailRequired');
    else if (!isValidEmail(email)) next.email = t('checkout.validationInvalidEmail');
    if (!String(phoneNational || '').trim()) next.phone = t('checkout.phoneRequired');
    else if (!isValidUaeMobileNational(phoneNational)) next.phone = t('addAddress.validationInvalidUaePhone');
    if (!address.trim()) next.address = t('checkout.addressRequired');
    return next;
  }, [firstName, lastName, email, phoneNational, address, t]);

  const showError = (field) => {
    return !!errors[field] && (submitAttempted || touched[field]);
  };

  const openAddressInMaps = async () => {
    const query = String(address || '').trim();
    if (!query) return;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${encodeURIComponent(query)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('checkout.couldNotOpenMaps'));
    }
  };

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

  // Initialize Stripe + detect Apple Pay availability (iOS only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (Platform.OS !== 'ios') {
          if (!cancelled) setApplePaySupported(false);
          return;
        }
        const cfg = getStripeConfigStatus?.() || {};
        if (!cancelled) {
          setApplePayConfigured(!!cfg?.hasPublishableKey);
          setApplePayDebug(cfg);
        }
        if (!cfg?.hasPublishableKey) {
          if (!cancelled) setApplePaySupported(false);
          return;
        }
        await initializeStripe();
        const supported = await checkApplePayAvailability();
        if (!cancelled) setApplePaySupported(!!supported);
      } catch {
        if (!cancelled) setApplePaySupported(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const selectPaymentMethod = async (method) => {
    const safe =
      method === PAYMENT_METHODS.APPLE_PAY
        ? PAYMENT_METHODS.APPLE_PAY
        : method === PAYMENT_METHODS.CARD
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
      // phone: prefer user.phone, else addressDetails.phone (both may be in different formats)
      const phoneRaw = String(user.phone || '').trim() || '';
      const parsed = parseGenosysAddress(user.address || '');
      setAddressDetails(parsed);
      // Show only the clean address line in the text input (no GENOSYS_ADDR_V1 payload)
      setAddress(getAddressLine(parsed || (user.address || '')));

      // If the saved address contains a phone, use it only when profile phone is empty
      const addrPhoneRaw = !phoneRaw && parsed?.phone ? String(parsed.phone) : '';
      const national = normalizeUaeToNationalDigits(phoneRaw || addrPhoneRaw);
      setPhoneNational(national);

      // If saved address contains emirate, pre-select it when possible
      if (parsed?.emirate && typeof setSelectedEmirate === 'function') {
        const next = String(parsed.emirate);
        setSelectedEmirate(next);
      }
    }
  }, [user]);

  const registerFieldLayout = (field) => (e) => {
    const y = e?.nativeEvent?.layout?.y;
    if (typeof y === 'number' && Number.isFinite(y)) {
      fieldLayoutsRef.current[field] = y;
    }
  };

  const registerSectionLayout = (sectionKey) => (e) => {
    const y = e?.nativeEvent?.layout?.y;
    if (typeof y === 'number' && Number.isFinite(y)) {
      sectionLayoutsRef.current[sectionKey] = y;
    }
  };

  const focusFirstInvalidField = async () => {
    const order = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const firstInvalid = order.find((k) => !!errors[k]);
    if (!firstInvalid) return;

    const y = Number(fieldLayoutsRef.current[firstInvalid]);
    if (Number.isFinite(y)) {
      try {
        scrollRef.current?.scrollTo?.({ y: Math.max(0, y - 24), animated: true });
      } catch {
        // ignore
      }
    }

    const refMap = {
      firstName: firstNameRef,
      lastName: lastNameRef,
      email: emailRef,
      phone: phoneRef,
      address: addressRef,
    };
    const targetRef = refMap[firstInvalid];
    setTimeout(() => {
      try {
        targetRef?.current?.focus?.();
      } catch {
        // ignore
      }
    }, 250);
  };

  const triggerEmirateHaptic = async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const Haptics = await import('expo-haptics');
      if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // ignore if module not available
    }
  };

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
    setSubmitAttempted(true);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
    });

    const hasErrors =
      !firstName.trim() ||
      !lastName.trim() ||
      !isValidEmail(email) ||
      !isValidUaeMobileNational(phoneNational) ||
      !address.trim();

    if (hasErrors) {
      await focusFirstInvalidField();
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
        customerPhone: toE164UaePhone(phoneNational),
        customerAddress: landmark.trim()
          ? `${addressFromV1}\nLandmark: ${landmark.trim()}`
          : addressFromV1,
        emirate: selectedEmirate,
        items: items,
        subtotal: safeSubtotal,
        shippingCost: safeShipping,
        vatAmount: safeVat,
        total: safeTotal,
        paymentMethod: selectedPaymentMethod,
        orderNotes: orderNotes.trim(),
        locale: locale || 'en',
        userToken: user?.token || user?.accessToken || null,
      };

      log.info('Submitting order:', {
        orderNumber: orderData.orderNumber,
        paymentMethod: orderData.paymentMethod,
        total: orderData.total,
        itemCount: orderData.items.length
      });

      // Submit order based on payment method
      let result;
      if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
        result = await submitCODOrder(orderData);
      } else if (selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY) {
        if (Platform.OS !== 'ios') {
          Alert.alert(t('applePay.notSupportedTitle'), t('applePay.notSupportedMessage'));
          return;
        }
        if (!applePayConfigured) {
          Alert.alert(t('applePay.notConfiguredTitle'), t('applePay.notConfiguredMessage'));
          return;
        }
        // NOTE: Stripe's isApplePaySupported() can return false on some real devices
        // (e.g. Wallet/cards/networks quirks). We don't hard-block here; we try and surface
        // the real error from Stripe if it fails.
        result = await submitApplePayOrder(orderData);
      } else {
        result = await submitCardOrder(orderData);
      }

      if (result.success) {
        const finalOrderNumber = String(result.orderNumber || orderNumber);
        log.debug('Checkout step success', { success: true, hasPaymentUrl: !!result.paymentUrl });

        // COD: submit immediately (no payment step)
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
          clearCart();
          Alert.alert(
            t('checkout.orderSubmittedTitle'),
            t('checkout.orderSubmittedMessageCOD', { orderNumber: finalOrderNumber }),
            [
              { 
                text: t('checkout.viewOrder'), 
                onPress: () => router.replace('/(tabs)/orders'),
                style: 'default'
              },
              { 
                text: t('checkout.continueShopping'), 
                onPress: () => router.replace('/(tabs)/shop'),
                style: 'cancel'
              }
            ]
          );
          return;
        }

        // Apple Pay: confirm on-device via Stripe RN + client secret
        if (selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY) {
          const clientSecret = String(result.clientSecret || '');
          if (!clientSecret) {
            Alert.alert(t('applePay.failedTitle'), t('applePay.missingClientSecret'));
            return;
          }

          const lineItems = [
            { label: t('checkout.subtotal'), amount: safeSubtotal.toFixed(2), type: 'final' },
            { label: t('checkout.shipping'), amount: safeShipping.toFixed(2), type: 'final' },
          ];

          const payRes = await presentApplePaySheet({
            clientSecret,
            cartItems: items,
            lineItems,
            totalAmount: safeTotal,
            customerInfo: {
              name: orderData.customerName,
              email: orderData.customerEmail,
              phone: orderData.customerPhone,
              address: orderData.customerAddress,
            },
            labels: {
              total: t('checkout.total'),
            },
          });

          if (!payRes?.success) {
            const details =
              payRes?.error?.message ||
              payRes?.error?.localizedMessage ||
              (typeof payRes?.error === 'string' ? payRes.error : '');
            Alert.alert(
              t('applePay.failedTitle'),
              details ? `${t('applePay.failedMessage')}\n\n${details}` : t('applePay.failedMessage')
            );
            return;
          }

          clearCart();
          Alert.alert(
            t('applePay.successTitle'),
            t('applePay.successMessage', { orderNumber: finalOrderNumber }),
            [
              { text: t('checkout.viewOrder'), onPress: () => router.replace('/(tabs)/orders') },
              { text: t('checkout.continueShopping'), onPress: () => router.replace('/(tabs)/shop'), style: 'cancel' },
            ]
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
            orderNumber: String(finalOrderNumber),
            paymentUrl: String(result.paymentUrl),
          },
        });
      } else {
        log.error('Order submission failed', result);
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
      log.error('Order processing error', error?.message || error);
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

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
          <View style={styles.stepsRow}>
            {(['delivery', 'payment', 'review']).map((k) => (
              <View key={k} style={styles.stepItem}>
                <Text style={[styles.stepText, activeStep === k && styles.stepTextActive]}>
                  {k === 'delivery'
                    ? t('checkout.stepDelivery')
                    : k === 'payment'
                      ? t('checkout.stepPayment')
                      : t('checkout.stepReview')}
                </Text>
                {activeStep === k ? <View style={styles.stepUnderline} /> : <View style={styles.stepUnderlineSpacer} />}
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const y = Number(e?.nativeEvent?.contentOffset?.y) || 0;
          const viewportH = Number(e?.nativeEvent?.layoutMeasurement?.height) || 0;
          const contentH = Number(e?.nativeEvent?.contentSize?.height) || 0;
          const deliveryY = Number(sectionLayoutsRef.current.delivery) || 0;
          const paymentY = Number(sectionLayoutsRef.current.payment) || 0;
          const reviewY = Number(sectionLayoutsRef.current.review) || 0;

          // Activate next step slightly before the section top (feels smoother)
          const bias = 80;
          const pos = y + bias;

          let next = 'delivery';
          // If user is near the bottom, always show Review (matches "order summary at the bottom").
          const nearBottom = contentH > 0 && viewportH > 0 && (y + viewportH >= contentH - 120);
          if (nearBottom) next = 'review';
          else if (pos >= reviewY) next = 'review';
          else if (pos >= paymentY) next = 'payment';
          else if (pos >= deliveryY) next = 'delivery';

          if (next !== activeStep) setActiveStep(next);
        }}
      >
        <View style={styles.content}>
          
          {/* Order Summary Header */}
          <CheckoutOrderHeaderCard
            styles={styles}
            orderNumber={orderNumber}
            itemCount={getTotalItems()}
            orderSummaryExpanded={orderSummaryExpanded}
            onToggle={() => setOrderSummaryExpanded((v) => !v)}
            paidItems={paidItems}
            promoItems={promoItems}
            safeSubtotal={safeSubtotal}
            safeShipping={safeShipping}
            safeVat={safeVat}
            safeTotal={safeTotal}
            selectedEmirate={selectedEmirate}
          />

          {/* Shipping Information */}
          <View style={styles.section} onLayout={registerSectionLayout('delivery')}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#E74C3C" />
              <Text style={styles.sectionTitle}>{t('checkout.shippingInformation')}</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf} onLayout={registerFieldLayout('firstName')}>
                <Text style={styles.label}>{t('checkout.firstName')} *</Text>
                <TextInput
                  style={[styles.input, showError('firstName') && styles.inputError]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t('checkout.enterFirstName')}
                  autoCapitalize="words"
                  onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                  ref={firstNameRef}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus?.()}
                />
                {showError('firstName') ? <Text style={styles.helperError}>{errors.firstName}</Text> : null}
              </View>
              <View style={styles.formHalf} onLayout={registerFieldLayout('lastName')}>
                <Text style={styles.label}>{t('checkout.lastName')} *</Text>
                <TextInput
                  style={[styles.input, showError('lastName') && styles.inputError]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t('checkout.enterLastName')}
                  autoCapitalize="words"
                  onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                  ref={lastNameRef}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus?.()}
                />
                {showError('lastName') ? <Text style={styles.helperError}>{errors.lastName}</Text> : null}
              </View>
            </View>

            <View style={styles.formGroup} onLayout={registerFieldLayout('email')}>
              <Text style={styles.label}>{t('checkout.emailAddress')} *</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithRightIcon,
                    showError('email') && styles.inputError,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('checkout.enterEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  ref={emailRef}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus?.()}
                />
                {isValidEmail(email) ? (
                  <View style={styles.inputRightIcon}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  </View>
                ) : null}
              </View>
              {showError('email') ? <Text style={styles.helperError}>{errors.email}</Text> : null}
            </View>

            <View style={styles.formGroup} onLayout={registerFieldLayout('phone')}>
              <Text style={styles.label}>{t('checkout.phoneNumber')} *</Text>
              <View style={styles.phoneRow}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+971</Text>
                </View>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputWithRightIcon,
                      showError('phone') && styles.inputError,
                    ]}
                    value={formatUaeNationalForInput(phoneNational)}
                    onChangeText={(text) => setPhoneNational(normalizeUaeToNationalDigits(text))}
                    placeholder={t('checkout.enterPhone')}
                    keyboardType="phone-pad"
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                    ref={phoneRef}
                    returnKeyType="next"
                    onSubmitEditing={() => addressRef.current?.focus?.()}
                  />
                  {isValidUaeMobileNational(phoneNational) ? (
                    <View style={styles.inputRightIcon}>
                      <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    </View>
                  ) : null}
                </View>
              </View>
              {showError('phone') ? <Text style={styles.helperError}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.formGroup} onLayout={registerFieldLayout('address')}>
              <Text style={styles.label}>{t('checkout.deliveryAddress')} *</Text>
              <TextInput
                style={[styles.input, styles.textArea, showError('address') && styles.inputError]}
                value={address}
                onChangeText={setAddress}
                placeholder={t('checkout.enterAddress')}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onBlur={() => setTouched((p) => ({ ...p, address: true }))}
                ref={addressRef}
              />
              {showError('address') ? <Text style={styles.helperError}>{errors.address}</Text> : null}

              <View style={styles.landmarkWrap}>
                <Text style={styles.label}>{t('checkout.landmarkOptional')}</Text>
                <TextInput
                  style={styles.input}
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder={t('checkout.landmarkPlaceholder')}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.emirate')} *</Text>
              <Text style={styles.deliveryEtaHint}>{deliveryEtaText}</Text>
              <View style={styles.emirateGrid}>
                {getAvailableEmirates().map((emirate) => (
                  <TouchableOpacity
                    key={emirate.name}
                    style={[
                      styles.emirateOption,
                      selectedEmirate === emirate.name && styles.emirateOptionSelected
                    ]}
                    onPress={async () => {
                      await triggerEmirateHaptic();
                      setSelectedEmirate(emirate.name);
                    }}
                  >
                    <View style={styles.emirateTopRow}>
                      <View style={styles.emirateTopLeft}>
                        <EmirateFlagIcon name={emirate.name} />
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.emirateText,
                            selectedEmirate === emirate.name && styles.emirateTextSelected,
                          ]}
                        >
                          {emirate.name}
                        </Text>
                      </View>
                      {selectedEmirate === emirate.name ? (
                        <Ionicons name="checkmark" size={16} color="#E74C3C" />
                      ) : null}
                    </View>
                    <View style={styles.emirateBottomRow}>
                      {(!!totals?.hasFreeShipping || Number(emirate.shippingCost) === 0) ? (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>{t('common.free')}</Text>
                        </View>
                      ) : (
                        <Text style={styles.emirateShipping}>AED {emirate.shippingCost}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section} onLayout={registerSectionLayout('payment')}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={20} color="#27AE60" />
              <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
            </View>

            <Text style={styles.paymentHint}>
              {t('checkout.defaultPaymentMethod')}:{' '}
              <Text style={styles.paymentHintStrong}>
                {selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY
                  ? t('applePay.applePay')
                  : selectedPaymentMethod === PAYMENT_METHODS.CARD
                    ? t('checkout.cardPayment')
                    : t('checkout.cashOnDelivery')}
              </Text>
              {' '}• {t('checkout.tapToChange')}
            </Text>

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

              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY && styles.paymentOptionSelected,
                    (!applePayConfigured) && styles.paymentOptionDisabled,
                  ]}
                  onPress={() => selectPaymentMethod(PAYMENT_METHODS.APPLE_PAY)}
                onLongPress={() => {
                  // Quick diagnostics for TestFlight debugging (no sensitive data; prefix only)
                  try {
                    const info = applePayDebug ? JSON.stringify(applePayDebug, null, 2) : 'No debug info';
                    Alert.alert('Apple Pay Debug', info);
                  } catch {
                    Alert.alert('Apple Pay Debug', 'Unable to render debug info');
                  }
                }}
                >
                  <View style={styles.paymentOptionHeader}>
                    <Ionicons
                      name={selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY ? "#E74C3C" : "#C7C7CC"}
                    />
                    <Ionicons name="logo-apple" size={18} color="#000000" style={{ marginLeft: 8, marginRight: 6 }} />
                    <Text style={styles.paymentTitle}>{t('applePay.applePay')}</Text>
                  </View>
                  <Text style={styles.paymentDescription}>
                    {!applePayConfigured
                      ? t('applePay.notConfiguredShort')
                      : (applePaySupported ? t('applePay.subtitle') : t('applePay.tryShort'))}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.trustRow}>
              <Ionicons name="lock-closed" size={14} color="#6B7280" />
              <Text style={styles.trustText}>{t('checkout.trustStripe')}</Text>
            </View>
            <Text style={styles.trustTextSecondary}>{t('checkout.trustStripeSecondary')}</Text>
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
          <View style={styles.section} onLayout={registerSectionLayout('review')}>
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

            {(() => {
              const freeMaskCount = promoItems.reduce((sum, it) => sum + (Number(it?.quantity) || 1), 0);
              if (!freeMaskCount) return null;
              const msg = freeMaskCount >= 2 ? t('bag.promoApplied2') : t('bag.promoApplied1');
              return (
                <View style={styles.freeShippingBanner}>
                  <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                  <Text style={styles.freeShippingText}>{msg}</Text>
                </View>
              );
            })()}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
              <Text style={styles.totalValue}>AED {safeTotal.toFixed(2)}</Text>
            </View>

            <Text style={styles.vatNote}>*{t('checkout.allPricesVatInclusive')}</Text>
          </View>

        </View>
      </ScrollView>

      {/* Bottom Action */}
      <CollapsibleFooter
        collapsed={footerCollapsed}
        onToggle={() => setFooterCollapsed((v) => !v)}
        chevronCollapsedName="chevron-down"
        chevronExpandedName="chevron-up"
        chevronHitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        chevronSize={20}
        chevronColor="#6B7280"
        containerStyle={[styles.bottomContainer, footerCollapsed && styles.bottomContainerCollapsed]}
        chevronButtonStyle={styles.footerChevronBtn}
        contentStyle={[styles.footerContent, !footerCollapsed && styles.footerContentExpanded]}
        details={
          <View style={styles.footerDetails}>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewText} numberOfLines={2} ellipsizeMode="tail">
                {t('checkout.reviewLine', {
                  emirate: selectedEmirate,
                  payment:
                    selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY
                      ? t('applePay.applePay')
                      : selectedPaymentMethod === PAYMENT_METHODS.CARD
                        ? t('checkout.cardPayment')
                        : t('checkout.cashOnDelivery'),
                  total: safeTotal.toFixed(2),
                })}
              </Text>
            </View>

            <View style={styles.stickySummaryRow}>
              <View style={styles.stickySummaryLeft}>
                <View style={styles.etaPill}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.etaPillText} numberOfLines={1} ellipsizeMode="tail">
                    {deliveryEtaText}
                  </Text>
                </View>
                {savingsAED > 0.5 ? (
                  <View style={styles.savingsPill}>
                    <Ionicons name="pricetag-outline" size={14} color="#16A34A" />
                    <Text style={styles.savingsPillText}>
                      {t('checkout.youSave')} AED {savingsAED.toFixed(2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        }
        action={
          selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY ? (
            <ApplePayButton
              onPress={handleSubmit}
              disabled={!applePayConfigured}
              loading={isProcessing}
              style={[
                styles.placeOrderButton,
                footerCollapsed && styles.placeOrderButtonCollapsed,
              ]}
            />
          ) : (
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                footerCollapsed && styles.placeOrderButtonCollapsed,
                isProcessing && styles.placeOrderButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name="bag-check" size={20} color="#ffffff" />
              )}
              <Text style={styles.placeOrderButtonText}>
                {isProcessing ? t('checkout.processing') : t('checkout.placeOrder')}
              </Text>
            </TouchableOpacity>
          )
        }
      />
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerSteps: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  stepsRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  stepTextActive: {
    color: '#111827',
  },
  stepUnderline: {
    marginTop: 4,
    height: 3,
    width: 26,
    borderRadius: 999,
    backgroundColor: '#16A34A',
  },
  stepUnderlineSpacer: {
    marginTop: 4,
    height: 3,
    width: 26,
    borderRadius: 999,
    backgroundColor: 'transparent',
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1D1D1F',
    backgroundColor: '#ffffff',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phonePrefix: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1D1F',
    letterSpacing: 0.2,
  },
  inputWrap: {
    position: 'relative',
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  inputRightIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  helperError: {
    marginTop: 6,
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pinRowButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pinButtonDisabled: {
    opacity: 0.5,
  },
  pinButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  pinRowButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  landmarkWrap: {
    marginTop: 12,
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
    justifyContent: 'space-between',
  },
  emirateTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
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
  emirateBottomRow: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  emirateShipping: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  deliveryEtaHint: {
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
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
  paymentOptionDisabled: {
    opacity: 0.6,
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
  paymentHint: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: -6,
    marginBottom: 10,
  },
  paymentHintStrong: {
    color: '#1D1D1F',
    fontWeight: '800',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  trustText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  trustTextSecondary: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 22,
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

  // Bottom Action
  bottomContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34, // Safe area
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
    position: 'relative',
  },
  bottomContainerCollapsed: {
    paddingTop: 8,
  },
  footerContent: {
    // Default: no right padding when collapsed
    paddingRight: 0,
    // Reserve vertical space for the absolutely-positioned chevron so it doesn't overlap the CTA.
    // When collapsed, `details` is not rendered and the chevron is position:absolute, so without this
    // the content area has ~0 height and the chevron sits on top of the Place Order button.
    minHeight: 44,
  },
  footerContentExpanded: {
    // When expanded: add whitespace for chevron on right
    paddingRight: 48, // Generous space for chevron (20px icon + 28px buffer)
  },
  footerDetails: {
    position: 'relative',
  },
  footerChevronBtn: {
    position: 'absolute',
    right: 0, // Chevron on RIGHT side
    top: 0, // Align with top
    padding: 8,
    zIndex: 10,
  },
  placeOrderButtonCollapsed: {
    // No extra margin when collapsed
  },
  reviewRow: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    lineHeight: 16,
  },
  stickySummaryRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  stickySummaryLeft: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  savingsPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  etaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'right',
    flexShrink: 1,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 14,
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

