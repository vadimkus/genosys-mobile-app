import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { calculateCartTotals, computeWaterfallBreakdown } from '../utils/cartUtils';
import { fetchMembership } from '../services/api';
import { submitCODOrder, createCardPaymentSheetIntent, generateOrderNumber } from '../services/orderService';
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../services/paymentPreferences';
import { captureException } from '../config/sentry';
import { useLocalization } from '../contexts/LocalizationContext';
import { formatAddressForDisplay } from '../utils/addressUtils';
import { extractProductOptions, isProductSelectionComplete } from '../utils/productOptions';
import { normalizeUserProfile } from '../utils/userProfile';
import CollapsibleHeader, { useCollapsibleHeader } from '../components/CollapsibleHeader';
import * as haptics from '../utils/haptics';
import CheckoutOrderHeaderCard from '../components/checkout/CheckoutOrderHeaderCard';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSuccessScreen from '../components/OrderSuccessScreen';
import CheckoutAddressForm from '../components/checkout/CheckoutAddressForm';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import RewardsRedemptionCard from '../components/checkout/RewardsRedemptionCard';
import OrderSummaryCard from '../components/checkout/OrderSummaryCard';
import { createLogger } from '../utils/logger';
import {
  isValidEmail,
  normalizeUaeToNationalDigits,
  formatUaeNationalForInput,
  isValidUaeMobileNational,
  toE164UaePhone,
  getDeliveryEtaInfo,
} from '../utils/checkoutFormUtils';
import T from '../utils/typography';
import { colors, shadow, surfaces } from '../utils/theme';
import { withErrorBoundary } from '../components/ErrorBoundary';
import { openWhatsApp } from '../utils/support';
import { startOrderActivityForNewOrder } from '../utils/orderLiveActivity';
import { saveLiveActivityToken } from '../services/pushNotificationsService';

