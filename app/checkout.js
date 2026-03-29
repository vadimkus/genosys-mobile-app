import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { calculateCartTotals, computeWaterfallBreakdown } from '../utils/cartUtils';
import { submitCODOrder, submitCardOrder, generateOrderNumber } from '../services/orderService';
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../services/paymentPreferences';
import { useLocalization } from '../contexts/LocalizationContext';
import { parseGenosysAddress, getAddressLine, formatAddressForDisplay } from '../utils/addressUtils';
import CollapsibleFooter from '../components/CollapsibleFooter';
import * as haptics from '../utils/haptics';
import CheckoutOrderHeaderCard from '../components/checkout/CheckoutOrderHeaderCard';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import CheckoutAddressForm from '../components/checkout/CheckoutAddressForm';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import OrderSummaryCard from '../components/checkout/OrderSummaryCard';
import { createLogger } from '../utils/logger';
import {
  isValidEmail,
  normalizeUaeToNationalDigits,
  formatUaeNationalForInput,
  isValidUaeMobileNational,
  toE164UaePhone,
  getDeliveryEtaInfo,
  computeSavingsAED,
} from '../utils/checkoutFormUtils';
import T from '../utils/typography';

export default function CheckoutScreen() {
  const log = useMemo(() => createLogger('Checkout'), []);
  const { user, getAddresses } = useAuth();
  const { items, getTotalItems, selectedEmirate, setSelectedEmirate, clearCart, getAvailableEmirates, reloadShippingRates, shippingRates } = useCart();
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const scrollRef = useRef(null);
  const fieldLayoutsRef = useRef({});
  const sectionLayoutsRef = useRef({ delivery: 0, payment: 0, review: 0 });
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const userPickedSavedAddressRef = useRef(false);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNational, setPhoneNational] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedAddressPickerOpen, setSavedAddressPickerOpen] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
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
  const submittingRef = useRef(false);
  const [orderNumber] = useState(() => generateOrderNumber()); // provisional; use API-returned orderNumber for confirmations
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(true);
  const [successOrder, setSuccessOrder] = useState(null);
  const successScale = useRef(new Animated.Value(0.8)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const totals = useMemo(() => calculateCartTotals(items, user, selectedEmirate, {
    emirates: getAvailableEmirates(),
    freeShippingThreshold: shippingRates?.freeShippingThreshold,
    vatRate: shippingRates?.vatRate,
  }), [items, user, selectedEmirate, getAvailableEmirates, shippingRates]);
  const safeSubtotal = Number(totals.subtotal) || 0;
  const safeShipping = Number(totals.shipping) || 0;
  const safeVat = Number(totals.vatAmount) || 0;
  const safeTotal = Number(totals.total) || 0;
  const savingsAED = computeSavingsAED(items, safeSubtotal);
  const waterfall = computeWaterfallBreakdown(items, user);
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
        ? `https://maps.apple.com/?q=${encodeURIComponent(query)}`
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
      try {
        const saved = await getDefaultPaymentMethod();
        // If user had Apple Pay saved, fall back to COD (Apple Pay removed)
        if (saved === 'apple_pay') {
          setSelectedPaymentMethod(PAYMENT_METHODS.COD);
        } else {
          setSelectedPaymentMethod(saved || PAYMENT_METHODS.COD);
        }
      } catch {
        setSelectedPaymentMethod(PAYMENT_METHODS.COD);
      }
    })();
  }, []);

  const selectPaymentMethod = async (method) => {
    haptics.mediumTap();
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
    if (userPickedSavedAddressRef.current) return;
    if (user) {
      const nameParts = user.name?.split(' ') || [];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(String(user.contactEmail || user.email || '').trim());
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

  const loadSavedAddresses = useCallback(async () => {
    try {
      const res = await getAddresses?.();
      if (res?.success) {
        setSavedAddresses(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      // ignore
    }
  }, [getAddresses]);

  useEffect(() => {
    loadSavedAddresses();
  }, [loadSavedAddresses]);

  // Refresh saved addresses when returning to Checkout (e.g. after adding/editing an address).
  useFocusEffect(
    useCallback(() => {
      loadSavedAddresses();
    }, [loadSavedAddresses])
  );

  const applySavedAddress = useCallback((addr) => {
    if (!addr) return;
    userPickedSavedAddressRef.current = true;
    setSelectedSavedAddressId(String(addr.id || ''));

    const name = String(addr.name || '').trim();
    const parts = name ? name.split(' ') : [];
    if (parts.length) {
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }

    const national = normalizeUaeToNationalDigits(String(addr.phone || '').trim());
    if (national) setPhoneNational(formatUaeNationalForInput(national));

    setAddressDetails(addr);

    const streetLine = String(addr.address || '').trim();
    const cityPart = String(addr.city || '').trim();
    const emiratePart = String(addr.emirate || '').trim();
    const fullAddress = [streetLine, cityPart, emiratePart].filter(Boolean).join(', ');
    setAddress(fullAddress || streetLine);

    if (addr?.landmark) {
      setLandmark(String(addr.landmark).trim());
    }

    if (addr?.emirate && typeof setSelectedEmirate === 'function') {
      setSelectedEmirate(String(addr.emirate).trim());
    }
  }, [setSelectedEmirate]);

  // Auto-populate the default saved address (or the only saved address) into the form
  useEffect(() => {
    if (userPickedSavedAddressRef.current) return;          // user already picked manually
    if (!savedAddresses || savedAddresses.length === 0) return;

    const defaultAddr = savedAddresses.find(a => a.isDefault === true)
                     || (savedAddresses.length === 1 ? savedAddresses[0] : null);
    if (defaultAddr) {
      applySavedAddress(defaultAddr);
    }
  }, [savedAddresses, applySavedAddress]);

  const getSavedTypeLabel = useCallback((typeRaw) => {
    const k = String(typeRaw || '').trim().toLowerCase();
    if (k === 'work') return t('addAddress.typeWork');
    if (k === 'other') return t('addAddress.typeOther');
    return t('addAddress.typeHome');
  }, [t]);

  const clearSavedAddressSelection = useCallback(() => {
    setSelectedSavedAddressId(null);
    userPickedSavedAddressRef.current = false;
    setAddressDetails(null);
  }, []);

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

  const triggerEmirateHaptic = () => {
    haptics.lightTap();
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
          { text: t('common.login'), onPress: () => router.push('/auth/login') }
        ]
      );
    }
  }, [user]);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    haptics.mediumTap();
    setSubmitAttempted(true);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
    });

    // Block checkout if any paid item has color variants but no color selected
    const itemsMissingColor = paidItems.filter(item => {
      const cv = item?.product?.colorVariants;
      return Array.isArray(cv) && cv.length > 0 && !item.selectedColor;
    });
    // Block checkout if any paid item has multiple size variants but no size selected
    const itemsMissingSize = paidItems.filter(item => {
      const variants = item?.product?.variants;
      if (!Array.isArray(variants)) return false;
      const sizes = variants.filter(v => v?.size && v.size !== 'default' && v.available !== false);
      const uniqueSizes = [...new Set(sizes.map(v => v.size))];
      return uniqueSizes.length > 1 && !item.selectedSize;
    });
    if (itemsMissingColor.length > 0 || itemsMissingSize.length > 0) {
      submittingRef.current = false;
      haptics.warning();
      const allMissing = [...itemsMissingColor, ...itemsMissingSize];
      const uniqueNames = [...new Set(allMissing.map(i => i?.product?.name || i?.product?.title || 'Unknown'))];
      const names = uniqueNames.join(', ');
      const title = itemsMissingColor.length > 0 && itemsMissingSize.length > 0
        ? t('checkout.variantRequiredTitle')
        : itemsMissingColor.length > 0
          ? t('checkout.colorRequiredTitle')
          : t('checkout.sizeRequiredTitle');
      const message = itemsMissingColor.length > 0 && itemsMissingSize.length > 0
        ? t('checkout.variantRequiredMessage', { products: names })
        : itemsMissingColor.length > 0
          ? t('checkout.colorRequiredMessage', { products: names })
          : t('checkout.sizeRequiredMessage', { products: names });
      Alert.alert(
        title,
        message,
        [
          { text: t('checkout.goToBag'), onPress: () => router.replace('/(tabs)/bag') },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
      return;
    }

    const hasErrors =
      !firstName.trim() ||
      !lastName.trim() ||
      !isValidEmail(email) ||
      !isValidUaeMobileNational(phoneNational) ||
      !address.trim();

    if (hasErrors) {
      submittingRef.current = false;
      haptics.warning();
      await focusFirstInvalidField();
      return;
    }

    haptics.mediumTap();
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
      const userDiscountPct = Number(user?.discountPercentage) || 0;
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
        // Discount fields for accurate order records and email templates
        discountPercentage: userDiscountPct,
        discountAmount: 0, // Server recalculates from discountPercentage
        // Bundle discount: computed from "Build Your Set" items in cart
        bundleDiscountPercentage: (() => {
          const bundleItem = items.find(it => it?.fromBundle || it?.product?.fromBundle);
          return Number(bundleItem?.bundleDiscountPercent || bundleItem?.product?.bundleDiscountPercent) || 0;
        })(),
        bundleDiscountAmount: (() => {
          const wf = computeWaterfallBreakdown(items, user);
          return wf?.bundleDiscountTotal || 0;
        })(),
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
      } else {
        result = await submitCardOrder(orderData);
      }

      if (result.success) {
        const finalOrderNumber = String(result.orderNumber || orderNumber);
        log.debug('Checkout step success', { success: true, hasPaymentUrl: !!result.paymentUrl });

        // COD: submit immediately (no payment step)
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
          haptics.success();
          clearCart();
          setSuccessOrder(finalOrderNumber);
          Animated.parallel([
            Animated.spring(successScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]).start();
          return;
        }

        // Card: DO NOT claim success until payment is confirmed.
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
      const errMsg =
        typeof error?.message === 'string'
          ? error.message
          : typeof error === 'string'
            ? error
            : '';

      log.error('Order processing error', errMsg || error);
      Alert.alert(
        t('checkout.orderProcessingErrorTitle'),
        errMsg
          ? `${t('checkout.orderProcessingErrorMessage')}\n\n${errMsg}`
          : t('checkout.orderProcessingErrorMessage'),
        [
          { text: t('checkout.tryAgain'), style: 'default' },
          { 
            text: t('checkout.contactSupport'), 
            onPress: async () => {
              const phoneNumber = '971585487665';
              const message = `Hi! I encountered an error while placing order ${orderNumber}. Payment method: ${selectedPaymentMethod}.${errMsg ? ` Error: ${errMsg}` : ''} Can you help me?`;
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
      submittingRef.current = false;
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

      {/* COD Order Success Modal */}
      <Modal visible={!!successOrder} transparent animationType="none">
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={40} color="#ffffff" />
            </View>

            <Text style={[styles.successTitle, isRTL && { textAlign: 'right' }]}>
              {t('checkout.orderSubmittedTitle')}
            </Text>

            <Text style={[styles.successBody, isRTL && { textAlign: 'right' }]}>
              {t('checkout.orderSubmittedMessageCOD', { orderNumber: successOrder || '' })}
            </Text>

            <TouchableOpacity
              style={styles.successPrimaryBtn}
              activeOpacity={0.85}
              onPress={() => { setSuccessOrder(null); router.replace('/(tabs)/orders'); }}
            >
              <Ionicons name="receipt-outline" size={18} color="#fff" style={{ marginEnd: 6 }} />
              <Text style={styles.successPrimaryText}>{t('checkout.viewOrder')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.successSecondaryBtn}
              activeOpacity={0.7}
              onPress={() => { setSuccessOrder(null); router.replace('/(tabs)/shop'); }}
            >
              <Text style={styles.successSecondaryText}>{t('checkout.continueShopping')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Header with Step Indicator */}
      <CheckoutSteps
        activeStep={activeStep}
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/bag')}
        styles={styles}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            waterfall={waterfall}
          />

          {/* Shipping / Address Form */}
          <CheckoutAddressForm
            firstName={firstName}
            lastName={lastName}
            email={email}
            phoneNational={phoneNational}
            address={address}
            landmark={landmark}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setEmail={setEmail}
            setPhoneNational={setPhoneNational}
            setAddress={setAddress}
            setLandmark={setLandmark}
            errors={errors}
            showError={showError}
            savedAddresses={savedAddresses}
            selectedSavedAddressId={selectedSavedAddressId}
            savedAddressPickerOpen={savedAddressPickerOpen}
            setSavedAddressPickerOpen={setSavedAddressPickerOpen}
            applySavedAddress={applySavedAddress}
            clearSavedAddressSelection={clearSavedAddressSelection}
            loadSavedAddresses={loadSavedAddresses}
            getSavedTypeLabel={getSavedTypeLabel}
            selectedEmirate={selectedEmirate}
            setSelectedEmirate={setSelectedEmirate}
            availableEmirates={getAvailableEmirates()}
            deliveryEtaText={deliveryEtaText}
            hasFreeShipping={totals?.hasFreeShipping}
            totals={totals}
            triggerEmirateHaptic={triggerEmirateHaptic}
            setTouched={setTouched}
            registerFieldLayout={registerFieldLayout}
            registerSectionLayout={registerSectionLayout}
            firstNameRef={firstNameRef}
            lastNameRef={lastNameRef}
            emailRef={emailRef}
            phoneRef={phoneRef}
            addressRef={addressRef}
            styles={styles}
            onNavigateToAddresses={() => router.push('/profile/addresses')}
            openAddressInMaps={openAddressInMaps}
          />

          {/* Payment Method */}
          <View onLayout={registerSectionLayout('payment')}>
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={selectPaymentMethod}
              styles={styles}
            />
          </View>

          {/* Order Notes */}
          <OrderSummaryCard
            orderNotes={orderNotes}
            setOrderNotes={setOrderNotes}
            styles={styles}
          />

          {/* Review section layout anchor (for step indicator scroll detection) */}
          <View onLayout={registerSectionLayout('review')} />

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
          <View style={[styles.footerDetails, isRTL && styles.footerDetailsRTL]}>
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewText, isRTL && styles.textRTL]} numberOfLines={2} ellipsizeMode="tail">
                {t('checkout.reviewLine', {
                  emirate: selectedEmirate,
                  payment:
                    selectedPaymentMethod === PAYMENT_METHODS.CARD
                      ? t('checkout.cardPayment')
                      : t('checkout.cashOnDelivery'),
                  total: safeTotal.toFixed(2),
                })}
              </Text>
            </View>

            <View style={styles.stickySummaryRow}>
              <View style={styles.stickySummaryLeft}>
                <View style={[styles.etaPill, isRTL && styles.rowRTL]}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={[styles.etaPillText, isRTL && styles.textRTL]} numberOfLines={1} ellipsizeMode="tail">
                    {deliveryEtaText}
                  </Text>
                </View>
                {savingsAED > 0.5 ? (
                  <View style={[styles.savingsPill, isRTL && styles.rowRTL]}>
                    <Ionicons name="pricetag-outline" size={14} color="#16A34A" />
                    <Text style={[styles.savingsPillText, isRTL && styles.textRTL]}>
                      {t('checkout.youSave')} AED {savingsAED.toFixed(2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        }
        action={
          <View>
            {/* Order total summary above Place Order button */}
            <View style={[styles.footerTotalRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.footerTotalLabel}>
                {(() => { const c = paidItems.reduce((s, i) => s + (Number(i.quantity) || 1), 0); return `${t('checkout.total') || 'Total'} (${c} ${c === 1 ? (t('checkout.item') || 'item') : (t('checkout.items') || 'items')})`; })()}
              </Text>
              <Text style={styles.footerTotalValue}>{safeTotal.toFixed(2)} AED</Text>
            </View>
            {safeShipping > 0 && (
              <Text style={styles.footerShippingNote}>
                {t('checkout.inclShipping') || 'Incl. shipping'} {safeShipping.toFixed(2)} AED
              </Text>
            )}
            {safeShipping === 0 && safeTotal > 0 && (
              <Text style={[styles.footerShippingNote, { color: '#16A34A' }]}>
                {t('checkout.freeShipping') || 'Free shipping'}
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                footerCollapsed && styles.placeOrderButtonCollapsed,
                isProcessing && styles.placeOrderButtonDisabled,
                isRTL && styles.placeOrderButtonRTL,
              ]}
              onPress={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name="bag-check" size={20} color="#ffffff" />
              )}
              <Text style={[styles.placeOrderButtonText, isRTL && styles.placeOrderButtonTextRTL]}>
                {isProcessing ? t('checkout.processing') : t('checkout.placeOrder')}
              </Text>
            </TouchableOpacity>
          </View>
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
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonRTL: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...T.sectionTitleSmall,
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
    ...T.captionSmall,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  stepsRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
  },
  stepsRowRTL: {
    flexDirection: 'row-reverse',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepText: {
    ...T.captionSmall,
    fontWeight: '700',
    color: '#9CA3AF',
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
    backgroundColor: '#dc2626',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  orderHeaderLeft: {
    flex: 1,
    paddingEnd: 12,
  },
  orderHeaderLeftRTL: {
    alignItems: 'flex-end',
  },
  orderNumber: {
    ...T.mono,
    color: '#ffffff',
  },
  itemCount: {
    ...T.label,
    color: '#ffffff',
    fontWeight: '400',
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
    ...T.label,
    fontWeight: '800',
    marginBottom: 8,
  },
  orderSummarySection: {
    ...T.labelSmall,
    fontWeight: '800',
    marginTop: 10,
  },
  orderSummaryLine: {
    ...T.captionSmall,
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
  orderTotalsRowRTL: {
    flexDirection: 'row-reverse',
  },
  orderTotalsLabel: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#3C3C43',
  },
  orderTotalsValue: {
    ...T.captionSmall,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  orderTotalsLabelStrong: {
    ...T.labelSmall,
    fontWeight: '800',
  },
  orderTotalsValueStrong: {
    ...T.labelSmall,
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
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    ...T.navTitle,
    fontWeight: '700',
  },

  // Form
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formRowRTL: {
    flexDirection: 'row-reverse',
  },
  formHalf: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    ...T.captionSmall,
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
    ...T.input,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  selectInputRTL: {
    flexDirection: 'row-reverse',
  },
  selectText: {
    ...T.input,
    flex: 1,
  },
  selectPlaceholder: {
    color: '#9CA3AF',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneRowRTL: {
    flexDirection: 'row-reverse',
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
    ...T.input,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  inputWrap: {
    position: 'relative',
  },
  inputWithRightIcon: {
    paddingEnd: 44,
  },
  inputRightIcon: {
    position: 'absolute',
    end: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#FFF5F5',
  },
  helperError: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#dc2626',
    marginTop: 6,
  },
  helperErrorRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  // For values that should remain LTR even in Arabic UI (emails, phone numbers)
  inputValueLTR: {
    writingDirection: 'ltr',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  // Saved address picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalCardRTL: {},
  modalOptionRTL: {
    alignItems: 'flex-end',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  modalTitle: {
    ...T.price,
    color: '#111827',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalOptionText: {
    ...T.label,
    fontWeight: '700',
    color: '#dc2626',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  modalAddressRow: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  modalAddressRowRTL: {
    alignItems: 'flex-end',
  },
  modalAddressRowActive: {
    borderColor: '#dc2626',
    backgroundColor: '#FFF5F5',
  },
  modalAddressType: {
    ...T.captionSmall,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  modalAddressName: {
    ...T.labelSmall,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  modalAddressLine: {
    ...T.caption,
    color: '#374151',
  },
  modalAddressMeta: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
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
    ...T.captionSmall,
    fontWeight: '600',
    color: '#007AFF',
  },
  pinRowButtonText: {
    ...T.labelSmall,
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
  emirateGridRTL: {
    flexDirection: 'row-reverse',
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
    paddingEnd: 8,
  },
  emirateTopLeftRTL: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
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
    borderColor: '#dc2626',
    backgroundColor: '#FFF5F5',
  },
  emirateText: {
    ...T.label,
    fontWeight: '500',
    color: '#3C3C43',
    flexShrink: 1,
  },
  emirateTextSelected: {
    color: '#dc2626',
  },
  emirateBottomRow: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  emirateBottomRowRTL: {
    alignItems: 'flex-start',
  },
  emirateShipping: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#8E8E93',
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
    ...T.captionTiny,
    fontWeight: '800',
    color: '#16A34A',
  },
  deliveryEtaHint: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 8,
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
    borderColor: '#dc2626',
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
    ...T.button,
    color: '#1D1D1F',
  },
  paymentDescription: {
    ...T.label,
    fontWeight: '400',
    color: '#8E8E93',
    marginLeft: 32,
  },
  paymentDescriptionRTL: {
    marginLeft: 0,
    marginRight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  paymentHint: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#6B7280',
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
    ...T.captionSmall,
    fontWeight: '600',
    color: '#6B7280',
  },
  trustTextSecondary: {
    ...T.captionSmall,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 6,
    marginLeft: 22,
  },
  trustTextSecondaryRTL: {
    marginLeft: 0,
    marginRight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryRowRTL: {
    flexDirection: 'row-reverse',
  },
  summaryLabel: {
    ...T.summaryLabel,
    color: '#3C3C43',
  },
  summaryValue: {
    ...T.summaryValue,
    fontWeight: '500',
  },
  summaryValueRTL: {
    textAlign: 'left',
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
    ...T.captionSmall,
    fontWeight: '500',
    color: '#27AE60',
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
    ...T.totalLabel,
  },
  totalValue: {
    ...T.totalValue,
    color: '#dc2626',
  },
  vatNote: {
    ...T.captionSmall,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Waterfall discount breakdown styles
  summaryValueStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  summaryLabelDiscount: {
    ...T.summaryValue,
    color: '#7C3AED',
  },
  summaryValueDiscount: {
    ...T.summaryValue,
    color: '#7C3AED',
  },
  summaryLabelIntermediate: {
    ...T.captionSmall,
    color: '#9CA3AF',
  },
  summaryValueIntermediate: {
    ...T.captionSmall,
    color: '#9CA3AF',
  },
  summaryLabelBundle: {
    ...T.summaryValue,
    color: '#16A34A',
  },
  summaryValueBundle: {
    ...T.summaryValue,
    color: '#16A34A',
  },
  summaryDividerLight: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 6,
  },
  summaryLabelBold: {
    ...T.summaryValue,
    fontWeight: '700',
  },
  summaryValueBold: {
    ...T.summaryValue,
    fontWeight: '700',
  },
  summaryValueFree: {
    color: '#16A34A',
    fontWeight: '600',
  },
  vatNoteRed: {
    ...T.captionTiny,
    color: '#dc2626',
    paddingVertical: 2,
  },
  youSavedBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  youSavedText: {
    ...T.labelSmall,
    fontWeight: '700',
    color: '#15803D',
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
    paddingEnd: 0,
    // Reserve vertical space for the absolutely-positioned chevron so it doesn't overlap the CTA.
    // When collapsed, `details` is not rendered and the chevron is position:absolute, so without this
    // the content area has ~0 height and the chevron sits on top of the Place Order button.
    minHeight: 44,
  },
  footerContentExpanded: {
    // When expanded: add whitespace for chevron on right
    paddingEnd: 48, // Generous space for chevron (20px icon + 28px buffer)
  },
  footerDetails: {
    position: 'relative',
  },
  footerChevronBtn: {
    position: 'absolute',
    end: 0, // Chevron on END side (auto-mirrors in RTL)
    top: 0, // Align with top
    padding: 8,
    zIndex: 10,
  },
  placeOrderButtonCollapsed: {
    // No extra margin when collapsed
  },
  footerTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  footerTotalLabel: {
    ...T.label,
    color: '#374151',
  },
  footerTotalValue: {
    ...T.sectionTitleSmall,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0,
  },
  footerShippingNote: {
    ...T.captionTiny,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  reviewRow: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    marginBottom: 12,
  },
  reviewText: {
    ...T.captionSmall,
    fontWeight: '700',
    color: '#6B7280',
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
    ...T.captionSmall,
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
    ...T.captionSmall,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'right',
    flexShrink: 1,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#dc2626',
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
    ...T.buttonLarge,
  },
  // RTL support (footer)
  footerDetailsRTL: {
    alignItems: 'flex-end',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  placeOrderButtonRTL: {
    flexDirection: 'row-reverse',
  },
  placeOrderButtonTextRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 10,
  },
  successBody: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  successPrimaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  successSecondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  successSecondaryText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
});