function CheckoutScreen() {
  const log = useMemo(() => createLogger('Checkout'), []);
  const { user, getAddresses } = useAuth();
  const { items, getTotalItems, selectedEmirate, setSelectedEmirate, clearCart, getAvailableEmirates, reloadShippingRates, shippingRates } = useCart();
  const { t, locale, dir } = useLocalization();
  // Order failures arrive from the service as a code; the sentence lives in
  // the catalogue so RU and AR users are not shown English under a translated
  // line. Unknown or missing code: nothing, and the caller falls back.
  const orderErrorText = (code) =>
    code && ['timeout', 'card', 'resume', 'generic'].includes(code) ? t(`checkout.orderErrors.${code}`) : '';
  const isRTL = dir === 'rtl';
  const { onScroll, headerHeight, insets } = useCollapsibleHeader();
  // Subtle entrance motion (matches OrderSuccessScreen / orders detail feel).
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;
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
  // Default to CARD on first render (matches web checkout). If the user has
  // explicitly saved a preference (including 'cod'), the effect below restores it.
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.CARD);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const submittingRef = useRef(false);
  const [orderNumber] = useState(() => generateOrderNumber()); // provisional; use API-returned orderNumber for confirmations
  // Server-issued canonical order number from the first (failed or successful)
  // card-intent attempt. Re-sending it on retry makes the server update the
  // same PENDING order + reuse its PaymentIntent instead of creating duplicates.
  const serverOrderNumberRef = useRef('');
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const totals = useMemo(() => calculateCartTotals(items, user, selectedEmirate, {
    emirates: getAvailableEmirates(),
    freeShippingThreshold: shippingRates?.freeShippingThreshold,
    vatRate: shippingRates?.vatRate,
  }), [items, user, selectedEmirate, getAvailableEmirates, shippingRates]);
  const safeSubtotal = Number(totals.subtotal) || 0;
  const safeShipping = Number(totals.shipping) || 0;
  const waterfall = computeWaterfallBreakdown(items, user);

  // ─── GENOSYS Rewards redemption ───────────────────────────────────────
  // Mirrors server rules (lib/loyalty.ts): blocks of 100 pts = AED 5, capped
  // at 20% of the product subtotal, not combinable with a personal discount.
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [loyaltyMultiplier, setLoyaltyMultiplier] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = user?.token || user?.accessToken;
      if (!token) return;
      const membership = await fetchMembership(token);
      if (!cancelled && membership?.track === 'REWARDS') {
        setLoyaltyBalance(Number(membership?.points?.balance || 0));
        setLoyaltyMultiplier(Number(membership?.multiplier || 1));
      }
    })();
    return () => { cancelled = true; };
  }, [user?.token, user?.accessToken]);

  const computeRedeemQuote = useCallback((productSubtotal) => {
    // Mirrors server rule: only an ACTIVE discount (type + percentage) blocks redemption
    const canUse = !(user?.discountType && Number(user?.discountPercentage || 0) > 0);
    if (!canUse) return { points: 0, aed: 0 };
    const blocks = Math.max(0, Math.min(
      Math.floor(loyaltyBalance / 100),
      Math.floor((Number(productSubtotal) * 0.2) / 5),
    ));
    return { points: blocks * 100, aed: blocks * 5 };
  }, [user?.discountType, user?.discountPercentage, loyaltyBalance]);

  const redeemQuote = computeRedeemQuote(safeSubtotal);
  const loyaltyDiscount = usePoints && redeemQuote.points > 0 ? redeemQuote.aed : 0;

  // Display totals: redemption reduces the final total; VAT is the included portion.
  const displayVatRate = (Number.isFinite(Number(shippingRates?.vatRate)) && Number(shippingRates?.vatRate) >= 0)
    ? Number(shippingRates.vatRate)
    : 0.05;
  const safeTotal = Math.max(0, Math.round(((Number(totals.total) || 0) - loyaltyDiscount) * 100) / 100);
  const safeVat = loyaltyDiscount > 0
    ? Math.round(((safeTotal * displayVatRate) / (1 + displayVatRate)) * 100) / 100
    : (Number(totals.vatAmount) || 0);
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

  // Subtle fade + lift on mount.
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  // Load default payment method preference. First-time users default to CARD
  // to match the web checkout; existing users keep whatever they last selected.
  useEffect(() => {
    (async () => {
      try {
        const saved = await getDefaultPaymentMethod();
        // Legacy value cleanup (Apple Pay was removed) - fall back to CARD.
        if (saved === 'apple_pay') {
          setSelectedPaymentMethod(PAYMENT_METHODS.CARD);
        } else {
          setSelectedPaymentMethod(saved || PAYMENT_METHODS.CARD);
        }
      } catch {
        setSelectedPaymentMethod(PAYMENT_METHODS.CARD);
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
      const profile = normalizeUserProfile(user);
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setEmail(profile.primaryEmail);
      setAddressDetails(profile.addressDetails);
      setAddress(profile.addressLine);

      const national = normalizeUaeToNationalDigits(profile.phone);
      setPhoneNational(national);

      // If saved address contains emirate, pre-select it when possible
      if (profile.emirate && typeof setSelectedEmirate === 'function') {
        setSelectedEmirate(profile.emirate);
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

  // Redirect if cart is empty (but not when showing success modal)
  useEffect(() => {
    if (items.length === 0 && !successOrder) {
      router.replace('/(tabs)/bag');
    }
  }, [items.length, successOrder]);

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

    // Block checkout if any paid item is missing a required canonical option.
    const itemsMissingColor = paidItems.filter(item => {
      const model = extractProductOptions(item?.product);
      return model.required.color && !item.selectedColor;
    });
    const itemsMissingSize = paidItems.filter(item => {
      const model = extractProductOptions(item?.product);
      return model.required.size && !item.selectedSize;
    });
    const itemsWithInvalidSelections = paidItems.filter(item =>
      !isProductSelectionComplete(item?.product, {
        selectedColor: item?.selectedColor,
        selectedSize: item?.selectedSize,
      })
    );
    if (itemsMissingColor.length > 0 || itemsMissingSize.length > 0 || itemsWithInvalidSelections.length > 0) {
      submittingRef.current = false;
      haptics.warning();
      const allMissing = [...itemsMissingColor, ...itemsMissingSize, ...itemsWithInvalidSelections];
      const uniqueNames = [...new Set(allMissing.map(i => i?.product?.name || i?.product?.title || 'Unknown'))];
      const names = uniqueNames.join(', ');
      const hasGeneralInvalidSelection =
        itemsWithInvalidSelections.length > 0 &&
        itemsMissingColor.length === 0 &&
        itemsMissingSize.length === 0;
      const title = (itemsMissingColor.length > 0 && itemsMissingSize.length > 0) || hasGeneralInvalidSelection
        ? t('checkout.variantRequiredTitle')
        : itemsMissingColor.length > 0
          ? t('checkout.colorRequiredTitle')
          : t('checkout.sizeRequiredTitle');
      const message = (itemsMissingColor.length > 0 && itemsMissingSize.length > 0) || hasGeneralInvalidSelection
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

      // Recompute totals immediately before submission so saved carts don't submit stale numbers.
      const finalTotals = calculateCartTotals(items, user, selectedEmirate, {
        emirates: getAvailableEmirates(),
        freeShippingThreshold: shippingRates?.freeShippingThreshold,
        vatRate: shippingRates?.vatRate,
      });
      const finalWaterfall = computeWaterfallBreakdown(items, user);

      // Guard: never submit an order with no paid items or a non-positive total
      // (e.g. a cart holding only promo items after a startup race).
      if (paidItems.length === 0 || !(Number(finalTotals.total) > 0)) {
        haptics.warning();
        Alert.alert(
          t('checkout.orderSubmissionFailedTitle'),
          t('checkout.orderProcessingErrorMessage'),
          [{ text: t('checkout.goToBag'), onPress: () => router.replace('/(tabs)/bag') }]
        );
        return;
      }

      // Prepare order data. Backend remains the pricing authority; these totals are client hints
      // and must match the cart snapshot being submitted.
      const rawUserDiscountPct = Number(user?.discountPercentage);
      const userDiscountPct =
        user?.discountType && Number.isFinite(rawUserDiscountPct) && rawUserDiscountPct > 0 && rawUserDiscountPct < 100
          ? rawUserDiscountPct
          : 0;
      // Redemption quote against the just-recomputed subtotal (server re-validates)
      const finalRedeemQuote = usePoints
        ? computeRedeemQuote(Number(finalTotals.subtotal) || 0)
        : { points: 0, aed: 0 };

      const orderData = {
        // Reuse the server-issued number on retries (idempotent card flow);
        // first attempt sends the provisional one, which the server replaces.
        orderNumber: serverOrderNumberRef.current || orderNumber,
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        customerEmail: email.trim(),
        customerPhone: toE164UaePhone(phoneNational),
        customerAddress: landmark.trim()
          ? `${addressFromV1}\nLandmark: ${landmark.trim()}`
          : addressFromV1,
        emirate: selectedEmirate,
        items: items,
        subtotal: Number(finalTotals.subtotal) || 0,
        shippingCost: Number(finalTotals.shipping) || 0,
        vatAmount: Number(finalTotals.vatAmount) || 0,
        total: Math.max(0, Math.round(((Number(finalTotals.total) || 0) - finalRedeemQuote.aed) * 100) / 100),
        // GENOSYS Rewards points to redeem (server validates and clamps)
        ...(finalRedeemQuote.points > 0 ? { redeemPoints: finalRedeemQuote.points } : {}),
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
          return finalWaterfall?.bundleDiscountTotal || 0;
        })(),
        clientPricingSnapshot: {
          retailTotal: finalWaterfall?.retailTotal || 0,
          userDiscountTotal: finalWaterfall?.userDiscountTotal || 0,
          bundleDiscountTotal: finalWaterfall?.bundleDiscountTotal || 0,
          source: 'mobile-pre-submit',
        },
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
        // Card / Apple Pay / Google Pay / Link via the native Stripe Payment Sheet.
        result = await createCardPaymentSheetIntent(orderData);
      }

      if (result.success) {
        const finalOrderNumber = String(result.orderNumber || orderNumber);
        // Remember the canonical server order number so any retry updates the
        // same PENDING order instead of creating a duplicate.
        if (selectedPaymentMethod !== PAYMENT_METHODS.COD && result.orderNumber) {
          serverOrderNumberRef.current = String(result.orderNumber);
        }
        log.debug('Checkout step success', { success: true, hasClientSecret: !!result.clientSecret });

        // COD: submit immediately (no payment step). The shared success screen
        // (OrderSuccessScreen) self-animates and fires the success haptic.
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
          clearCart();
          // Put the card on the Lock Screen now rather than waiting for the customer to
          // open Orders. Not awaited: checkout must not hang on it.
          startOrderActivityForNewOrder({
            orderNumber: finalOrderNumber,
            orderId: result.orderId,
            paymentMethod: 'cod',
            emirate: selectedEmirate,
            t,
            send: (payload) => saveLiveActivityToken(user?.token, payload),
            authToken: user?.token,
          });
          setSuccessOrder(finalOrderNumber);
          return;
        }

        // Card: DO NOT claim success until payment is confirmed in the Payment Sheet.
        if (!result.clientSecret) {
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
            clientSecret: String(result.clientSecret),
          },
        });
      } else {
        log.error('Order submission failed', result);
        Alert.alert(
          t('checkout.orderSubmissionFailedTitle'),
          orderErrorText(result.errorCode) || t('checkout.orderProcessingErrorMessage'),
          [
            { text: t('checkout.tryAgain'), style: 'default' },
            { 
              text: t('checkout.contactSupport'), 
              onPress: async () => {
                const message = t('support.whatsappCheckoutHelpMessage', {
                  orderNumber: String(orderNumber),
                  paymentMethod: String(selectedPaymentMethod),
                });
                if (!(await openWhatsApp(message))) {
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
      // The service throws an English fallback with a code attached; show the
      // translated line for the code and keep the raw text for the log only.
      const shownMsg = orderErrorText(error?.code) || (error?.code ? '' : errMsg);

      log.error('Order processing error', errMsg || error);
      // Order-submission failures are the most business-critical error class -
      // make sure they reach Sentry, not just the local log.
      captureException(error instanceof Error ? error : new Error(errMsg || 'Order processing error'), {
        tags: { area: 'checkout', op: 'submitOrder' },
      });
      Alert.alert(
        t('checkout.orderProcessingErrorTitle'),
        shownMsg
          ? `${t('checkout.orderProcessingErrorMessage')}\n\n${shownMsg}`
          : t('checkout.orderProcessingErrorMessage'),
        [
          { text: t('checkout.tryAgain'), style: 'default' },
          { 
            text: t('checkout.contactSupport'), 
            onPress: async () => {
              const base = t('support.whatsappCheckoutErrorMessage', {
                orderNumber: String(orderNumber),
                paymentMethod: String(selectedPaymentMethod),
              });
              // The raw error is appended untranslated on purpose - support needs
              // the server's wording verbatim to match it against the logs.
              const message = errMsg ? `${base} (${errMsg})` : base;
              if (!(await openWhatsApp(message))) {
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

  if (items.length === 0 && !successOrder) {
    return null; // Will redirect via useEffect
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // COD order success → shared full-screen confirmation (identical to the
  // card / Apple Pay success screen in app/payment/stripe.js).
  if (successOrder) {
    return (
      <OrderSuccessScreen
        title={t('checkout.orderSubmittedTitle')}
        message={t('checkout.orderSubmittedMessageCOD', { orderNumber: successOrder || '' })}
        viewOrderLabel={t('checkout.viewOrder')}
        continueLabel={t('checkout.continueShopping')}
        onViewOrder={() => router.replace('/(tabs)/orders')}
        onContinueShopping={() => router.replace('/(tabs)/shop')}
      />
    );
  }

  const onBack = () => {
    haptics.lightTap();
    router.canGoBack() ? router.back() : router.replace('/(tabs)/bag');
  };

  return (
    <View style={styles.container}>
      <CollapsibleHeader
        title={t('checkout.title')}
        onBack={onBack}
        isRTL={isRTL}
      />

      <Animated.View style={[styles.motionWrap, { opacity: fade, transform: [{ translateY: lift }] }]}>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 8 }]}
      >
        <View style={styles.content}>
          <CheckoutSteps
            currentStep="checkout"
            onCartPress={() => router.replace('/(tabs)/bag')}
          />
          
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
            loyalty={redeemQuote.points > 0 ? {
              points: redeemQuote.points,
              aed: redeemQuote.aed,
              enabled: usePoints,
              onToggle: () => { haptics.lightTap(); setUsePoints((v) => !v); },
            } : null}
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

          {/* GENOSYS Rewards - always-visible redemption control */}
          <RewardsRedemptionCard
            balance={loyaltyBalance}
            quote={redeemQuote}
            enabled={usePoints}
            onToggle={() => { haptics.lightTap(); setUsePoints((v) => !v); }}
            earnPreview={loyaltyMultiplier > 0
              ? Math.floor(Math.max(0, safeSubtotal - loyaltyDiscount) * loyaltyMultiplier)
              : 0}
            isRTL={isRTL}
          />

          {/* Order Notes */}
          <OrderSummaryCard
            orderNotes={orderNotes}
            setOrderNotes={setOrderNotes}
            styles={styles}
          />

          {/* Review section layout anchor (kept for child onLayout API parity) */}
          <View onLayout={registerSectionLayout('review')} />

        </View>
      </Animated.ScrollView>
      </Animated.View>

      {/* Sticky pay bar - single primary action */}
      <View style={[styles.payBar, { paddingBottom: (insets?.bottom || 0) + 12 }]}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            shadow.cta(colors.cta),
            isProcessing && styles.placeOrderButtonDisabled,
            isRTL && styles.placeOrderButtonRTL,
          ]}
          onPress={handleSubmit}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Ionicons name="bag-check" size={20} color={colors.white} />
          )}
          <Text style={[styles.placeOrderButtonText, isRTL && styles.placeOrderButtonTextRTL]} numberOfLines={1}>
            {isProcessing
              ? t('checkout.processing')
              : `${t('checkout.placeOrder')} • AED ${safeTotal.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.groupedBg,
  },
  motionWrap: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Order Header
  orderHeaderCard: {
    ...surfaces.card,
    ...shadow.card,
    marginBottom: 14,
    overflow: 'hidden',
  },
  orderHeader: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  orderHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderHeaderIconWrapRTL: {
    // no transform - icon is symmetric
  },
  orderHeaderLeft: {
    flex: 1,
    paddingEnd: 8,
  },
  orderHeaderLeftRTL: {
    alignItems: 'flex-end',
  },
  orderEyebrow: {
    ...T.eyebrow,
  },
  orderHeaderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.label,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  itemCount: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    marginTop: 1,
  },
  orderHeaderDiscountBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.okBg,
    color: colors.ok,
    fontSize: 11,
    fontWeight: '800',
  },
  orderSummaryBody: {
    backgroundColor: colors.subtleBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
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
    color: colors.bodyText,
    lineHeight: 18,
    marginBottom: 4,
  },
  orderSummaryLineBlock: {
    marginBottom: 8,
  },
  orderSummaryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -1,
  },
  orderSummaryOriginalPrice: {
    ...T.captionTiny,
    color: colors.secondaryLabel,
    textDecorationLine: 'line-through',
  },
  orderSummaryDiscountPill: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.okBg,
    color: colors.ok,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  orderSummaryDiscountedPrice: {
    ...T.captionSmall,
    color: colors.label,
    fontWeight: '800',
  },
  orderSummaryDivider: {
    height: 1,
    backgroundColor: colors.separator,
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
    color: colors.bodyText,
  },
  orderTotalsValue: {
    ...T.captionSmall,
    fontWeight: '700',
    color: colors.label,
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
    ...surfaces.card,
    ...shadow.card,
    padding: 20,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    ...T.body,
    fontWeight: '700',
    color: colors.label,
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
    color: colors.secondaryLabel,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.subtleBg,
  },
  selectInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.subtleBg,
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
    color: colors.secondaryLabel,
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
    backgroundColor: colors.subtleBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
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
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  helperError: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.accent,
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
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.separator,
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
    borderBottomColor: colors.fill,
  },
  modalHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  modalTitle: {
    ...T.price,
    color: colors.label,
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
    color: colors.accent,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.fill,
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
    borderColor: colors.separator,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  modalAddressRowRTL: {
    alignItems: 'flex-end',
  },
  modalAddressRowActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  modalAddressType: {
    ...T.captionSmall,
    fontWeight: '800',
    color: colors.label,
    marginBottom: 4,
  },
  modalAddressName: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 2,
  },
  modalAddressLine: {
    ...T.caption,
    color: colors.bodyText,
  },
  modalAddressMeta: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.mutedText,
    marginTop: 4,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.groupedBg,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  pinRowButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.groupedBg,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  pinButtonDisabled: {
    opacity: 0.5,
  },
  pinButtonText: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.blue,
  },
  pinRowButtonText: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.blue,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 12,
    backgroundColor: colors.subtleBg,
  },
  emirateOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  emirateText: {
    ...T.label,
    fontWeight: '500',
    color: colors.label,
    flexShrink: 1,
  },
  emirateTextSelected: {
    color: colors.accent,
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
    color: colors.secondaryLabel,
  },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.okBg,
    borderWidth: 1,
    borderColor: colors.okLine,
  },
  freeBadgeText: {
    ...T.captionTiny,
    fontWeight: '800',
    color: colors.ok,
  },
  deliveryEtaHint: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.mutedText,
    marginTop: 2,
    marginBottom: 8,
  },

  // Payment
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    borderRadius: 12,
    backgroundColor: colors.subtleBg,
  },
  paymentOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
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
    color: colors.label,
  },
  paymentDescription: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
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
    color: colors.mutedText,
    marginTop: -6,
    marginBottom: 10,
  },
  paymentHintStrong: {
    color: colors.label,
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
    color: colors.mutedText,
  },
  trustTextSecondary: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.secondaryLabel,
    marginTop: 6,
    marginLeft: 24,
  },
  trustTextSecondaryRTL: {
    marginLeft: 0,
    marginRight: 24,
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
    color: colors.bodyText,
  },
  summaryValue: {
    ...T.summaryValue,
    fontWeight: '500',
  },
  summaryValueRTL: {
    textAlign: 'right',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.okBg,
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  freeShippingText: {
    ...T.captionSmall,
    fontWeight: '500',
    color: colors.ok,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    marginTop: 8,
  },
  totalLabel: {
    ...T.totalLabel,
  },
  totalValue: {
    ...T.totalValue,
    color: colors.accent,
  },
  vatNote: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Waterfall discount breakdown styles
  summaryValueStrikethrough: {
    textDecorationLine: 'line-through',
    color: colors.secondaryLabel,
  },
  summaryLabelDiscount: {
    ...T.summaryValue,
    color: colors.purple,
  },
  summaryValueDiscount: {
    ...T.summaryValue,
    color: colors.purple,
  },
  summaryLabelIntermediate: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
  },
  summaryValueIntermediate: {
    ...T.captionSmall,
    color: colors.secondaryLabel,
  },
  summaryLabelBundle: {
    ...T.summaryValue,
    color: colors.ok,
  },
  summaryValueBundle: {
    ...T.summaryValue,
    color: colors.ok,
  },
  summaryDividerLight: {
    height: 1,
    backgroundColor: colors.separator,
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
    color: colors.ok,
    fontWeight: '600',
  },
  vatNoteRed: {
    ...T.captionTiny,
    color: colors.accent,
    paddingVertical: 2,
  },
  youSavedBanner: {
    backgroundColor: colors.okBg,
    borderWidth: 1,
    borderColor: colors.okLine,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  youSavedText: {
    ...T.labelSmall,
    fontWeight: '700',
    color: colors.ok,
  },

  // Sticky pay bar
  payBar: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    shadowColor: colors.shadowCast,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cta,
    paddingVertical: 16,
    minHeight: 52,
    borderRadius: 14,
    gap: 10,
  },
  placeOrderButtonDisabled: {
    backgroundColor: colors.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  placeOrderButtonText: {
    ...T.button,
    fontWeight: '700',
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
});

// Screen-level error boundary: a render crash here shows a recoverable
// error screen instead of taking down the whole navigation stack.
export default withErrorBoundary(CheckoutScreen, { screenName: 'Checkout' });
